/**
 * 主脚本：从数据库读取数据，通过 Provider 映射转换为 Metabase 维度数据，生成 Parquet 文件
 */

import type { JSONSchema, ProviderScript, Update } from '../types/schemas'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { createDatabaseClient, getDatabaseConfigFromEnv } from './database-client'
import { ParquetWriter } from './parquet-writer'

export interface GenerateParquetOptions {
  // 输出目录
  outputDir?: string
  // 批量处理大小
  batchSize?: number
  // 压缩方式
  compression?: 'uncompressed' | 'snappy' | 'gzip' | 'lz4' | 'zstd'
  // 指定要处理的 provider（如果不指定，处理所有）
  providers?: string[]
  // 流式处理每批次大小
  streamBatchSize?: number
}

/**
 * 动态加载所有 provider 脚本
 */
async function loadProviders(): Promise<ProviderScript<any>[]> {
  const providersPath = path.join(process.cwd(), 'src', 'providers')
  const files = fs.readdirSync(providersPath)

  const providers: ProviderScript<any>[] = []

  for (const file of files) {
    if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
      const modulePath = path.join(providersPath, file)
      try {
        const module = await import(pathToFileURL(modulePath).href)

        // 查找导出的 ProviderScript
        for (const exportValue of Object.values(module)) {
          if (
            exportValue
            && typeof exportValue === 'object'
            && 'providerName' in exportValue
            && 'tableName' in exportValue
            && 'rowSchema' in exportValue
            && 'map' in exportValue
          ) {
            providers.push(exportValue as ProviderScript<any>)
            console.log(`✓ Loaded provider: ${exportValue.providerName}`)
          }
        }
      }
      catch (error) {
        console.warn(`⚠ Failed to load provider from ${file}:`, error)
      }
    }
  }

  return providers
}

/**
 * 加载所有 Metabase 定义
 */
async function loadMetabases(): Promise<Record<string, JSONSchema>> {
  const metabasesPath = path.join(process.cwd(), 'src', 'metabases')
  const entries = fs.readdirSync(metabasesPath, { withFileTypes: true })

  const metabases: Record<string, JSONSchema> = {}

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const indexPath = path.join(metabasesPath, entry.name, 'index.ts')
      if (fs.existsSync(indexPath)) {
        try {
          const module = await import(pathToFileURL(indexPath).href)

          // 查找 JSONSchema（type: 'array'）
          for (const exportValue of Object.values(module)) {
            if (
              exportValue
              && typeof exportValue === 'object'
              && '$id' in exportValue
              && 'type' in exportValue
              && exportValue.type === 'array'
            ) {
              const schema = exportValue as JSONSchema
              metabases[schema.$id!] = schema
              console.log(`✓ Loaded metabase: ${schema.$id}`)
            }
          }
        }
        catch (error) {
          console.warn(`⚠ Failed to load metabase from ${entry.name}:`, error)
        }
      }
    }
  }

  return metabases
}

/**
 * 根据 Provider 推断对应的 Metabase
 */
function inferMetabaseId(providerName: string): string {
  // 大多数情况下，Provider 名称对应一个二级维度
  // 例如: SzfgjjHousingProvidentFundDepositRecord -> MetabaseForIdNumberAndHousingProvidentFundDepositRecord
  return `MetabaseForIdNumberAnd${providerName.replace(/^[A-Z][a-z]+/, '')}`
}

/**
 * 聚合 Updates 到维度数据
 * 按 key 分组，每个 key 对应一行维度数据
 *
 * @param updates 所有 updates
 * @param expectedKeyLength 期望的 key 长度（从 Metabase x-keys 获取）
 */
function aggregateUpdates(updates: Update[], expectedKeyLength: number): Record<string, any>[] {
  const grouped = new Map<string, Record<string, any>>()

  for (const update of updates) {
    // 只处理匹配 key 长度的 updates
    if (update.key.length !== expectedKeyLength) {
      continue
    }

    const keyStr = update.key.join('|')
    let record = grouped.get(keyStr)

    if (!record) {
      record = {}
      grouped.set(keyStr, record)
    }

    // 更新字段值
    if (update.field && update.value !== undefined) {
      record[update.field] = update.value
    }
  }

  return Array.from(grouped.values())
}

/**
 * 处理单个 provider，转换为维度数据
 * 一个 Provider 可能输出到多个 Metabase（按 key 长度分组）
 */
async function processProvider(
  provider: ProviderScript<any>,
  client: any,
  metabases: Record<string, JSONSchema>,
  options: GenerateParquetOptions,
): Promise<void> {
  console.log(`\nProcessing provider: ${provider.providerName} (${provider.providerNameZh})`)
  console.log(`  Table: ${provider.tableName}`)

  try {
    // 从数据库读取原始数据
    const sql = `SELECT * FROM ${provider.tableName}`
    console.log(`  Querying database...`)

    const allUpdates: Update[] = []

    // 流式处理数据
    let rowCount = 0
    const batchSize = options.streamBatchSize || 1000

    for await (const batch of client.stream(sql, batchSize)) {
      rowCount += batch.length

      // 对每一行应用 Provider.map() 转换
      for (const row of batch) {
        const updates = provider.map(row)
        allUpdates.push(...updates)
      }

      if (rowCount % 10000 === 0) {
        console.log(`  Processed ${rowCount} rows...`)
      }
    }

    console.log(`  Loaded ${rowCount} rows from database`)
    console.log(`  Generated ${allUpdates.length} updates`)

    // 按 key 长度分组
    const groupedByKeyLength = new Map<number, Update[]>()
    for (const update of allUpdates) {
      const keyLength = update.key.length
      if (!groupedByKeyLength.has(keyLength)) {
        groupedByKeyLength.set(keyLength, [])
      }
      groupedByKeyLength.get(keyLength)!.push(update)
    }

    console.log(`  Updates grouped by key length: ${Array.from(groupedByKeyLength.keys()).join(', ')}`)

    // 对每个 key 长度生成对应的 Parquet 文件
    for (const [keyLength, updates] of groupedByKeyLength) {
      let metabaseId: string
      let metabase: JSONSchema | undefined

      if (keyLength === 1) {
        // 一级维度：输出到 MetabaseForIdNumber
        metabaseId = 'MetabaseForIdNumber'
        metabase = metabases[metabaseId]
      }
      else {
        // 二级维度：推断 Metabase ID
        metabaseId = inferMetabaseId(provider.providerName)
        metabase = metabases[metabaseId]
      }

      if (!metabase) {
        console.warn(`  ⚠ No metabase found for key length ${keyLength} (${metabaseId}), skipping...`)
        continue
      }

      console.log(`\n  Processing key length ${keyLength} → ${metabaseId}`)

      // 聚合 Updates 到维度数据
      const dimensionalRecords = aggregateUpdates(updates, keyLength)
      console.log(`    Aggregated to ${dimensionalRecords.length} dimensional records`)

      if (dimensionalRecords.length === 0) {
        console.warn(`    ⚠ No records to write, skipping...`)
        continue
      }

      // 写入 Parquet
      const outputDir = options.outputDir || path.join(process.cwd(), 'output', 'parquet')
      const writer = new ParquetWriter(
        metabaseId,
        metabase,
        {
          outputDir,
          batchSize: options.batchSize,
          compression: options.compression,
        },
      )

      await writer.addRows(dimensionalRecords)
      const outputPath = await writer.finish()
      console.log(`    ✓ Generated: ${outputPath} (${writer.getRowCount()} rows)`)
    }
  }
  catch (error) {
    console.error(`✗ Failed to process provider ${provider.providerName}:`, error)
    throw error
  }
}

/**
 * 主函数
 */
export async function generateParquet(options: GenerateParquetOptions = {}): Promise<void> {
  const startTime = Date.now()

  // 设置默认选项
  const opts: GenerateParquetOptions = {
    outputDir: options.outputDir || path.join(process.cwd(), 'output', 'parquet'),
    batchSize: options.batchSize || 10000,
    compression: options.compression || 'snappy',
    streamBatchSize: options.streamBatchSize || 1000,
    providers: options.providers,
  }

  console.log('='.repeat(60))
  console.log('Generate Parquet with Dimensional Modeling')
  console.log('='.repeat(60))
  console.log(`Output directory: ${opts.outputDir}`)
  console.log(`Batch size: ${opts.batchSize}`)
  console.log(`Compression: ${opts.compression}`)
  console.log('='.repeat(60))

  // 确保输出目录存在
  if (!fs.existsSync(opts.outputDir!)) {
    fs.mkdirSync(opts.outputDir!, { recursive: true })
    console.log(`✓ Created output directory: ${opts.outputDir}`)
  }

  // 加载数据库配置
  const dbConfig = getDatabaseConfigFromEnv()
  console.log(`\nDatabase: ${dbConfig.type}://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`)

  // 创建数据库客户端
  const client = createDatabaseClient(dbConfig)
  console.log('✓ Database client connected')

  try {
    // 加载所有 Metabase 定义
    console.log('\nLoading metabases...')
    const metabases = await loadMetabases()
    console.log(`✓ Loaded ${Object.keys(metabases).length} metabases`)

    // 加载所有 provider
    console.log('\nLoading providers...')
    const allProviders = await loadProviders()
    console.log(`✓ Loaded ${allProviders.length} providers`)

    // 筛选要处理的 provider
    let providersToProcess = allProviders
    if (opts.providers && opts.providers.length > 0) {
      providersToProcess = providersToProcess.filter(p =>
        opts.providers!.includes(p.providerName),
      )
      console.log(`\nProcessing ${providersToProcess.length} specified providers`)
    }
    else {
      console.log(`\nProcessing all ${providersToProcess.length} providers`)
    }

    // 处理每个 provider
    for (const provider of providersToProcess) {
      await processProvider(provider, client, metabases, opts)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n${'='.repeat(60)}`)
    console.log(`✓ All done! Completed in ${duration}s`)
    console.log('='.repeat(60))
  }
  catch (error) {
    console.error('\n✗ Error occurred during processing:', error)
    throw error
  }
  finally {
    await client.close()
    console.log('✓ Database connection closed')
  }
}

/**
 * CLI 入口
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)

  const options: GenerateParquetOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--output' || arg === '-o') {
      options.outputDir = args[++i]
    }
    else if (arg === '--batch-size') {
      options.batchSize = Number.parseInt(args[++i])
    }
    else if (arg === '--compression' || arg === '-c') {
      options.compression = args[++i] as any
    }
    else if (arg === '--providers' || arg === '-p') {
      options.providers = args[++i].split(',')
    }
    else if (arg === '--stream-batch-size') {
      options.streamBatchSize = Number.parseInt(args[++i])
    }
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx src/scripts-v2/generate-parquet.ts [options]

说明:
  从数据库读取原始数据，通过 Provider 映射转换为 Metabase 维度数据，生成 Parquet 文件

Options:
  -o, --output <dir>              输出目录 (默认: output/parquet)
  --batch-size <size>             批量写入大小 (默认: 10000)
  -c, --compression <type>        压缩方式: uncompressed, snappy, gzip, lz4, zstd (默认: snappy)
  -p, --providers <names>         指定要处理的 provider，逗号分隔
  --stream-batch-size <size>      流式处理批次大小 (默认: 1000)
  -h, --help                      显示帮助信息

环境变量:
  DB_TYPE                         数据库类型: postgres, mysql (默认: postgres)
  DB_HOST                         数据库主机 (默认: localhost)
  DB_PORT                         数据库端口 (默认: 5432/3306)
  DB_USER                         数据库用户 (默认: postgres)
  DB_PASSWORD                     数据库密码
  DB_NAME                         数据库名称 (默认: opss)

示例:
  # 生成所有 provider 的维度 Parquet 文件
  tsx src/scripts-v2/generate-parquet.ts

  # 只生成指定 provider 的文件
  tsx src/scripts-v2/generate-parquet.ts -p NcybjMedicalRetailSettlement,SzfgjjHousingProvidentFundDepositRecord

  # 指定输出目录和压缩方式
  tsx src/scripts-v2/generate-parquet.ts -o ./data -c gzip
      `)
      process.exit(0)
    }
  }

  try {
    await generateParquet(options)
  }
  catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (process.argv[1]?.includes('generate-parquet')) {
  main()
}

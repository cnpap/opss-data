/**
 * Parquet 文件验证工具
 * 读取生成的 Parquet 文件并显示基本信息
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import parquet from 'parquetjs'

async function verifyParquetFile(filePath: string): Promise<void> {
  console.log(`\n验证文件: ${filePath}`)
  console.log('='.repeat(60))

  if (!fs.existsSync(filePath)) {
    console.error(`✗ 文件不存在: ${filePath}`)
    return
  }

  try {
    const reader = await parquet.ParquetReader.openFile(filePath)

    console.log(`✓ 文件格式正确`)

    // 获取 schema
    const schema = reader.getSchema()
    console.log(`\nSchema 信息:`)
    console.log(`  字段数量: ${Object.keys(schema.fields).length}`)
    console.log(`  字段列表:`)

    for (const [fieldName, field] of Object.entries(schema.fields)) {
      const fieldInfo = field as any
      console.log(`    - ${fieldName}: ${fieldInfo.primitiveType || fieldInfo.originalType} ${fieldInfo.optional ? '(可选)' : '(必填)'}`)
    }

    // 读取前几行数据
    const cursor = reader.getCursor()
    let rowCount = 0
    const sampleRows: any[] = []

    while (rowCount < 5) {
      const row = await cursor.next()
      if (!row) {
        break
      }
      sampleRows.push(row)
      rowCount++
    }

    console.log(`\n前 ${sampleRows.length} 行数据样例:`)
    for (let i = 0; i < sampleRows.length; i++) {
      console.log(`  第 ${i + 1} 行:`)
      console.log(JSON.stringify(sampleRows[i], null, 2).split('\n').map(line => `    ${line}`).join('\n'))
    }

    // 获取总行数（需要遍历整个文件）
    const allCursor = reader.getCursor()
    let totalRows = 0
    while (await allCursor.next()) {
      totalRows++
    }

    console.log(`\n统计信息:`)
    console.log(`  总行数: ${totalRows}`)
    console.log(`  文件大小: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`)

    await reader.close()
    console.log(`\n✓ 验证完成`)
  }
  catch (error) {
    console.error(`✗ 验证失败:`, error)
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法: tsx src/scripts-v2/verify-parquet.ts <文件路径>

示例:
  tsx src/scripts-v2/verify-parquet.ts output/parquet/NcybjMedicalRetailSettlement.parquet
  tsx src/scripts-v2/verify-parquet.ts output/parquet/*.parquet
    `)
    return
  }

  for (const arg of args) {
    // 处理通配符（简单实现）
    if (arg.includes('*')) {
      const dir = path.dirname(arg)
      const pattern = path.basename(arg).replace('*', '.*')
      const regex = new RegExp(`^${pattern}$`)

      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          if (regex.test(file) && file.endsWith('.parquet')) {
            await verifyParquetFile(path.join(dir, file))
          }
        }
      }
    }
    else {
      await verifyParquetFile(arg)
    }
  }
}

if (process.argv[1]?.includes('verify-parquet')) {
  main().catch(console.error)
}

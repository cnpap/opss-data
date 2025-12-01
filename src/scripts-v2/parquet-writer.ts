/**
 * Parquet 文件生成器
 * 使用 parquetjs 生成 Parquet 文件
 */

import type { JSONSchema } from '../types/schemas'
import * as fs from 'node:fs'
import * as path from 'node:path'
import parquet from 'parquetjs'

export interface ParquetWriterOptions {
  outputDir: string
  // 批量写入大小
  batchSize?: number
  // Parquet 文件选项
  compression?: 'uncompressed' | 'snappy' | 'gzip' | 'lz4' | 'zstd'
}

/**
 * 将 JSON Schema 转换为 Parquet Schema
 */
function jsonSchemaToParquetSchema(schema: JSONSchema): any {
  // 支持两种格式：
  // 1. array type with items (Metabase format)
  // 2. object type with properties (Provider format)
  let properties: Record<string, JSONSchema>
  let required: string[] | undefined

  if (schema.type === 'array' && schema.items && !Array.isArray(schema.items)) {
    const itemSchema = schema.items
    if (itemSchema.type !== 'object' || !itemSchema.properties) {
      throw new Error('Schema items must be an object with properties')
    }
    properties = itemSchema.properties
    required = itemSchema.required
  }
  else if (schema.type === 'object' && schema.properties) {
    properties = schema.properties
    required = schema.required
  }
  else {
    throw new Error('Schema must be either an array type with items or an object type with properties')
  }

  const fields: Record<string, any> = {}

  for (const [name, fieldSchema] of Object.entries(properties)) {
    const isOptional = !required?.includes(name)

    if (fieldSchema.type === 'string') {
      if (fieldSchema.format === 'date') {
        // 日期类型
        fields[name] = { type: 'INT32', optional: isOptional }
      }
      else if (fieldSchema.format === 'date-time' || fieldSchema.format === 'date-time-tz') {
        // 时间戳类型 (毫秒)
        fields[name] = { type: 'TIMESTAMP_MILLIS', optional: isOptional }
      }
      else {
        // 字符串类型
        fields[name] = { type: 'UTF8', optional: isOptional }
      }
    }
    else if (fieldSchema.type === 'number') {
      // 使用 DOUBLE 类型（parquetjs 对 DECIMAL 支持有限）
      fields[name] = { type: 'DOUBLE', optional: isOptional }
    }
    else if (fieldSchema.type === 'boolean') {
      fields[name] = { type: 'BOOLEAN', optional: isOptional }
    }
    else if (fieldSchema.type === 'array') {
      // 数组类型存储为 JSON 字符串
      fields[name] = { type: 'UTF8', optional: isOptional }
    }
    else if (fieldSchema.type === 'object') {
      // 对象类型存储为 JSON 字符串
      fields[name] = { type: 'UTF8', optional: isOptional }
    }
    else {
      // 默认使用字符串
      fields[name] = { type: 'UTF8', optional: isOptional }
    }
  }

  return new parquet.ParquetSchema(fields)
}

/**
 * 转换数据值
 */
function convertValue(value: any, fieldSchema: JSONSchema): any {
  if (value === null || value === undefined) {
    return null
  }

  if (fieldSchema.type === 'string') {
    if (fieldSchema.format === 'date') {
      // 日期：转换为从 Unix epoch 开始的天数
      const date = new Date(value)
      return Math.floor(date.getTime() / (1000 * 60 * 60 * 24))
    }
    else if (fieldSchema.format === 'date-time' || fieldSchema.format === 'date-time-tz') {
      // 时间戳：确保是 Date 对象
      return new Date(value)
    }
    else {
      return String(value)
    }
  }
  else if (fieldSchema.type === 'number') {
    return Number(value)
  }
  else if (fieldSchema.type === 'boolean') {
    return Boolean(value)
  }
  else if (fieldSchema.type === 'array') {
    // 数组转 JSON 字符串
    return JSON.stringify(value)
  }
  else if (fieldSchema.type === 'object') {
    // 对象转 JSON 字符串
    return JSON.stringify(value)
  }

  return value
}

/**
 * Parquet 写入器
 */
export class ParquetWriter {
  private schema: any
  private jsonSchema: JSONSchema
  private outputPath: string
  private writer: any | null = null
  private rowCount: number = 0
  private compression: string

  constructor(
    name: string,
    schema: JSONSchema,
    options: ParquetWriterOptions,
  ) {
    this.jsonSchema = schema
    this.schema = jsonSchemaToParquetSchema(schema)
    this.outputPath = path.join(options.outputDir, `${name}.parquet`)
    this.compression = options.compression || 'SNAPPY'

    // 确保输出目录存在
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true })
    }
  }

  /**
   * 初始化 writer
   */
  private async ensureWriter(): Promise<void> {
    if (!this.writer) {
      this.writer = await parquet.ParquetWriter.openFile(this.schema, this.outputPath)
    }
  }

  /**
   * 添加一行数据
   */
  async addRow(row: Record<string, any>): Promise<void> {
    await this.ensureWriter()

    // 获取 properties
    let properties: Record<string, JSONSchema>
    if (this.jsonSchema.type === 'array' && this.jsonSchema.items && !Array.isArray(this.jsonSchema.items)) {
      const itemSchema = this.jsonSchema.items
      if (itemSchema.type !== 'object' || !itemSchema.properties) {
        throw new Error('Invalid schema items')
      }
      properties = itemSchema.properties
    }
    else if (this.jsonSchema.type === 'object' && this.jsonSchema.properties) {
      properties = this.jsonSchema.properties
    }
    else {
      throw new Error('Invalid schema')
    }

    // 转换数据
    const convertedRow: Record<string, any> = {}
    for (const [name, fieldSchema] of Object.entries(properties)) {
      convertedRow[name] = convertValue(row[name], fieldSchema)
    }

    await this.writer.appendRow(convertedRow)
    this.rowCount++
  }

  /**
   * 批量添加数据
   */
  async addRows(rows: Record<string, any>[]): Promise<void> {
    for (const row of rows) {
      await this.addRow(row)
    }
  }

  /**
   * 完成写入并保存文件
   */
  async finish(): Promise<string> {
    if (this.writer) {
      await this.writer.close()
      console.log(`✓ Written ${this.rowCount} rows to ${this.outputPath}`)
    }
    else {
      console.warn(`No data to write for ${this.outputPath}`)
    }

    return this.outputPath
  }

  /**
   * 获取当前已添加的行数
   */
  getRowCount(): number {
    return this.rowCount
  }
}

/**
 * 便捷方法：直接从数据数组写入 Parquet 文件
 */
export async function writeParquetFile(
  name: string,
  schema: JSONSchema,
  data: Record<string, any>[],
  options: ParquetWriterOptions,
): Promise<string> {
  const writer = new ParquetWriter(name, schema, options)
  await writer.addRows(data)
  return await writer.finish()
}

/**
 * 流式写入 Parquet 文件（适用于大数据量）
 */
export async function writeParquetFileStream(
  name: string,
  schema: JSONSchema,
  dataStream: AsyncGenerator<Record<string, any>[], void, unknown>,
  options: ParquetWriterOptions,
): Promise<string> {
  const writer = new ParquetWriter(name, schema, options)

  for await (const batch of dataStream) {
    await writer.addRows(batch)
  }

  return await writer.finish()
}

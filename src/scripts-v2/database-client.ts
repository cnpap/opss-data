/**
 * 数据库连接抽象层
 * 支持 PostgreSQL 和 MySQL
 */

import type { ProviderScript } from '../types/schemas'
import process from 'node:process'
import mysql from 'mysql2/promise'
import pg from 'pg'

const { Pool: PgPool } = pg

export interface DatabaseConfig {
  type: 'postgres' | 'mysql'
  host: string
  port: number
  user: string
  password: string
  database: string
  // 连接池配置
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

export interface QueryResult<T = unknown> {
  rows: T[]
  rowCount: number
}

/**
 * 数据库客户端抽象接口
 */
export interface DatabaseClient {
  query: <T>(sql: string, params?: readonly unknown[]) => Promise<QueryResult<T>>
  stream: <T>(sql: string, batchSize?: number) => AsyncGenerator<T[], void, unknown>
  close: () => Promise<void>
}

/**
 * PostgreSQL 客户端实现
 */
export class PostgresClient implements DatabaseClient {
  private pool: pg.Pool

  constructor(config: DatabaseConfig) {
    this.pool = new PgPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      max: config.max || 10,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    })
  }

  async query<T>(sql: string, params?: readonly unknown[]): Promise<QueryResult<T>> {
    const result = await this.pool.query(sql, params as unknown[])
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    }
  }

  async* stream<T>(sql: string, batchSize = 1000): AsyncGenerator<T[], void, unknown> {
    // 简化实现：查询所有数据然后分批返回
    // 对于真正的大数据量，可以使用 LIMIT/OFFSET 或 cursor
    const result = await this.query<T>(sql)
    const rows = result.rows

    for (let i = 0; i < rows.length; i += batchSize) {
      yield rows.slice(i, i + batchSize)
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

/**
 * MySQL 客户端实现
 */
export class MySQLClient implements DatabaseClient {
  private pool: mysql.Pool

  constructor(config: DatabaseConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: config.max || 10,
      waitForConnections: true,
      queueLimit: 0,
    })
  }

  async query<T>(sql: string, params?: readonly unknown[]): Promise<QueryResult<T>> {
    const [rows] = await this.pool.execute(sql, params)
    const rowsArray: T[] = Array.isArray(rows) ? (rows as T[]) : ([] as T[])
    return {
      rows: rowsArray,
      rowCount: rowsArray.length,
    }
  }

  async* stream<T>(sql: string, batchSize = 1000): AsyncGenerator<T[], void, unknown> {
    const connection = await this.pool.getConnection()
    try {
      const [rows] = await connection.query(sql)
      const rowsArray: T[] = Array.isArray(rows) ? (rows as T[]) : ([] as T[])

      let batch: T[] = []
      for (const row of rowsArray) {
        batch.push(row as T)
        if (batch.length >= batchSize) {
          yield batch
          batch = []
        }
      }

      if (batch.length > 0) {
        yield batch
      }
    }
    finally {
      connection.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

/**
 * 创建数据库客户端工厂函数
 */
export function createDatabaseClient(config: DatabaseConfig): DatabaseClient {
  if (config.type === 'postgres') {
    return new PostgresClient(config)
  }
  else if (config.type === 'mysql') {
    return new MySQLClient(config)
  }
  else {
    throw new Error(`Unsupported database type: ${config.type}`)
  }
}

/**
 * 从环境变量读取数据库配置
 * 兼容新旧两套环境变量：DB_xx 和 PG_xx/MYSQL_xx
 */
export function getDatabaseConfigFromEnv(): DatabaseConfig {
  const type = (process.env.DB_TYPE || 'postgres') as 'postgres' | 'mysql'

  // 优先使用 PG_*/MYSQL_* 变量（兼容老系统）
  const host = process.env.DB_HOST || process.env.PG_HOST || process.env.MYSQL_HOST || 'localhost'
  const port = Number.parseInt(
    process.env.DB_PORT
    || process.env.PG_PORT
    || process.env.MYSQL_PORT
    || (type === 'postgres' ? '5432' : '3306'),
  )
  const user = process.env.DB_USER || process.env.PG_USER || process.env.MYSQL_USER || 'postgres'
  const password = process.env.DB_PASSWORD || process.env.PG_PASSWORD || process.env.MYSQL_PASSWORD || ''
  const database = process.env.DB_NAME || process.env.PG_DATABASE || process.env.MYSQL_DATABASE || 'opss'

  return {
    type,
    host,
    port,
    user,
    password,
    database,
  }
}

/**
 * 根据 Provider 配置查询数据
 */
export async function queryProviderData<T extends object>(
  client: DatabaseClient,
  provider: ProviderScript<T>,
  limit?: number,
): Promise<T[]> {
  const limitClause = limit ? ` LIMIT ${limit}` : ''
  const sql = `SELECT * FROM ${provider.tableName}${limitClause}`

  const result = await client.query<T>(sql)
  return result.rows
}

/**
 * 流式查询 Provider 数据（用于大数据量）
 */
export async function* streamProviderData<T extends object>(
  client: DatabaseClient,
  provider: ProviderScript<T>,
  batchSize = 1000,
): AsyncGenerator<T[], void, unknown> {
  const sql = `SELECT * FROM ${provider.tableName}`

  yield* client.stream<T>(sql, batchSize)
}

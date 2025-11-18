import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@clickhouse/client'

function env(k: string, d?: string) {
  const v = process.env[k]
  return v == null || v === '' ? d : v
}

function getBaseUrl() {
  const direct = env('CLICKHOUSE_URL')
  if (direct)
    return direct
  const protocol = env('CLICKHOUSE_PROTOCOL', 'http')
  const host = env('CLICKHOUSE_HOST', 'localhost')
  const port = env('CLICKHOUSE_PORT', protocol === 'https' ? '8443' : '8123')
  const normalizedPort = (() => {
    if ((protocol === 'http' || protocol === 'https') && port === '9000')
      return protocol === 'https' ? '8443' : '8123'
    return port
  })()
  return `${protocol}://${host}:${normalizedPort}`
}
async function applySqlDir(client: ReturnType<typeof createClient>, sqlDir: string) {
  const files = (await fs.readdir(sqlDir)).filter(f => f.toLowerCase().endsWith('.sql')).sort((a, b) => a.localeCompare(b))
  for (const f of files) {
    const p = path.join(sqlDir, f)
    const content = await fs.readFile(p, 'utf-8')
    const statements = content
      .split(/;\s*\n|;\s*$/)
      .map(s => s.trim())
      .filter(s => s.length)
    for (const stmt of statements)
      await client.command({ query: stmt })
    console.log(`已应用: ${p}`)
  }
}

async function main() {
  const baseUrl = getBaseUrl()
  const database = env('CLICKHOUSE_DATABASE', 'opss')!
  const username = env('CLICKHOUSE_USERNAME', 'default')!
  const password = env('CLICKHOUSE_PASSWORD', '')!
  const adminClient = createClient({ url: baseUrl, username, password })
  const dbClient = createClient({ url: baseUrl, database, username, password })
  const args = process.argv.slice(2)
  const has = (flag: string) => args.includes(flag)
  const getArg = (flag: string) => {
    const i = args.findIndex(a => a === flag)
    return i >= 0 ? args[i + 1] : undefined
  }
  try {
    if (has('--ping')) {
      const hasPing = typeof (adminClient as any).ping === 'function'
      if (hasPing) {
        const ok = await (adminClient as any).ping()
        if (!ok)
          throw new Error('ping failed')
      }
      else {
        const r = await adminClient.query({ query: 'SELECT 1', format: 'JSONEachRow' })
        await r.text()
      }
      console.log('联通')
      return
    }
    if (has('--drop-db'))
      await adminClient.command({ query: `DROP DATABASE IF EXISTS ${database}` })
    if (has('--create-db'))
      await adminClient.command({ query: `CREATE DATABASE IF NOT EXISTS ${database}` })
    if (has('--apply')) {
      const sqlDir = getArg('--sql-dir') || path.resolve(process.cwd(), 'src/clickhouse/sql/generated')
      await applySqlDir(dbClient, path.isAbsolute(sqlDir) ? sqlDir : path.resolve(process.cwd(), sqlDir))
      console.log('已应用所有 SQL 文件')
      return
    }
    const r = await adminClient.query({ query: 'SELECT 1', format: 'JSONEachRow' })
    await r.text()
    console.log('联通')
  }
  catch (e: unknown) {
    console.log('未联通', e)
    process.exitCode = 1
  }
  finally {
    await adminClient.close()
    await dbClient.close()
  }
}

main()

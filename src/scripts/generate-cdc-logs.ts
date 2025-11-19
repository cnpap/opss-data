import type { Update } from '../types/schemas'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Client } from 'pg'
import { NcybjMedicalRetailSettlement } from '../providers/NcybjMedicalRetailSettlement'
import { NcybjResidentMedicalInsuranceBasicInfo } from '../providers/NcybjResidentMedicalInsuranceBasicInfo'
import { SzfgjjHousingProvidentFundDepositRecord } from '../providers/SzfgjjHousingProvidentFundDepositRecord'

function env(k: string, d?: string) {
  const v = process.env[k]
  return v == null || v === '' ? d : v
}

function getConnectionConfig() {
  const connectionString = env('DATABASE_URL')
  if (connectionString)
    return { connectionString }
  return {
    host: env('PG_HOST', 'localhost'),
    port: Number.parseInt(env('PG_PORT', '5432')!),
    database: env('PG_DATABASE', 'opss'),
    user: env('PG_USER', 'postgres'),
    password: env('PG_PASSWORD', ''),
  }
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true })
}

function pad(n: number, width = 6) {
  const s = String(n)
  return s.length >= width ? s : '0'.repeat(width - s.length) + s
}

function collectKeyValues(updates: Update[]) {
  const m: Record<string, unknown> = {}
  for (const u of updates) {
    const f = (u as any).field as string | undefined
    if (!f)
      continue
    if (Array.isArray(u.key)) {
      if (u.key.includes(f))
        m[f] = u.value
    }
    else if (typeof u.key === 'string' && u.key === f) {
      m[f] = u.value
    }
  }
  return m
}

async function writeEvents(folder: string, events: any[]) {
  await ensureDir(folder)
  const files = (await fs.readdir(folder)).filter(f => f.toLowerCase().endsWith('.json')).sort((a, b) => a.localeCompare(b))
  let idx = files.length + 1
  for (const ev of events) {
    const name = `${pad(idx)}.json`
    const p = path.join(folder, name)
    await fs.writeFile(p, JSON.stringify(ev))
    idx++
  }
}

async function main() {
  const client = new Client(getConnectionConfig())
  await client.connect()
  const providers = [
    NcybjResidentMedicalInsuranceBasicInfo,
    NcybjMedicalRetailSettlement,
    SzfgjjHousingProvidentFundDepositRecord,
  ]
  const baseOutDir = path.resolve(process.cwd(), 'src/cdc-data')
  const eventsByFolder = new Map<string, any[]>()
  for (const p of providers) {
    const res = await client.query(`SELECT * FROM ${p.tableName}`)
    for (const row of res.rows as any[]) {
      const updates = p.map(row)
      const kv = collectKeyValues(updates)
      const grouped = new Map<string, { op: string, key: string[], pk: Record<string, unknown>, fields: Record<string, unknown>, source: string, updatedAt: string | null }>()
      for (const u of updates) {
        if (!Array.isArray(u.key) || !(u as any).field)
          continue
        const keyPath = u.key.join('-')
        const pk: Record<string, unknown> = {}
        let complete = true
        for (const k of u.key) {
          const v = kv[k]
          if (v == null || v === '') {
            complete = false
            break
          }
          pk[k] = v
        }
        if (!complete)
          continue
        const updatedAt = (u as any).updatedAt ?? null
        const exist = grouped.get(keyPath)
        if (exist) {
          exist.fields[(u as any).field] = u.value
          if (!exist.updatedAt && updatedAt)
            exist.updatedAt = updatedAt
        }
        else {
          const fields: Record<string, unknown> = {}
          fields[(u as any).field] = u.value
          grouped.set(keyPath, {
            op: 'i',
            key: u.key,
            pk,
            fields,
            source: p.providerName,
            updatedAt,
          })
        }
      }
      for (const [keyPath, ev] of grouped) {
        const folder = path.join(baseOutDir, keyPath)
        const arr = eventsByFolder.get(folder) ?? []
        arr.push(ev)
        eventsByFolder.set(folder, arr)
      }
    }
  }
  for (const [folder, events] of eventsByFolder)
    await writeEvents(folder, events)
  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})

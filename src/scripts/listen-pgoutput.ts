import type { Update } from '../types/schemas'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Client } from 'pg'
import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication'
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

const baseOutDir = path.resolve(process.cwd(), 'src/cdc-data')
const counters = new Map<string, number>()

async function nextFilePath(folder: string) {
  await ensureDir(folder)
  let idx = counters.get(folder)
  if (idx == null) {
    const files = (await fs.readdir(folder)).filter(f => f.toLowerCase().endsWith('.json')).sort((a, b) => a.localeCompare(b))
    idx = files.length + 1
  }
  const name = `${pad(idx)}.json`
  const p = path.join(folder, name)
  counters.set(folder, idx + 1)
  return p
}

function tupleToRow(columns: any[], tuple: any[]) {
  const row: Record<string, unknown> = {}
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]
    const cell = tuple[i]
    const name = col?.name ?? col
    const val = cell?.text ?? cell?.value ?? cell?.string ?? (typeof cell === 'object' ? (cell?.val ?? null) : cell)
    row[name] = val
  }
  return row
}

async function ensureSlotExists(slotName: string) {
  const client = new Client(getConnectionConfig())
  await client.connect()
  try {
    const exists = await client.query('select 1 from pg_replication_slots where slot_name=$1', [slotName])
    if (exists.rowCount === 0)
      await client.query('select * from pg_create_logical_replication_slot($1, $2)', [slotName, 'pgoutput'])
  }
  finally {
    await client.end()
  }
}

async function main() {
  const publication = env('PG_PUBLICATION', 'opss_data_pub')!
  const slotName = env('PG_SLOT_NAME', 'opss_data_slot')!
  await ensureSlotExists(slotName)

  const service = new LogicalReplicationService(getConnectionConfig(), { acknowledge: { auto: true, timeoutSeconds: 10 } })
  const plugin = new PgoutputPlugin({ protoVersion: 1, publicationNames: [publication] })

  const providers = [
    NcybjResidentMedicalInsuranceBasicInfo,
    NcybjMedicalRetailSettlement,
    SzfgjjHousingProvidentFundDepositRecord,
  ]
  const providerByTable = new Map<string, any>()
  for (const p of providers)
    providerByTable.set(p.tableName, p)

  service.on('start', () => {
    console.log('replication start')
  })
  service.on('heartbeat', (_lsn: string, ts: number, shouldRespond: boolean) => {
    console.log('heartbeat', ts, shouldRespond)
  })
  service.on('acknowledge', (lsn: string) => {
    console.log('ack', lsn)
  })
  service.on('error', (err: Error) => {
    console.error('replication error', err)
  })
  service.on('data', async (_lsn: string, log: any) => {
    const type = (log?.tag ?? log?.command ?? log?.type ?? '').toString().toLowerCase()
    if (!type)
      return
    if (type === 'insert' || type === 'update' || type === 'delete') {
      const rel = log?.relation ?? log?.rel ?? log
      const tableName: string = rel?.name ?? rel?.table ?? ''
      if (!tableName)
        return
      console.log('change', type, tableName)
      const provider = providerByTable.get(tableName)
      if (!provider)
        return
      const columns = rel?.columns ?? rel?.cols ?? rel?.columnnames ?? []
      const tupleCandidate = type === 'delete'
        ? (log?.oldTuple ?? log?.old?.tuple ?? log?.old ?? [])
        : (log?.newTuple ?? log?.tuple ?? log?.new?.tuple ?? log?.new ?? log?.row ?? [])
      let row: Record<string, unknown> = {}
      if (Array.isArray(tupleCandidate)) {
        row = tupleToRow(columns, tupleCandidate)
      }
      else if (tupleCandidate && typeof tupleCandidate === 'object') {
        row = tupleCandidate as Record<string, unknown>
      }
      if (!row || Object.keys(row).length === 0) {
        console.log('debug:event', JSON.stringify({ keys: Object.keys(log || {}), rel, columns }))
        console.log('debug:tuples', {
          newTuple: log?.newTuple,
          tuple: log?.tuple,
          oldTuple: log?.oldTuple,
          old: log?.old,
          new: log?.new,
          row: log?.row,
        })
      }
      const updates: Update[] = provider.map(row)
      const kv = collectKeyValues(updates)
      {
        const rawFolder = path.join(baseOutDir, '_raw', tableName)
        const rawEv = {
          op: type[0],
          table: tableName,
          kv,
          row,
          source: provider.providerName,
          updatedAt: (row as any).swap_data_time ?? null,
        }
        const p = await nextFilePath(rawFolder)
        await fs.writeFile(p, JSON.stringify(rawEv))
      }
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
        const updatedAt = (u as any).updatedAt ?? (row as any).swap_data_time ?? null
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
            op: type[0],
            key: u.key,
            pk,
            fields,
            source: provider.providerName,
            updatedAt,
          })
        }
      }
      for (const [keyPath, ev] of grouped) {
        const folder = path.join(baseOutDir, keyPath)
        const p = await nextFilePath(folder)
        await fs.writeFile(p, JSON.stringify(ev))
      }
    }
  })

  await service.subscribe(plugin, slotName).catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
}

main()

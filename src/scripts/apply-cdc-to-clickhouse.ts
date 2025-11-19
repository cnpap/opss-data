import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { createClient } from '@clickhouse/client'
import dayjs from 'dayjs'

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

async function listJson(dir: string) {
  try {
    const files = await fs.readdir(dir)
    return files.filter(f => f.toLowerCase().endsWith('.json')).sort((a, b) => a.localeCompare(b)).map(f => path.join(dir, f))
  }
  catch {
    return []
  }
}

async function readEvents(baseDir: string) {
  const out: { folder: string, files: string[], keyPath: string }[] = []
  const entries = await fs.readdir(baseDir)
  for (const e of entries) {
    if (e === '_raw')
      continue
    const folder = path.join(baseDir, e)
    const stat = await fs.stat(folder).catch(() => null)
    if (!stat || !stat.isDirectory())
      continue
    const files = await listJson(folder)
    if (files.length === 0)
      continue
    out.push({ folder, files, keyPath: e })
  }
  return out
}

interface CheckpointFolder { lastFile?: string }
interface Checkpoint { version: number, folders: Record<string, CheckpointFolder>, updatedAt?: string }

function fileIndexFromName(name: string) {
  const m = name.match(/(\d+)/)
  if (!m)
    return null
  const n = Number.parseInt(m[1]!, 10)
  return Number.isFinite(n) ? n : null
}

function isNewerFile(a: string, b: string) {
  const ai = fileIndexFromName(a)
  const bi = fileIndexFromName(b)
  if (ai != null && bi != null)
    return ai > bi
  return a.localeCompare(b) > 0
}

async function loadCheckpoint(baseDir: string): Promise<Checkpoint> {
  const p = path.join(baseDir, '.checkpoint.json')
  try {
    const raw = await fs.readFile(p, 'utf-8')
    const obj = JSON.parse(raw) as Checkpoint
    if (!obj || typeof obj !== 'object')
      return { version: 1, folders: {} }
    if (typeof obj.version !== 'number')
      obj.version = 1
    obj.folders = obj.folders || {}
    return obj
  }
  catch {
    return { version: 1, folders: {} }
  }
}

async function saveCheckpoint(baseDir: string, ckpt: Checkpoint) {
  const p = path.join(baseDir, '.checkpoint.json')
  ckpt.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  await fs.writeFile(p, JSON.stringify(ckpt, null, 2), 'utf-8')
}

function toDateString(s: unknown) {
  if (!s || typeof s !== 'string')
    return null
  const d = dayjs(s)
  if (!d.isValid())
    return null
  return d.format('YYYY-MM-DD')
}

function toDateTimeString(s: unknown) {
  if (!s || typeof s !== 'string')
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
  const d = dayjs(s)
  if (!d.isValid())
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
  return d.format('YYYY-MM-DD HH:mm:ss')
}

interface Ev { op: string, key: string[], pk: Record<string, unknown>, fields: Record<string, unknown>, source?: string, updatedAt?: string | null }

function toSnakeCase(s: string) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase()
}

function tailNameFromId(id: string | undefined) {
  if (!id)
    return undefined
  const m = id.match(/^MetabaseForIdNumber(?:And)?(.+)?$/)
  if (!m)
    return undefined
  const tail = m[1] || ''
  return tail
}

async function loadIndexSchemas(metabasesDir: string) {
  const entries = await fs.readdir(metabasesDir)
  const files: string[] = []
  for (const e of entries) {
    const p = path.join(metabasesDir, e, 'index.ts')
    try {
      await fs.access(p)
      files.push(p)
    }
    catch {}
  }
  return files
}

interface JSONSchema {
  $id?: string
  title?: string
  type?: 'object' | 'string' | 'number' | 'array' | 'boolean' | 'null'
  properties?: Record<string, JSONSchema>
  required?: string[]
  enum?: readonly unknown[]
  items?: JSONSchema | JSONSchema[]
  format?: string
  ['x-parent-keys']?: string[]
  ['x-keys']?: string[]
}

interface SchemaMapping {
  keyPath: string
  keys: string[]
  table: string
  primaryKeys: string[]
  props: Record<string, JSONSchema>
}

async function buildMappings() {
  const metabasesDir = path.resolve(process.cwd(), 'src/metabases')
  const files = await loadIndexSchemas(metabasesDir)
  const maps: SchemaMapping[] = []
  for (const f of files) {
    const mod = await import(pathToFileURL(f).href) as Record<string, unknown>
    const candidates = Object.values(mod).filter(v => v && typeof v === 'object') as JSONSchema[]
    const schema = candidates.find(s => s && s.type === 'array' && s.items && typeof s.items === 'object')
    if (!schema)
      continue
    const items = schema.items as JSONSchema
    const parentKeys = Array.isArray((schema as any)['x-keys']) && (schema as any)['x-keys']!.length ? (schema as any)['x-keys'] as string[] : (Array.isArray((schema as any)['x-parent-keys']) && (schema as any)['x-parent-keys']!.length ? (schema as any)['x-parent-keys'] as string[] : ['idNumber'])
    const keyPath = parentKeys.join('-')
    const tail = tailNameFromId(schema.$id)
    const table = tail ? toSnakeCase(tail) : 'metabase_for_id_number'
    const uniq = Array.isArray(items.required) ? items.required : []
    const primaryKeys = Array.from(new Set([...parentKeys, ...uniq]))
    const props = items.properties || {}
    maps.push({ keyPath, keys: parentKeys, table, primaryKeys, props })
  }
  return maps
}

function convertPrimitive(schema: JSONSchema | undefined, name: string, value: unknown) {
  if (value == null)
    return null
  const t = schema?.type
  if (t === 'string') {
    if (schema?.format === 'date')
      return toDateString(String(value))
    if (schema?.format === 'date-time')
      return toDateTimeString(String(value))
    return String(value)
  }
  if (t === 'number') {
    const n = typeof value === 'number' ? value : Number(value as any)
    return Number.isFinite(n) ? n : null
  }
  if (t === 'boolean')
    return Boolean(value)
  return value
}

function mapRowFromEvent(ev: Ev, map: SchemaMapping) {
  const row: Record<string, unknown> = {}
  for (const k of map.primaryKeys) {
    const v = ev.pk[k as keyof typeof ev.pk]
    row[toSnakeCase(k)] = v == null ? null : String(v)
  }
  const updatedAt = toDateTimeString(ev.updatedAt)
  row.updated_at = updatedAt
  row.opss_updated_at_ms = Number(dayjs().valueOf())
  const f = ev.fields || {}
  const names = Object.keys(f).filter(n => n in map.props)
  for (const name of names) {
    if (map.primaryKeys.includes(name))
      continue
    const sch = map.props[name]
    const snake = toSnakeCase(name)
    const val = (f as any)[name]
    if (sch && sch.type === 'array') {
      const items = sch.items
      if (items && !Array.isArray(items) && items.type === 'object') {
        const childProps = items.properties || {}
        const arr = Array.isArray(val) ? val as any[] : []
        for (const [childName, childSchema] of Object.entries(childProps)) {
          const col = `${snake}.${toSnakeCase(childName)}`
          const childValues = arr.map(i => convertPrimitive(childSchema, childName, i?.[childName]))
          row[col] = childValues
        }
        continue
      }
      row[snake] = Array.isArray(val) ? val : []
      continue
    }
    if (sch && sch.type === 'object') {
      row[snake] = val ?? null
      continue
    }
    row[snake] = convertPrimitive(sch, name, val)
  }
  if (ev.op === 'd') {
    for (const name of names) {
      if (map.primaryKeys.includes(name))
        continue
      const sch = map.props[name]
      const snake = toSnakeCase(name)
      if (sch && sch.type === 'array') {
        const items = sch.items
        if (items && !Array.isArray(items) && items.type === 'object') {
          const childProps = items.properties || {}
          for (const childName of Object.keys(childProps)) {
            const col = `${snake}.${toSnakeCase(childName)}`
            row[col] = []
          }
          continue
        }
        row[snake] = []
        continue
      }
      row[snake] = null
    }
  }
  return row
}

async function applyEvents(baseDir: string, dryRun: boolean) {
  const database = env('CLICKHOUSE_DATABASE', 'opss')!
  const username = env('CLICKHOUSE_USERNAME', 'default')!
  const password = env('CLICKHOUSE_PASSWORD', '')!
  const client = dryRun ? null : createClient({ url: getBaseUrl(), database, username, password })
  const checkpoint = await loadCheckpoint(baseDir)
  let changed = false
  try {
    const sets = await readEvents(baseDir)
    const maps = await buildMappings()
    let total = 0
    for (const s of sets) {
      const rows: Record<string, unknown>[] = []
      const map = maps.find(m => m.keyPath === s.keyPath)
      if (!map)
        continue
      const last = checkpoint.folders[s.keyPath]?.lastFile
      const files = last ? s.files.filter(f => isNewerFile(path.basename(f), last)) : s.files
      if (files.length === 0)
        continue
      for (const file of files) {
        const raw = await fs.readFile(file, 'utf-8').catch(() => '')
        if (!raw)
          continue
        const ev = JSON.parse(raw) as Ev
        const op = (ev.op || '').toLowerCase()
        if (!op)
          continue
        rows.push(mapRowFromEvent(ev, map))
      }
      if (rows.length === 0)
        continue
      total += rows.length
      if (dryRun) {
        console.log(JSON.stringify({ table: map.table, count: rows.length, sample: rows[0] }, null, 2))
      }
      else {
        await (client as any).insert({ table: map.table, values: rows, format: 'JSONEachRow' })
        console.log(`已同步: ${map.table} -> ${rows.length}`)
        const lastFile = path.basename(files[files.length - 1]!)
        checkpoint.folders[s.keyPath] = { lastFile }
        changed = true
      }
    }
    if (dryRun)
      console.log(`预览完成，总计 ${total} 行`)
    else
      console.log(`同步完成，总计 ${total} 行`)
  }
  finally {
    if (client)
      await client.close()
    if (!dryRun && changed) {
      try {
        await saveCheckpoint(baseDir, checkpoint)
      }
      catch {}
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dirIdx = args.findIndex(a => a === '--dir')
  const baseDir = dirIdx >= 0 && args[dirIdx + 1] ? args[dirIdx + 1] : path.resolve(process.cwd(), 'src/cdc-data')
  const absDir = path.isAbsolute(baseDir) ? baseDir : path.resolve(process.cwd(), baseDir)
  const dryRun = args.includes('--dry-run')
  await applyEvents(absDir, dryRun)
}

main()

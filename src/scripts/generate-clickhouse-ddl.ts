import type { JSONSchema } from '../types/schemas'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createClient } from '@clickhouse/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function toSnakeCase(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
}

function enumToClickHouse(values: readonly unknown[]) {
  const arr = Array.isArray(values) ? values : []
  const strs = arr.filter(v => typeof v === 'string') as string[]
  if (strs.length === arr.length && strs.length > 0 && strs.length <= 127) {
    return `Enum8(${strs.map((v, i) => `'${v.replace(/'/g, '\'\'')}' = ${i + 1}`).join(', ')})`
  }
  return 'String'
}

function numberTypeByName(name: string) {
  const n = name.toLowerCase()
  if (/amount|金额|费用/i.test(n))
    return 'Decimal(10, 2)'
  if (n.endsWith('year'))
    return 'UInt16'
  if (n.endsWith('month'))
    return 'UInt8'
  if (n.endsWith('day'))
    return 'UInt8'
  return 'Float64'
}

function mapType(name: string, schema: JSONSchema | undefined): string {
  if (!schema || !schema.type)
    return 'String'
  if (schema.enum && Array.isArray(schema.enum))
    return enumToClickHouse(schema.enum)
  if (schema.type === 'string') {
    if (schema.format === 'date')
      return 'Date'
    if (schema.format === 'date-time')
      return 'DateTime'
    return 'String'
  }
  if (schema.type === 'number')
    return numberTypeByName(name)
  if (schema.type === 'boolean')
    return 'Bool'
  if (schema.type === 'array')
    return 'Array(String)'
  if (schema.type === 'object')
    return 'String'
  return 'String'
}

function isRequired(name: string, required?: string[]) {
  return Array.isArray(required) && required.includes(name)
}

function escapeComment(s: string | undefined) {
  if (!s)
    return undefined
  return s.replace(/'/g, '\'\'')
}

function colLine(name: string, type: string, required: boolean, comment?: string) {
  const col = toSnakeCase(name)
  const cmt = escapeComment(comment)
  if (required)
    return `  ${col} ${type}${cmt ? ` COMMENT '${cmt}'` : ''}`
  if (type.startsWith('Nullable('))
    return `  ${col} ${type}${cmt ? ` COMMENT '${cmt}'` : ''}`
  if (type === 'DateTime' || type === 'Date')
    return `  ${col} Nullable(${type})${cmt ? ` COMMENT '${cmt}'` : ''}`
  return `  ${col} Nullable(${type})${cmt ? ` COMMENT '${cmt}'` : ''}`
}

function buildColumnsFromProps(props: Record<string, JSONSchema> | undefined, required?: string[], specialNonNull: Set<string> = new Set()) {
  const out: string[] = []
  if (!props)
    return out
  for (const [name, sch] of Object.entries(props)) {
    const typ = mapType(name, sch)
    const req = specialNonNull.has(name) || isRequired(name, required)
    out.push(colLine(name, typ, req, sch.title))
  }
  return out
}

function inferUniqueKeys(items: JSONSchema | undefined): string[] {
  const req = items?.required || []
  return Array.isArray(req) ? req : []
}

function parentKeysFrom(schema: JSONSchema): string[] {
  const x = (schema as any)['x-parent-keys']
  if (Array.isArray(x) && x.length)
    return x as string[]
  return ['idNumber']
}

function ddlForTable(table: string, columns: string[], orderBy: string[], primaryKey: string[], tableComment?: string) {
  const cols = columns.join(',\n')
  const ob = orderBy.map(toSnakeCase).join(', ')
  const pk = primaryKey.map(toSnakeCase).join(', ')
  const cmt = escapeComment(tableComment)
  const create = `CREATE TABLE IF NOT EXISTS ${toSnakeCase(table)} (\n${cols}\n)\nENGINE = MergeTree()\nORDER BY (${ob})\nPRIMARY KEY (${pk})\nSETTINGS index_granularity = 8192;\n`
  const alter = cmt ? `ALTER TABLE ${toSnakeCase(table)} MODIFY COMMENT '${cmt}';\n` : ''
  return `${create}${alter}`
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

function tailNameFromId(id: string | undefined) {
  if (!id)
    return undefined
  const m = id.match(/^MetabaseForIdNumber(?:And)?(.+)?$/)
  if (!m)
    return undefined
  const tail = m[1] || ''
  return tail
}

async function generate(outDir: string) {
  const metabasesDir = path.resolve(__dirname, '../metabases')
  await fs.mkdir(outDir, { recursive: true })
  const files = await loadIndexSchemas(metabasesDir)
  const ddls: { name: string, sql: string }[] = []
  for (const f of files) {
    const mod = await import(pathToFileURL(f).href) as Record<string, unknown>
    const candidates = Object.values(mod).filter(v => v && typeof v === 'object') as JSONSchema[]
    const schema = candidates.find(s => s && s.type === 'array' && s.items && typeof s.items === 'object')
    if (!schema)
      continue
    const tail = tailNameFromId(schema.$id)
    const items = schema.items as JSONSchema
    if (!tail) {
      const props = items.properties || {}
      const specialNonNull = new Set<string>(['updatedAt'])
      const basic = props.basicRegistration as JSONSchema | undefined
      if (basic && basic.type === 'object') {
        const cols: string[] = []
        cols.push(colLine('idNumber', 'String', true, (items.properties || {}).idNumber?.title || '身份证件号码'))
        if (props.idType)
          cols.push(colLine('idType', mapType('idType', props.idType), true, props.idType.title))
        if (props.fullName)
          cols.push(colLine('fullName', mapType('fullName', props.fullName), true, props.fullName.title))
        cols.push(...buildColumnsFromProps(basic.properties, basic.required, specialNonNull))
        const sql = ddlForTable('basic_registration', cols, ['idNumber', 'updatedAt'], ['idNumber'], basic.title || schema.title)
        ddls.push({ name: 'basic_registration', sql })
      }
      const phone = props.contactPhone as JSONSchema | undefined
      if (phone && phone.type === 'array' && phone.items && typeof phone.items === 'object') {
        const ip = phone.items as JSONSchema
        const cols: string[] = []
        cols.push(colLine('idNumber', 'String', true, (items.properties || {}).idNumber?.title || '身份证件号码'))
        const uniq = inferUniqueKeys(ip)
        const uniqCols = uniq.length ? uniq : ['phoneNumber']
        const specialNonNull = new Set<string>(['updatedAt', ...uniqCols])
        cols.push(...buildColumnsFromProps(ip.properties, ip.required, specialNonNull))
        const sql = ddlForTable('contact_phone', cols, ['idNumber', ...uniqCols, 'updatedAt'], ['idNumber', ...uniqCols], phone.title || schema.title)
        ddls.push({ name: 'contact_phone', sql })
      }
      const address = props.contactAddress as JSONSchema | undefined
      if (address && address.type === 'array' && address.items && typeof address.items === 'object') {
        const ia = address.items as JSONSchema
        const cols: string[] = []
        cols.push(colLine('idNumber', 'String', true, (items.properties || {}).idNumber?.title || '身份证件号码'))
        const uniq = inferUniqueKeys(ia)
        const uniqCols = uniq.length ? uniq : ['addressName']
        const specialNonNull = new Set<string>(['updatedAt', ...uniqCols])
        cols.push(...buildColumnsFromProps(ia.properties, ia.required, specialNonNull))
        const sql = ddlForTable('contact_address', cols, ['idNumber', ...uniqCols, 'updatedAt'], ['idNumber', ...uniqCols], address.title || schema.title)
        ddls.push({ name: 'contact_address', sql })
      }
      continue
    }
    const tableName = toSnakeCase(tail || 'unknown')
    const parentKeys = parentKeysFrom(schema)
    const uniq = inferUniqueKeys(items)
    const specialNonNull = new Set<string>(['updatedAt'])
    const cols: string[] = []
    for (const pk of parentKeys)
      cols.push(colLine(pk, 'String', true, (items.properties || {})[pk]?.title || (pk === 'idNumber' ? '身份证件号码' : undefined)))
    for (const uk of uniq)
      cols.push(colLine(uk, mapType(uk, (items.properties || {})[uk]), true, (items.properties || {})[uk]?.title))
    const others = Object.keys(items.properties || {}).filter(k => !parentKeys.includes(k) && !uniq.includes(k))
    for (const k of others) {
      const sch = (items.properties || {})[k]
      const typ = mapType(k, sch)
      const req = specialNonNull.has(k)
      cols.push(colLine(k, typ, req, sch.title))
    }
    const orderBy = [...parentKeys, ...uniq, 'updatedAt']
    const primaryKey = [...parentKeys, ...uniq]
    const sql = ddlForTable(tableName, cols, orderBy, primaryKey, schema.title)
    ddls.push({ name: tableName, sql })
  }
  ddls.sort((a, b) => a.name.localeCompare(b.name))
  let idx = 1
  for (const d of ddls) {
    const name = `${String(idx).padStart(2, '0')}_${d.name}.sql`
    await fs.writeFile(path.join(outDir, name), d.sql, 'utf-8')
    idx++
  }
  return ddls
}

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

async function applyDdls(ddls: { name: string, sql: string }[]) {
  const baseUrl = getBaseUrl()
  const database = env('CLICKHOUSE_DATABASE', 'opss')!
  const username = env('CLICKHOUSE_USERNAME', 'default')!
  const password = env('CLICKHOUSE_PASSWORD', '')!
  const client = createClient({ url: baseUrl, database, username, password })
  try {
    for (const d of ddls)
      await client.command({ query: d.sql })
    console.log('已应用到数据库')
  }
  finally {
    await client.close()
  }
}

async function main() {
  const args = process.argv.slice(2)
  const outIdx = args.findIndex(a => a === '--out')
  const outDir = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : path.resolve(__dirname, '../clickhouse/sql/generated')
  const absOut = path.isAbsolute(outDir) ? outDir : path.resolve(process.cwd(), outDir)
  const ddls = await generate(absOut)
  console.log(`生成 ${ddls.length} 个表的建表语句到: ${absOut}`)
  if (args.includes('--apply'))
    await applyDdls(ddls)
}

main()

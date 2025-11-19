import process from 'node:process'
import { Client } from 'pg'

function env(k: string, d?: string) {
  const v = process.env[k]
  return v == null || v === '' ? d : v
}

function getConnectionConfig() {
  const connectionString = env('DATABASE_URL')
  if (connectionString) {
    return { connectionString }
  }

  return {
    host: env('PG_HOST', 'localhost'),
    port: Number.parseInt(env('PG_PORT', '5432')!),
    database: env('PG_DATABASE', 'opss'),
    user: env('PG_USER', 'postgres'),
    password: env('PG_PASSWORD', ''),
  }
}

async function main() {
  const config = getConnectionConfig()
  const client = new Client(config)

  try {
    await client.connect()

    console.log('查询生成的假数据:')
    console.log('='.repeat(50))

    const result = await client.query('SELECT * FROM ncybj_01_ncscxjmylbxjbxx_copy1 LIMIT 5')

    result.rows.forEach((row, index) => {
      console.log(`记录 ${index + 1}:`)
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      console.log('')
    })

    console.log(`总共查询到 ${result.rows.length} 条记录`)
  }
  catch (error) {
    console.error('查询失败:', error)
  }
  finally {
    await client.end()
  }
}

main()

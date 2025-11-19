import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
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

async function applySqlDir(client: Client, sqlDir: string) {
  const files = (await fs.readdir(sqlDir)).filter(f => f.toLowerCase().endsWith('.sql')).sort((a, b) => a.localeCompare(b))
  for (const f of files) {
    const p = path.join(sqlDir, f)
    const content = await fs.readFile(p, 'utf-8')
    const statements = content
      .split(/;\s*\n|;\s*$/)
      .map(s => s.trim())
      .filter(s => s.length && !s.startsWith('--'))

    for (const stmt of statements) {
      try {
        await client.query(stmt)
      }
      catch (error) {
        console.error(`执行失败: ${p} - ${stmt.substring(0, 50)}...`)
        throw error
      }
    }
    console.log(`已应用: ${p}`)
  }
}

async function runFakeDataScript(args: string[] = []) {
  return new Promise<void>((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), 'src/scripts/generate-fake-data.ts')
    const child = spawn('npx', ['tsx', scriptPath, ...args], {
      stdio: 'inherit',
      shell: true,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(`假数据生成脚本失败，退出码: ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const has = (flag: string) => args.includes(flag)
  const getArg = (flag: string) => {
    const i = args.findIndex(a => a === flag)
    return i >= 0 ? args[i + 1] : undefined
  }

  const config = getConnectionConfig()

  // 对于数据库删除和创建操作，需要连接到postgres数据库
  const adminConfig = {
    ...config,
    database: 'postgres', // 使用postgres数据库进行管理员操作
  }
  const adminClient = new Client(adminConfig)

  try {
    await adminClient.connect()

    if (has('--ping')) {
      const result = await adminClient.query('SELECT 1')
      if (result.rows.length > 0) {
        console.log('联通')
      }
      else {
        throw new Error('ping failed')
      }
      return
    }

    if (has('--drop-db')) {
      const database = env('PG_DATABASE', 'opss')
      try {
        const terminateSql = `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`
        const terminateRes = await adminClient.query(terminateSql, [database])
        console.log(`已终止 ${terminateRes.rowCount} 个会话`)

        await adminClient.query(`DROP DATABASE IF EXISTS "${database}"`)
        console.log(`数据库 ${database} 已删除`)
      }
      catch {
        console.warn(`删除数据库失败，尝试强制删除: ${database}`)
        // try {
        //   await adminClient.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`)
        //   console.log(`数据库 ${database} 已强制删除`)
        // }
        // catch (err2) {
        //   throw err2
        // }
      }
    }

    if (has('--create-db')) {
      const database = env('PG_DATABASE', 'opss')
      // 检查数据库是否已存在
      const checkResult = await adminClient.query(`
        SELECT 1 FROM pg_database WHERE datname = $1
      `, [database])

      if (checkResult.rows.length === 0) {
        // 使用引号包裹数据库名称以支持特殊字符
        await adminClient.query(`CREATE DATABASE "${database}"`)
        console.log(`数据库 ${database} 已创建`)
      }
      else {
        console.log(`数据库 ${database} 已存在，跳过创建`)
      }
    }

    if (has('--apply')) {
      // 重新连接到新创建的数据库
      const dbConfig = {
        ...config,
        database: env('PG_DATABASE', 'opss'),
      }
      const dbClient = new Client(dbConfig)

      try {
        await dbClient.connect()
        const sqlDir = getArg('--sql-dir') || path.resolve(process.cwd(), 'src/providers/sql')
        await applySqlDir(dbClient, path.isAbsolute(sqlDir) ? sqlDir : path.resolve(process.cwd(), sqlDir))
        console.log('已应用所有 SQL 文件')
      }
      finally {
        await dbClient.end()
      }
    }

    if (has('--generate-fake')) {
      console.log('开始生成假数据...')
      const fakeDataArgs: string[] = []

      if (has('--all')) {
        fakeDataArgs.push('--all')
      }
      if (has('--table')) {
        const tableName = getArg('--table')
        if (tableName) {
          fakeDataArgs.push('--table', tableName)
        }
      }
      if (has('--count')) {
        const count = getArg('--count')
        if (count) {
          fakeDataArgs.push('--count', count)
        }
      }

      await runFakeDataScript(fakeDataArgs)
      console.log('假数据生成完成')
    }

    if (!has('--ping') && !has('--drop-db') && !has('--create-db') && !has('--apply') && !has('--generate-fake')) {
      const result = await adminClient.query('SELECT 1')
      if (result.rows.length > 0) {
        console.log('联通')
      }
    }
  }
  catch (e: unknown) {
    console.log('未联通', e)
    process.exitCode = 1
  }
  finally {
    await adminClient.end()
  }
}

main()

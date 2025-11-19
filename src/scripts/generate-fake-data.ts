import process from 'node:process'
import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
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

// 生成中国身份证号码
function generateChineseID() {
  const area = '511381' // 南充地区代码
  const year = 1980 + Math.floor(Math.random() * 30)
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')
  const sequence = String(Math.floor(Math.random() * 999)).padStart(3, '0')
  const partial = area + year + month + day + sequence

  // 计算校验位
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += Number.parseInt(partial[i]) * weights[i]
  }

  const checkCode = checkCodes[sum % 11]
  return partial + checkCode
}

// 生成中文姓名
function generateChineseName() {
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗']
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '勇', '明', '华', '红', '平', '军', '艳', '刚', '健', '燕', '波']
  return surnames[Math.floor(Math.random() * surnames.length)]
    + names[Math.floor(Math.random() * names.length)]
    + (Math.random() > 0.3 ? names[Math.floor(Math.random() * names.length)] : '')
}

// 生成中文机构名称
function generateChineseOrganization() {
  const prefixes = ['南充市', '四川省', '西充县', '蓬安县', '阆中市']
  const types = ['人民医院', '中医院', '妇幼保健院', '社区卫生服务中心', '卫生院', '大药房', '医药公司', '诊所']
  const suffixes = ['', '第一', '第二', '第三', '中心', '人民']

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  const type = types[Math.floor(Math.random() * types.length)]

  return `${prefix}${suffix}${type}`
}

// 生成组织机构名称
function generateOrganizationName() {
  const orgs = ['琳琅居委会', '学堂沟村', '楼子寺村', '人民政府', '社区服务中心', '街道办事处', '物业管理公司', '劳务有限公司', '出租汽车有限公司']
  return orgs[Math.floor(Math.random() * orgs.length)]
}

// 表结构配置
const tableConfigs: Record<string, any> = {
  ncybj_01_ncscxjmylbxjbxx_copy1: {
    count: 50,
    generator: () => {
      const currentYear = new Date().getFullYear()
      const cbnd = currentYear - Math.floor(Math.random() * 5) // 最近5年
      return {
        sndcbjg: generateOrganizationName(),
        cccbnd: 2017 + Math.floor(Math.random() * 8),
        cbsf: ['居民', '职工', '学生', '儿童'][Math.floor(Math.random() * 4)],
        grbm: faker.string.numeric(18),
        xm: generateChineseName(),
        cbzt: ['正常参保', '暂停参保', '终止参保'][Math.floor(Math.random() * 3)],
        cbnd,
        jfzje: Number((Math.random() * 1000 + 200).toFixed(2)),
        grjfje: Number((Math.random() * 500 + 100).toFixed(2)),
        sfzh: generateChineseID(),
      }
    },
  },
  ncybj_02_ncsybddlsqyskmxxx_copy1: {
    count: 100,
    generator: () => {
      const settlementId = `511300G${faker.string.numeric(15)}`
      const idNumber = generateChineseID()
      return {
        jsID: settlementId,
        rybh: faker.string.numeric(20),
        ryxm: generateChineseName(),
        zjhm: idNumber,
        rylb: ['在职', '退休', '居民'][Math.floor(Math.random() * 3)],
        dwbh: `510000511300${faker.string.numeric(14)}`,
        dwmc: generateChineseOrganization(),
        ylfze: Number((Math.random() * 500 + 50).toFixed(2)),
        jjzfze: Number((Math.random() * 300).toFixed(2)),
        jgmc: generateChineseOrganization(),
      }
    },
  },
  szfgjj_grjcmx_copy1: {
    count: 80,
    generator: () => {
      const accountNumber = `000${faker.string.numeric(9)}`
      const idNumber = generateChineseID()
      const currentDate = new Date()
      const randomDate = dayjs(currentDate).subtract(Math.floor(Math.random() * 365 * 3), 'day').format('YYYY-MM-DD')

      return {
        grzh: accountNumber,
        jcdw: generateOrganizationName(),
        xingming: generateChineseName(),
        zjhm: idNumber,
        jcje: Number((Math.random() * 3000 + 500).toFixed(2)),
        jzrq: randomDate,
      }
    },
  },
}

// 生成假数据的通用函数
async function generateTableFakeData(client: Client, tableName: string, count?: number) {
  const config = tableConfigs[tableName]
  if (!config) {
    console.warn(`未找到表 ${tableName} 的配置，跳过假数据生成`)
    return 0
  }

  try {
    console.log(`正在处理表: ${tableName}`)

    // 获取表结构
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName])

    if (columnsResult.rows.length === 0) {
      console.log(`表 ${tableName} 没有列信息`)
      return 0
    }

    const rowCount = count || config.count
    console.log(`将生成 ${rowCount} 条数据`)
    const fakeData = []

    for (let i = 0; i < rowCount; i++) {
      const row = config.generator()
      fakeData.push(row)
    }

    console.log(`生成了 ${fakeData.length} 条假数据`)

    // 清空现有数据
    console.log(`清空表 ${tableName} 的现有数据`)
    await client.query(`DELETE FROM ${tableName}`)

    // 插入假数据
    let insertedCount = 0
    for (let i = 0; i < fakeData.length; i++) {
      const row = fakeData[i]
      try {
        const keys = Object.keys(row)
        const columns = keys.map(k => `"${k}"`).join(', ')
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const values = keys.map(k => (row as Record<string, any>)[k])

        await client.query(
          `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
          values,
        )
        insertedCount++
        if ((i + 1) % 10 === 0) {
          console.log(`已插入 ${i + 1}/${fakeData.length} 条数据`)
        }
      }
      catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.warn(`插入数据失败: ${msg}, 数据:`, row)
      }
    }

    console.log(`表 ${tableName} 已生成 ${insertedCount}/${rowCount} 条假数据`)
    return insertedCount
  }
  catch (error) {
    console.error(`生成表 ${tableName} 假数据失败:`, error)
    return 0
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const has = (flag: string) => args.includes(flag)
  const getArg = (flag: string) => {
    const i = args.findIndex(a => a === flag)
    return i >= 0 ? args[i + 1] : undefined
  }

  const config = getConnectionConfig()
  const client = new Client(config)

  try {
    await client.connect()
    console.log('数据库连接成功')

    // 获取要生成假数据的表
    let tables: string[] = []

    if (has('--all')) {
      tables = Object.keys(tableConfigs)
    }
    else if (has('--table')) {
      const tableName = getArg('--table')
      if (tableName) {
        tables = [tableName]
      }
    }
    else {
      // 默认生成所有已配置的表
      tables = Object.keys(tableConfigs)
    }

    // 获取数量参数
    const count = getArg('--count') ? Number.parseInt(getArg('--count')!) : undefined

    if (tables.length === 0) {
      console.log('未指定要生成假数据的表，使用 --all 或 --table <表名>')
      return
    }

    console.log(`开始为以下表生成假数据: ${tables.join(', ')}`)

    let totalInserted = 0
    for (const table of tables) {
      const inserted = await generateTableFakeData(client, table, count)
      totalInserted += inserted
    }

    console.log(`假数据生成完成，总共插入 ${totalInserted} 条数据`)
  }
  catch (error) {
    console.error('执行失败:', error)
    process.exitCode = 1
  }
  finally {
    await client.end()
  }
}

// 如果直接运行此脚本
console.log('假数据生成脚本启动...')
console.log('import.meta.url:', import.meta.url)
console.log('process.argv[1]:', process.argv[1])
console.log('参数:', process.argv.slice(2))
main()

export { generateTableFakeData, tableConfigs }

import type { Gender } from '../types/domain'
import type { KeySpec, MetabaseDefinition, Update } from '../types/schemas'

function deriveBirthFromId(row: { idNumber: string, updatedAt?: string }): Update[] {
  const id = row.idNumber
  if (!id || (id.length !== 18 && id.length !== 15))
    return []
  const s = id.toUpperCase()
  let y: string, m: string, d: string
  if (s.length === 18) {
    y = s.slice(6, 10)
    m = s.slice(10, 12)
    d = s.slice(12, 14)
  }
  else {
    y = `19${s.slice(6, 8)}`
    m = s.slice(8, 10)
    d = s.slice(10, 12)
  }
  if (!/^\d{4}$/.test(y) || !/^\d{2}$/.test(m) || !/^\d{2}$/.test(d))
    return []
  const ym = Number(m)
  const yd = Number(d)
  if (ym < 1 || ym > 12)
    return []
  if (yd < 1 || yd > 31)
    return []
  return [
    { key: ['idNumber', 'birthDate'], value: `${y}${m}${d}`, source: ['idNumber'], quality: 100, updatedAt: row.updatedAt },
    { key: ['idNumber', 'birthYear'], value: Number(y), source: ['idNumber'], quality: 100, updatedAt: row.updatedAt },
    { key: ['idNumber', 'birthMonth'], value: ym, source: ['idNumber'], quality: 100, updatedAt: row.updatedAt },
    { key: ['idNumber', 'birthDay'], value: yd, source: ['idNumber'], quality: 100, updatedAt: row.updatedAt },
  ]
}

function deriveGenderFromId(row: { idNumber: string, updatedAt?: string }): Update[] {
  const id = row.idNumber
  if (!id || (id.length !== 18 && id.length !== 15))
    return []
  const s = id.toUpperCase()
  const idx = s.length === 18 ? 16 : 14
  const gd = s[idx]
  if (!/^\d$/.test(gd))
    return []
  const gender: Gender = Number(gd) % 2 === 1 ? 'M' : 'F'
  return [
    { key: ['idNumber', 'gender'], value: gender, source: ['idNumber'], quality: 100, updatedAt: row.updatedAt },
  ]
}

const birthDateSpec: KeySpec = {
  key: ['idNumber', 'birthDate'],
  name: '出生日期',
  type: 'date',
  children: [
    { key: ['idNumber', 'birthYear'], name: '出生年份', type: 'number' },
    { key: ['idNumber', 'birthMonth'], name: '出生月份', type: 'number' },
    { key: ['idNumber', 'birthDay'], name: '出生日', type: 'number' },
  ],
  derive: deriveBirthFromId,
}

const genderSpec: KeySpec = {
  key: ['idNumber', 'gender'],
  name: '性别',
  type: 'enum',
  enumValues: ['M', 'F'],
  derive: deriveGenderFromId,
}

export const MetabaseForIdNumber: MetabaseDefinition = {
  uniqueKeys: [
    { key: 'idNumber', name: '身份证件号码', type: 'string' },
  ],
  dependentKeys: [
    { key: ['idNumber', 'fullName'], name: '姓名', type: 'string', validator: v => v ? undefined : { errorType: 'required', message: 'fullName is required' } },
    birthDateSpec,
    genderSpec,
    { key: ['idNumber', 'ethnicity'], name: '民族', type: 'string' },
    { key: ['idNumber', 'nationality'], name: '国籍', type: 'string' },
    { key: ['idNumber', 'politicalStatus'], name: '政治面貌', type: 'string' },
    { key: ['idNumber', 'religion'], name: '宗教信仰', type: 'string' },
    { key: ['idNumber', 'updatedAt'], name: '更新时间', type: 'date' },
    { key: ['idNumber', 'idType'], name: '身份证件类型', type: 'string' },
    { key: ['idNumber', 'formerName'], name: '曾用名', type: 'string' },
  ],
}

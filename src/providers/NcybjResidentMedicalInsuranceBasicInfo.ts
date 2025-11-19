import type { JSONSchema, ProviderScript } from '../types/schemas'

export interface NcybjResidentMedicalInsuranceBasicInfoRow {
  sndcbjg?: string
  cccbnd?: number
  cbsf?: string
  grbm?: string
  xm: string
  cbzt?: string
  cbnd?: number
  jfzje?: number
  grjfje?: number
  sfzh: string
  swap_data_time?: string
}

const RowSchema: JSONSchema = {
  title: '城乡居民医疗保险参保基本信息（提供端行结构）',
  type: 'object',
  properties: {
    sndcbjg: { type: 'string', title: '上年参保机构' },
    cccbnd: { type: 'number', title: '初次参保年度' },
    cbsf: { type: 'string', title: '参保身份' },
    grbm: { type: 'string', title: '个人编码' },
    xm: { type: 'string', title: '姓名' },
    cbzt: { type: 'string', title: '当前参保状态' },
    cbnd: { type: 'number', title: '当前缴费年度' },
    jfzje: { type: 'number', title: '当前缴费金额' },
    grjfje: { type: 'number', title: '当前缴费金额' },
    sfzh: { type: 'string', title: '身份证件号码' },
    swap_data_time: { type: 'string', format: 'date-time', title: '更新时间' },
  },
  required: ['sfzh', 'xm'],
}

export const NcybjResidentMedicalInsuranceBasicInfo: ProviderScript<NcybjResidentMedicalInsuranceBasicInfoRow> = {
  providerNameZh: '市医疗保障局',
  providerName: 'NcybjResidentMedicalInsuranceBasicInfo',
  rowSchema: RowSchema,
  map(row) {
    return [
      { key: ['idNumber'], value: row.sfzh },
      { key: ['idNumber', 'fullName'], value: row.xm },
    ]
  },
}

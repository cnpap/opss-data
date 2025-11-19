import type { JSONSchema, ProviderScript } from '../types/schemas'

export interface SzfgjjHousingProvidentFundDepositRecordRow {
  xh: number
  grzh: string
  jcdw?: string
  xingming: string
  zjhm?: string
  jcje: number
  jzrq: string
  swap_data_time?: string
}

const RowSchema: JSONSchema = {
  title: '个人缴存明细（提供端行结构）',
  type: 'object',
  properties: {
    xh: { type: 'number', title: '序号' },
    grzh: { type: 'string', title: '个人账号' },
    jcdw: { type: 'string', title: '缴存单位' },
    xingming: { type: 'string', title: '姓名' },
    zjhm: { type: 'string', title: '身份证件号码' },
    jcje: { type: 'number', title: '缴存金额' },
    jzrq: { type: 'string', format: 'date', title: '记账日期' },
    swap_data_time: { type: 'string', format: 'date-time', title: '更新时间' },
  },
  required: ['xh', 'grzh', 'xingming', 'jcje', 'jzrq'],
}

export const SzfgjjHousingProvidentFundDepositRecord: ProviderScript<SzfgjjHousingProvidentFundDepositRecordRow> = {
  providerNameZh: '市住房公积金管理中心',
  providerName: 'SzfgjjHousingProvidentFundDepositRecord',
  tableName: 'szfgjj_grjcmx_copy1',
  rowSchema: RowSchema,
  map(row) {
    return [
      { key: ['idNumber'], field: 'idNumber', value: row.zjhm, updatedAt: row.swap_data_time },
      { key: ['idNumber'], field: 'fullName', value: row.xingming, updatedAt: row.swap_data_time },
      { key: ['idNumber', 'personalAccount'], field: 'personalAccount', value: row.grzh, updatedAt: row.swap_data_time },
      { key: ['idNumber', 'personalAccount'], field: 'depositOrganization', value: row.jcdw, updatedAt: row.swap_data_time },
      { key: ['idNumber', 'personalAccount'], field: 'depositAmount', value: Number(row.jcje), updatedAt: row.swap_data_time },
      { key: ['idNumber', 'personalAccount'], field: 'postingDate', value: row.jzrq, updatedAt: row.swap_data_time },
    ]
  },
}

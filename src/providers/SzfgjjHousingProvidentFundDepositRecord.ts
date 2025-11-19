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
  rowSchema: RowSchema,
  map(row) {
    return [
      { key: ['idNumber'], value: row.zjhm },
      { key: ['idNumber', 'fullName'], value: row.xingming },
      { key: ['idNumber', 'personalAccount'], value: row.grzh },
      { key: ['idNumber', 'personalAccount', 'depositOrganization'], value: row.jcdw },
      { key: ['idNumber', 'personalAccount', 'depositAmount'], value: row.jcje },
      { key: ['idNumber', 'personalAccount', 'postingDate'], value: row.jzrq },
      { key: ['idNumber', 'personalAccount', 'updatedAt'], value: row.swap_data_time },
    ]
  },
}

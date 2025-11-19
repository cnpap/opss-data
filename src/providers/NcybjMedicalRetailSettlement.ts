import type { JSONSchema, ProviderScript } from '../types/schemas'

export interface NcybjMedicalRetailSettlementRow {
  jsID: string
  rybh?: string
  ryxm?: string
  zjhm: string
  rylb?: string
  dwbh?: string
  dwmc?: string
  ylfze?: number
  jjzfze?: number
  jgmc?: string
  swap_data_time?: string
}

const RowSchema: JSONSchema = {
  title: '医保定点零售药店刷卡明细（提供端行结构）',
  type: 'object',
  properties: {
    jsID: { type: 'string', title: '结算ID' },
    rybh: { type: 'string', title: '人员编号' },
    ryxm: { type: 'string', title: '人员姓名' },
    zjhm: { type: 'string', title: '身份证件号码' },
    rylb: { type: 'string', title: '类别' },
    dwbh: { type: 'string', title: '单位编号' },
    dwmc: { type: 'string', title: '单位名称' },
    ylfze: { type: 'number', title: '医疗费总额' },
    jjzfze: { type: 'number', title: '基金支付总额' },
    jgmc: { type: 'string', title: '机构名称' },
    swap_data_time: { type: 'string', format: 'date-time', title: '更新时间' },
  },
  required: ['zjhm', 'jsID'],
}

export const NcybjMedicalRetailSettlement: ProviderScript<NcybjMedicalRetailSettlementRow> = {
  providerNameZh: '市医疗保障局',
  providerName: 'NcybjMedicalRetailSettlement',
  tableName: 'ncybj_02_ncsybddlsqyskmxxx_copy1',
  rowSchema: RowSchema,
  map(row) {
    return [
      { key: ['idNumber'], field: 'idNumber', value: row.zjhm, updatedAt: row.swap_data_time },
      { key: ['idNumber'], field: 'fullName', value: row.ryxm, updatedAt: row.swap_data_time },
      { key: [], value: row.jsID },
      { key: [], value: row.rybh },
      { key: [], value: row.ryxm },
      { key: [], value: row.rylb },
      { key: [], value: row.dwbh },
      { key: [], value: row.dwmc },
      { key: [], value: row.ylfze },
      { key: [], value: row.jjzfze },
      { key: [], value: row.jgmc },
    ]
  },
}

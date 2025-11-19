import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndPersonalSocialSecurity: JSONSchema = {
  'title': '个人社保信息维度（社保）',
  '$id': 'MetabaseForIdNumberAndPersonalSocialSecurity',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'socialSecurityAccountNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      socialSecurityAccountNumber: { type: 'string', title: '社保账户编号' },
      currentSocialSecurityPayingEmployerName: { type: 'string', title: '当前社保缴纳单位' },
      hasMedicalInsurance: { type: 'boolean', title: '是否参与医疗保险' },
      hasUnemploymentInsurance: { type: 'boolean', title: '是否参与失业保险' },
      hasMaternityInsurance: { type: 'boolean', title: '是否参与生育保险' },
      hasPensionInsurance: { type: 'boolean', title: '是否参与养老保险' },
      hasWorkInjuryInsurance: { type: 'boolean', title: '是否参与工伤保险' },
      receivesPension: { type: 'boolean', title: '是否领取退休金' },
    },
    required: ['socialSecurityAccountNumber'],
    additionalProperties: false,
  },
}

import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndPersonalHealthcareInsurance: JSONSchema = {
  'title': '个人医保信息维度（医疗）',
  '$id': 'MetabaseForIdNumberAndPersonalHealthcareInsurance',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'medicalInsuranceAccountNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      medicalInsuranceAccountNumber: { type: 'string', title: '医疗保险账户编号' },
      medicalInsuranceBalance: { type: 'number', title: '医疗保险余额' },
      pensionInsuranceBalance: { type: 'number', title: '养老保险余额' },
      medicalInsuranceContributionAmount: { type: 'number', title: '缴纳医疗保险数额' },
      currentSocialSecurityPayingEmployerName: { type: 'string', title: '当前社保缴纳单位' },
    },
    required: ['medicalInsuranceAccountNumber'],
    additionalProperties: false,
  },
}

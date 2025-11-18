import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndSocialSecurityBenefitRecord: JSONSchema = {
  'title': '社保金领取记录维度（社保）',
  '$id': 'MetabaseForIdNumberAndSocialSecurityBenefitRecord',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      benefitRecordId: { type: 'string', title: '领取记录ID' },
      identityCode: { type: 'string', title: '身份识别码' },
      socialSecurityCategory: { type: 'string', title: '社保种类' },
      benefitCategory: { type: 'string', title: '待遇类别' },
      benefitDate: { type: 'string', format: 'date', title: '领取日期' },
      benefitAmount: { type: 'number', title: '领取金额' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['benefitRecordId'],
  },
}

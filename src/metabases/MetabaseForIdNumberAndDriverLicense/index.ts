import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndDriverLicense: JSONSchema = {
  'title': '驾驶证维度（交通）',
  '$id': 'MetabaseForIdNumberAndDriverLicense',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      licenseNumber: { type: 'string', title: '驾驶证编码' },
      permittedVehicleType: { type: 'string', title: '准驾车型' },
      firstIssueDate: { type: 'string', format: 'date', title: '初次领证日期' },
      validFrom: { type: 'string', format: 'date', title: '有效期始' },
      validTo: { type: 'string', format: 'date', title: '有效期止' },
      mobilePhone: { type: 'string', title: '手机号码' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['licenseNumber'],
    additionalProperties: false,
  },
}

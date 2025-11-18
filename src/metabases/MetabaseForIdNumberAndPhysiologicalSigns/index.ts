import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndPhysiologicalSigns: JSONSchema = {
  'title': '生理体征维度（卫生/民政）',
  '$id': 'MetabaseForIdNumberAndPhysiologicalSigns',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      healthStatus: { type: 'string', title: '健康状况' },
      weight: { type: 'number', title: '体重' },
      height: { type: 'number', title: '身高' },
      disabilityCertificateNumber: { type: 'string', title: '残疾证号' },
      disabilityType: { type: 'string', title: '残疾类型' },
      disabilityLevel: { type: 'string', title: '残疾等级' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['disabilityCertificateNumber'],
  },
}

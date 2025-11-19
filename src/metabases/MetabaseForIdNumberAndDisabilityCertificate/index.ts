import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndDisabilityCertificate: JSONSchema = {
  'title': '残疾证信息维度（人社）',
  '$id': 'MetabaseForIdNumberAndDisabilityCertificate',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'disabilityCertificateNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      disabilityCertificateNumber: { type: 'string', title: '残疾证号' },
      disabilityType: { type: 'string', title: '残疾类型' },
      disabilityLevel: { type: 'string', title: '残疾等级' },
    },
    required: ['disabilityCertificateNumber'],
    additionalProperties: false,
  },
}

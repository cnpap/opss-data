import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndCremation: JSONSchema = {
  'title': '火化维度（民政）',
  '$id': 'MetabaseForIdNumberAndCremation',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'cremationCertificateNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      deathDate: { type: 'string', format: 'date', title: '死亡日期' },
      deathTime: { type: 'string', format: 'date-time', title: '死亡时间' },
      deathCause: { type: 'string', title: '死亡原因' },
      cremationCertificateNumber: { type: 'string', title: '火化证件编号' },
      cremationDate: { type: 'string', format: 'date', title: '火化日期' },
    },
    additionalProperties: false,
    required: ['cremationCertificateNumber'],
  },
}

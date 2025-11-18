import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndDeathCancellation: JSONSchema = {
  'title': '死亡注销信息维度（民政）',
  '$id': 'MetabaseForIdNumberAndDeathCancellation',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      deathCancellationCertificateNumber: { type: 'string', title: '死亡注销证件编号' },
      deathDate: { type: 'string', format: 'date', title: '死亡日期' },
      deathTime: { type: 'string', format: 'date-time', title: '死亡时间' },
      deathCause: { type: 'string', title: '死亡原因' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['deathCancellationCertificateNumber'],
    additionalProperties: false,
  },
}

import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndCompulsoryEnforcement: JSONSchema = {
  'title': '强制执行维度（司法）',
  '$id': 'MetabaseForIdNumberAndCompulsoryEnforcement',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      enforcementCaseNumber: { type: 'string', title: '执行案号' },
      enforcementFilingTime: { type: 'string', format: 'date-time', title: '强制执行立案时间' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    additionalProperties: false,
    required: ['enforcementCaseNumber'],
  },
}

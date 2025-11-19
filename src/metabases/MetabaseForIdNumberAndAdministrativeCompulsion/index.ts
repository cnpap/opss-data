import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndAdministrativeCompulsion: JSONSchema = {
  'title': '行政强制维度（行政）',
  '$id': 'MetabaseForIdNumberAndAdministrativeCompulsion',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'executionDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      executionDocumentNumber: { type: 'string', title: '行政强制执行文号' },
      applicationDate: { type: 'string', format: 'date', title: '行政强制申请日期' },
      compulsionCategory: { type: 'string', title: '行政强制分类' },
      executionTime: { type: 'string', format: 'date-time', title: '行政强制执行时间' },
      counterpartyCategory: { type: 'string', title: '行政强制相对人分类' },
      unsealDate: { type: 'string', format: 'date', title: '行政强制解封日期' },
    },
    required: ['executionDocumentNumber'],
  },
}

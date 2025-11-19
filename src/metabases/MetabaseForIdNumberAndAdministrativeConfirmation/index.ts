import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndAdministrativeConfirmation: JSONSchema = {
  'title': '行政确认维度（行政）',
  '$id': 'MetabaseForIdNumberAndAdministrativeConfirmation',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'confirmationDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      confirmationDocumentNumber: { type: 'string', title: '行政确认文书号' },
      confirmationCategory: { type: 'string', title: '行政确认类别' },
      confirmationDate: { type: 'string', format: 'date', title: '行政确认日期' },
    },
    required: ['confirmationDocumentNumber'],
  },
}

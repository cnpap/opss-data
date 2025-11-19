import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndAdministrativeAdjudication: JSONSchema = {
  'title': '行政裁决维度（行政）',
  '$id': 'MetabaseForIdNumberAndAdministrativeAdjudication',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'adjudicationDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      adjudicationDocumentNumber: { type: 'string', title: '行政裁决文书号' },
      applicationMatter: { type: 'string', title: '行政裁决申请事项' },
      adjudicationAuthority: { type: 'string', title: '行政裁决实施机关' },
      paymentAmount: { type: 'number', title: '行政给付费用' },
      paymentDate: { type: 'string', format: 'date', title: '行政给付日期' },
    },
    required: ['adjudicationDocumentNumber'],
  },
}

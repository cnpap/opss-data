import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndDishonestEnforcement: JSONSchema = {
  'title': '失信被执行维度（司法）',
  '$id': 'MetabaseForIdNumberAndDishonestEnforcement',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'enforcementDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      enforcementDocumentNumber: { type: 'string', title: '失信被执行依据文号' },
      dishonestBehavior: { type: 'string', title: '失信行为' },
      recognitionDate: { type: 'string', format: 'date', title: '失信被执行认定日期' },
      filingDate: { type: 'string', format: 'date', title: '失信被执行立案日期' },
      performanceStatus: { type: 'string', title: '失信被执行履行情况' },
      listedReasonOrCircumstanceZh: { type: 'string', title: '列入事由/情形（中文名称）' },
    },
    required: ['enforcementDocumentNumber'],
  },
}

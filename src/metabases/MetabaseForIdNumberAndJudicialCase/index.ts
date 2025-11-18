import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndJudicialCase: JSONSchema = {
  'title': '司法案件维度（司法）',
  '$id': 'MetabaseForIdNumberAndJudicialCase',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      caseNumber: { type: 'string', title: '司法案件案号' },
      plaintiffName: { type: 'string', title: '司法案件原告人' },
      causeOfAction: { type: 'string', title: '司法案件案由' },
      filingDate: { type: 'string', format: 'date', title: '司法案件立案日期' },
      judgmentResult: { type: 'string', title: '司法案件判决结果' },
      enforcementCaseClosureDate: { type: 'string', format: 'date', title: '执行案件报结日期' },
      enforcementCaseClosureMethod: { type: 'string', title: '执行案件结案方式' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['caseNumber'],
  },
}

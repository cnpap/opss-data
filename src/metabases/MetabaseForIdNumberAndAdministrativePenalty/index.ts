import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndAdministrativePenalty: JSONSchema = {
  'title': '行政处罚维度（行政）',
  '$id': 'MetabaseForIdNumberAndAdministrativePenalty',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'decisionDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      decisionDocumentNumber: { type: 'string', title: '行政处罚决定书文号' },
      subjectOrganizationUSCC: { type: 'string', title: '行政处罚对象所在组织机构统一社会信用代码' },
      subjectOrganizationCode: { type: 'string', title: '行政处罚对象所在组织机构代码' },
      penaltyContent: { type: 'string', title: '行政处罚内容' },
      legalBasis: { type: 'string', title: '行政处罚依据' },
      penaltyAuthority: { type: 'string', title: '行政处罚机关' },
    },
    required: ['decisionDocumentNumber'],
  },
}

import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndCompetencyCredential: JSONSchema = {
  'title': '能力资质维度（就业）',
  '$id': 'MetabaseForIdNumberAndCompetencyCredential',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      competencyCertificateNumber: { type: 'string', title: '能力资质证件编号' },
      competencyCertificateName: { type: 'string', title: '能力资质证件名称' },
      issuingAuthorityName: { type: 'string', title: '能力资质证件签发机关名称' },
      issueDate: { type: 'string', format: 'date', title: '发证日期' },
      status: { type: 'string', title: '状态' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['competencyCertificateNumber'],
  },
}

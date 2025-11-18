import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndUnemployment: JSONSchema = {
  'title': '失业信息维度（就业）',
  '$id': 'MetabaseForIdNumberAndUnemployment',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      employmentEntrepreneurshipCertificateNumber: { type: 'string', title: '就业创业证编号' },
      issuingAuthority: { type: 'string', title: '就业创业证发证机构' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['employmentEntrepreneurshipCertificateNumber'],
  },
}

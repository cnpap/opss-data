import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndProfessionalQualification: JSONSchema = {
  'title': '从业资格维度（就业）',
  '$id': 'MetabaseForIdNumberAndProfessionalQualification',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'qualificationCertificateNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      qualificationCertificateNumber: { type: 'string', title: '从业资格证件编号' },
      qualificationCertificateName: { type: 'string', title: '从业资格证件名称' },
      qualificationCertificateType: { type: 'string', title: '从业资格证件类型' },
      issuingAuthorityName: { type: 'string', title: '从业资格证件签发机关名称' },
      validFrom: { type: 'string', format: 'date', title: '从业资格证件有效期起' },
      validTo: { type: 'string', format: 'date', title: '从业资格证件有效期止' },
      issueDate: { type: 'string', format: 'date', title: '从业资格证件签发日期' },
      firstIssueDate: { type: 'string', format: 'date', title: '从业资格证件初次签发日期' },
    },
    required: ['qualificationCertificateNumber'],
  },
}

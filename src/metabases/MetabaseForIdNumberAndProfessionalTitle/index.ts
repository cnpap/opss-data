import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndProfessionalTitle: JSONSchema = {
  'title': '职称信息维度（人社）',
  '$id': 'MetabaseForIdNumberAndProfessionalTitle',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'titleCertificateNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      titleCertificateNumber: { type: 'string', title: '职称证书编号' },
      titleName: { type: 'string', title: '职称名称' },
      currentTechnicalWork: { type: 'string', title: '现从事专业技术工作' },
      employerName: { type: 'string', title: '单位名称' },
      currentAdministrativePosition: { type: 'string', title: '现行政职务' },
      evaluationDate: { type: 'string', format: 'date', title: '评定时间' },
    },
    required: ['titleCertificateNumber'],
    additionalProperties: false,
  },
}

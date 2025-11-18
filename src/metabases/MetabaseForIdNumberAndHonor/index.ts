import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndHonor: JSONSchema = {
  'title': '荣誉维度（人社）',
  '$id': 'MetabaseForIdNumberAndHonor',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      honorCertificateNumber: { type: 'string', title: '荣誉证书编号' },
      honorLevel: { type: 'string', title: '荣誉级别' },
      recognitionDate: { type: 'string', format: 'date', title: '荣誉认定日期' },
      certificateValidFrom: { type: 'string', format: 'date', title: '荣誉证书有效期自' },
      certificateValidTo: { type: 'string', format: 'date', title: '荣誉证书有效期至' },
      issuingAuthorityName: { type: 'string', title: '荣誉颁发机构名称' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['honorCertificateNumber'],
  },
}

import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndAdministrativeLicense: JSONSchema = {
  'title': '行政许可维度（行政）',
  '$id': 'MetabaseForIdNumberAndAdministrativeLicense',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'licenseDocumentType'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      licenseDocumentType: { type: 'string', title: '许可文件类型' },
      licenseStatus: { type: 'string', title: '许可状态' },
      validFrom: { type: 'string', format: 'date', title: '许可有效期自' },
      validTo: { type: 'string', format: 'date', title: '许可有效期至' },
    },
    required: ['licenseDocumentType'],
  },
}

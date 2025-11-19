import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndDeclaredDeath: JSONSchema = {
  'title': '宣告死亡信息维度（民政）',
  '$id': 'MetabaseForIdNumberAndDeclaredDeath',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'declaredDeathDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      declaredDeathDocumentNumber: { type: 'string', title: '宣告死亡文书编号' },
      deathSentenceDate: { type: 'string', format: 'date', title: '死刑判决日期' },
    },
    required: ['declaredDeathDocumentNumber'],
    additionalProperties: false,
  },
}

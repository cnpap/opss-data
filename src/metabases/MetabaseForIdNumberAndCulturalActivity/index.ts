import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndCulturalActivity: JSONSchema = {
  'title': '文体活动维度（文体）',
  '$id': 'MetabaseForIdNumberAndCulturalActivity',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'activityName'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      activityName: { type: 'string', title: '活动名称' },
      totalVolunteerHours: { type: 'number', title: '志愿者活动总时长' },
    },
    required: ['activityName'],
    additionalProperties: false,
  },
}

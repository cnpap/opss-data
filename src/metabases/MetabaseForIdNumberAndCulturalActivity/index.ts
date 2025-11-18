import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndCulturalActivity: JSONSchema = {
  'title': '文体活动维度（文体）',
  '$id': 'MetabaseForIdNumberAndCulturalActivity',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      activityName: { type: 'string', title: '活动名称' },
      totalVolunteerHours: { type: 'number', title: '志愿者活动总时长' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['activityName'],
    additionalProperties: false,
  },
}

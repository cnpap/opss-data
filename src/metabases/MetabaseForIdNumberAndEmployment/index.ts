import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndEmployment: JSONSchema = {
  'title': '就业维度（就业）',
  '$id': 'MetabaseForIdNumberAndEmployment',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      employmentStatus: { type: 'string', title: '从业状况' },
      occupation: { type: 'string', title: '职业名称' },
      employerName: { type: 'string', title: '工作单位名称' },
      employerUSCC: { type: 'string', title: '工作单位统一社会信用代码' },
      currentPositionSince: {
        type: 'string',
        format: 'date',
        title: '现任岗位时间',
      },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['employerUSCC'],
    additionalProperties: false,
  },
}

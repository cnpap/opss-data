import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndVocationalEducation: JSONSchema = {
  'title': '职业教育信息维度（教育）',
  '$id': 'MetabaseForIdNumberAndVocationalEducation',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'schoolIdOrGraduatedSchool'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      schoolIdOrGraduatedSchool: { type: 'string', title: '学校唯一标识/毕业学校' },
      studentNumber: { type: 'string', title: '学号' },
      admissionDate: { type: 'string', format: 'date', title: '入学日期' },
      graduationDate: { type: 'string', format: 'date', title: '毕业日期' },
      major: { type: 'string', title: '所学专业' },
      academicSystem: { type: 'string', title: '学制' },
      gradeName: { type: 'string', title: '年级名称' },
      className: { type: 'string', title: '班级名称' },
    },
    required: ['schoolIdOrGraduatedSchool'],
    additionalProperties: false,
  },
}

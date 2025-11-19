import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndExam: JSONSchema = {
  'title': '考试维度（教育）',
  '$id': 'MetabaseForIdNumberAndExam',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'candidateNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      graduationType: { type: 'string', title: '毕业类型' },
      graduationCertificateNumber: { type: 'string', title: '毕业证号码' },
      candidateNumber: { type: 'string', title: '考生号' },
      subjectName: { type: 'string', title: '科目名称' },
      examScore: { type: 'number', title: '考试成绩' },
    },
    required: ['candidateNumber'],
  },
}

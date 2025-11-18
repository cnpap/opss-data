import type { JSONSchema } from '../../types/schemas'
import { EducationTypeSchema } from '../../types/common'

export const MetabaseForIdNumberAndSchool: JSONSchema = {
  title: '学校维度（教育）',
  $id: 'MetabaseForIdNumberAndSchool',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'array',
  properties: {
    idNumber: { type: 'string', title: '身份证件号码' },
    schoolIdOrGraduatedSchool: { type: 'string', title: '学校唯一标识/毕业学校' },
    educationType: EducationTypeSchema,
    studentNumber: { type: 'string', title: '学号' },
    gradeName: { type: 'string', title: '年级名称' },
    className: { type: 'string', title: '班级名称' },
    admissionDate: { type: 'string', format: 'date', title: '入学日期' },
    graduationDate: { type: 'string', format: 'date', title: '毕业日期' },
    updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
  },
  required: ['idNumber', 'schoolIdOrGraduatedSchool'],
}

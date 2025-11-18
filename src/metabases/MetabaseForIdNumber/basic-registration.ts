import type { JSONSchema } from '../../types/schemas'
import { GenderSchema } from '../../types/common'

export const BasicRegistration: JSONSchema = {
  title: '基本登记信息',
  type: 'object',
  properties: {
    formerName: { type: 'string', title: '曾用名' },
    gender: GenderSchema,
    birthDate: { type: 'string', title: '出生日期' },
    birthYear: { type: 'number', title: '出生年份' },
    birthMonth: { type: 'number', title: '出生月份' },
    birthDay: { type: 'number', title: '出生日' },
    ethnicity: { type: 'string', title: '民族' },
    nationality: { type: 'string', title: '国籍' },
    politicalStatus: { type: 'string', title: '政治面貌' },
    religion: { type: 'string', title: '宗教信仰' },
    updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
  },
}

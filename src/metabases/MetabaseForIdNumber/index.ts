import type { JSONSchema } from '../../types/schemas'
import { GenderSchema } from '../../types/common'

const ContactAddress: JSONSchema = {
  title: '联系地址',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      addressName: { type: 'string', title: '地址名称' },
    },
  },
}

const ContactPhone: JSONSchema = {
  title: '联系电话',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      phoneNumber: { type: 'string', title: '电话号码' },
    },
  },
}

export const MetabaseForIdNumber: JSONSchema = {
  'title': '按证件号码维度',
  '$id': 'MetabaseForIdNumber',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      idNumber: { type: 'string', title: '身份证件号码' },
      fullName: { type: 'string', title: '姓名' },
      idType: { type: 'string', title: '身份证件类型' },
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
      contactPhone: ContactPhone,
      contactAddress: ContactAddress,
    },
    required: ['idNumber'],
    additionalProperties: false,
  },
}

export * from './derivations'

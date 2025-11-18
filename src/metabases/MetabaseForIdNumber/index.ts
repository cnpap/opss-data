import type { JSONSchema } from '../../types/schemas'
import { BasicRegistration } from './basic-registration'
import { ContactAddress } from './contact-address'
import { ContactPhone } from './contact-phone'

export const MetabaseForIdNumber: JSONSchema = {
  title: '按证件号码维度',
  $id: 'MetabaseForIdNumber',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      idNumber: { type: 'string', title: '身份证件号码' },
      fullName: { type: 'string', title: '姓名' },
      idType: { type: 'string', title: '身份证件类型' },
      basicRegistration: BasicRegistration,
      contactPhone: ContactPhone,
      contactAddress: ContactAddress,
    },
    required: ['idNumber'],
    additionalProperties: false,
  },
}

export * from './derivations'

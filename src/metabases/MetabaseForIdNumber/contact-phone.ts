import type { JSONSchema } from '../../types/schemas'

export const ContactPhone: JSONSchema = {
  title: '联系电话',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      phoneNumber: { type: 'string', title: '电话号码' },
    },
  },
}

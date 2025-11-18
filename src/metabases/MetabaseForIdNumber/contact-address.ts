import type { JSONSchema } from '../../types/schemas'

export const ContactAddress: JSONSchema = {
  title: '联系地址',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      addressName: { type: 'string', title: '地址名称' },
      updatedAt: { type: 'string', format: 'date-time', title: '最后更新时间' },
    },
  },
}

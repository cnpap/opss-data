import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndHousingProvidentFundDepositRecord: JSONSchema = {
  'title': '个人公积金缴存记录维度（公积金）',
  '$id': 'MetabaseForIdNumberAndHousingProvidentFundDepositRecord',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      personalAccount: { type: 'string', title: '个人账户' },
      depositOrganization: { type: 'string', title: '缴存单位' },
      depositAmount: { type: 'number', title: '缴存金额' },
      postingDate: { type: 'string', format: 'date', title: '记账日期' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['personalAccount'],
  },
}

import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndRealEstateTransaction: JSONSchema = {
  'title': '房产交易信息维度（不动产）',
  '$id': 'MetabaseForIdNumberAndRealEstateTransaction',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      houseAddress: { type: 'string', title: '房屋地址' },
      housePropertyNature: { type: 'string', title: '房屋性质' },
      buildingArea: { type: 'number', title: '房屋建筑面积' },
      usageArea: { type: 'number', title: '房屋使用面积' },
      houseName: { type: 'string', title: '房屋名称' },
      houseNumber: { type: 'string', title: '房屋房号' },
      contractNumber: { type: 'string', title: '购房合同编号' },
      contractSigningDate: { type: 'string', format: 'date', title: '购房合同签订日期' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['contractNumber'],
    additionalProperties: false,
  },
}

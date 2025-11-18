import type { JSONSchema } from '../../types/schemas'

export const RealEstateCertificates: JSONSchema = {
  title: '不动产权证信息',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      certificateNumber: { type: 'string', title: '产权证编号' },
      registrationTime: { type: 'string', format: 'date-time', title: '不动产权登记时间' },
      unitNumber: { type: 'string', title: '不动产单元号' },
      administrativeRegionCode: { type: 'string', title: '不动产所属行政区编号' },
      ownershipMode: { type: 'string', title: '不动产权共有方式' },
      rightsShareRatio: { type: 'string', title: '不动产权利比例' },
      rightsNature: { type: 'string', title: '不动产权利性质' },
      rightsType: { type: 'string', title: '不动产权利类型' },
      rightsHolderType: { type: 'string', title: '不动产权利人类型' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
  },
}

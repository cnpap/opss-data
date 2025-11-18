import type { JSONSchema } from '../../types/schemas'

export const DriverLicenseBasic: JSONSchema = {
  title: '机动车驾驶证基本信息',
  type: 'object',
  properties: {
    mobilePhone: { type: 'string', title: '手机号码' },
    permittedVehicleType: { type: 'string', title: '准驾车型' },
    firstIssueDate: { type: 'string', format: 'date', title: '初次领证日期' },
    validFrom: { type: 'string', format: 'date', title: '有效期始' },
    validTo: { type: 'string', format: 'date', title: '有效期止' },
    updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
  },
}

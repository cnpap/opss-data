import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndMotorVehicle: JSONSchema = {
  'title': '机动车维度（交通）',
  '$id': 'MetabaseForIdNumberAndMotorVehicle',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'vehicleIdentificationNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      vehicleIdentificationNumber: { type: 'string', title: '车辆识别代号' },
      domesticOrImported: { type: 'string', title: '车辆国产或进口' },
      chineseBrand: { type: 'string', title: '车辆中文品牌' },
      model: { type: 'string', title: '车辆型号' },
      vehicleType: { type: 'string', title: '车辆类型' },
      drivingLicenseValidTo: { type: 'string', format: 'date', title: '行驶证有效期至' },
    },
    required: ['vehicleIdentificationNumber'],
  },
}

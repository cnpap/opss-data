import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndAgriculturalMachine: JSONSchema = {
  'title': '农机维度（农业）',
  '$id': 'MetabaseForIdNumberAndAgriculturalMachine',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'machineFrameNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      machineFrameNumber: { type: 'string', title: '农机机架号码' },
      cabPassengerCount: { type: 'number', title: '农机驾驶室乘人数' },
      machineType: { type: 'string', title: '农机类型' },
    },
    required: ['machineFrameNumber', 'cabPassengerCount', 'machineType'],
  },
}

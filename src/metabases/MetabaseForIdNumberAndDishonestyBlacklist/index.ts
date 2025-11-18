import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndDishonestyBlacklist: JSONSchema = {
  'title': '失信黑名单维度（信用）',
  '$id': 'MetabaseForIdNumberAndDishonestyBlacklist',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-parent-keys': ['idNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      caseNumber: { type: 'string', title: '案件编号' },
      listedDate: { type: 'string', format: 'date', title: '列入失信黑名单日期' },
      listingReason: { type: 'string', title: '列入失信黑名单事由' },
      removedDate: { type: 'string', format: 'date', title: '退出失信黑名单日期' },
      updatedAt: { type: 'string', format: 'date-time', title: '更新时间' },
    },
    required: ['caseNumber'],
  },
}

import type { JSONSchema } from '../types/schemas'
import { MetabaseForIdNumber } from './MetabaseForIdNumber/index'
import { MetabaseForIdNumberAndEmployment } from './MetabaseForIdNumberAndEmployment/index'
import { MetabaseForIdNumberAndSchool } from './MetabaseForIdNumberAndSchool/index'

export * from './MetabaseForIdNumber/index'
export * from './MetabaseForIdNumberAndEmployment/index'
export * from './MetabaseForIdNumberAndSchool/index'

export const all: Record<string, JSONSchema> = {
  MetabaseForIdNumber,
  MetabaseForIdNumberAndEmployment,
  MetabaseForIdNumberAndSchool,
}

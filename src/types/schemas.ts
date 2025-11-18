export interface ValidationError {
  errorType: string
  message: string
}

export type KeyDataType = 'string' | 'number' | 'date' | 'enum'

export type KeyTuple = string[]

export interface BaseRow {
  idNumber: string
  updatedAt?: string
}

export interface Update {
  key: KeyTuple
  value: unknown
  source: KeyTuple | string
  quality: number
  updatedAt?: string
}

export interface KeySpec {
  key: KeyTuple | string
  name: string
  type: KeyDataType
  enumValues?: readonly unknown[]
  validator?: (value: unknown) => ValidationError | undefined
  children?: KeySpec[]
  derive?: (row: BaseRow) => Update[]
}

export interface MetabaseDefinition {
  uniqueKeys: KeySpec[]
  dependentKeys: KeySpec[]
}

export interface ProviderScript<Row extends object> {
  providerNameZh: string
  providerName: string
  topic: 'BasicRegistration'
  rowSchema?: Record<string, string>
  map: (row: Row) => Update[]
}

import type { ProviderScript } from '../types/schemas'

export interface PSBRow {
  idType: string
  idNumber: string
  fullName: string
  updatedAt?: string
}

export const PublicSecurityBureau: ProviderScript<PSBRow> = {
  providerNameZh: '市公安局',
  providerName: 'PublicSecurityBureau',
  topic: 'BasicRegistration',
  map(row) {
    return [
      {
        key: ['idNumber', 'idType'],
        value: row.idType,
        source: 'PublicSecurityBureau',
        quality: 90,
        updatedAt: row.updatedAt,
      },
      {
        key: ['idNumber', 'fullName'],
        value: row.fullName,
        source: 'PublicSecurityBureau',
        quality: 90,
        updatedAt: row.updatedAt,
      },
    ]
  },
}

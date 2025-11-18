import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MetabaseForIdNumber, PublicSecurityBureau } from '../src/index'

interface PSBRow {
  idType: string
  idNumber: string
  fullName: string
  updatedAt?: string
}

function getDerived(row: { idNumber: string, updatedAt?: string }) {
  const birthSpec = MetabaseForIdNumber.dependentKeys.find(k => Array.isArray(k.key) && k.key[1] === 'birthDate')
  const genderSpec = MetabaseForIdNumber.dependentKeys.find(k => Array.isArray(k.key) && k.key[1] === 'gender')
  const birthUpdates = birthSpec?.derive ? birthSpec.derive(row) : []
  const genderUpdates = genderSpec?.derive ? genderSpec.derive(row) : []
  return [...birthUpdates, ...genderUpdates]
}

describe('provider mapping aligns with MetabaseForIdNumber keys', () => {
  const samplePath = resolve(__dirname, '../src/sample-data/providers/PublicSecurityBureau.json')
  const rows: PSBRow[] = JSON.parse(readFileSync(samplePath, 'utf-8'))

  it('maps provider fields into updates', () => {
    const updates = rows.flatMap(r => PublicSecurityBureau.map(r))
    expect(updates.length).toBe(rows.length * 2)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const u1 = updates[i * 2]
      const u2 = updates[i * 2 + 1]
      expect(u1.key).toEqual(['idNumber', 'idType'])
      expect(u1.value).toEqual(row.idType)
      expect(u2.key).toEqual(['idNumber', 'fullName'])
      const val = typeof u2.value === 'function' ? (u2.value as (r: PSBRow) => unknown)(row) : u2.value
      expect(val).toEqual(row.fullName)
    }
  })

  it('derives birthDate and gender from idNumber', () => {
    const derived = rows.flatMap(r => getDerived({ idNumber: r.idNumber, updatedAt: r.updatedAt }))
    const picked = (k: string) => derived.find(u => Array.isArray(u.key) && u.key[1] === k)?.value

    expect(picked('birthDate')).toBe('19491231')
    expect(picked('gender')).toBe('F')

    const derived2 = getDerived({ idNumber: rows[1].idNumber, updatedAt: rows[1].updatedAt })
    const pick2 = (k: string) => derived2.find(u => Array.isArray(u.key) && u.key[1] === k)?.value
    expect(pick2('birthDate')).toBe('19980315')
    expect(pick2('gender')).toBe('F')
  })
})

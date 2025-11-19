import type { Gender } from '../../types/common'
import type { Update } from '../../types/schemas'

export function deriveBirthFromId(row: {
  idNumber: string
  updatedAt?: string
}): Update[] {
  const id = row.idNumber
  if (!id || (id.length !== 18 && id.length !== 15))
    return []
  const s = id.toUpperCase()
  let y: string, m: string, d: string
  if (s.length === 18) {
    y = s.slice(6, 10)
    m = s.slice(10, 12)
    d = s.slice(12, 14)
  }
  else {
    y = `19${s.slice(6, 8)}`
    m = s.slice(8, 10)
    d = s.slice(10, 12)
  }
  if (!/^\d{4}$/.test(y) || !/^\d{2}$/.test(m) || !/^\d{2}$/.test(d))
    return []
  const ym = Number(m)
  const yd = Number(d)
  if (ym < 1 || ym > 12)
    return []
  if (yd < 1 || yd > 31)
    return []
  return [
    {
      key: ['idNumber', 'birthDate'],
      value: `${y}${m}${d}`,
      source: ['idNumber'],
      quality: 100,
      updatedAt: row.updatedAt,
    },
    {
      key: ['idNumber', 'birthYear'],
      value: Number(y),
      source: ['idNumber'],
      quality: 100,
      updatedAt: row.updatedAt,
    },
    {
      key: ['idNumber', 'birthMonth'],
      value: ym,
      source: ['idNumber'],
      quality: 100,
      updatedAt: row.updatedAt,
    },
    {
      key: ['idNumber', 'birthDay'],
      value: yd,
      source: ['idNumber'],
      quality: 100,
      updatedAt: row.updatedAt,
    },
  ]
}

export function deriveGenderFromId(row: {
  idNumber: string
  updatedAt?: string
}): Update[] {
  const id = row.idNumber
  if (!id || (id.length !== 18 && id.length !== 15))
    return []
  const s = id.toUpperCase()
  const idx = s.length === 18 ? 16 : 14
  const gd = s[idx]
  if (!/^\d$/.test(gd))
    return []
  const gender: Gender = Number(gd) % 2 === 1 ? 'M' : 'F'
  return [
    {
      key: ['idNumber', 'gender'],
      value: gender,
      source: ['idNumber'],
      quality: 100,
      updatedAt: row.updatedAt,
    },
  ]
}

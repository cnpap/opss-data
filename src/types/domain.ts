export type Gender = 'M' | 'F'

export interface MetabaseRegistrationRecord {
  idType: string
  idNumber: string
  fullName: string
  formerName?: string
  gender?: Gender
  birthDate?: string
  birthYear?: number
  birthMonth?: number
  birthDay?: number
  ethnicity?: string
  nationality?: string
  politicalStatus?: string
  religion?: string
  updatedAt?: string
}

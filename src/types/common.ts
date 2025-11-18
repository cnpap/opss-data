import type { JSONSchema } from './schemas'

export type Gender = 'M' | 'F'

export const GenderValues: readonly Gender[] = ['M', 'F'] as const

export const GenderSchema: JSONSchema = {
  type: 'string',
  enum: GenderValues,
  title: '性别',
}

export type EducationType = 'preSchool' | 'compulsory' | 'highSchool'

export const EducationTypeValues: readonly EducationType[] = [
  'preSchool',
  'compulsory',
  'highSchool',
] as const

export const EducationTypeSchema: JSONSchema = {
  type: 'string',
  enum: EducationTypeValues,
  title: '教育类型',
  description: 'preSchool=学前教育；compulsory=义务教育；highSchool=高中教育',
}

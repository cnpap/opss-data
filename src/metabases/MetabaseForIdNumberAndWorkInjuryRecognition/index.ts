import type { JSONSchema } from '../../types/schemas'

export const MetabaseForIdNumberAndWorkInjuryRecognition: JSONSchema = {
  'title': '工伤认定信息维度（人社）',
  '$id': 'MetabaseForIdNumberAndWorkInjuryRecognition',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'x-keys': ['idNumber', 'recognitionDocumentNumber'],
  'type': 'array',
  'items': {
    type: 'object',
    properties: {
      recognitionDocumentNumber: { type: 'string', title: '工伤认定文书编号' },
      injuryOccurrenceTime: { type: 'string', format: 'date-time', title: '工伤发生时间' },
      recognitionTime: { type: 'string', format: 'date-time', title: '工伤认定时间' },
      applicationDate: { type: 'string', format: 'date', title: '工伤认定申请日期' },
      employerName: { type: 'string', title: '用人单位' },
      employerUSCC: { type: 'string', title: '统一社会信用代码' },
      applicantRelationToInjuredWorker: { type: 'string', title: '认定申请人与工伤职工关系' },
      recognitionConclusion: { type: 'string', title: '工伤认定结论' },
      recognitionBasisCategory: { type: 'string', title: '认定依据类别' },
      occupationAtInjury: { type: 'string', title: '受伤时的职业/工种' },
      accidentCategory: { type: 'string', title: '事故类别' },
      injurySeverity: { type: 'string', title: '伤害程度' },
      occupationalDiseaseName: { type: 'string', title: '职业病名称' },
      monthsOfExposureToHazardousWork: { type: 'number', title: '接触职业病危害月数' },
      injuredBodyPart: { type: 'string', title: '受伤害部位' },
    },
    required: ['recognitionDocumentNumber'],
    additionalProperties: false,
  },
}

export type AssessmentType = 'written' | 'oral'

import { GradingCurveConfig } from './GradingCurve'

export interface Assessment {
  id: string
  classId: string
  subjectId: string
  title: string
  type: AssessmentType
  date: Date
  gradingCurve?: GradingCurveConfig | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateAssessmentInput {
  classId: string
  subjectId: string
  title: string
  type: AssessmentType
  date: Date
  gradingCurve?: GradingCurveConfig | null
}

export interface AssessmentStoreValue {
  assessments: Assessment[]
  loading: boolean
  loadAssessments: () => Promise<void>
  createAssessment: (input: CreateAssessmentInput) => Promise<Assessment>
  updateAssessment: (
    assessmentId: string,
    updates: Partial<Assessment>
  ) => Promise<Assessment>
}

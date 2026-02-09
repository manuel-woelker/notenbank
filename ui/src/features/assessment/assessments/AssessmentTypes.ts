export type AssessmentType = 'written' | 'oral'

export interface Assessment {
  id: string
  classId: string
  subjectId: string
  title: string
  type: AssessmentType
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateAssessmentInput {
  classId: string
  subjectId: string
  title: string
  type: AssessmentType
  date: Date
}

export interface AssessmentStoreValue {
  assessments: Assessment[]
  loading: boolean
  loadAssessments: () => Promise<void>
  createAssessment: (input: CreateAssessmentInput) => Promise<Assessment>
}

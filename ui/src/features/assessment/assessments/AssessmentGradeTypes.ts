import { BaseEntity } from '../../../shared/repositories/RepositoryTypes'
import { Grade } from '../../../shared/Grade'

export interface AssessmentGrade extends BaseEntity {
  assessmentId: string
  studentId: string
  grade: Grade
  points?: number | null
  errors?: number | null
}

export interface CreateAssessmentGradeInput {
  assessmentId: string
  studentId: string
  grade: Grade
  points?: number | null
  errors?: number | null
}

export interface AssessmentGradeStoreValue {
  assessmentGrades: AssessmentGrade[]
  loading: boolean
  loadAssessmentGrades: () => Promise<void>
  setAssessmentGrade: (
    assessmentId: string,
    studentId: string,
    grade: Grade | null
  ) => Promise<void>
  setAssessmentResult: (
    assessmentId: string,
    studentId: string,
    result: {
      grade: Grade | null
      points?: number | null
      errors?: number | null
    }
  ) => Promise<void>
}

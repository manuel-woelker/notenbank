import { BaseEntity } from '../../../shared/repositories/RepositoryTypes'
import { Grade } from '../../../shared/Grade'

export interface AssessmentGrade extends BaseEntity {
  assessmentId: string
  studentId: string
  grade: Grade
}

export interface CreateAssessmentGradeInput {
  assessmentId: string
  studentId: string
  grade: Grade
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
}

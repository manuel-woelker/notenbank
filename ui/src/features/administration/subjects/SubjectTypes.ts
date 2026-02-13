import { BaseEntity } from '../../../shared/repositories/RepositoryTypes'

/**
 * Subject entity representing a subject within a class
 */
export interface Subject extends BaseEntity {
  name: string
  classId: string
}

/**
 * Input data for creating a new subject
 */
export interface CreateSubjectInput {
  name: string
  classId: string
}

/**
 * Context value provided to components
 */
export interface SubjectStoreValue {
  subjects: Subject[]
  loading: boolean
  loadSubjects: () => Promise<void>
  createSubject: (input: CreateSubjectInput) => Promise<Subject>
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<Subject>
}

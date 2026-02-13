import { BaseEntity } from '../../../shared/repositories/RepositoryTypes'

/**
 * Student entity representing a student in the administration system
 */
export interface Student extends BaseEntity {
  firstName: string
  lastName: string
  classId: string
}

/**
 * Input data for creating a new student
 */
export interface CreateStudentInput {
  firstName: string
  lastName: string
  classId: string
}

/**
 * Context value provided to components
 */
export interface StudentStoreValue {
  students: Student[]
  loading: boolean
  loadStudents: () => Promise<void>
  createStudent: (input: CreateStudentInput) => Promise<Student>
  updateStudent: (id: string, updates: Partial<Student>) => Promise<Student>
}

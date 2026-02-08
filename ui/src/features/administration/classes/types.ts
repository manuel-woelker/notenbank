import { BaseEntity } from '../../../shared/repositories/types'

/**
 * Class entity representing a class/group in the student administration system
 */
export interface Class extends BaseEntity {
  name: string // Class name (e.g., "Class 5A", "Grade 10B")
}

/**
 * Input data for creating a new class
 */
export interface CreateClassInput {
  name: string
}

/**
 * Context value provided to components
 */
export interface ClassStoreValue {
  classes: Class[]
  loading: boolean
  loadClasses: () => Promise<void>
  createClass: (input: CreateClassInput) => Promise<Class>
}

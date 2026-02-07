/**
 * Class entity representing a class/group in the student administration system
 */
export interface Class {
  id: string // UUID for unique identification
  name: string // Class name (e.g., "Class 5A", "Grade 10B")
  createdAt: Date // Timestamp for creation
  updatedAt: Date // Timestamp for last update
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
export interface ClassContextValue {
  classes: Class[]
  loading: boolean
  loadClasses: () => Promise<void>
  createClass: (input: CreateClassInput) => Promise<Class>
}

import { Class, CreateClassInput } from './types'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'

const DB_NAME = 'notenbank'
const DB_VERSION = 1
const STORE_NAME = 'classes'

/* 📖 # Why maintain a ClassRepository type alias?
 *
 * While the repository is now generic, we maintain the ClassRepository type alias for:
 * 1. Backward compatibility with existing code (ClassContext, tests, etc.)
 * 2. Clear documentation of the repository's purpose and entity type
 * 3. Consistent naming pattern across all entity repositories
 *
 * This allows ClassContext and other consumers to continue using the familiar
 * ClassRepository type without needing to understand the generic implementation details.
 */
export type ClassRepository = Repository<Class, CreateClassInput>

/* 📖 # How to create repositories for future entities
 *
 * This pattern can be replicated for Students, Subjects, and other entities:
 *
 * ```typescript
 * export const studentRepository = createRepository<Student, CreateStudentInput>({
 *   dbName: 'notenbank',
 *   dbVersion: 2,  // Increment when adding new stores
 *   storeName: 'students',
 *   indexes: [
 *     { name: 'classId', keyPath: 'classId' },
 *     { name: 'lastName', keyPath: 'lastName' },
 *   ],
 * })
 * ```
 *
 * For entities with additional Date fields (e.g., Student.birthDate), provide
 * custom serialize/deserialize functions in the configuration.
 */
export const classRepository: ClassRepository = createRepository<
  Class,
  CreateClassInput
>({
  dbName: DB_NAME,
  dbVersion: DB_VERSION,
  storeName: STORE_NAME,
  indexes: [
    { name: 'name', keyPath: 'name', options: { unique: false } },
    { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
  ],
})

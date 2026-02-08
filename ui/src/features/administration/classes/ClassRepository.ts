import { z } from 'zod'
import { Class, CreateClassInput } from './ClassTypes'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_NAME,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'

const STORE_NAME = 'classes'

/* 📖 # Why maintain a ClassRepository type alias?
 *
 * While the repository is now generic, we maintain the ClassRepository type alias for:
 * 1. Backward compatibility with existing code (ClassStore, tests, etc.)
 * 2. Clear documentation of the repository's purpose and entity type
 * 3. Consistent naming pattern across all entity repositories
 *
 * This allows ClassStore and other consumers to continue using the familiar
 * ClassRepository type without needing to understand the generic implementation details.
 */
export type ClassRepository = Repository<Class, CreateClassInput>

const classSchemas = {
  entity: z.object({
    id: z.string(),
    name: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    name: z.string().min(1),
  }),
  update: z.object({
    name: z.string().min(1).optional(),
  }),
}

/* 📖 # How to create repositories for future entities
 *
 * This pattern can be replicated for Students, Subjects, and other entities:
 *
 * ```typescript
 * export const studentRepository = createRepository<Student, CreateStudentInput>({
 *   dbName: 'notenbank',
 *   dbVersion: 2,  // Increment when adding new stores
 *   storeName: 'students',
 *   schemas: {
 *     entity: z.object({
 *       id: z.string(),
 *       firstName: z.string().min(1),
 *       lastName: z.string().min(1),
 *       createdAt: z.date(),
 *       updatedAt: z.date(),
 *     }),
 *     create: z.object({
 *       firstName: z.string().min(1),
 *       lastName: z.string().min(1),
 *     }),
 *     update: z.object({
 *       firstName: z.string().min(1).optional(),
 *       lastName: z.string().min(1).optional(),
 *     }),
 *   },
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
  dbName: NOTENBANK_DB_NAME,
  dbVersion: NOTENBANK_DB_VERSION,
  storeName: STORE_NAME,
  indexes: [
    { name: 'name', keyPath: 'name', options: { unique: false } },
    { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
  ],
  schemas: classSchemas,
  onUpgrade: ensureNotenbankStores,
})

import { z } from 'zod'
import { Student, CreateStudentInput } from './StudentTypes'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'
import { createTrackingRepository } from '../../../shared/changeTracking/createTrackingRepository'

const STORE_NAME = 'students'

export type StudentRepository = Repository<Student, CreateStudentInput>

const studentSchemas = {
  entity: z.object({
    id: z.string(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    classId: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    classId: z.string().min(1),
  }),
  update: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    classId: z.string().min(1).optional(),
  }),
}

const baseStudentRepository: StudentRepository = createRepository<
  Student,
  CreateStudentInput
>({
  dbName: getActiveDatabaseName,
  dbVersion: NOTENBANK_DB_VERSION,
  storeName: STORE_NAME,
  indexes: [
    { name: 'classId', keyPath: 'classId', options: { unique: false } },
    { name: 'lastName', keyPath: 'lastName', options: { unique: false } },
    { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
  ],
  schemas: studentSchemas,
  onUpgrade: ensureNotenbankStores,
})

export const studentRepository: StudentRepository = createTrackingRepository(
  baseStudentRepository,
  'student'
)

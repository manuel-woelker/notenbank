import { z } from 'zod'
import {
  Assessment,
  AssessmentType,
  CreateAssessmentInput,
} from './AssessmentTypes'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'

const STORE_NAME = 'assessments'

export type AssessmentRepository = Repository<Assessment, CreateAssessmentInput>

const assessmentTypeSchema = z.enum(['written', 'oral'])

const assessmentSchemas = {
  entity: z.object({
    id: z.string(),
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    type: assessmentTypeSchema,
    date: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    type: assessmentTypeSchema,
    date: z.date(),
  }),
  update: z.object({
    classId: z.string().min(1).optional(),
    subjectId: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    type: assessmentTypeSchema.optional(),
    date: z.date().optional(),
  }),
}

export const assessmentRepository: AssessmentRepository = createRepository<
  Assessment,
  CreateAssessmentInput
>({
  dbName: getActiveDatabaseName,
  dbVersion: NOTENBANK_DB_VERSION,
  storeName: STORE_NAME,
  indexes: [
    { name: 'classId', keyPath: 'classId', options: { unique: false } },
    { name: 'subjectId', keyPath: 'subjectId', options: { unique: false } },
    { name: 'date', keyPath: 'date', options: { unique: false } },
  ],
  schemas: assessmentSchemas,
  onUpgrade: ensureNotenbankStores,
})

if (import.meta.vitest) {
  const { describe, it, expect, beforeAll } = import.meta.vitest
  const { IDBFactory } = await import('fake-indexeddb')

  describe('assessmentRepository', () => {
    beforeAll(() => {
      globalThis.indexedDB = new IDBFactory()
    })

    it('creates and retrieves assessments for a subject', async () => {
      const created = await assessmentRepository.create({
        classId: 'class-1',
        subjectId: 'subject-1',
        title: 'Klausur 1',
        type: 'written' satisfies AssessmentType,
        date: new Date('2025-01-12'),
      })

      const found = await assessmentRepository.findById(created.id)

      expect(found).toMatchObject({
        id: created.id,
        classId: 'class-1',
        subjectId: 'subject-1',
        title: 'Klausur 1',
        type: 'written',
      })
    })
  })
}

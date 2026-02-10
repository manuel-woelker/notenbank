import { z } from 'zod'
import {
  AssessmentGrade,
  CreateAssessmentGradeInput,
} from './AssessmentGradeTypes'
import { Grade, createGrade } from '../../../shared/Grade'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'

const STORE_NAME = 'assessmentGrades'

export type AssessmentGradeRepository = Repository<
  AssessmentGrade,
  CreateAssessmentGradeInput
>

const gradeSchema = z.custom<Grade>((value) => typeof value === 'number')

const assessmentGradeSchemas = {
  entity: z.object({
    id: z.string(),
    assessmentId: z.string().min(1),
    studentId: z.string().min(1),
    grade: gradeSchema,
    points: z.number().nullable().optional(),
    errors: z.number().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    assessmentId: z.string().min(1),
    studentId: z.string().min(1),
    grade: gradeSchema,
    points: z.number().nullable().optional(),
    errors: z.number().nullable().optional(),
  }),
  update: z.object({
    assessmentId: z.string().min(1).optional(),
    studentId: z.string().min(1).optional(),
    grade: gradeSchema.optional(),
    points: z.number().nullable().optional(),
    errors: z.number().nullable().optional(),
  }),
}

export const assessmentGradeRepository: AssessmentGradeRepository =
  createRepository<AssessmentGrade, CreateAssessmentGradeInput>({
    dbName: getActiveDatabaseName,
    dbVersion: NOTENBANK_DB_VERSION,
    storeName: STORE_NAME,
    indexes: [
      {
        name: 'assessmentId',
        keyPath: 'assessmentId',
        options: { unique: false },
      },
      { name: 'studentId', keyPath: 'studentId', options: { unique: false } },
      {
        name: 'assessmentStudent',
        keyPath: ['assessmentId', 'studentId'],
        options: { unique: true },
      },
    ],
    schemas: assessmentGradeSchemas,
    onUpgrade: ensureNotenbankStores,
  })

if (import.meta.vitest) {
  const { describe, it, expect, beforeAll } = import.meta.vitest
  const { IDBFactory } = await import('fake-indexeddb')

  describe('assessmentGradeRepository', () => {
    beforeAll(() => {
      globalThis.indexedDB = new IDBFactory()
    })

    it('creates and retrieves grades for an assessment', async () => {
      const created = await assessmentGradeRepository.create({
        assessmentId: 'assessment-1',
        studentId: 'student-1',
        grade: createGrade(2.0),
        points: 42.5,
      })

      const found = await assessmentGradeRepository.findById(created.id)

      expect(found).toMatchObject({
        id: created.id,
        assessmentId: 'assessment-1',
        studentId: 'student-1',
        grade: 2.0,
        points: 42.5,
      })
    })
  })
}

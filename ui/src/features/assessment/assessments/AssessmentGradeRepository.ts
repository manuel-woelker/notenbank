import { z } from 'zod'
import {
  AssessmentGrade,
  CreateAssessmentGradeInput,
} from './AssessmentGradeTypes'
import { Grade } from '../../../shared/Grade'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'
import { createTrackingRepository } from '../../../shared/changeTracking/createTrackingRepository'

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

const baseAssessmentGradeRepository: AssessmentGradeRepository =
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

/* 📖 # Why provide assessment lookup for grade tracking?
 *
 * AssessmentGrade entities only have assessmentId and studentId.
 * To enable filtering by class or subject, we need to look up the
 * assessment to get its classId and subjectId.
 *
 * We use a lazy import to avoid circular dependency issues.
 */
export const assessmentGradeRepository: AssessmentGradeRepository =
  createTrackingRepository(
    baseAssessmentGradeRepository,
    'assessment_grade',
    async (assessmentId: string) => {
      // Lazy import to avoid circular dependency
      const { assessmentRepository } = await import('./AssessmentRepository')
      return assessmentRepository.findById(assessmentId)
    }
  )

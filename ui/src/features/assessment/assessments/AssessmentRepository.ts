import { z } from 'zod'
import { Assessment, CreateAssessmentInput } from './AssessmentTypes'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'
import { createTrackingRepository } from '../../../shared/changeTracking/createTrackingRepository'

const STORE_NAME = 'assessments'

export type AssessmentRepository = Repository<Assessment, CreateAssessmentInput>

const assessmentTypeSchema = z.enum(['written', 'oral'])
const gradingCurveModeSchema = z.enum(['points', 'errors'])
const gradingCurveSchema = z.object({
  mode: gradingCurveModeSchema,
  grade1Value: z.number(),
  grade4Value: z.number(),
})

const assessmentSchemas = {
  entity: z.object({
    id: z.string(),
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    type: assessmentTypeSchema,
    date: z.date(),
    gradingCurve: gradingCurveSchema.nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    type: assessmentTypeSchema,
    date: z.date(),
    gradingCurve: gradingCurveSchema.nullable().optional(),
  }),
  update: z.object({
    classId: z.string().min(1).optional(),
    subjectId: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    type: assessmentTypeSchema.optional(),
    date: z.date().optional(),
    gradingCurve: gradingCurveSchema.nullable().optional(),
  }),
}

const baseAssessmentRepository: AssessmentRepository = createRepository<
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

export const assessmentRepository: AssessmentRepository =
  createTrackingRepository(baseAssessmentRepository, 'assessment')

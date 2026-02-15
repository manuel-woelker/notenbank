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

/* 📖 # Why serialize gradingCurve to JSON?
 *
 * TinyBase stores data as primitive key-value pairs and doesn't support
 * nested objects directly. The gradingCurve object needs to be serialized
 * to JSON for storage and parsed back when reading.
 */

// Extended serialized type that handles gradingCurve as a JSON string
interface SerializedAssessment {
  id: string
  classId: string
  subjectId: string
  title: string
  type: 'written' | 'oral'
  date: string
  gradingCurve: string | null
  createdAt: string
  updatedAt: string
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
  serialize: (entity) => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(entity)) {
      if (value instanceof Date) {
        result[key] = value.toISOString()
      } else if (
        key === 'gradingCurve' &&
        value !== null &&
        value !== undefined
      ) {
        result[key] = JSON.stringify(value)
      } else {
        result[key] = value
      }
    }
    return result as unknown as SerializedAssessment
  },
  deserialize: (data) => {
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        if (ISO_DATE_REGEX.test(value)) {
          result[key] = new Date(value)
        } else if (key === 'gradingCurve') {
          try {
            result[key] = JSON.parse(value)
          } catch {
            result[key] = null
          }
        } else {
          result[key] = value
        }
      } else {
        result[key] = value
      }
    }
    return result as unknown as Assessment
  },
})

export const assessmentRepository: AssessmentRepository =
  createTrackingRepository(baseAssessmentRepository, 'assessment')

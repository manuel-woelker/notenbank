import { z } from 'zod'
import {
  RecentAssessment,
  CreateRecentAssessmentRepositoryInput,
} from './RecentAssessmentTypes'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'

const STORE_NAME = 'recentAssessments'

export type RecentAssessmentRepository = Repository<
  RecentAssessment,
  CreateRecentAssessmentRepositoryInput
>

const recentAssessmentSchemas = {
  entity: z.object({
    id: z.string(),
    assessmentId: z.string().min(1),
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(['written', 'oral']),
    date: z.date(),
    accessedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    assessmentId: z.string().min(1),
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(['written', 'oral']),
    date: z.date(),
    accessedAt: z.date(),
  }),
  update: z.object({
    assessmentId: z.string().min(1).optional(),
    classId: z.string().min(1).optional(),
    subjectId: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    type: z.enum(['written', 'oral']).optional(),
    date: z.date().optional(),
    accessedAt: z.date().optional(),
  }),
}

export const recentAssessmentRepository: RecentAssessmentRepository =
  createRepository<RecentAssessment, CreateRecentAssessmentRepositoryInput>({
    dbName: getActiveDatabaseName,
    dbVersion: NOTENBANK_DB_VERSION,
    storeName: STORE_NAME,
    indexes: [
      {
        name: 'assessmentId',
        keyPath: 'assessmentId',
        options: { unique: false },
      },
      {
        name: 'accessedAt',
        keyPath: 'accessedAt',
        options: { unique: false },
      },
    ],
    schemas: recentAssessmentSchemas,
    onUpgrade: ensureNotenbankStores,
  })

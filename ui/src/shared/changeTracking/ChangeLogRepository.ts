import { z } from 'zod'
import { ChangeLog, EntityType, OperationType } from './ChangeLogTypes'
import { createRepository } from '../repositories/createRepository'
import type { Repository } from '../repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../repositories/notenbankDb'
import { getActiveDatabaseName } from '../store/databaseStore'
import { Serialized } from '../repositories/RepositoryTypes'

const STORE_NAME = 'changeLogs'

/* 📖 # Why a separate ChangeLog entity instead of modifying BaseEntity?
 *
 * ChangeLog has different fields than standard entities:
 * - Uses `timestamp` instead of `createdAt`/`updatedAt` (logs are immutable)
 * - Has denormalized context fields (classId, subjectId, etc.) for efficient querying
 * - Stores arbitrary entity data as JSON (entityData field)
 *
 * This separation keeps the core entity infrastructure simple while allowing
 * the audit trail to have its specialized schema.
 */

type CreateChangeLogInput = Omit<ChangeLog, 'id' | 'createdAt' | 'updatedAt'>

export type ChangeLogRepository = Repository<ChangeLog, CreateChangeLogInput>

/* 📖 # Why use timestamp instead of createdAt for change logs?
 *
 * Change logs are immutable audit records - they are never updated after creation.
 * Using a single `timestamp` field instead of `createdAt`/`updatedAt` makes this
 * semantic difference explicit and saves storage space.
 */
const changeLogSchemas = {
  entity: z.object({
    id: z.string(),
    timestamp: z.date(),
    userId: z.string(),
    operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    entityType: z.enum([
      'class',
      'student',
      'subject',
      'assessment',
      'assessment_grade',
    ]),
    entityId: z.string(),
    entityData: z.any(),
    description: z.string(),
    classId: z.string().optional(),
    subjectId: z.string().optional(),
    assessmentId: z.string().optional(),
    studentId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }) as z.ZodType<ChangeLog>,
  create: z.object({
    timestamp: z.date(),
    userId: z.string(),
    operation: z.enum(['CREATE', 'UPDATE', 'DELETE'] as const),
    entityType: z.enum([
      'class',
      'student',
      'subject',
      'assessment',
      'assessment_grade',
    ] as const),
    entityId: z.string(),
    entityData: z.any(),
    description: z.string(),
    classId: z.string().optional(),
    subjectId: z.string().optional(),
    assessmentId: z.string().optional(),
    studentId: z.string().optional(),
  }) as z.ZodType<CreateChangeLogInput>,
  update: z.object({}) as z.ZodType<Partial<ChangeLog>>, // Change logs are immutable, never updated
}

/* 📖 # Why custom serialization for ChangeLog?
 *
 * ChangeLog has both timestamp (primary) and createdAt/updatedAt (for BaseEntity compatibility).
 * All three date fields need Date↔string conversion. We set createdAt/updatedAt to timestamp value.
 */
function serializeChangeLog(entity: ChangeLog): Serialized<ChangeLog> {
  return {
    ...entity,
    timestamp: entity.timestamp.toISOString(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  } as Serialized<ChangeLog>
}

function deserializeChangeLog(data: Serialized<ChangeLog>): ChangeLog {
  const serialized = data as unknown as {
    timestamp: string
    createdAt: string
    updatedAt: string
  }
  return {
    ...data,
    timestamp: new Date(serialized.timestamp),
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
  } as ChangeLog
}

/* 📖 # Why these specific indexes?
 *
 * Query patterns for change tracking UI:
 * - Sort by timestamp (descending) - Primary index
 * - Filter by entity type (e.g., "show only grade changes")
 * - Filter by operation (e.g., "show only deletions")
 * - Filter by context (e.g., "show changes for class 10A")
 * - Filter by specific entity (e.g., "show changes to student X")
 *
 * The composite [classId, timestamp] index optimizes the common pattern of
 * "show all changes for a class, sorted by time".
 */
export const changeLogRepository: ChangeLogRepository = createRepository<
  ChangeLog,
  CreateChangeLogInput
>({
  dbName: getActiveDatabaseName,
  dbVersion: NOTENBANK_DB_VERSION,
  storeName: STORE_NAME,
  indexes: [
    { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } },
    { name: 'entityType', keyPath: 'entityType', options: { unique: false } },
    { name: 'operation', keyPath: 'operation', options: { unique: false } },
    { name: 'entityId', keyPath: 'entityId', options: { unique: false } },
    { name: 'classId', keyPath: 'classId', options: { unique: false } },
    { name: 'subjectId', keyPath: 'subjectId', options: { unique: false } },
    {
      name: 'assessmentId',
      keyPath: 'assessmentId',
      options: { unique: false },
    },
    { name: 'studentId', keyPath: 'studentId', options: { unique: false } },
    // Composite index for "class activity timeline" queries
    {
      name: 'classId_timestamp',
      keyPath: ['classId', 'timestamp'],
      options: { unique: false },
    },
  ],
  schemas: changeLogSchemas,
  serialize: serializeChangeLog,
  deserialize: deserializeChangeLog,
  onUpgrade: ensureNotenbankStores,
})

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { clearAllRepositoryCaches } =
    await import('../repositories/createRepository')

  describe('ChangeLogRepository', () => {
    beforeEach(async () => {
      await clearAllRepositoryCaches()
    })

    it('should create and retrieve a change log entry', async () => {
      const changeLog: CreateChangeLogInput = {
        timestamp: new Date('2024-01-15T10:00:00Z'),
        userId: 'System',
        operation: 'CREATE' as OperationType,
        entityType: 'class' as EntityType,
        entityId: 'class-1',
        entityData: { id: 'class-1', name: '10A' },
        description: "Klasse '10A' erstellt",
        classId: 'class-1',
      }

      const created = await changeLogRepository.create(changeLog)

      expect(created.id).toBeDefined()
      expect(created.timestamp).toEqual(changeLog.timestamp)
      expect(created.operation).toBe('CREATE')
      expect(created.entityType).toBe('class')
      expect(created.description).toBe("Klasse '10A' erstellt")

      const retrieved = await changeLogRepository.findById(created.id)
      expect(retrieved).toEqual(created)
      expect(retrieved?.timestamp).toBeInstanceOf(Date)
    })

    it('should retrieve all change log entries', async () => {
      const log1: CreateChangeLogInput = {
        timestamp: new Date('2024-01-15T10:00:00Z'),
        userId: 'System',
        operation: 'CREATE' as OperationType,
        entityType: 'class' as EntityType,
        entityId: 'class-1',
        entityData: { id: 'class-1', name: '10A' },
        description: "Klasse '10A' erstellt",
        classId: 'class-1',
      }

      const log2: CreateChangeLogInput = {
        timestamp: new Date('2024-01-15T11:00:00Z'),
        userId: 'System',
        operation: 'UPDATE' as OperationType,
        entityType: 'class' as EntityType,
        entityId: 'class-1',
        entityData: { id: 'class-1', name: '10A Updated' },
        description: "Klasse '10A' aktualisiert",
        classId: 'class-1',
      }

      await changeLogRepository.create(log1)
      await changeLogRepository.create(log2)

      const all = await changeLogRepository.findAll()
      expect(all).toHaveLength(2)
      expect(all[0].timestamp).toBeInstanceOf(Date)
      expect(all[1].timestamp).toBeInstanceOf(Date)
    })

    it('should handle change logs with all context fields', async () => {
      const changeLog: CreateChangeLogInput = {
        timestamp: new Date('2024-01-15T10:00:00Z'),
        userId: 'System',
        operation: 'CREATE' as OperationType,
        entityType: 'assessment_grade' as EntityType,
        entityId: 'grade-1',
        entityData: {
          id: 'grade-1',
          grade: 2.5,
          studentId: 'student-1',
          assessmentId: 'assessment-1',
        },
        description: 'Note für Max Mustermann erstellt',
        classId: 'class-1',
        subjectId: 'subject-1',
        assessmentId: 'assessment-1',
        studentId: 'student-1',
      }

      const created = await changeLogRepository.create(changeLog)

      expect(created.classId).toBe('class-1')
      expect(created.subjectId).toBe('subject-1')
      expect(created.assessmentId).toBe('assessment-1')
      expect(created.studentId).toBe('student-1')
    })

    it('should handle change logs without optional context fields', async () => {
      const changeLog: CreateChangeLogInput = {
        timestamp: new Date('2024-01-15T10:00:00Z'),
        userId: 'System',
        operation: 'DELETE' as OperationType,
        entityType: 'class' as EntityType,
        entityId: 'class-1',
        entityData: { id: 'class-1', name: '10A' },
        description: "Klasse '10A' gelöscht",
      }

      const created = await changeLogRepository.create(changeLog)

      expect(created.classId).toBeUndefined()
      expect(created.subjectId).toBeUndefined()
      expect(created.assessmentId).toBeUndefined()
      expect(created.studentId).toBeUndefined()
    })

    it('should properly serialize and deserialize timestamp field', async () => {
      const timestamp = new Date('2024-01-15T10:30:45.123Z')
      const changeLog: CreateChangeLogInput = {
        timestamp,
        userId: 'System',
        operation: 'UPDATE' as OperationType,
        entityType: 'student' as EntityType,
        entityId: 'student-1',
        entityData: {
          id: 'student-1',
          firstName: 'Max',
          lastName: 'Mustermann',
        },
        description: 'Student aktualisiert',
        studentId: 'student-1',
      }

      const created = await changeLogRepository.create(changeLog)
      const retrieved = await changeLogRepository.findById(created.id)

      expect(retrieved?.timestamp).toBeInstanceOf(Date)
      expect(retrieved?.timestamp.getTime()).toBe(timestamp.getTime())
    })
  })
}

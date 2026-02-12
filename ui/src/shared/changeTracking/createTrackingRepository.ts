import { Repository } from '../repositories/Repository'
import { BaseEntity, CreateInput } from '../repositories/RepositoryTypes'
import { changeLogRepository } from './ChangeLogRepository'
import { EntityType } from './ChangeLogTypes'
import { extractContext } from './contextExtractor'
import { generateDescription } from './descriptionGenerator'
import { Assessment } from '../../features/assessment/assessments/AssessmentTypes'

/* 📖 # Why use a wrapper pattern for tracking?
 *
 * Instead of modifying IndexedDBRepository directly, we wrap existing
 * repositories to add change tracking. This design provides:
 *
 * 1. Separation of concerns: Core repository logic remains untouched
 * 2. Flexibility: Easy to enable/disable tracking per entity
 * 3. Maintainability: Tracking logic is isolated in one place
 * 4. No breaking changes: Existing code continues to work unchanged
 */

/**
 * Wrap a repository to automatically track all changes
 *
 * @template T - The entity type
 * @template TCreate - The creation input type
 * @param repository - The base repository to wrap
 * @param entityType - The type of entity (for change log classification)
 * @param assessmentLookup - Optional function to look up assessments (needed for grade tracking)
 * @returns Wrapped repository that logs all changes
 *
 * @example
 * ```typescript
 * const baseRepository = createRepository<Class, CreateClassInput>({...})
 * export const classRepository = createTrackingRepository(baseRepository, 'class')
 * ```
 */
export function createTrackingRepository<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
>(
  repository: Repository<T, TCreate>,
  entityType: EntityType,
  assessmentLookup?: (assessmentId: string) => Promise<Assessment | null>
): Repository<T, TCreate> {
  return {
    schemas: repository.schemas,
    findAll: repository.findAll,
    findById: repository.findById,

    create: async (data: TCreate): Promise<T> => {
      // Execute the create operation
      const entity = await repository.create(data)

      // Log the change (errors are caught and logged but don't break the operation)
      try {
        const context = await extractContext(
          entityType,
          entity,
          assessmentLookup
        )
        const description = generateDescription(entityType, 'CREATE', entity)
        const now = new Date()

        await changeLogRepository.create({
          timestamp: now,
          userId: 'System', // TODO: Replace with actual user when authentication is implemented
          operation: 'CREATE',
          entityType,
          entityId: entity.id,
          entityData: entity,
          description,
          ...context,
        })
      } catch (error) {
        // Log error but don't break the main operation
        console.error(`Failed to log CREATE for ${entityType}:`, error)
      }

      return entity
    },

    update: async (id: string, data: Partial<T>): Promise<T> => {
      // Execute the update operation
      const entity = await repository.update(id, data)

      // Log the change
      try {
        const context = await extractContext(
          entityType,
          entity,
          assessmentLookup
        )
        const description = generateDescription(entityType, 'UPDATE', entity)
        const now = new Date()

        await changeLogRepository.create({
          timestamp: now,
          userId: 'System',
          operation: 'UPDATE',
          entityType,
          entityId: entity.id,
          entityData: entity,
          description,
          ...context,
        })
      } catch (error) {
        console.error(`Failed to log UPDATE for ${entityType}:`, error)
      }

      return entity
    },

    delete: async (id: string): Promise<void> => {
      /* 📖 # Why capture entity data before deletion?
       *
       * For DELETE operations, we need to capture the full entity state
       * before it's removed from the database. This allows:
       * - Recovery of accidentally deleted data
       * - Audit trail showing what was deleted
       * - Comparison with previous states
       */
      let entityBeforeDelete: T | null = null
      try {
        entityBeforeDelete = await repository.findById(id)
      } catch (error) {
        console.error(
          `Failed to fetch entity before delete for ${entityType}:`,
          error
        )
      }

      // Execute the delete operation
      await repository.delete(id)

      // Log the change
      if (entityBeforeDelete) {
        try {
          const context = await extractContext(
            entityType,
            entityBeforeDelete,
            assessmentLookup
          )
          const description = generateDescription(
            entityType,
            'DELETE',
            entityBeforeDelete
          )
          const now = new Date()

          await changeLogRepository.create({
            timestamp: now,
            userId: 'System',
            operation: 'DELETE',
            entityType,
            entityId: id,
            entityData: entityBeforeDelete,
            description,
            ...context,
          })
        } catch (error) {
          console.error(`Failed to log DELETE for ${entityType}:`, error)
        }
      }
    },
  }
}

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, vi } = import.meta.vitest
  const { IDBFactory } = await import('fake-indexeddb')

  describe('createTrackingRepository', () => {
    beforeEach(() => {
      globalThis.indexedDB = new IDBFactory()
    })

    it('should track CREATE operations', async () => {
      // Create a mock repository
      const mockEntity = {
        id: 'test-1',
        name: 'Test Class',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRepository: Repository<typeof mockEntity, { name: string }> = {
        schemas: {} as never,
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockEntity),
        update: vi.fn().mockResolvedValue(mockEntity),
        delete: vi.fn().mockResolvedValue(undefined),
      }

      // Wrap with tracking
      const trackedRepo = createTrackingRepository(mockRepository, 'class')

      // Create an entity
      const result = await trackedRepo.create({ name: 'Test Class' })

      // Verify the entity was created
      expect(result).toEqual(mockEntity)
      expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Test Class' })

      // Verify a change log entry was created
      const changeLogs = await changeLogRepository.findAll()
      expect(changeLogs).toHaveLength(1)
      expect(changeLogs[0].operation).toBe('CREATE')
      expect(changeLogs[0].entityType).toBe('class')
      expect(changeLogs[0].entityId).toBe('test-1')
      expect(changeLogs[0].description).toBe("Klasse 'Test Class' erstellt")
    })

    it('should track UPDATE operations', async () => {
      const mockEntity = {
        id: 'test-1',
        name: 'Updated Class',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRepository: Repository<typeof mockEntity, { name: string }> = {
        schemas: {} as never,
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(mockEntity),
        create: vi.fn().mockResolvedValue(mockEntity),
        update: vi.fn().mockResolvedValue(mockEntity),
        delete: vi.fn().mockResolvedValue(undefined),
      }

      const trackedRepo = createTrackingRepository(mockRepository, 'class')

      // Update an entity
      const result = await trackedRepo.update('test-1', {
        name: 'Updated Class',
      })

      // Verify the entity was updated
      expect(result).toEqual(mockEntity)
      expect(mockRepository.update).toHaveBeenCalledWith('test-1', {
        name: 'Updated Class',
      })

      // Verify a change log entry was created
      const changeLogs = await changeLogRepository.findAll()
      expect(changeLogs).toHaveLength(1)
      expect(changeLogs[0].operation).toBe('UPDATE')
      expect(changeLogs[0].entityType).toBe('class')
      expect(changeLogs[0].entityId).toBe('test-1')
      expect(changeLogs[0].description).toBe(
        "Klasse 'Updated Class' aktualisiert"
      )
    })

    it('should track DELETE operations', async () => {
      const mockEntity = {
        id: 'test-1',
        name: 'Deleted Class',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRepository: Repository<typeof mockEntity, { name: string }> = {
        schemas: {} as never,
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(mockEntity),
        create: vi.fn().mockResolvedValue(mockEntity),
        update: vi.fn().mockResolvedValue(mockEntity),
        delete: vi.fn().mockResolvedValue(undefined),
      }

      const trackedRepo = createTrackingRepository(mockRepository, 'class')

      // Delete an entity
      await trackedRepo.delete('test-1')

      // Verify the entity was deleted
      expect(mockRepository.delete).toHaveBeenCalledWith('test-1')

      // Verify a change log entry was created with entity data
      const changeLogs = await changeLogRepository.findAll()
      expect(changeLogs).toHaveLength(1)
      expect(changeLogs[0].operation).toBe('DELETE')
      expect(changeLogs[0].entityType).toBe('class')
      expect(changeLogs[0].entityId).toBe('test-1')
      expect(changeLogs[0].entityData).toEqual(mockEntity)
      expect(changeLogs[0].description).toBe("Klasse 'Deleted Class' gelöscht")
    })

    it('should not break operations if change logging fails', async () => {
      const mockEntity = {
        id: 'test-1',
        name: 'Test Class',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRepository: Repository<typeof mockEntity, { name: string }> = {
        schemas: {} as never,
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(mockEntity),
        create: vi.fn().mockResolvedValue(mockEntity),
        update: vi.fn().mockResolvedValue(mockEntity),
        delete: vi.fn().mockResolvedValue(undefined),
      }

      // Mock console.error to suppress error output in tests
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // Create a wrapper that will throw an error during context extraction
      const trackedRepo = createTrackingRepository(
        mockRepository,
        'invalid' as EntityType // Invalid entity type will cause an error
      )

      // The operation should still succeed despite logging failure
      const result = await trackedRepo.create({ name: 'Test Class' })
      expect(result).toEqual(mockEntity)

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should extract context for student entities', async () => {
      const mockStudent = {
        id: 'student-1',
        firstName: 'Max',
        lastName: 'Mustermann',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRepository: Repository<
        typeof mockStudent,
        Omit<typeof mockStudent, 'id' | 'createdAt' | 'updatedAt'>
      > = {
        schemas: {} as never,
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(mockStudent),
        create: vi.fn().mockResolvedValue(mockStudent),
        update: vi.fn().mockResolvedValue(mockStudent),
        delete: vi.fn().mockResolvedValue(undefined),
      }

      const trackedRepo = createTrackingRepository(mockRepository, 'student')

      await trackedRepo.create({
        firstName: 'Max',
        lastName: 'Mustermann',
        classId: 'class-1',
      })

      const changeLogs = await changeLogRepository.findAll()
      expect(changeLogs).toHaveLength(1)
      expect(changeLogs[0].classId).toBe('class-1')
      expect(changeLogs[0].studentId).toBe('student-1')
    })
  })
}

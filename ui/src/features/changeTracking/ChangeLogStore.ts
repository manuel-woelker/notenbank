import { createStore } from '../../shared/store/jestor'
import {
  ChangeLog,
  EntityType,
  OperationType,
} from '../../shared/changeTracking/ChangeLogTypes'
import { changeLogRepository } from '../../shared/changeTracking/ChangeLogRepository'

/* 📖 # Why client-side filtering instead of IndexedDB queries?
 *
 * For MVP, we load all change logs and filter in memory. This provides:
 * 1. Simpler implementation (no complex IDBKeyRange logic)
 * 2. Good performance for reasonable dataset sizes (<10,000 entries)
 * 3. Flexible filtering across multiple dimensions
 *
 * If performance becomes an issue, we can migrate to IndexedDB-level
 * filtering using the indexes we've already created.
 */

export interface ChangeLogFilters {
  dateFrom?: Date
  dateTo?: Date
  entityTypes: EntityType[]
  operations: OperationType[]
  classId?: string
  subjectId?: string
  assessmentId?: string
  studentId?: string
}

interface ChangeLogStoreState {
  changeLogs: ChangeLog[]
  loading: boolean
  filters: ChangeLogFilters
}

const defaultFilters: ChangeLogFilters = {
  entityTypes: [],
  operations: [],
}

export const changeLogStore = createStore<ChangeLogStoreState>({
  name: 'changeLogs',
  initialState: {
    changeLogs: [],
    loading: true,
    filters: defaultFilters,
  },
  init: () => {
    void loadChangeLogs()
  },
})

/**
 * Load all change logs from repository
 * Logs are sorted by timestamp in descending order (most recent first)
 */
export async function loadChangeLogs() {
  changeLogStore.update('changeLogs:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await changeLogRepository.findAll()
    /* 📖 # Why sort by timestamp descending?
     *
     * Users typically care most about recent changes. Sorting descending
     * ensures the most recent changes appear first in the UI.
     */
    const sorted = data.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
    changeLogStore.update('changeLogs:load:success', (state) => {
      state.changeLogs = sorted
    })
  } catch (error) {
    console.error('Failed to load change logs:', error)
    throw error
  } finally {
    changeLogStore.update('changeLogs:load:finally', (state) => {
      state.loading = false
    })
  }
}

/**
 * Update filters
 */
export function setFilters(filters: Partial<ChangeLogFilters>) {
  changeLogStore.update('changeLogs:setFilters', (state) => {
    state.filters = { ...state.filters, ...filters }
  })
}

/**
 * Clear all filters
 */
export function clearFilters() {
  changeLogStore.update('changeLogs:clearFilters', (state) => {
    state.filters = defaultFilters
  })
}

/**
 * Get filtered change logs based on current filters
 */
export function getFilteredChangeLogs(
  changeLogs: ChangeLog[],
  filters: ChangeLogFilters
): ChangeLog[] {
  return changeLogs.filter((log) => {
    // Date range filter
    if (filters.dateFrom && log.timestamp < filters.dateFrom) {
      return false
    }
    if (filters.dateTo && log.timestamp > filters.dateTo) {
      return false
    }

    // Entity type filter (empty array means "all")
    if (
      filters.entityTypes.length > 0 &&
      !filters.entityTypes.includes(log.entityType)
    ) {
      return false
    }

    // Operation filter (empty array means "all")
    if (
      filters.operations.length > 0 &&
      !filters.operations.includes(log.operation)
    ) {
      return false
    }

    // Context filters
    if (filters.classId && log.classId !== filters.classId) {
      return false
    }
    if (filters.subjectId && log.subjectId !== filters.subjectId) {
      return false
    }
    if (filters.assessmentId && log.assessmentId !== filters.assessmentId) {
      return false
    }
    if (filters.studentId && log.studentId !== filters.studentId) {
      return false
    }

    return true
  })
}

/**
 * Hook to access change log store
 */
export const useChangeLogStore = () => {
  const changeLogs = changeLogStore.select.changeLogs()
  const loading = changeLogStore.select.loading()
  const filters = changeLogStore.select.filters()

  const filteredChangeLogs = getFilteredChangeLogs(changeLogs, filters)

  return {
    changeLogs,
    filteredChangeLogs,
    loading,
    filters,
    loadChangeLogs,
    setFilters,
    clearFilters,
  }
}

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { clearAllRepositoryCaches } =
    await import('../../shared/repositories/createRepository')

  describe('ChangeLogStore', () => {
    beforeEach(async () => {
      await clearAllRepositoryCaches()
      // Reset store state
      changeLogStore.update('test:reset', (state) => {
        state.changeLogs = []
        state.loading = false
        state.filters = defaultFilters
      })
    })

    describe('getFilteredChangeLogs', () => {
      const sampleLogs: ChangeLog[] = [
        {
          id: '1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          userId: 'System',
          operation: 'CREATE',
          entityType: 'class',
          entityId: 'class-1',
          entityData: {},
          description: 'Klasse erstellt',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          timestamp: new Date('2024-01-15T11:00:00Z'),
          userId: 'System',
          operation: 'UPDATE',
          entityType: 'student',
          entityId: 'student-1',
          entityData: {},
          description: 'Schüler aktualisiert',
          classId: 'class-1',
          studentId: 'student-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          timestamp: new Date('2024-01-15T12:00:00Z'),
          userId: 'System',
          operation: 'DELETE',
          entityType: 'assessment_grade',
          entityId: 'grade-1',
          entityData: {},
          description: 'Note gelöscht',
          classId: 'class-1',
          subjectId: 'subject-1',
          assessmentId: 'assessment-1',
          studentId: 'student-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      it('should return all logs when no filters applied', () => {
        const filtered = getFilteredChangeLogs(sampleLogs, defaultFilters)
        expect(filtered).toHaveLength(3)
      })

      it('should filter by date range', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          dateFrom: new Date('2024-01-15T10:30:00Z'),
          dateTo: new Date('2024-01-15T11:30:00Z'),
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe('2')
      })

      it('should filter by entity types', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          entityTypes: ['class', 'student'],
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(2)
        expect(filtered.map((l) => l.entityType)).toEqual(['class', 'student'])
      })

      it('should filter by operations', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          operations: ['CREATE', 'UPDATE'],
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(2)
        expect(filtered.map((l) => l.operation)).toEqual(['CREATE', 'UPDATE'])
      })

      it('should filter by classId', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          classId: 'class-1',
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(3) // All have classId: class-1
      })

      it('should filter by studentId', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          studentId: 'student-1',
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe('2')
      })

      it('should filter by multiple criteria', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          entityTypes: ['student', 'assessment_grade'],
          operations: ['UPDATE'],
          classId: 'class-1',
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe('2')
      })

      it('should return empty array when no logs match filters', () => {
        const filters: ChangeLogFilters = {
          ...defaultFilters,
          classId: 'non-existent-class',
        }
        const filtered = getFilteredChangeLogs(sampleLogs, filters)
        expect(filtered).toHaveLength(0)
      })
    })

    describe('loadChangeLogs', () => {
      it('should load and sort change logs by timestamp descending', async () => {
        // Create some change logs
        await changeLogRepository.create({
          timestamp: new Date('2024-01-15T10:00:00Z'),
          userId: 'System',
          operation: 'CREATE',
          entityType: 'class',
          entityId: 'class-1',
          entityData: {},
          description: 'Klasse erstellt',
        })
        await changeLogRepository.create({
          timestamp: new Date('2024-01-15T12:00:00Z'),
          userId: 'System',
          operation: 'UPDATE',
          entityType: 'class',
          entityId: 'class-1',
          entityData: {},
          description: 'Klasse aktualisiert',
        })
        await changeLogRepository.create({
          timestamp: new Date('2024-01-15T11:00:00Z'),
          userId: 'System',
          operation: 'DELETE',
          entityType: 'class',
          entityId: 'class-1',
          entityData: {},
          description: 'Klasse gelöscht',
        })

        await loadChangeLogs()

        const state = changeLogStore.getSnapshot()
        expect(state.changeLogs).toHaveLength(3)
        expect(state.loading).toBe(false)

        // Verify descending order
        const timestamps = state.changeLogs.map((l: ChangeLog) =>
          l.timestamp.getTime()
        )
        expect(timestamps[0]).toBeGreaterThan(timestamps[1])
        expect(timestamps[1]).toBeGreaterThan(timestamps[2])
      })
    })

    describe('setFilters', () => {
      it('should update filters', () => {
        setFilters({ classId: 'class-1', entityTypes: ['student'] })

        const state = changeLogStore.getSnapshot()
        expect(state.filters.classId).toBe('class-1')
        expect(state.filters.entityTypes).toEqual(['student'])
      })

      it('should merge with existing filters', () => {
        setFilters({ classId: 'class-1' })
        setFilters({ entityTypes: ['student'] })

        const state = changeLogStore.getSnapshot()
        expect(state.filters.classId).toBe('class-1')
        expect(state.filters.entityTypes).toEqual(['student'])
      })
    })

    describe('clearFilters', () => {
      it('should reset filters to default', () => {
        setFilters({ classId: 'class-1', entityTypes: ['student'] })
        clearFilters()

        const state = changeLogStore.getSnapshot()
        expect(state.filters).toEqual(defaultFilters)
      })
    })
  })
}

import { createStore } from '../../../shared/store/jestor'
import { Class, CreateClassInput, ClassStoreValue } from './ClassTypes'
import { classRepository } from './ClassRepository'

interface ClassStoreState {
  classes: Class[]
  loading: boolean
}

const classStore = createStore<ClassStoreState>({
  name: 'classes',
  initialState: { classes: [], loading: true },
  init: () => {
    void loadClasses()
  },
})

/**
 * Load all classes from repository
 */
export async function loadClasses() {
  classStore.update('classes:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await classRepository.findAll()
    classStore.update('classes:load:success', (state) => {
      state.classes = data
    })
  } catch (error) {
    console.error('Failed to load classes:', error)
    throw error
  } finally {
    classStore.update('classes:load:finally', (state) => {
      state.loading = false
    })
  }
}

/**
 * Create a new class
 */
const createClass = async (input: CreateClassInput): Promise<Class> => {
  try {
    const newClass = await classRepository.create(input)
    classStore.update('classes:create:success', (state) => {
      state.classes.push(newClass)
    })
    return newClass
  } catch (error) {
    console.error('Failed to create class:', error)
    throw error
  }
}

/**
 * Hook to access class store
 */
export const useClassStore = (): ClassStoreValue => {
  const classes = classStore.select.classes()
  const loading = classStore.select.loading()
  return {
    classes,
    loading,
    loadClasses,
    createClass,
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, vi, afterEach } = import.meta.vitest
  const { renderHook, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')

  describe('ClassStore', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
      // Reset IndexedDB for each test with a fresh instance
      globalThis.indexedDB = new IDBFactory()
      const existingClasses = await classRepository.findAll()
      await Promise.all(
        existingClasses.map((existingClass) =>
          classRepository.delete(existingClass.id)
        )
      )
      classStore.update('classes:reset', (state) => {
        state.classes = []
        state.loading = true
      })
      // Clear console.error calls to avoid noise in test output
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      // Restore console.error
      consoleErrorSpy.mockRestore()
      // Clean up all database connections
      vi.restoreAllMocks()
    })

    describe('ClassStore', () => {
      it('provides initial state with loading true and empty classes', async () => {
        const { result } = renderHook(() => useClassStore())

        // Initial state should have loading true
        expect(result.current.loading).toBe(true)
        expect(result.current.classes).toEqual([])
      })

      it('loadClasses fetches classes', async () => {
        // Pre-populate some classes
        await classRepository.create({
          name: 'Class A',
        })
        await classRepository.create({
          name: 'Class B',
        })

        const { result } = renderHook(() => useClassStore())

        await loadClasses()

        // Wait for classes to load
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.classes).toHaveLength(2)
        const classNames = result.current.classes.map((c) => c.name).sort()
        expect(classNames).toEqual(['Class A', 'Class B'])
      })

      it('loadClasses refreshes the classes list', async () => {
        const { result } = renderHook(() => useClassStore())

        await loadClasses()

        const initialCount = result.current.classes.length

        // Create a class directly in repository (bypassing context)
        await classRepository.create({
          name: 'New Class',
        })

        // Reload classes
        await result.current.loadClasses()

        await waitFor(() => {
          expect(result.current.classes.length).toBe(initialCount + 1)
        })

        expect(
          result.current.classes.find((c) => c.name === 'New Class')
        ).toBeDefined()
      })

      it('createClass adds new class to state', async () => {
        const { result } = renderHook(() => useClassStore())

        await loadClasses()

        const initialCount = result.current.classes.length

        // Create a class through context
        const newClass = await result.current.createClass({
          name: 'Test Class',
        })

        expect(newClass.name).toBe('Test Class')
        expect(newClass.id).toBeDefined()

        // Wait for state to update with the new class
        await waitFor(() => {
          expect(result.current.classes.length).toBe(initialCount + 1)
        })

        expect(
          result.current.classes.find((c) => c.id === newClass.id)
        ).toEqual(newClass)
      })

      it('createClass throws error when repository fails', async () => {
        const { result } = renderHook(() => useClassStore())

        // Mock repository to throw error
        const createSpy = vi
          .spyOn(classRepository, 'create')
          .mockRejectedValueOnce(new Error('Database error'))

        await expect(
          result.current.createClass({
            name: 'Test',
          })
        ).rejects.toThrow('Database error')

        // Restore original implementation
        createSpy.mockRestore()
      })

      it('loadClasses sets loading to false even when repository fails', async () => {
        const { result } = renderHook(() => useClassStore())

        await loadClasses()

        // Now mock repository to throw error for subsequent calls
        const findAllSpy = vi
          .spyOn(classRepository, 'findAll')
          .mockRejectedValueOnce(new Error('Database error'))

        // Call loadClasses and expect it to throw
        await expect(result.current.loadClasses()).rejects.toThrow(
          'Database error'
        )

        // Loading should still be set to false (finally block)
        expect(result.current.loading).toBe(false)

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to load classes:',
          expect.any(Error)
        )

        // Restore spy
        findAllSpy.mockRestore()
      })

      it('sets loading to false after loadClasses completes', async () => {
        const { result } = renderHook(() => useClassStore())

        // Call loadClasses and wait for it to complete
        await result.current.loadClasses()

        // Loading should be false after completion
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
      })
    })
  })
}

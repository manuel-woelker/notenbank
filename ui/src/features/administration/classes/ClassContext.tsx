import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Class, CreateClassInput, ClassContextValue } from './types'
import { classRepository } from './ClassRepository'

const ClassContext = createContext<ClassContextValue | undefined>(undefined)

interface ClassProviderProps {
  children: ReactNode
}

/**
 * Provider component for class state management
 */
export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Load all classes from repository
   */
  const loadClasses = async () => {
    setLoading(true)
    try {
      const data = await classRepository.findAll()
      setClasses(data)
    } catch (error) {
      console.error('Failed to load classes:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new class
   */
  const createClass = async (input: CreateClassInput): Promise<Class> => {
    try {
      const newClass = await classRepository.create(input)
      setClasses((prev) => [...prev, newClass])
      return newClass
    } catch (error) {
      console.error('Failed to create class:', error)
      throw error
    }
  }

  // Load classes on mount
  useEffect(() => {
    loadClasses()
  }, [])

  const value: ClassContextValue = {
    classes,
    loading,
    loadClasses,
    createClass,
  }

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
}

/**
 * Hook to access class context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useClassContext = (): ClassContextValue => {
  const context = useContext(ClassContext)
  if (!context) {
    throw new Error('useClassContext must be used within a ClassProvider')
  }
  return context
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, vi, afterEach } = import.meta.vitest
  const { renderHook, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')

  describe('ClassContext', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      // Reset IndexedDB for each test with a fresh instance
      globalThis.indexedDB = new IDBFactory()
      // Clear console.error calls to avoid noise in test output
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      // Restore console.error
      consoleErrorSpy.mockRestore()
      // Clean up all database connections
      vi.restoreAllMocks()
    })

    describe('ClassProvider', () => {
      it('provides initial state with loading true and empty classes', async () => {
        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Initial state should have loading true
        expect(result.current.loading).toBe(true)
        expect(result.current.classes).toEqual([])

        // Wait for initial load to complete
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
      })

      it('loads classes on mount', async () => {
        // Pre-populate some classes
        await classRepository.create({
          name: 'Class A',
          description: 'Description A',
        })
        await classRepository.create({
          name: 'Class B',
          description: 'Description B',
        })

        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Wait for classes to load
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.classes).toHaveLength(2)
        const classNames = result.current.classes.map((c) => c.name).sort()
        expect(classNames).toEqual(['Class A', 'Class B'])
      })

      it('loadClasses refreshes the classes list', async () => {
        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Wait for initial load
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        const initialCount = result.current.classes.length

        // Create a class directly in repository (bypassing context)
        await classRepository.create({
          name: 'New Class',
          description: 'Description',
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
        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Wait for initial load
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        const initialCount = result.current.classes.length

        // Create a class through context
        const newClass = await result.current.createClass({
          name: 'Test Class',
          description: 'Test Description',
        })

        expect(newClass.name).toBe('Test Class')
        expect(newClass.description).toBe('Test Description')
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
        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Wait for initial load
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Mock repository to throw error
        const createSpy = vi
          .spyOn(classRepository, 'create')
          .mockRejectedValueOnce(new Error('Database error'))

        await expect(
          result.current.createClass({
            name: 'Test',
            description: 'Test',
          })
        ).rejects.toThrow('Database error')

        // Restore original implementation
        createSpy.mockRestore()
      })

      it('loadClasses sets loading to false even when repository fails', async () => {
        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Wait for initial load to complete
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

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
        const { result } = renderHook(() => useClassContext(), {
          wrapper: ClassProvider,
        })

        // Wait for initial load
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Call loadClasses and wait for it to complete
        await result.current.loadClasses()

        // Loading should be false after completion
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
      })
    })

    describe('useClassContext', () => {
      it('throws error when used outside ClassProvider', () => {
        expect(() => {
          renderHook(() => useClassContext())
        }).toThrow('useClassContext must be used within a ClassProvider')
      })
    })
  })
}

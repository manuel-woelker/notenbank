import { createStore } from '../../../shared/store/jestor'
import { CreateSubjectInput, Subject, SubjectStoreValue } from './SubjectTypes'
import { subjectRepository } from './SubjectRepository'

interface SubjectStoreState {
  subjects: Subject[]
  loading: boolean
}

const subjectStore = createStore<SubjectStoreState>({
  name: 'subjects',
  initialState: { subjects: [], loading: true },
  init: () => {
    void loadSubjects()
  },
})

/**
 * Load all subjects from repository
 */
export async function loadSubjects() {
  subjectStore.update('subjects:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await subjectRepository.findAll()
    subjectStore.update('subjects:load:success', (state) => {
      state.subjects = data
    })
  } catch (error) {
    console.error('Failed to load subjects:', error)
    throw error
  } finally {
    subjectStore.update('subjects:load:finally', (state) => {
      state.loading = false
    })
  }
}

/**
 * Create a new subject
 */
const createSubject = async (input: CreateSubjectInput): Promise<Subject> => {
  try {
    const newSubject = await subjectRepository.create(input)
    subjectStore.update('subjects:create:success', (state) => {
      state.subjects.push(newSubject)
    })
    return newSubject
  } catch (error) {
    console.error('Failed to create subject:', error)
    throw error
  }
}

/**
 * Hook to access subject store
 */
export const useSubjectStore = (): SubjectStoreValue => {
  const subjects = subjectStore.select.subjects()
  const loading = subjectStore.select.loading()
  return {
    subjects,
    loading,
    loadSubjects,
    createSubject,
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, afterEach, vi } = import.meta.vitest
  const { renderHook, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')

  describe('SubjectStore', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
      globalThis.indexedDB = new IDBFactory()
      const existingSubjects = await subjectRepository.findAll()
      await Promise.all(
        existingSubjects.map((existingSubject) =>
          subjectRepository.delete(existingSubject.id)
        )
      )
      subjectStore.update('subjects:reset', (state) => {
        state.subjects = []
        state.loading = true
      })
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      vi.restoreAllMocks()
    })

    it('provides initial state with loading true and empty subjects', async () => {
      const { result } = renderHook(() => useSubjectStore())

      expect(result.current.loading).toBe(true)
      expect(result.current.subjects).toEqual([])
    })

    it('loadSubjects fetches subjects', async () => {
      await subjectRepository.create({
        name: 'Mathe',
        classId: 'class-a',
      })
      await subjectRepository.create({
        name: 'Deutsch',
        classId: 'class-b',
      })

      const { result } = renderHook(() => useSubjectStore())

      await loadSubjects()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const subjectNames = result.current.subjects
        .map((subject) => subject.name)
        .sort()
      expect(subjectNames).toEqual(['Deutsch', 'Mathe'])
    })

    it('createSubject adds new subject to state', async () => {
      const { result } = renderHook(() => useSubjectStore())

      await loadSubjects()

      const initialCount = result.current.subjects.length

      const newSubject = await result.current.createSubject({
        name: 'Sport',
        classId: 'class-a',
      })

      expect(newSubject.name).toBe('Sport')
      expect(newSubject.id).toBeDefined()

      await waitFor(() => {
        expect(result.current.subjects.length).toBe(initialCount + 1)
      })

      expect(
        result.current.subjects.find((subject) => subject.id === newSubject.id)
      ).toEqual(newSubject)
    })

    it('loadSubjects sets loading to false even when repository fails', async () => {
      const { result } = renderHook(() => useSubjectStore())

      await loadSubjects()

      const findAllSpy = vi
        .spyOn(subjectRepository, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'))

      await expect(result.current.loadSubjects()).rejects.toThrow(
        'Database error'
      )

      expect(result.current.loading).toBe(false)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load subjects:',
        expect.any(Error)
      )

      findAllSpy.mockRestore()
    })
  })
}

import { createStore } from '../../../shared/store/jestor'
import { Grade, createGrade } from '../../../shared/Grade'
import {
  AssessmentGrade,
  AssessmentGradeStoreValue,
} from './AssessmentGradeTypes'
import { assessmentGradeRepository } from './AssessmentGradeRepository'

interface AssessmentGradeStoreState {
  assessmentGrades: AssessmentGrade[]
  loading: boolean
}

const assessmentGradeStore = createStore<AssessmentGradeStoreState>({
  name: 'assessmentGrades',
  initialState: { assessmentGrades: [], loading: true },
  init: () => {
    void loadAssessmentGrades()
  },
})

/**
 * Load all assessment grades from repository
 */
export async function loadAssessmentGrades() {
  assessmentGradeStore.update('assessmentGrades:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await assessmentGradeRepository.findAll()
    assessmentGradeStore.update('assessmentGrades:load:success', (state) => {
      state.assessmentGrades = data
    })
  } catch (error) {
    console.error('Failed to load assessment grades:', error)
    throw error
  } finally {
    assessmentGradeStore.update('assessmentGrades:load:finally', (state) => {
      state.loading = false
    })
  }
}

/* 📖 # Why upsert grades through the store?
Persisted grades must keep a stable ID for updates, while the UI only knows the
assessment + student pair. The store resolves the current entity (if any) and
updates or creates the row so callers can stay stateless.
*/
const setAssessmentGrade = async (
  assessmentId: string,
  studentId: string,
  grade: Grade | null
): Promise<void> => {
  return setAssessmentResult(assessmentId, studentId, { grade })
}

const setAssessmentResult = async (
  assessmentId: string,
  studentId: string,
  result: {
    grade: Grade | null
    points?: number | null
    errors?: number | null
  }
): Promise<void> => {
  const { assessmentGrades } = assessmentGradeStore.getSnapshot()
  const existing = assessmentGrades.find(
    (entry) =>
      entry.assessmentId === assessmentId && entry.studentId === studentId
  )
  const hasValue =
    result.grade !== null || result.points != null || result.errors != null

  if (!hasValue || result.grade === null) {
    if (!existing) {
      return
    }
    await assessmentGradeRepository.delete(existing.id)
    assessmentGradeStore.update('assessmentGrades:delete:success', (state) => {
      state.assessmentGrades = state.assessmentGrades.filter(
        (entry) => entry.id !== existing.id
      )
    })
    return
  }

  if (existing) {
    const updated = await assessmentGradeRepository.update(existing.id, {
      grade: result.grade,
      points: result.points ?? null,
      errors: result.errors ?? null,
    })
    assessmentGradeStore.update('assessmentGrades:update:success', (state) => {
      const index = state.assessmentGrades.findIndex(
        (entry) => entry.id === existing.id
      )
      if (index >= 0) {
        state.assessmentGrades[index] = updated
      }
    })
    return
  }

  const created = await assessmentGradeRepository.create({
    assessmentId,
    studentId,
    grade: result.grade,
    points: result.points ?? null,
    errors: result.errors ?? null,
  })
  assessmentGradeStore.update('assessmentGrades:create:success', (state) => {
    state.assessmentGrades.push(created)
  })
}

export const useAssessmentGradeStore = (): AssessmentGradeStoreValue => {
  const assessmentGrades = assessmentGradeStore.select.assessmentGrades()
  const loading = assessmentGradeStore.select.loading()
  return {
    assessmentGrades,
    loading,
    loadAssessmentGrades,
    setAssessmentGrade,
    setAssessmentResult,
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, afterEach, vi } = import.meta.vitest
  const { renderHook, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')

  describe('AssessmentGradeStore', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
      globalThis.indexedDB = new IDBFactory()
      const existingGrades = await assessmentGradeRepository.findAll()
      await Promise.all(
        existingGrades.map((existingGrade) =>
          assessmentGradeRepository.delete(existingGrade.id)
        )
      )
      assessmentGradeStore.update('assessmentGrades:reset', (state) => {
        state.assessmentGrades = []
        state.loading = true
      })
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      vi.restoreAllMocks()
    })

    it('loads grades from the repository', async () => {
      await assessmentGradeRepository.create({
        assessmentId: 'assessment-1',
        studentId: 'student-1',
        grade: createGrade(1.0),
      })

      const { result } = renderHook(() => useAssessmentGradeStore())

      await loadAssessmentGrades()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.assessmentGrades).toHaveLength(1)
      expect(result.current.assessmentGrades[0]?.studentId).toBe('student-1')
    })

    it('creates and updates grades via setAssessmentGrade', async () => {
      const { result } = renderHook(() => useAssessmentGradeStore())

      await loadAssessmentGrades()

      await result.current.setAssessmentGrade(
        'assessment-1',
        'student-1',
        createGrade(2.0)
      )
      expect(result.current.assessmentGrades).toHaveLength(1)

      await result.current.setAssessmentGrade(
        'assessment-1',
        'student-1',
        createGrade(3.0)
      )
      expect(result.current.assessmentGrades).toHaveLength(1)
      expect(result.current.assessmentGrades[0]?.grade).toBe(3.0)
    })

    it('stores points or errors via setAssessmentResult', async () => {
      const { result } = renderHook(() => useAssessmentGradeStore())

      await loadAssessmentGrades()

      await result.current.setAssessmentResult('assessment-1', 'student-1', {
        grade: createGrade(2.25),
        points: 42.5,
      })

      expect(result.current.assessmentGrades).toHaveLength(1)
      expect(result.current.assessmentGrades[0]?.grade).toBe(2.25)
      expect(result.current.assessmentGrades[0]?.points).toBe(42.5)
      expect(result.current.assessmentGrades[0]?.errors).toBeNull()
    })

    it('removes grades when setAssessmentGrade receives null', async () => {
      const { result } = renderHook(() => useAssessmentGradeStore())

      await loadAssessmentGrades()

      await result.current.setAssessmentGrade(
        'assessment-1',
        'student-1',
        createGrade(2.0)
      )
      expect(result.current.assessmentGrades).toHaveLength(1)

      await result.current.setAssessmentGrade('assessment-1', 'student-1', null)
      expect(result.current.assessmentGrades).toHaveLength(0)
    })

    it('loadAssessmentGrades sets loading to false even when repository fails', async () => {
      const { result } = renderHook(() => useAssessmentGradeStore())

      await loadAssessmentGrades()

      const findAllSpy = vi
        .spyOn(assessmentGradeRepository, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'))

      await expect(result.current.loadAssessmentGrades()).rejects.toThrow(
        'Database error'
      )

      expect(result.current.loading).toBe(false)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load assessment grades:',
        expect.any(Error)
      )

      findAllSpy.mockRestore()
    })
  })
}

import { createStore } from '../../../shared/store/jestor'
import {
  Assessment,
  AssessmentStoreValue,
  CreateAssessmentInput,
} from './AssessmentTypes'
import { assessmentRepository } from './AssessmentRepository'

interface AssessmentStoreState {
  assessments: Assessment[]
  loading: boolean
}

const assessmentStore = createStore<AssessmentStoreState>({
  name: 'assessments',
  initialState: { assessments: [], loading: true },
  init: () => {
    void loadAssessments()
  },
})

/**
 * Load all assessments from repository
 */
export async function loadAssessments() {
  assessmentStore.update('assessments:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await assessmentRepository.findAll()
    assessmentStore.update('assessments:load:success', (state) => {
      state.assessments = data
    })
  } catch (error) {
    console.error('Failed to load assessments:', error)
    throw error
  } finally {
    assessmentStore.update('assessments:load:finally', (state) => {
      state.loading = false
    })
  }
}

/**
 * Create a new assessment
 */
const createAssessment = async (
  input: CreateAssessmentInput
): Promise<Assessment> => {
  try {
    const newAssessment = await assessmentRepository.create(input)
    assessmentStore.update('assessments:create:success', (state) => {
      state.assessments.push(newAssessment)
    })
    return newAssessment
  } catch (error) {
    console.error('Failed to create assessment:', error)
    throw error
  }
}

/**
 * Update an existing assessment
 */
const updateAssessment = async (
  assessmentId: string,
  updates: Partial<Assessment>
): Promise<Assessment> => {
  try {
    const updated = await assessmentRepository.update(assessmentId, updates)
    assessmentStore.update('assessments:update:success', (state) => {
      const index = state.assessments.findIndex(
        (assessment) => assessment.id === assessmentId
      )
      if (index >= 0) {
        state.assessments[index] = updated
      }
    })
    return updated
  } catch (error) {
    console.error('Failed to update assessment:', error)
    throw error
  }
}

/**
 * Hook to access assessment store
 */
export const useAssessmentStore = (): AssessmentStoreValue => {
  const assessments = assessmentStore.select.assessments()
  const loading = assessmentStore.select.loading()
  return {
    assessments,
    loading,
    loadAssessments,
    createAssessment,
    updateAssessment,
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, afterEach, vi } = import.meta.vitest
  const { renderHook, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')

  describe('AssessmentStore', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
      globalThis.indexedDB = new IDBFactory()
      const existingAssessments = await assessmentRepository.findAll()
      await Promise.all(
        existingAssessments.map((existingAssessment) =>
          assessmentRepository.delete(existingAssessment.id)
        )
      )
      assessmentStore.update('assessments:reset', (state) => {
        state.assessments = []
        state.loading = true
      })
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      vi.restoreAllMocks()
    })

    it('provides initial state with loading true and empty assessments', async () => {
      const { result } = renderHook(() => useAssessmentStore())

      expect(result.current.loading).toBe(true)
      expect(result.current.assessments).toEqual([])
    })

    it('loadAssessments fetches assessments', async () => {
      await assessmentRepository.create({
        classId: 'class-a',
        subjectId: 'subject-a',
        title: 'Klausur 1',
        type: 'written',
        date: new Date('2025-03-01'),
      })
      await assessmentRepository.create({
        classId: 'class-a',
        subjectId: 'subject-a',
        title: 'Mündliche Note',
        type: 'oral',
        date: new Date('2025-03-15'),
      })

      const { result } = renderHook(() => useAssessmentStore())

      await loadAssessments()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const titles = result.current.assessments
        .map((assessment) => assessment.title)
        .sort()
      expect(titles).toEqual(['Klausur 1', 'Mündliche Note'])
    })

    it('createAssessment adds new assessment to state', async () => {
      const { result } = renderHook(() => useAssessmentStore())

      await loadAssessments()

      const initialCount = result.current.assessments.length

      const newAssessment = await result.current.createAssessment({
        classId: 'class-a',
        subjectId: 'subject-a',
        title: 'Test 1',
        type: 'written',
        date: new Date('2025-04-10'),
      })

      expect(newAssessment.title).toBe('Test 1')
      expect(newAssessment.id).toBeDefined()

      await waitFor(() => {
        expect(result.current.assessments.length).toBe(initialCount + 1)
      })

      expect(
        result.current.assessments.find(
          (assessment) => assessment.id === newAssessment.id
        )
      ).toEqual(newAssessment)
    })

    it('updateAssessment updates assessment data', async () => {
      const { result } = renderHook(() => useAssessmentStore())

      await loadAssessments()

      const newAssessment = await result.current.createAssessment({
        classId: 'class-a',
        subjectId: 'subject-a',
        title: 'Test 1',
        type: 'written',
        date: new Date('2025-04-10'),
      })

      await result.current.updateAssessment(newAssessment.id, {
        title: 'Test 1 (neu)',
        gradingCurve: {
          mode: 'points',
          grade1Value: 60,
          grade4Value: 30,
        },
      })

      const updated = result.current.assessments.find(
        (assessment) => assessment.id === newAssessment.id
      )

      expect(updated?.title).toBe('Test 1 (neu)')
      expect(updated?.gradingCurve).toEqual({
        mode: 'points',
        grade1Value: 60,
        grade4Value: 30,
      })
    })

    it('loadAssessments sets loading to false even when repository fails', async () => {
      const { result } = renderHook(() => useAssessmentStore())

      await loadAssessments()

      const findAllSpy = vi
        .spyOn(assessmentRepository, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'))

      await expect(result.current.loadAssessments()).rejects.toThrow(
        'Database error'
      )

      expect(result.current.loading).toBe(false)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load assessments:',
        expect.any(Error)
      )

      findAllSpy.mockRestore()
    })
  })
}

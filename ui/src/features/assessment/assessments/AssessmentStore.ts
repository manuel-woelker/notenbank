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

export const assessmentStore = createStore<AssessmentStoreState>({
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

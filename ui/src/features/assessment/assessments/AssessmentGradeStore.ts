import { createStore } from '../../../shared/store/jestor'
import { Grade } from '../../../shared/Grade'
import {
  AssessmentGrade,
  AssessmentGradeStoreValue,
} from './AssessmentGradeTypes'
import { assessmentGradeRepository } from './AssessmentGradeRepository'

interface AssessmentGradeStoreState {
  assessmentGrades: AssessmentGrade[]
  loading: boolean
}

export const assessmentGradeStore = createStore<AssessmentGradeStoreState>({
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

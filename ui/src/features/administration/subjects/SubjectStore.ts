import { createStore } from '../../../shared/store/jestor'
import { CreateSubjectInput, Subject, SubjectStoreValue } from './SubjectTypes'
import { subjectRepository } from './SubjectRepository'

interface SubjectStoreState {
  subjects: Subject[]
  loading: boolean
}

export const subjectStore = createStore<SubjectStoreState>({
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

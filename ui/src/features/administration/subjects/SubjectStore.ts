import {
  createEntityStore,
  useEntityStore,
} from '../../../shared/store/createEntityStore'
import { Subject, CreateSubjectInput, SubjectStoreValue } from './SubjectTypes'
import { subjectRepository } from './SubjectRepository'

const { store, loadAll, create } = createEntityStore<
  Subject,
  CreateSubjectInput
>({
  name: 'subjects',
  repository: subjectRepository,
  autoLoad: true,
})

export const subjectStore = store
export const loadSubjects = loadAll
export const createSubject = create

const updateSubject = async (
  subjectId: string,
  updates: Partial<Subject>
): Promise<Subject> => {
  try {
    const updated = await subjectRepository.update(subjectId, updates)
    store.update('subjects:update:success', (state) => {
      const index = state.entities.findIndex((s) => s.id === subjectId)
      if (index >= 0) {
        state.entities[index] = updated
      }
    })
    return updated
  } catch (error) {
    console.error('Failed to update subject:', error)
    throw error
  }
}

export const useSubjectStore = (): SubjectStoreValue => {
  const { entities, loading } = useEntityStore(store, loadAll, create)
  return {
    subjects: entities,
    loading,
    loadSubjects,
    createSubject,
    updateSubject,
  }
}

import {
  createEntityStore,
  useEntityStore,
} from '../../../shared/store/createEntityStore'
import { Class, CreateClassInput, ClassStoreValue } from './ClassTypes'
import { classRepository } from './ClassRepository'

const { store, loadAll, create } = createEntityStore<Class, CreateClassInput>({
  name: 'classes',
  repository: classRepository,
  autoLoad: true,
})

export const classStore = store
export const loadClasses = loadAll
export const createClass = create

const updateClass = async (
  classId: string,
  updates: Partial<Class>
): Promise<Class> => {
  try {
    const updated = await classRepository.update(classId, updates)
    store.update('classes:update:success', (state) => {
      const index = state.entities.findIndex((c) => c.id === classId)
      if (index >= 0) {
        state.entities[index] = updated
      }
    })
    return updated
  } catch (error) {
    console.error('Failed to update class:', error)
    throw error
  }
}

export const useClassStore = (): ClassStoreValue => {
  const { entities, loading } = useEntityStore(store, loadAll, create)
  return {
    classes: entities,
    loading,
    loadClasses,
    createClass,
    updateClass,
  }
}

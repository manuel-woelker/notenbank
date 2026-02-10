import { createStore } from '../../../shared/store/jestor'
import { Class, CreateClassInput, ClassStoreValue } from './ClassTypes'
import { classRepository } from './ClassRepository'

interface ClassStoreState {
  classes: Class[]
  loading: boolean
}

export const classStore = createStore<ClassStoreState>({
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

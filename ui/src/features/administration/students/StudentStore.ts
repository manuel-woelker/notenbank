import {
  createEntityStore,
  useEntityStore,
} from '../../../shared/store/createEntityStore'
import { Student, CreateStudentInput, StudentStoreValue } from './StudentTypes'
import { studentRepository } from './StudentRepository'

const { store, loadAll, create } = createEntityStore<
  Student,
  CreateStudentInput
>({
  name: 'students',
  repository: studentRepository,
  autoLoad: true,
})

export const studentStore = store
export const loadStudents = loadAll
export const createStudent = create

const updateStudent = async (
  studentId: string,
  updates: Partial<Student>
): Promise<Student> => {
  try {
    const updated = await studentRepository.update(studentId, updates)
    store.update('students:update:success', (state) => {
      const index = state.entities.findIndex((s) => s.id === studentId)
      if (index >= 0) {
        state.entities[index] = updated
      }
    })
    return updated
  } catch (error) {
    console.error('Failed to update student:', error)
    throw error
  }
}

export const useStudentStore = (): StudentStoreValue => {
  const { entities, loading } = useEntityStore(store, loadAll, create)
  return {
    students: entities,
    loading,
    loadStudents,
    createStudent,
    updateStudent,
  }
}

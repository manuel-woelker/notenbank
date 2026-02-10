import { createStore } from '../../../shared/store/jestor'
import { Student, CreateStudentInput, StudentStoreValue } from './StudentTypes'
import { studentRepository } from './StudentRepository'

interface StudentStoreState {
  students: Student[]
  loading: boolean
}

export const studentStore = createStore<StudentStoreState>({
  name: 'students',
  initialState: { students: [], loading: true },
  init: () => {
    void loadStudents()
  },
})

/**
 * Load all students from repository
 */
export async function loadStudents() {
  studentStore.update('students:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await studentRepository.findAll()
    studentStore.update('students:load:success', (state) => {
      state.students = data
    })
  } catch (error) {
    console.error('Failed to load students:', error)
    throw error
  } finally {
    studentStore.update('students:load:finally', (state) => {
      state.loading = false
    })
  }
}

/**
 * Create a new student
 */
const createStudent = async (input: CreateStudentInput): Promise<Student> => {
  try {
    const newStudent = await studentRepository.create(input)
    studentStore.update('students:create:success', (state) => {
      state.students.push(newStudent)
    })
    return newStudent
  } catch (error) {
    console.error('Failed to create student:', error)
    throw error
  }
}

/**
 * Hook to access student store
 */
export const useStudentStore = (): StudentStoreValue => {
  const students = studentStore.select.students()
  const loading = studentStore.select.loading()
  return {
    students,
    loading,
    loadStudents,
    createStudent,
  }
}

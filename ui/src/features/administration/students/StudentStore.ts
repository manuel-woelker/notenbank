import { createStore } from '../../../shared/store/jestor'
import { Student, CreateStudentInput, StudentStoreValue } from './types'
import { studentRepository } from './StudentRepository'

interface StudentStoreState {
  students: Student[]
  loading: boolean
}

const studentStore = createStore<StudentStoreState>({
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

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, vi, afterEach } = import.meta.vitest
  const { renderHook, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')

  describe('StudentStore', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
      globalThis.indexedDB = new IDBFactory()
      const existingStudents = await studentRepository.findAll()
      await Promise.all(
        existingStudents.map((existingStudent) =>
          studentRepository.delete(existingStudent.id)
        )
      )
      studentStore.update('students:reset', (state) => {
        state.students = []
        state.loading = true
      })
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      vi.restoreAllMocks()
    })

    it('provides initial state with loading true and empty students', async () => {
      const { result } = renderHook(() => useStudentStore())

      expect(result.current.loading).toBe(true)
      expect(result.current.students).toEqual([])
    })

    it('loadStudents fetches students', async () => {
      await studentRepository.create({
        firstName: 'Aly',
        lastName: 'Student',
        classId: 'class-a',
      })
      await studentRepository.create({
        firstName: 'Bo',
        lastName: 'Student',
        classId: 'class-b',
      })

      const { result } = renderHook(() => useStudentStore())

      await loadStudents()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.students).toHaveLength(2)
      const studentNames = result.current.students
        .map((student) => student.firstName)
        .sort()
      expect(studentNames).toEqual(['Aly', 'Bo'])
    })

    it('loadStudents refreshes the student list', async () => {
      const { result } = renderHook(() => useStudentStore())

      await loadStudents()

      const initialCount = result.current.students.length

      await studentRepository.create({
        firstName: 'New',
        lastName: 'Student',
        classId: 'class-a',
      })

      await result.current.loadStudents()

      await waitFor(() => {
        expect(result.current.students.length).toBe(initialCount + 1)
      })

      expect(
        result.current.students.find((student) => student.firstName === 'New')
      ).toBeDefined()
    })

    it('createStudent adds new student to state', async () => {
      const { result } = renderHook(() => useStudentStore())

      await loadStudents()

      const initialCount = result.current.students.length

      const newStudent = await result.current.createStudent({
        firstName: 'Test',
        lastName: 'Student',
        classId: 'class-a',
      })

      expect(newStudent.firstName).toBe('Test')
      expect(newStudent.id).toBeDefined()

      await waitFor(() => {
        expect(result.current.students.length).toBe(initialCount + 1)
      })

      expect(
        result.current.students.find((student) => student.id === newStudent.id)
      ).toEqual(newStudent)
    })

    it('createStudent throws error when repository fails', async () => {
      const { result } = renderHook(() => useStudentStore())

      const createSpy = vi
        .spyOn(studentRepository, 'create')
        .mockRejectedValueOnce(new Error('Database error'))

      await expect(
        result.current.createStudent({
          firstName: 'Test',
          lastName: 'Student',
          classId: 'class-a',
        })
      ).rejects.toThrow('Database error')

      createSpy.mockRestore()
    })

    it('loadStudents sets loading to false even when repository fails', async () => {
      const { result } = renderHook(() => useStudentStore())

      await loadStudents()

      const findAllSpy = vi
        .spyOn(studentRepository, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'))

      await expect(result.current.loadStudents()).rejects.toThrow(
        'Database error'
      )

      expect(result.current.loading).toBe(false)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load students:',
        expect.any(Error)
      )

      findAllSpy.mockRestore()
    })

    it('sets loading to false after loadStudents completes', async () => {
      const { result } = renderHook(() => useStudentStore())

      await result.current.loadStudents()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
}

// @vitest-environment happy-dom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import { studentRepository } from './StudentRepository'
import { loadStudents, studentStore, useStudentStore } from './StudentStore'

describe('StudentStore', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    await clearAllRepositoryCaches()
    const existingStudents = await studentRepository.findAll()
    await Promise.all(
      existingStudents.map((existingStudent) =>
        studentRepository.delete(existingStudent.id)
      )
    )
    // Wait for any pending auto-load to complete, then reset state
    await waitFor(() => {
      const state = studentStore.getSnapshot()
      return !state.loading
    })
    studentStore.update(
      'students:reset',
      (state: { entities: unknown[]; loading: boolean }) => {
        state.entities = []
        state.loading = true
      }
    )
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

  describe('updateStudent', () => {
    it('updates student data in state and repository', async () => {
      const { result } = renderHook(() => useStudentStore())

      // Create a student first
      const newStudent = await studentRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        classId: 'class-1',
      })

      await loadStudents()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Update the student
      await result.current.updateStudent(newStudent.id, {
        firstName: 'Jane',
        lastName: 'Smith',
      })

      // Verify the update in state
      await waitFor(() => {
        const updatedStudent = result.current.students.find(
          (s) => s.id === newStudent.id
        )
        expect(updatedStudent?.firstName).toBe('Jane')
        expect(updatedStudent?.lastName).toBe('Smith')
      })

      // Verify the update in repository
      const fromRepo = await studentRepository.findById(newStudent.id)
      expect(fromRepo?.firstName).toBe('Jane')
      expect(fromRepo?.lastName).toBe('Smith')
    })

    it('throws error when repository update fails', async () => {
      const { result } = renderHook(() => useStudentStore())

      // Create a student first
      const newStudent = await studentRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        classId: 'class-1',
      })

      await loadStudents()

      // Mock repository to throw error
      const updateSpy = vi
        .spyOn(studentRepository, 'update')
        .mockRejectedValueOnce(new Error('Update failed'))

      await expect(
        result.current.updateStudent(newStudent.id, { firstName: 'Jane' })
      ).rejects.toThrow('Update failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update student:',
        expect.any(Error)
      )

      updateSpy.mockRestore()
    })

    it('loadStudents refreshes the students list', async () => {
      const { result } = renderHook(() => useStudentStore())

      await loadStudents()

      const initialCount = result.current.students.length

      // Create a student directly in repository
      await studentRepository.create({
        firstName: 'New',
        lastName: 'Student',
        classId: 'class-a',
      })

      // Reload students
      await result.current.loadStudents()

      await waitFor(() => {
        expect(result.current.students.length).toBe(initialCount + 1)
      })

      expect(
        result.current.students.find((student) => student.firstName === 'New')
      ).toBeDefined()
    })
  })
})

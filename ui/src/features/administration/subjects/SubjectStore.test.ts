// @vitest-environment happy-dom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import { subjectRepository } from './SubjectRepository'
import { loadSubjects, subjectStore, useSubjectStore } from './SubjectStore'

describe('SubjectStore', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    await clearAllRepositoryCaches()
    const existingSubjects = await subjectRepository.findAll()
    await Promise.all(
      existingSubjects.map((existingSubject) =>
        subjectRepository.delete(existingSubject.id)
      )
    )
    // Wait for any pending auto-load to complete, then reset state
    await waitFor(() => {
      const state = subjectStore.getSnapshot()
      return !state.loading
    })
    subjectStore.update(
      'subjects:reset',
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

  it('provides initial state with loading true and empty subjects', async () => {
    const { result } = renderHook(() => useSubjectStore())

    expect(result.current.loading).toBe(true)
    expect(result.current.subjects).toEqual([])
  })

  it('loadSubjects fetches subjects', async () => {
    await subjectRepository.create({
      name: 'Mathe',
      classId: 'class-a',
    })
    await subjectRepository.create({
      name: 'Deutsch',
      classId: 'class-b',
    })

    const { result } = renderHook(() => useSubjectStore())

    await loadSubjects()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const subjectNames = result.current.subjects
      .map((subject) => subject.name)
      .sort()
    expect(subjectNames).toEqual(['Deutsch', 'Mathe'])
  })

  it('createSubject adds new subject to state', async () => {
    const { result } = renderHook(() => useSubjectStore())

    await loadSubjects()

    const initialCount = result.current.subjects.length

    const newSubject = await result.current.createSubject({
      name: 'Sport',
      classId: 'class-a',
    })

    expect(newSubject.name).toBe('Sport')
    expect(newSubject.id).toBeDefined()

    await waitFor(() => {
      expect(result.current.subjects.length).toBe(initialCount + 1)
    })

    expect(
      result.current.subjects.find((subject) => subject.id === newSubject.id)
    ).toEqual(newSubject)
  })

  it('loadSubjects sets loading to false even when repository fails', async () => {
    const { result } = renderHook(() => useSubjectStore())

    await loadSubjects()

    const findAllSpy = vi
      .spyOn(subjectRepository, 'findAll')
      .mockRejectedValueOnce(new Error('Database error'))

    await expect(result.current.loadSubjects()).rejects.toThrow(
      'Database error'
    )

    expect(result.current.loading).toBe(false)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load subjects:',
      expect.any(Error)
    )

    findAllSpy.mockRestore()
  })

  describe('updateSubject', () => {
    it('updates subject data in state and repository', async () => {
      const { result } = renderHook(() => useSubjectStore())

      // Create a subject first
      const newSubject = await subjectRepository.create({
        name: 'Mathe',
        classId: 'class-1',
      })

      await loadSubjects()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Update the subject
      await result.current.updateSubject(newSubject.id, { name: 'Mathematik' })

      // Verify the update in state
      await waitFor(() => {
        const updatedSubject = result.current.subjects.find(
          (s) => s.id === newSubject.id
        )
        expect(updatedSubject?.name).toBe('Mathematik')
      })

      // Verify the update in repository
      const fromRepo = await subjectRepository.findById(newSubject.id)
      expect(fromRepo?.name).toBe('Mathematik')
    })

    it('throws error when repository update fails', async () => {
      const { result } = renderHook(() => useSubjectStore())

      // Create a subject first
      const newSubject = await subjectRepository.create({
        name: 'Mathe',
        classId: 'class-1',
      })

      await loadSubjects()

      // Mock repository to throw error
      const updateSpy = vi
        .spyOn(subjectRepository, 'update')
        .mockRejectedValueOnce(new Error('Update failed'))

      await expect(
        result.current.updateSubject(newSubject.id, { name: 'Mathematik' })
      ).rejects.toThrow('Update failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update subject:',
        expect.any(Error)
      )

      updateSpy.mockRestore()
    })

    it('loadSubjects refreshes the subjects list', async () => {
      const { result } = renderHook(() => useSubjectStore())

      await loadSubjects()

      const initialCount = result.current.subjects.length

      // Create a subject directly in repository
      await subjectRepository.create({
        name: 'Sport',
        classId: 'class-a',
      })

      // Reload subjects
      await result.current.loadSubjects()

      await waitFor(() => {
        expect(result.current.subjects.length).toBe(initialCount + 1)
      })

      expect(
        result.current.subjects.find((subject) => subject.name === 'Sport')
      ).toBeDefined()
    })
  })
})

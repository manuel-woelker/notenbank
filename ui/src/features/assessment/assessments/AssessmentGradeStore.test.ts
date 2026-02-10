// @vitest-environment happy-dom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createGrade } from '../../../shared/Grade'
import { assessmentGradeRepository } from './AssessmentGradeRepository'
import {
  assessmentGradeStore,
  loadAssessmentGrades,
  useAssessmentGradeStore,
} from './AssessmentGradeStore'

describe('AssessmentGradeStore', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    globalThis.indexedDB = new IDBFactory()
    const existingGrades = await assessmentGradeRepository.findAll()
    await Promise.all(
      existingGrades.map((existingGrade) =>
        assessmentGradeRepository.delete(existingGrade.id)
      )
    )
    assessmentGradeStore.update('assessmentGrades:reset', (state) => {
      state.assessmentGrades = []
      state.loading = true
    })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('loads grades from the repository', async () => {
    await assessmentGradeRepository.create({
      assessmentId: 'assessment-1',
      studentId: 'student-1',
      grade: createGrade(1.0),
    })

    const { result } = renderHook(() => useAssessmentGradeStore())

    await loadAssessmentGrades()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.assessmentGrades).toHaveLength(1)
    expect(result.current.assessmentGrades[0]?.studentId).toBe('student-1')
  })

  it('creates and updates grades via setAssessmentGrade', async () => {
    const { result } = renderHook(() => useAssessmentGradeStore())

    await loadAssessmentGrades()

    await result.current.setAssessmentGrade(
      'assessment-1',
      'student-1',
      createGrade(2.0)
    )
    expect(result.current.assessmentGrades).toHaveLength(1)

    await result.current.setAssessmentGrade(
      'assessment-1',
      'student-1',
      createGrade(3.0)
    )
    expect(result.current.assessmentGrades).toHaveLength(1)
    expect(result.current.assessmentGrades[0]?.grade).toBe(3.0)
  })

  it('stores points or errors via setAssessmentResult', async () => {
    const { result } = renderHook(() => useAssessmentGradeStore())

    await loadAssessmentGrades()

    await result.current.setAssessmentResult('assessment-1', 'student-1', {
      grade: createGrade(2.25),
      points: 42.5,
    })

    expect(result.current.assessmentGrades).toHaveLength(1)
    expect(result.current.assessmentGrades[0]?.grade).toBe(2.25)
    expect(result.current.assessmentGrades[0]?.points).toBe(42.5)
    expect(result.current.assessmentGrades[0]?.errors).toBeNull()
  })

  it('removes grades when setAssessmentGrade receives null', async () => {
    const { result } = renderHook(() => useAssessmentGradeStore())

    await loadAssessmentGrades()

    await result.current.setAssessmentGrade(
      'assessment-1',
      'student-1',
      createGrade(2.0)
    )
    expect(result.current.assessmentGrades).toHaveLength(1)

    await result.current.setAssessmentGrade('assessment-1', 'student-1', null)
    expect(result.current.assessmentGrades).toHaveLength(0)
  })

  it('loadAssessmentGrades sets loading to false even when repository fails', async () => {
    const { result } = renderHook(() => useAssessmentGradeStore())

    await loadAssessmentGrades()

    const findAllSpy = vi
      .spyOn(assessmentGradeRepository, 'findAll')
      .mockRejectedValueOnce(new Error('Database error'))

    await expect(result.current.loadAssessmentGrades()).rejects.toThrow(
      'Database error'
    )

    expect(result.current.loading).toBe(false)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load assessment grades:',
      expect.any(Error)
    )

    findAllSpy.mockRestore()
  })
})

// @vitest-environment happy-dom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { assessmentRepository } from './AssessmentRepository'
import {
  assessmentStore,
  loadAssessments,
  useAssessmentStore,
} from './AssessmentStore'

describe('AssessmentStore', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    globalThis.indexedDB = new IDBFactory()
    const existingAssessments = await assessmentRepository.findAll()
    await Promise.all(
      existingAssessments.map((existingAssessment) =>
        assessmentRepository.delete(existingAssessment.id)
      )
    )
    assessmentStore.update('assessments:reset', (state) => {
      state.assessments = []
      state.loading = true
    })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('provides initial state with loading true and empty assessments', async () => {
    const { result } = renderHook(() => useAssessmentStore())

    expect(result.current.loading).toBe(true)
    expect(result.current.assessments).toEqual([])
  })

  it('loadAssessments fetches assessments', async () => {
    await assessmentRepository.create({
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Klausur 1',
      type: 'written',
      date: new Date('2025-03-01'),
    })
    await assessmentRepository.create({
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Mündliche Note',
      type: 'oral',
      date: new Date('2025-03-15'),
    })

    const { result } = renderHook(() => useAssessmentStore())

    await loadAssessments()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const titles = result.current.assessments
      .map((assessment) => assessment.title)
      .sort()
    expect(titles).toEqual(['Klausur 1', 'Mündliche Note'])
  })

  it('createAssessment adds new assessment to state', async () => {
    const { result } = renderHook(() => useAssessmentStore())

    await loadAssessments()

    const initialCount = result.current.assessments.length

    const newAssessment = await result.current.createAssessment({
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Test 1',
      type: 'written',
      date: new Date('2025-04-10'),
    })

    expect(newAssessment.title).toBe('Test 1')
    expect(newAssessment.id).toBeDefined()

    await waitFor(() => {
      expect(result.current.assessments.length).toBe(initialCount + 1)
    })

    expect(
      result.current.assessments.find(
        (assessment) => assessment.id === newAssessment.id
      )
    ).toEqual(newAssessment)
  })

  it('updateAssessment updates assessment data', async () => {
    const { result } = renderHook(() => useAssessmentStore())

    await loadAssessments()

    const newAssessment = await result.current.createAssessment({
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Test 1',
      type: 'written',
      date: new Date('2025-04-10'),
    })

    await result.current.updateAssessment(newAssessment.id, {
      title: 'Test 1 (neu)',
      gradingCurve: {
        mode: 'points',
        grade1Value: 60,
        grade4Value: 30,
      },
    })

    const updated = result.current.assessments.find(
      (assessment) => assessment.id === newAssessment.id
    )

    expect(updated?.title).toBe('Test 1 (neu)')
    expect(updated?.gradingCurve).toEqual({
      mode: 'points',
      grade1Value: 60,
      grade4Value: 30,
    })
  })

  it('loadAssessments sets loading to false even when repository fails', async () => {
    const { result } = renderHook(() => useAssessmentStore())

    await loadAssessments()

    const findAllSpy = vi
      .spyOn(assessmentRepository, 'findAll')
      .mockRejectedValueOnce(new Error('Database error'))

    await expect(result.current.loadAssessments()).rejects.toThrow(
      'Database error'
    )

    expect(result.current.loading).toBe(false)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load assessments:',
      expect.any(Error)
    )

    findAllSpy.mockRestore()
  })
})

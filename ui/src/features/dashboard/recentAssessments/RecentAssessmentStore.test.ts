// @vitest-environment happy-dom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import { recentAssessmentRepository } from './RecentAssessmentRepository'
import {
  recentAssessmentStore,
  loadRecentAssessments,
  useRecentAssessmentStore,
} from './RecentAssessmentStore'

describe('RecentAssessmentStore', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    await clearAllRepositoryCaches()
    const existingAssessments = await recentAssessmentRepository.findAll()
    await Promise.all(
      existingAssessments.map((existing) =>
        recentAssessmentRepository.delete(existing.id)
      )
    )
    recentAssessmentStore.update('recentAssessments:reset', (state) => {
      state.recentAssessments = []
      state.loading = true
    })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('provides initial state with loading true and empty recent assessments', async () => {
    const { result } = renderHook(() => useRecentAssessmentStore())

    expect(result.current.loading).toBe(true)
    expect(result.current.recentAssessments).toEqual([])
  })

  it('loadRecentAssessments fetches recent assessments sorted by accessedAt', async () => {
    await recentAssessmentRepository.create({
      assessmentId: 'assessment-1',
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Klausur 1',
      type: 'written',
      date: new Date('2025-03-01'),
      accessedAt: new Date('2025-03-10'),
    })
    await recentAssessmentRepository.create({
      assessmentId: 'assessment-2',
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Mündliche Note',
      type: 'oral',
      date: new Date('2025-03-15'),
      accessedAt: new Date('2025-03-12'),
    })

    const { result } = renderHook(() => useRecentAssessmentStore())

    await loadRecentAssessments()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const titles = result.current.recentAssessments.map(
      (assessment) => assessment.title
    )
    expect(titles).toEqual(['Mündliche Note', 'Klausur 1'])
  })

  it('trackAssessmentUsage creates new entry for new assessment', async () => {
    const { result } = renderHook(() => useRecentAssessmentStore())

    await loadRecentAssessments()

    await result.current.trackAssessmentUsage({
      assessmentId: 'assessment-new',
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Neue Klausur',
      type: 'written',
      date: new Date('2025-04-10'),
    })

    await waitFor(() => {
      expect(result.current.recentAssessments.length).toBe(1)
    })

    const entry = result.current.recentAssessments[0]
    expect(entry.title).toBe('Neue Klausur')
    expect(entry.assessmentId).toBe('assessment-new')
  })

  it('trackAssessmentUsage updates existing entry timestamp', async () => {
    await recentAssessmentRepository.create({
      assessmentId: 'assessment-existing',
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Bestehende Klausur',
      type: 'written',
      date: new Date('2025-03-01'),
      accessedAt: new Date('2025-03-10'),
    })

    const { result } = renderHook(() => useRecentAssessmentStore())

    await loadRecentAssessments()

    const initialCount = result.current.recentAssessments.length
    expect(initialCount).toBe(1)

    await result.current.trackAssessmentUsage({
      assessmentId: 'assessment-existing',
      classId: 'class-a',
      subjectId: 'subject-a',
      title: 'Bestehende Klausur',
      type: 'written',
      date: new Date('2025-03-01'),
    })

    await waitFor(() => {
      expect(result.current.recentAssessments.length).toBe(1)
    })

    const updatedEntry = result.current.recentAssessments[0]
    expect(updatedEntry.title).toBe('Bestehende Klausur')
    expect(updatedEntry.accessedAt.getTime()).toBeGreaterThan(
      new Date('2025-03-10').getTime()
    )
  })

  it('keeps only the 10 most recent assessments', async () => {
    for (let i = 1; i <= 12; i++) {
      await recentAssessmentRepository.create({
        assessmentId: `assessment-${i}`,
        classId: 'class-a',
        subjectId: 'subject-a',
        title: `Klausur ${i}`,
        type: 'written',
        date: new Date('2025-03-01'),
        accessedAt: new Date(`2025-03-${i}`),
      })
    }

    const { result } = renderHook(() => useRecentAssessmentStore())

    await loadRecentAssessments()

    await waitFor(() => {
      expect(result.current.recentAssessments.length).toBe(10)
    })

    const allInDb = await recentAssessmentRepository.findAll()
    expect(allInDb.length).toBe(10)
  })

  it('loadRecentAssessments sets loading to false even when repository fails', async () => {
    const { result } = renderHook(() => useRecentAssessmentStore())

    await loadRecentAssessments()

    const findAllSpy = vi
      .spyOn(recentAssessmentRepository, 'findAll')
      .mockRejectedValueOnce(new Error('Database error'))

    await expect(result.current.loadRecentAssessments()).rejects.toThrow(
      'Database error'
    )

    expect(result.current.loading).toBe(false)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load recent assessments:',
      expect.any(Error)
    )

    findAllSpy.mockRestore()
  })
})

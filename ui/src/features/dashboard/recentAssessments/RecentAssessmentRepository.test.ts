import { beforeAll, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { recentAssessmentRepository } from './RecentAssessmentRepository'

describe('recentAssessmentRepository', () => {
  beforeAll(() => {
    globalThis.indexedDB = new IDBFactory()
  })

  it('creates and retrieves recent assessments', async () => {
    const created = await recentAssessmentRepository.create({
      assessmentId: 'assessment-1',
      classId: 'class-1',
      subjectId: 'subject-1',
      title: 'Klausur 1',
      type: 'written',
      date: new Date('2025-01-12'),
      accessedAt: new Date('2025-01-15'),
    })

    const found = await recentAssessmentRepository.findById(created.id)

    expect(found).toMatchObject({
      id: created.id,
      assessmentId: 'assessment-1',
      classId: 'class-1',
      subjectId: 'subject-1',
      title: 'Klausur 1',
      type: 'written',
    })
  })

  it('updates accessedAt timestamp', async () => {
    const created = await recentAssessmentRepository.create({
      assessmentId: 'assessment-2',
      classId: 'class-1',
      subjectId: 'subject-1',
      title: 'Mündliche Note',
      type: 'oral',
      date: new Date('2025-01-12'),
      accessedAt: new Date('2025-01-15'),
    })

    const newAccessedAt = new Date('2025-01-20')
    await recentAssessmentRepository.update(created.id, {
      accessedAt: newAccessedAt,
    })

    const updated = await recentAssessmentRepository.findById(created.id)
    expect(updated?.accessedAt.getTime()).toBe(newAccessedAt.getTime())
  })
})

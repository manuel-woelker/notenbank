import { beforeAll, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createGrade } from '../../../shared/Grade'
import { assessmentGradeRepository } from './AssessmentGradeRepository'

describe('assessmentGradeRepository', () => {
  beforeAll(() => {
    globalThis.indexedDB = new IDBFactory()
  })

  it('creates and retrieves grades for an assessment', async () => {
    const created = await assessmentGradeRepository.create({
      assessmentId: 'assessment-1',
      studentId: 'student-1',
      grade: createGrade(2.0),
      points: 42.5,
    })

    const found = await assessmentGradeRepository.findById(created.id)

    expect(found).toMatchObject({
      id: created.id,
      assessmentId: 'assessment-1',
      studentId: 'student-1',
      grade: 2.0,
      points: 42.5,
    })
  })
})

import { beforeAll, describe, expect, it } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import { createGrade } from '../../../shared/Grade'
import { assessmentGradeRepository } from './AssessmentGradeRepository'

describe('assessmentGradeRepository', () => {
  beforeAll(async () => {
    await clearAllRepositoryCaches()
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

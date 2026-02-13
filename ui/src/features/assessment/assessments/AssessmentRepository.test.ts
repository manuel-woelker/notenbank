import { beforeAll, describe, expect, it } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import type { AssessmentType } from './AssessmentTypes'
import { assessmentRepository } from './AssessmentRepository'

describe('assessmentRepository', () => {
  beforeAll(async () => {
    await clearAllRepositoryCaches()
  })

  it('creates and retrieves assessments for a subject', async () => {
    const created = await assessmentRepository.create({
      classId: 'class-1',
      subjectId: 'subject-1',
      title: 'Klausur 1',
      type: 'written' satisfies AssessmentType,
      date: new Date('2025-01-12'),
    })

    const found = await assessmentRepository.findById(created.id)

    expect(found).toMatchObject({
      id: created.id,
      classId: 'class-1',
      subjectId: 'subject-1',
      title: 'Klausur 1',
      type: 'written',
    })
  })
})

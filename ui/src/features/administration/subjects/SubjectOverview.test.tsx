// @vitest-environment happy-dom
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { classRepository } from '../classes/ClassRepository'
import { subjectRepository } from './SubjectRepository'
import { assessmentRepository } from '../../assessment/assessments/AssessmentRepository'
import { assessmentGradeRepository } from '../../assessment/assessments/AssessmentGradeRepository'
import { SubjectOverview } from './SubjectOverview'

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  )
  return {
    ...actual,
    useNavigate: () => () => {},
  }
})

describe('SubjectOverview', () => {
  beforeEach(async () => {
    if (!window.matchMedia) {
      window.matchMedia = () =>
        ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList
    }
    window.getComputedStyle = () =>
      ({
        getPropertyValue: () => '',
      }) as unknown as CSSStyleDeclaration
    globalThis.indexedDB = new IDBFactory()
    const existingClasses = await classRepository.findAll()
    await Promise.all(
      existingClasses.map((existingClass) =>
        classRepository.delete(existingClass.id)
      )
    )
    const existingSubjects = await subjectRepository.findAll()
    await Promise.all(
      existingSubjects.map((existingSubject) =>
        subjectRepository.delete(existingSubject.id)
      )
    )
    const existingAssessments = await assessmentRepository.findAll()
    await Promise.all(
      existingAssessments.map((existingAssessment) =>
        assessmentRepository.delete(existingAssessment.id)
      )
    )
    const existingGrades = await assessmentGradeRepository.findAll()
    await Promise.all(
      existingGrades.map((existingGrade) =>
        assessmentGradeRepository.delete(existingGrade.id)
      )
    )
  })

  it('renders the subject and class name', async () => {
    const newClass = await classRepository.create({ name: 'Klasse A' })
    const subject = await subjectRepository.create({
      name: 'Deutsch',
      classId: newClass.id,
    })

    const { getByText } = render(
      <SubjectOverview classId={newClass.id} subjectId={subject.id} />
    )

    await waitFor(() => {
      expect(getByText('Fach Deutsch')).toBeTruthy()
    })

    await waitFor(() => {
      expect(getByText('Klasse Klasse A')).toBeTruthy()
    })
  })
})

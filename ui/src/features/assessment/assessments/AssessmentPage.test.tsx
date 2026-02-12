// @vitest-environment happy-dom
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { classRepository } from '../../administration/classes/ClassRepository'
import { subjectRepository } from '../../administration/subjects/SubjectRepository'
import { studentRepository } from '../../administration/students/StudentRepository'
import { createGrade } from '../../../shared/Grade'
import { assessmentRepository } from './AssessmentRepository'
import { assessmentGradeRepository } from './AssessmentGradeRepository'
import { AssessmentPage } from './AssessmentPage'

describe('AssessmentPage', () => {
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
    if (!globalThis.ResizeObserver) {
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    }
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
    const existingStudents = await studentRepository.findAll()
    await Promise.all(
      existingStudents.map((existingStudent) =>
        studentRepository.delete(existingStudent.id)
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

  it('renders the assessment title, student list, and average', async () => {
    const newClass = await classRepository.create({ name: 'Klasse 10A' })
    const subject = await subjectRepository.create({
      name: 'Mathe',
      classId: newClass.id,
    })
    const assessment = await assessmentRepository.create({
      classId: newClass.id,
      subjectId: subject.id,
      title: 'Klausur 1',
      type: 'written',
      date: new Date('2025-03-10'),
    })
    await assessmentGradeRepository.create({
      assessmentId: assessment.id,
      studentId: 'student-1',
      grade: createGrade(2.0),
    })
    await assessmentGradeRepository.create({
      assessmentId: assessment.id,
      studentId: 'student-2',
      grade: createGrade(3.0),
    })
    await studentRepository.create({
      firstName: 'Lina',
      lastName: 'Meyer',
      classId: newClass.id,
    })

    const { container, getByText } = render(
      <AssessmentPage
        classId={newClass.id}
        subjectId={subject.id}
        assessmentId={assessment.id}
      />
    )

    // Use container query to avoid issues with multiple elements from other tests when isolate: false
    await waitFor(() => {
      const containerText = container.textContent || ''
      expect(containerText).toContain('Leistungsfeststellung Klausur 1')
    })

    await waitFor(() => {
      expect(getByText('Durchschnitt')).toBeTruthy()
      expect(getByText('2,50')).toBeTruthy()
    })

    await waitFor(() => {
      expect(getByText('Meyer, Lina')).toBeTruthy()
    })
  })
})

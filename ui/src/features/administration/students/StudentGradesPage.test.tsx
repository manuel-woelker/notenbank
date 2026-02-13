// @vitest-environment happy-dom
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import { classRepository } from '../classes/ClassRepository'
import { studentRepository } from './StudentRepository'
import { subjectRepository } from '../subjects/SubjectRepository'
import { assessmentRepository } from '../../assessment/assessments/AssessmentRepository'
import { assessmentGradeRepository } from '../../assessment/assessments/AssessmentGradeRepository'
import { createGrade } from '../../../shared/Grade'
import { StudentGradesPage } from './StudentGradesPage'

const ensureAntdTestEnvironment = () => {
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
}

describe('StudentGradesPage', () => {
  beforeEach(async () => {
    ensureAntdTestEnvironment()
    await clearAllRepositoryCaches()
    const existingClasses = await classRepository.findAll()
    await Promise.all(
      existingClasses.map((existingClass) =>
        classRepository.delete(existingClass.id)
      )
    )
    const existingStudents = await studentRepository.findAll()
    await Promise.all(
      existingStudents.map((existingStudent) =>
        studentRepository.delete(existingStudent.id)
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

  it('renders subject list and detail grades', async () => {
    const newClass = await classRepository.create({ name: 'Klasse 9B' })
    const student = await studentRepository.create({
      firstName: 'Lina',
      lastName: 'Meyer',
      classId: newClass.id,
    })
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
      studentId: student.id,
      grade: createGrade(2.25),
    })

    const { getByText, getAllByText } = render(
      <StudentGradesPage classId={newClass.id} studentId={student.id} />
    )

    await waitFor(() => {
      expect(getByText('Schüler Lina Meyer')).toBeTruthy()
    })

    await waitFor(() => {
      expect(getAllByText('Mathe').length).toBeGreaterThan(0)
      expect(getAllByText(/2,25/).length).toBeGreaterThan(0)
    })

    await act(async () => {
      fireEvent.click(getAllByText('Mathe')[0])
    })

    await waitFor(() => {
      expect(getByText('Klausur 1')).toBeTruthy()
      expect(getByText('2-')).toBeTruthy()
    })
  })
})

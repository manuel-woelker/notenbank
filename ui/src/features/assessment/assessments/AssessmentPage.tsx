import React, { useMemo } from 'react'
import { Space, Typography } from 'antd'
import { useClassStore } from '../../administration/classes/ClassStore'
import { useStudentStore } from '../../administration/students/StudentStore'
import { useSubjectStore } from '../../administration/subjects/SubjectStore'
import { useAssessmentStore } from './AssessmentStore'
import { AssessmentGradeTable } from './AssessmentGradeTable'
import { useAssessmentGradeStore } from './AssessmentGradeStore'
import { Grade } from '../../../shared/Grade'

const { Title, Text } = Typography

interface AssessmentPageProps {
  classId: string
  subjectId: string
  assessmentId: string
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  classId,
  subjectId,
  assessmentId,
}) => {
  const { classes, loading: classesLoading } = useClassStore()
  const { subjects, loading: subjectsLoading } = useSubjectStore()
  const { students, loading: studentsLoading } = useStudentStore()
  const { assessments, loading: assessmentsLoading } = useAssessmentStore()
  const {
    assessmentGrades,
    loading: gradesLoading,
    setAssessmentGrade,
  } = useAssessmentGradeStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const selectedSubject = subjects.find((item) => item.id === subjectId)
  const selectedAssessment = assessments.find(
    (item) => item.id === assessmentId
  )

  const classStudents = useMemo(
    () => students.filter((student) => student.classId === classId),
    [students, classId]
  )

  const grades = useMemo(() => {
    const map: Record<string, Grade | null> = {}
    assessmentGrades
      .filter((entry) => entry.assessmentId === assessmentId)
      .forEach((entry) => {
        map[entry.studentId] = entry.grade
      })
    return map
  }, [assessmentGrades, assessmentId])

  const averageGradeLabel = useMemo(() => {
    const assessmentEntries = assessmentGrades.filter(
      (entry) => entry.assessmentId === assessmentId
    )
    if (assessmentEntries.length === 0) {
      return '—'
    }
    const total = assessmentEntries.reduce((sum, entry) => sum + entry.grade, 0)
    const average = total / assessmentEntries.length
    return average.toFixed(2).replace('.', ',')
  }, [assessmentGrades, assessmentId])

  const isLoading =
    classesLoading ||
    subjectsLoading ||
    studentsLoading ||
    assessmentsLoading ||
    gradesLoading

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Leistungsfeststellung {selectedAssessment?.title ?? '—'}
          </Title>
          {selectedClass ? (
            <Text type="secondary">Klasse {selectedClass.name}</Text>
          ) : null}
          {selectedSubject ? (
            <Text type="secondary" style={{ display: 'block' }}>
              Fach {selectedSubject.name}
            </Text>
          ) : null}
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary">Durchschnitt</Text>
          <Title level={4} style={{ margin: 0 }}>
            {averageGradeLabel}
          </Title>
        </div>
      </div>

      {!isLoading && !selectedAssessment ? (
        <Text type="secondary">Leistungsfeststellung nicht gefunden.</Text>
      ) : null}

      {selectedAssessment ? (
        <AssessmentGradeTable
          students={classStudents}
          grades={grades}
          onGradeChange={(studentId, grade) => {
            void setAssessmentGrade(assessmentId, studentId, grade)
          }}
        />
      ) : null}
    </Space>
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { render, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')
  const { classRepository } =
    await import('../../administration/classes/ClassRepository')
  const { subjectRepository } =
    await import('../../administration/subjects/SubjectRepository')
  const { studentRepository } =
    await import('../../administration/students/StudentRepository')
  const { assessmentRepository } = await import('./AssessmentRepository')
  const { assessmentGradeRepository } =
    await import('./AssessmentGradeRepository')
  const { createGrade } = await import('../../../shared/Grade')

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

      const { getByText } = render(
        <AssessmentPage
          classId={newClass.id}
          subjectId={subject.id}
          assessmentId={assessment.id}
        />
      )

      await waitFor(() => {
        expect(getByText('Leistungsfeststellung Klausur 1')).toBeTruthy()
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
}

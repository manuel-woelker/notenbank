import React, { useMemo } from 'react'
import { Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Grade } from '../../../shared/Grade'
import { gradeToString } from '../../../shared/Grade'
import { useClassStore } from '../classes/ClassStore'
import { useStudentStore } from './StudentStore'
import { useSubjectStore } from '../subjects/SubjectStore'
import { useAssessmentStore } from '../../assessment/assessments/AssessmentStore'
import type { AssessmentType } from '../../assessment/assessments/AssessmentTypes'
import { useAssessmentGradeStore } from '../../assessment/assessments/AssessmentGradeStore'

const { Title, Text } = Typography

const dateFormatter = new Intl.DateTimeFormat('de-DE')

const assessmentTypeLabels: Record<AssessmentType, string> = {
  written: 'Schriftlich',
  oral: 'Mündlich',
}

type StudentGradeRow = {
  id: string
  assessmentTitle: string
  subjectName: string
  assessmentType: AssessmentType | null
  date: Date | null
  grade: Grade
}

interface StudentGradesPageProps {
  classId: string
  studentId: string
}

export const StudentGradesPage: React.FC<StudentGradesPageProps> = ({
  classId,
  studentId,
}) => {
  const { classes, loading: classesLoading } = useClassStore()
  const { students, loading: studentsLoading } = useStudentStore()
  const { subjects, loading: subjectsLoading } = useSubjectStore()
  const { assessments, loading: assessmentsLoading } = useAssessmentStore()
  const { assessmentGrades, loading: gradesLoading } = useAssessmentGradeStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const selectedStudent = students.find((item) => item.id === studentId)

  const studentGrades = useMemo(() => {
    return assessmentGrades
      .filter((entry) => entry.studentId === studentId)
      .map((entry) => {
        const assessment = assessments.find(
          (item) => item.id === entry.assessmentId
        )
        const subject = assessment
          ? subjects.find((item) => item.id === assessment.subjectId)
          : undefined
        return {
          id: entry.id,
          assessmentTitle:
            assessment?.title ?? 'Unbekannte Leistungsfeststellung',
          subjectName: subject?.name ?? 'Unbekanntes Fach',
          assessmentType: assessment?.type ?? null,
          date: assessment?.date ?? null,
          grade: entry.grade,
        }
      })
      .sort((a, b) => {
        const left = a.date ? a.date.getTime() : 0
        const right = b.date ? b.date.getTime() : 0
        return right - left
      })
  }, [assessmentGrades, assessments, subjects, studentId])

  const isLoading =
    classesLoading ||
    studentsLoading ||
    subjectsLoading ||
    assessmentsLoading ||
    gradesLoading

  const columns: ColumnsType<StudentGradeRow> = [
    {
      title: 'Leistungsfeststellung',
      dataIndex: 'assessmentTitle',
      key: 'assessmentTitle',
    },
    {
      title: 'Fach',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Typ',
      dataIndex: 'assessmentType',
      key: 'assessmentType',
      render: (value: AssessmentType | null) =>
        value ? assessmentTypeLabels[value] : '—',
      width: 140,
    },
    {
      title: 'Datum',
      dataIndex: 'date',
      key: 'date',
      render: (value: Date | null) =>
        value ? dateFormatter.format(value) : '—',
      sorter: (a, b) => {
        const left = a.date ? a.date.getTime() : 0
        const right = b.date ? b.date.getTime() : 0
        return left - right
      },
      width: 140,
    },
    {
      title: 'Note',
      dataIndex: 'grade',
      key: 'grade',
      render: (value: Grade) => gradeToString(value),
      width: 100,
    },
  ]

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>
          Schüler {selectedStudent?.firstName ?? '—'}{' '}
          {selectedStudent?.lastName ?? ''}
        </Title>
        {selectedClass ? (
          <Text type="secondary">Klasse {selectedClass.name}</Text>
        ) : null}
      </div>

      {!isLoading && !selectedStudent ? (
        <Text type="secondary">Schüler nicht gefunden.</Text>
      ) : null}

      <div>
        <Title level={4} style={{ marginTop: 0 }}>
          Noten
        </Title>
        <Table
          columns={columns}
          dataSource={studentGrades}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'Keine Noten vorhanden.' }}
          size="small"
        />
      </div>
    </Space>
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { render, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')
  const { classRepository } = await import('../classes/ClassRepository')
  const { studentRepository } = await import('./StudentRepository')
  const { subjectRepository } = await import('../subjects/SubjectRepository')
  const { assessmentRepository } =
    await import('../../assessment/assessments/AssessmentRepository')
  const { assessmentGradeRepository } =
    await import('../../assessment/assessments/AssessmentGradeRepository')
  const { createGrade } = await import('../../../shared/Grade')

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
      globalThis.indexedDB = new IDBFactory()
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

    it('renders student details and grade rows', async () => {
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

      const { getByText } = render(
        <StudentGradesPage classId={newClass.id} studentId={student.id} />
      )

      await waitFor(() => {
        expect(getByText('Schüler Lina Meyer')).toBeTruthy()
      })

      await waitFor(() => {
        expect(getByText('Mathe')).toBeTruthy()
        expect(getByText('Klausur 1')).toBeTruthy()
        expect(getByText('2-')).toBeTruthy()
      })
    })
  })
}

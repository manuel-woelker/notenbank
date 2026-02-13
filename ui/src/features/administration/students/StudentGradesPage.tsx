import React, { useMemo, useState } from 'react'
import { Col, Row, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Grade } from '../../../shared/Grade'
import { gradeToString } from '../../../shared/Grade'
import { useClassStore } from '../classes/ClassStore'
import { useStudentStore } from './StudentStore'
import { useSubjectStore } from '../subjects/SubjectStore'
import { useAssessmentStore } from '../../assessment/assessments/AssessmentStore'
import type {
  Assessment,
  AssessmentType,
} from '../../assessment/assessments/AssessmentTypes'
import { useAssessmentGradeStore } from '../../assessment/assessments/AssessmentGradeStore'
import { combineLoading } from '../../../shared/store/combineLoading'

const { Title, Text } = Typography

const dateFormatter = new Intl.DateTimeFormat('de-DE')

const assessmentTypeLabels: Record<AssessmentType, string> = {
  written: 'Schriftlich',
  oral: 'Mündlich',
}

/* 📖 # Why use default weights for assessment types?
The UI needs weighted averages but per-subject weight configuration is not yet
modeled. Using a conventional 2:1 written-to-oral ratio keeps the calculation
transparent and provides stable results until configurable weights land.
*/
const assessmentTypeWeights: Record<AssessmentType, number> = {
  written: 2,
  oral: 1,
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

type SubjectGradeRow = {
  id: string
  name: string
  weightedLabel: string
}

export const StudentGradesPage: React.FC<StudentGradesPageProps> = ({
  classId,
  studentId,
}) => {
  const { classes, loading: classesLoading } = useClassStore()
  const { students, loading: studentsLoading } = useStudentStore()
  const { subjects, loading: subjectsLoading } = useSubjectStore()
  const { assessments } = useAssessmentStore()
  const { assessmentGrades, loading: gradesLoading } = useAssessmentGradeStore()
  const [userSelectedSubjectId, setUserSelectedSubjectId] = useState<
    string | null
  >(null)

  const selectedClass = classes.find((item) => item.id === classId)
  const selectedStudent = students.find((item) => item.id === studentId)

  const classSubjects = useMemo(
    () => subjects.filter((subject) => subject.classId === classId),
    [subjects, classId]
  )

  const assessmentById = useMemo(
    () => new Map(assessments.map((assessment) => [assessment.id, assessment])),
    [assessments]
  )

  const studentGradesBySubject = useMemo(() => {
    const result = new Map<
      string,
      Array<{ grade: Grade; assessment: Assessment }>
    >()
    assessmentGrades.forEach((entry) => {
      if (entry.studentId !== studentId) {
        return
      }
      const assessment = assessmentById.get(entry.assessmentId)
      if (!assessment || assessment.classId !== classId) {
        return
      }
      const entries = result.get(assessment.subjectId) ?? []
      entries.push({ grade: entry.grade, assessment })
      result.set(assessment.subjectId, entries)
    })
    return result
  }, [assessmentGrades, assessmentById, studentId, classId])

  const formatAverage = (value: number | null) =>
    value === null ? '—' : value.toFixed(2).replace('.', ',')

  const subjectRows = useMemo<SubjectGradeRow[]>(() => {
    return classSubjects.map((subject) => {
      const entries = studentGradesBySubject.get(subject.id) ?? []
      const weighted =
        entries.length === 0
          ? null
          : entries.reduce((sum, entry) => {
              const weight = assessmentTypeWeights[entry.assessment.type]
              return sum + entry.grade * weight
            }, 0) /
            entries.reduce((sum, entry) => {
              const weight = assessmentTypeWeights[entry.assessment.type]
              return sum + weight
            }, 0)
      return {
        id: subject.id,
        name: subject.name,
        weightedLabel: formatAverage(weighted),
      }
    })
  }, [classSubjects, studentGradesBySubject])

  const resolvedSubjectId = useMemo(() => {
    if (userSelectedSubjectId) {
      const exists = subjectRows.some(
        (subject) => subject.id === userSelectedSubjectId
      )
      if (exists) {
        return userSelectedSubjectId
      }
    }
    const subjectWithGrades = subjectRows.find(
      (subject) => subject.weightedLabel !== '—'
    )
    return subjectWithGrades?.id ?? subjectRows[0]?.id ?? ''
  }, [userSelectedSubjectId, subjectRows])

  const selectedSubject = classSubjects.find(
    (subject) => subject.id === resolvedSubjectId
  )

  const detailRows = useMemo<StudentGradeRow[]>(() => {
    if (!resolvedSubjectId) {
      return []
    }
    const entries = studentGradesBySubject.get(resolvedSubjectId) ?? []
    return entries
      .map((entry) => ({
        id: entry.assessment.id,
        assessmentTitle: entry.assessment.title,
        subjectName: selectedSubject?.name ?? 'Unbekanntes Fach',
        assessmentType: entry.assessment.type,
        date: entry.assessment.date,
        grade: entry.grade,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [studentGradesBySubject, resolvedSubjectId, selectedSubject])

  const isLoading = combineLoading(
    classesLoading,
    studentsLoading,
    subjectsLoading,
    gradesLoading
  )

  const subjectColumns: ColumnsType<SubjectGradeRow> = [
    {
      title: 'Fach',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Durchschnittsnote',
      dataIndex: 'weightedLabel',
      key: 'weightedLabel',
      width: 160,
    },
  ]

  const detailColumns: ColumnsType<StudentGradeRow> = [
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

      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Title level={4} style={{ marginTop: 0 }}>
            Fächer
          </Title>
          <div data-tour="student-subjects">
            <Table
              columns={subjectColumns}
              dataSource={subjectRows}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              locale={{ emptyText: 'Keine Fächer vorhanden.' }}
              size="small"
              onRow={(record) => ({
                onClick: () => setUserSelectedSubjectId(record.id),
                style: {
                  cursor: 'pointer',
                  backgroundColor:
                    record.id === resolvedSubjectId ? '#e6f4ff' : undefined,
                },
              })}
            />
          </div>
        </Col>
        <Col xs={24} md={14}>
          <Title level={4} style={{ marginTop: 0 }}>
            Noten {selectedSubject ? `(${selectedSubject.name})` : ''}
          </Title>
          <div data-tour="student-grades">
            <Table
              columns={detailColumns}
              dataSource={detailRows}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              locale={{ emptyText: 'Keine Noten vorhanden.' }}
              size="small"
            />
          </div>
        </Col>
      </Row>
    </Space>
  )
}

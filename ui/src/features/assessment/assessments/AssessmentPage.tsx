import React, { useEffect, useMemo } from 'react'
import {
  Card,
  Col,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useClassStore } from '../../administration/classes/ClassStore'
import { useStudentStore } from '../../administration/students/StudentStore'
import { useSubjectStore } from '../../administration/subjects/SubjectStore'
import { useAssessmentStore } from './AssessmentStore'
import { AssessmentGradeTable } from './AssessmentGradeTable'
import { useAssessmentGradeStore } from './AssessmentGradeStore'
import { Grade, gradeToString } from '../../../shared/Grade'
import { GradingCurveConfig, generateGradingTable } from './GradingCurve'
import { trackAssessmentUsage } from '../../dashboard/recentAssessments/RecentAssessmentStore'

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
  const {
    assessments,
    loading: assessmentsLoading,
    updateAssessment,
  } = useAssessmentStore()
  const {
    assessmentGrades,
    loading: gradesLoading,
    setAssessmentGrade,
    setAssessmentResult,
  } = useAssessmentGradeStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const selectedSubject = subjects.find((item) => item.id === subjectId)
  const selectedAssessment = assessments.find(
    (item) => item.id === assessmentId
  )

  useEffect(() => {
    if (selectedAssessment && !assessmentsLoading) {
      void trackAssessmentUsage({
        assessmentId: selectedAssessment.id,
        classId: selectedAssessment.classId,
        subjectId: selectedAssessment.subjectId,
        title: selectedAssessment.title,
        type: selectedAssessment.type,
        date: selectedAssessment.date,
      })
    }
  }, [selectedAssessment, assessmentsLoading])

  const classStudents = useMemo(
    () => students.filter((student) => student.classId === classId),
    [students, classId]
  )

  const results = useMemo(() => {
    const map: Record<
      string,
      { grade: Grade | null; points?: number | null; errors?: number | null }
    > = {}
    assessmentGrades
      .filter((entry) => entry.assessmentId === assessmentId)
      .forEach((entry) => {
        map[entry.studentId] = {
          grade: entry.grade,
          points: entry.points ?? null,
          errors: entry.errors ?? null,
        }
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

  const gradingCurve = selectedAssessment?.gradingCurve ?? null
  const gradingCurveEnabled = Boolean(gradingCurve)
  const gradingTableData = useMemo(() => {
    if (!gradingCurve) {
      return []
    }
    const table =
      gradingCurve.mode === 'errors'
        ? generateGradingTable({
            grade1Value: -gradingCurve.grade1Value,
            grade4Value: -gradingCurve.grade4Value,
          }).map((entry) => ({
            grade: entry.grade,
            threshold: -entry.minimumPoints,
          }))
        : generateGradingTable(gradingCurve).map((entry) => ({
            grade: entry.grade,
            threshold: entry.minimumPoints,
          }))

    return table.map((entry) => ({
      key: `${entry.grade}`,
      ...entry,
    }))
  }, [gradingCurve])

  const formatThresholdValue = (value: number) =>
    value.toLocaleString('de-DE', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    })

  const gradingTableColumns: ColumnsType<{
    grade: Grade
    threshold: number
  }> = [
    {
      title: 'Note',
      dataIndex: 'grade',
      key: 'grade',
      render: (value: Grade) => gradeToString(value),
      width: 120,
    },
    {
      title: gradingCurve?.mode === 'errors' ? 'Max. Fehler' : 'Min. Punkte',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (value: number) => formatThresholdValue(value),
    },
  ]

  const ensureGradingCurve = (updates: Partial<GradingCurveConfig>) => {
    if (!selectedAssessment) {
      return
    }
    const baseCurve: GradingCurveConfig = gradingCurve ?? {
      mode: 'points',
      grade1Value: 60,
      grade4Value: 30,
    }
    void updateAssessment(selectedAssessment.id, {
      gradingCurve: { ...baseCurve, ...updates },
    })
  }

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
        <Row gutter={[16, 16]} align="top">
          <Col xs={24} lg={14}>
            <div data-tour="assessment-grades">
              <AssessmentGradeTable
                students={classStudents}
                results={results}
                gradingCurve={gradingCurve}
                onGradeChange={(studentId, grade) => {
                  void setAssessmentGrade(assessmentId, studentId, grade)
                }}
                onScoreChange={(studentId, result) => {
                  void setAssessmentResult(assessmentId, studentId, result)
                }}
              />
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <Space
              orientation="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Card
                size="small"
                title="Notenlinie"
                data-tour="assessment-curve"
              >
                <Space
                  orientation="vertical"
                  size="middle"
                  style={{ width: '100%' }}
                >
                  <Space align="center">
                    <Switch
                      checked={gradingCurveEnabled}
                      onChange={(checked) => {
                        if (!selectedAssessment) {
                          return
                        }
                        if (!checked) {
                          void updateAssessment(selectedAssessment.id, {
                            gradingCurve: null,
                          })
                          return
                        }
                        ensureGradingCurve({})
                      }}
                    />
                    <Text>Notenlinie verwenden</Text>
                  </Space>
                  <Space wrap>
                    <Space orientation="vertical" size={4}>
                      <Text type="secondary">Auswertung</Text>
                      <Select
                        placeholder="Auswertung"
                        options={[
                          { label: 'Punkte', value: 'points' },
                          { label: 'Fehler', value: 'errors' },
                        ]}
                        value={gradingCurve?.mode}
                        onChange={(value) => {
                          ensureGradingCurve({ mode: value })
                        }}
                        disabled={!gradingCurveEnabled}
                        style={{ minWidth: 160 }}
                      />
                    </Space>
                    <Space orientation="vertical" size={4}>
                      <Text type="secondary">Note 1</Text>
                      <InputNumber
                        min={0}
                        step={0.5}
                        placeholder="Note 1"
                        value={gradingCurve?.grade1Value ?? null}
                        onChange={(value) => {
                          if (typeof value === 'number') {
                            ensureGradingCurve({ grade1Value: value })
                          }
                        }}
                        disabled={!gradingCurveEnabled}
                        aria-label="Wert für Note 1"
                      />
                    </Space>
                    <Space orientation="vertical" size={4}>
                      <Text type="secondary">Note 4</Text>
                      <InputNumber
                        min={0}
                        step={0.5}
                        placeholder="Note 4"
                        value={gradingCurve?.grade4Value ?? null}
                        onChange={(value) => {
                          if (typeof value === 'number') {
                            ensureGradingCurve({ grade4Value: value })
                          }
                        }}
                        disabled={!gradingCurveEnabled}
                        aria-label="Wert für Note 4"
                      />
                    </Space>
                  </Space>
                </Space>
              </Card>
              {gradingCurveEnabled ? (
                <Card size="small" title="Notentabelle">
                  <Table
                    columns={gradingTableColumns}
                    dataSource={gradingTableData}
                    rowKey="key"
                    pagination={false}
                    size="small"
                  />
                </Card>
              ) : null}
            </Space>
          </Col>
        </Row>
      ) : null}
    </Space>
  )
}

import React, { useMemo } from 'react'
import { Space, Typography, message } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import { useClassStore } from '../classes/ClassStore'
import { useSubjectStore } from './SubjectStore'
import { useAssessmentStore } from '../../assessment/assessments/AssessmentStore'
import { AssessmentTable } from '../../assessment/assessments/AssessmentTable'
import { useAssessmentGradeStore } from '../../assessment/assessments/AssessmentGradeStore'
import { useDatabaseStore } from '../../../shared/store/databaseStore'
import { buildClassRouteSegment } from '../../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../../shared/routes/subjectRoute'
import { buildAssessmentRouteSegment } from '../../../shared/routes/assessmentRoute'
import { combineLoading } from '../../../shared/store/combineLoading'

const { Title, Text } = Typography

interface SubjectOverviewProps {
  classId: string
  subjectId: string
}

/**
 * Overview page for a subject within a class
 */
export const SubjectOverview: React.FC<SubjectOverviewProps> = ({
  classId,
  subjectId,
}) => {
  const navigate = useNavigate()
  const { classes, loading: classesLoading } = useClassStore()
  const { subjects, loading: subjectsLoading } = useSubjectStore()
  const { assessments, createAssessment, updateAssessment } =
    useAssessmentStore()
  const { assessmentGrades, loading: gradesLoading } = useAssessmentGradeStore()
  const { isExample } = useDatabaseStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const selectedSubject = subjects.find((item) => item.id === subjectId)
  const classRouteSegment = buildClassRouteSegment(classes, classId)
  const subjectRouteSegment = buildSubjectRouteSegment(
    subjects,
    classId,
    subjectId
  )
  const getAssessmentHref = (assessmentId: string) => {
    if (!classRouteSegment || !subjectRouteSegment) {
      return isExample ? '#/classes?db=example' : '#/classes'
    }
    const assessmentSegment = buildAssessmentRouteSegment(
      assessments,
      classId,
      subjectId,
      assessmentId
    )
    return isExample
      ? `#/classes/${classRouteSegment}/subjects/${subjectRouteSegment}/assessments/${assessmentSegment}?db=example`
      : `#/classes/${classRouteSegment}/subjects/${subjectRouteSegment}/assessments/${assessmentSegment}`
  }
  const subjectAssessments = useMemo(
    () =>
      assessments
        .filter(
          (assessment) =>
            assessment.classId === classId && assessment.subjectId === subjectId
        )
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [assessments, classId, subjectId]
  )

  const averageGradesByAssessmentId = useMemo(() => {
    const averages: Record<string, number> = {}
    subjectAssessments.forEach((assessment) => {
      const entries = assessmentGrades.filter(
        (grade) => grade.assessmentId === assessment.id
      )
      if (entries.length === 0) {
        return
      }
      averages[assessment.id] =
        entries.reduce((sum, entry) => sum + entry.grade, 0) / entries.length
    })
    return averages
  }, [assessmentGrades, subjectAssessments])

  const isLoading = combineLoading(
    classesLoading,
    subjectsLoading,
    gradesLoading
  )

  const handleCreateAssessment = async (
    input: Parameters<typeof createAssessment>[0]
  ) => {
    try {
      await createAssessment(input)
      message.success('Leistungsfeststellung hinzugefügt.')
    } catch (error) {
      console.error('Failed to add assessment:', error)
      message.error(
        'Leistungsfeststellung konnte nicht hinzugefügt werden. Bitte erneut versuchen.'
      )
    }
  }

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>
          Fach {selectedSubject?.name ?? '—'}
        </Title>
        {selectedClass ? (
          <Text type="secondary">Klasse {selectedClass.name}</Text>
        ) : null}
      </div>

      {!isLoading && !selectedSubject ? (
        <Text type="secondary">Fach nicht gefunden.</Text>
      ) : null}

      <div data-tour="subject-assessments">
        <Title level={4} style={{ marginTop: 0 }}>
          Leistungsfeststellungen
        </Title>
        <AssessmentTable
          assessments={subjectAssessments}
          loading={isLoading}
          averageGradesByAssessmentId={averageGradesByAssessmentId}
          onCreateAssessment={async (input) => {
            await handleCreateAssessment({
              ...input,
              classId,
              subjectId,
            })
          }}
          onUpdateAssessment={async (id, updates) => {
            await updateAssessment(id, updates)
          }}
          onSelectAssessment={(assessmentId) => {
            if (!classRouteSegment || !subjectRouteSegment) {
              return
            }
            const assessmentSegment = buildAssessmentRouteSegment(
              assessments,
              classId,
              subjectId,
              assessmentId
            )
            void navigate({
              to: `/classes/${classRouteSegment}/subjects/${subjectRouteSegment}/assessments/${assessmentSegment}`,
              search: (prev) => prev,
            })
          }}
          getAssessmentHref={getAssessmentHref}
          disableCreate={!selectedClass || !selectedSubject}
        />
      </div>
    </Space>
  )
}

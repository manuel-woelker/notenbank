import React, { useMemo } from 'react'
import { Space, Typography, message } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import { useClassStore } from '../classes/ClassStore'
import { useSubjectStore } from './SubjectStore'
import { useAssessmentStore } from '../../assessment/assessments/AssessmentStore'
import { AssessmentTable } from '../../assessment/assessments/AssessmentTable'
import { buildClassRouteSegment } from '../../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../../shared/routes/subjectRoute'
import { buildAssessmentRouteSegment } from '../../../shared/routes/assessmentRoute'

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
  const {
    assessments,
    loading: assessmentsLoading,
    createAssessment,
  } = useAssessmentStore()

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
      return '#/classes'
    }
    const assessmentSegment = buildAssessmentRouteSegment(
      assessments,
      classId,
      subjectId,
      assessmentId
    )
    return `#/classes/${classRouteSegment}/subjects/${subjectRouteSegment}/assessments/${assessmentSegment}`
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

  const isLoading = classesLoading || subjectsLoading || assessmentsLoading

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

      <div>
        <Title level={4} style={{ marginTop: 0 }}>
          Leistungsfeststellungen
        </Title>
        <AssessmentTable
          assessments={subjectAssessments}
          loading={isLoading}
          onCreateAssessment={async (input) => {
            await handleCreateAssessment({
              ...input,
              classId,
              subjectId,
            })
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
            })
          }}
          getAssessmentHref={getAssessmentHref}
          disableCreate={!selectedClass || !selectedSubject}
        />
      </div>
    </Space>
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, vi } = import.meta.vitest
  const { render, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')
  const { classRepository } = await import('../classes/ClassRepository')
  const { subjectRepository } = await import('./SubjectRepository')
  const { assessmentRepository } =
    await import('../../assessment/assessments/AssessmentRepository')

  vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual<
      typeof import('@tanstack/react-router')
    >('@tanstack/react-router')
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
}

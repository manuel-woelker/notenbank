import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { useSubjectStore } from '../../features/administration/subjects/SubjectStore'
import { useAssessmentStore } from '../../features/assessment/assessments/AssessmentStore'
import { AssessmentPage } from '../../features/assessment/assessments/AssessmentPage'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'
import { findSubjectByRouteSegment } from '../../shared/routes/subjectRoute'
import { findAssessmentByRouteSegment } from '../../shared/routes/assessmentRoute'

export const AssessmentRoute: React.FC = () => {
  const { classKey, subjectKey, assessmentKey } = useParams({
    from: '/classes/$classKey/subjects/$subjectKey/assessments/$assessmentKey',
  })
  const { classes } = useClassStore()
  const { subjects } = useSubjectStore()
  const { assessments } = useAssessmentStore()

  const selectedClass = findClassByRouteSegment(classes, classKey)
  const selectedSubject = selectedClass
    ? findSubjectByRouteSegment(subjects, selectedClass.id, subjectKey)
    : undefined
  const selectedAssessment =
    selectedClass && selectedSubject
      ? findAssessmentByRouteSegment(
          assessments,
          selectedClass.id,
          selectedSubject.id,
          assessmentKey
        )
      : undefined

  return (
    <AssessmentPage
      classId={selectedClass?.id ?? ''}
      subjectId={selectedSubject?.id ?? ''}
      assessmentId={selectedAssessment?.id ?? ''}
    />
  )
}

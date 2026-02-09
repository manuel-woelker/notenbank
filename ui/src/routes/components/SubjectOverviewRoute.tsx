import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { SubjectOverview } from '../../features/administration/subjects/SubjectOverview'
import { useSubjectStore } from '../../features/administration/subjects/SubjectStore'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'
import { findSubjectByRouteSegment } from '../../shared/routes/subjectRoute'

export const SubjectOverviewRoute: React.FC = () => {
  const { classKey, subjectKey } = useParams({
    from: '/classes/$classKey/subjects/$subjectKey',
  })
  const { classes } = useClassStore()
  const { subjects } = useSubjectStore()
  const selectedClass = findClassByRouteSegment(classes, classKey)
  const selectedSubject = selectedClass
    ? findSubjectByRouteSegment(subjects, selectedClass.id, subjectKey)
    : undefined

  return (
    <SubjectOverview
      classId={selectedClass?.id ?? ''}
      subjectId={selectedSubject?.id ?? ''}
    />
  )
}

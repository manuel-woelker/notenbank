import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { SubjectOverview } from '../../features/administration/subjects/SubjectOverview'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'

export const SubjectOverviewRoute: React.FC = () => {
  const { classKey, subjectId } = useParams({
    from: '/classes/$classKey/subjects/$subjectId',
  })
  const { classes } = useClassStore()
  const selectedClass = findClassByRouteSegment(classes, classKey)

  return (
    <SubjectOverview classId={selectedClass?.id ?? ''} subjectId={subjectId} />
  )
}

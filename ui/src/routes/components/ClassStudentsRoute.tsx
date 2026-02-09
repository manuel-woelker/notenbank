import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { ClassOverview } from '../../features/administration/students/ClassOverview'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'

export const ClassStudentsRoute: React.FC = () => {
  const { classKey } = useParams({ from: '/classes/$classKey' })
  const { classes } = useClassStore()
  const selectedClass = findClassByRouteSegment(classes, classKey)

  return <ClassOverview classId={selectedClass?.id ?? ''} />
}

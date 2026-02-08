import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { ClassStudentsList } from '../../features/administration/students/ClassStudentsList'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'

export const ClassStudentsRoute: React.FC = () => {
  const { classKey } = useParams({ from: '/classes/$classKey/students' })
  const { classes } = useClassStore()
  const selectedClass = findClassByRouteSegment(classes, classKey)

  return <ClassStudentsList classId={selectedClass?.id ?? ''} />
}

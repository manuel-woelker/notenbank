import React from 'react'
import { useParams } from '@tanstack/react-router'
import { ClassStudentsList } from '../../features/administration/students/ClassStudentsList'

export const ClassStudentsRoute: React.FC = () => {
  const { classId } = useParams({ from: '/classes/$classId/students' })
  return <ClassStudentsList classId={classId} />
}

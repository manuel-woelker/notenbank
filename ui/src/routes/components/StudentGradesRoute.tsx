import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { useStudentStore } from '../../features/administration/students/StudentStore'
import { StudentGradesPage } from '../../features/administration/students/StudentGradesPage'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'
import { findStudentByRouteSegment } from '../../shared/routes/studentRoute'

export const StudentGradesRoute: React.FC = () => {
  const { classKey, studentKey } = useParams({
    from: '/classes/$classKey/students/$studentKey',
  })
  const { classes } = useClassStore()
  const { students } = useStudentStore()
  const selectedClass = findClassByRouteSegment(classes, classKey)
  const selectedStudent = selectedClass
    ? findStudentByRouteSegment(students, selectedClass.id, studentKey)
    : undefined

  return (
    <StudentGradesPage
      classId={selectedClass?.id ?? ''}
      studentId={selectedStudent?.id ?? ''}
    />
  )
}

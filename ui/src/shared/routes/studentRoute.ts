import type { Student } from '../../features/administration/students/StudentTypes'

/* 📖 # Why build student slugs from full names?
Student detail URLs should be readable and stable even when internal IDs change.
Using "Nachname Vorname" matches how staff refer to students while keeping
route segments deterministic with a numeric suffix for duplicates.
*/
const normalizeStudentName = (student: Student) =>
  `${student.lastName} ${student.firstName}`.trim().toLowerCase()

const normalizeStudentSlug = (student: Student) =>
  normalizeStudentName(student).replace(/\s+/g, '-')

export const buildStudentRouteSegment = (
  students: Student[],
  classId: string,
  studentId: string
) => {
  const target = students.find(
    (item) => item.id === studentId && item.classId === classId
  )
  if (!target) {
    return encodeURIComponent(studentId)
  }
  const nameSlug = normalizeStudentSlug(target)
  const sameName = students.filter(
    (item) =>
      item.classId === classId && normalizeStudentSlug(item) === nameSlug
  )
  const index = sameName.findIndex((item) => item.id === studentId) + 1
  const safeIndex = index > 0 ? index : 1

  const suffix = safeIndex > 1 ? `-${safeIndex}` : ''
  return encodeURIComponent(`${nameSlug}${suffix}`)
}

export const findStudentByRouteSegment = (
  students: Student[],
  classId: string,
  rawSegment: string
) => {
  const decoded = decodeURIComponent(rawSegment)
  const match = decoded.match(/^(.*?)(?:-(\d+))?$/)
  if (!match) {
    return undefined
  }
  const nameSlug = match[1]
  const index = match[2] ? Number(match[2]) : 1
  if (!Number.isFinite(index) || index < 1) {
    return undefined
  }
  const sameName = students.filter(
    (item) =>
      item.classId === classId && normalizeStudentSlug(item) === nameSlug
  )

  return sameName[index - 1]
}

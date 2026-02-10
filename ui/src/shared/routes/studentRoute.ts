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

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('studentRoute', () => {
    const timestamp = new Date('2024-01-01T00:00:00.000Z')
    const students: Student[] = [
      {
        id: 's-1',
        classId: 'c-1',
        firstName: 'Lina',
        lastName: 'Meyer',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 's-2',
        classId: 'c-1',
        firstName: 'Lina',
        lastName: 'Meyer',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 's-3',
        classId: 'c-1',
        firstName: 'Alex',
        lastName: 'Schulz',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 's-4',
        classId: 'c-2',
        firstName: 'Lina',
        lastName: 'Meyer',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]

    it('builds student route segments by name within a class', () => {
      expect(buildStudentRouteSegment(students, 'c-1', 's-1')).toBe(
        'meyer-lina'
      )
      expect(buildStudentRouteSegment(students, 'c-1', 's-2')).toBe(
        'meyer-lina-2'
      )
      expect(buildStudentRouteSegment(students, 'c-1', 's-3')).toBe(
        'schulz-alex'
      )
      expect(buildStudentRouteSegment(students, 'c-2', 's-4')).toBe(
        'meyer-lina'
      )
    })

    it('finds students by route segment within the class', () => {
      expect(findStudentByRouteSegment(students, 'c-1', 'meyer-lina')?.id).toBe(
        's-1'
      )
      expect(
        findStudentByRouteSegment(students, 'c-1', 'meyer-lina-2')?.id
      ).toBe('s-2')
      expect(
        findStudentByRouteSegment(students, 'c-1', 'schulz-alex')?.id
      ).toBe('s-3')
      expect(findStudentByRouteSegment(students, 'c-2', 'meyer-lina')?.id).toBe(
        's-4'
      )
    })
  })
}

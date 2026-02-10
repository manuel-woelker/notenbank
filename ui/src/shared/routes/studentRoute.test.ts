import { describe, expect, it } from 'vitest'
import type { Student } from '../../features/administration/students/StudentTypes'
import {
  buildStudentRouteSegment,
  findStudentByRouteSegment,
} from './studentRoute'

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
    expect(buildStudentRouteSegment(students, 'c-1', 's-1')).toBe('meyer-lina')
    expect(buildStudentRouteSegment(students, 'c-1', 's-2')).toBe(
      'meyer-lina-2'
    )
    expect(buildStudentRouteSegment(students, 'c-1', 's-3')).toBe('schulz-alex')
    expect(buildStudentRouteSegment(students, 'c-2', 's-4')).toBe('meyer-lina')
  })

  it('finds students by route segment within the class', () => {
    expect(findStudentByRouteSegment(students, 'c-1', 'meyer-lina')?.id).toBe(
      's-1'
    )
    expect(findStudentByRouteSegment(students, 'c-1', 'meyer-lina-2')?.id).toBe(
      's-2'
    )
    expect(findStudentByRouteSegment(students, 'c-1', 'schulz-alex')?.id).toBe(
      's-3'
    )
    expect(findStudentByRouteSegment(students, 'c-2', 'meyer-lina')?.id).toBe(
      's-4'
    )
  })
})

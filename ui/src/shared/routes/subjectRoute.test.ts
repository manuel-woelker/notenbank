import { describe, expect, it } from 'vitest'
import type { Subject } from '../../features/administration/subjects/SubjectTypes'
import {
  buildSubjectRouteSegment,
  findSubjectByRouteSegment,
} from './subjectRoute'

describe('subjectRoute', () => {
  const timestamp = new Date('2024-01-01T00:00:00.000Z')
  const subjects: Subject[] = [
    {
      id: 's-1',
      classId: 'c-1',
      name: 'Deutsch',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 's-2',
      classId: 'c-1',
      name: 'Deutsch',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 's-3',
      classId: 'c-1',
      name: 'Mathe Grundlagen',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 's-4',
      classId: 'c-2',
      name: 'Deutsch',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]

  it('builds subject route segments based on subject name and class', () => {
    expect(buildSubjectRouteSegment(subjects, 'c-1', 's-1')).toBe('deutsch')
    expect(buildSubjectRouteSegment(subjects, 'c-1', 's-2')).toBe('deutsch-2')
    expect(buildSubjectRouteSegment(subjects, 'c-1', 's-3')).toBe(
      'mathe-grundlagen'
    )
    expect(buildSubjectRouteSegment(subjects, 'c-2', 's-4')).toBe('deutsch')
  })

  it('finds subjects by route segment within the class', () => {
    expect(findSubjectByRouteSegment(subjects, 'c-1', 'deutsch')?.id).toBe(
      's-1'
    )
    expect(findSubjectByRouteSegment(subjects, 'c-1', 'deutsch-2')?.id).toBe(
      's-2'
    )
    expect(
      findSubjectByRouteSegment(subjects, 'c-1', 'mathe-grundlagen')?.id
    ).toBe('s-3')
    expect(findSubjectByRouteSegment(subjects, 'c-2', 'deutsch')?.id).toBe(
      's-4'
    )
  })
})

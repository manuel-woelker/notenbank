import type { Subject } from '../../features/administration/subjects/SubjectTypes'

const normalizeSubjectName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '-')

export const buildSubjectRouteSegment = (
  subjects: Subject[],
  classId: string,
  subjectId: string
) => {
  const target = subjects.find(
    (item) => item.id === subjectId && item.classId === classId
  )
  if (!target) {
    return encodeURIComponent(normalizeSubjectName(subjectId))
  }
  const nameSlug = normalizeSubjectName(target.name)
  const sameName = subjects.filter(
    (item) =>
      item.classId === classId && normalizeSubjectName(item.name) === nameSlug
  )
  const index = sameName.findIndex((item) => item.id === subjectId) + 1
  const safeIndex = index > 0 ? index : 1

  const suffix = safeIndex > 1 ? `-${safeIndex}` : ''
  return encodeURIComponent(`${nameSlug}${suffix}`)
}

export const findSubjectByRouteSegment = (
  subjects: Subject[],
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
  const sameName = subjects.filter(
    (item) =>
      item.classId === classId && normalizeSubjectName(item.name) === nameSlug
  )

  return sameName[index - 1]
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

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
}

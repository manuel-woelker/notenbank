import type { Assessment } from '../../features/assessment/assessments/AssessmentTypes'

const normalizeAssessmentTitle = (title: string) =>
  title.trim().toLowerCase().replace(/\s+/g, '-')

export const buildAssessmentRouteSegment = (
  assessments: Assessment[],
  classId: string,
  subjectId: string,
  assessmentId: string
) => {
  const target = assessments.find(
    (item) =>
      item.id === assessmentId &&
      item.classId === classId &&
      item.subjectId === subjectId
  )
  if (!target) {
    return encodeURIComponent(normalizeAssessmentTitle(assessmentId))
  }
  const titleSlug = normalizeAssessmentTitle(target.title)
  const sameTitle = assessments.filter(
    (item) =>
      item.classId === classId &&
      item.subjectId === subjectId &&
      normalizeAssessmentTitle(item.title) === titleSlug
  )
  const index = sameTitle.findIndex((item) => item.id === assessmentId) + 1
  const safeIndex = index > 0 ? index : 1

  const suffix = safeIndex > 1 ? `-${safeIndex}` : ''
  return encodeURIComponent(`${titleSlug}${suffix}`)
}

export const findAssessmentByRouteSegment = (
  assessments: Assessment[],
  classId: string,
  subjectId: string,
  rawSegment: string
) => {
  const decoded = decodeURIComponent(rawSegment)
  const directMatches = assessments.filter(
    (item) =>
      item.classId === classId &&
      item.subjectId === subjectId &&
      normalizeAssessmentTitle(item.title) === decoded
  )
  if (directMatches.length > 0) {
    return directMatches[0]
  }
  const match = decoded.match(/^(.*?)(?:-(\d+))?$/)
  if (!match) {
    return undefined
  }
  const titleSlug = match[1]
  const index = match[2] ? Number(match[2]) : 1
  if (!Number.isFinite(index) || index < 1) {
    return undefined
  }
  const sameTitle = assessments.filter(
    (item) =>
      item.classId === classId &&
      item.subjectId === subjectId &&
      normalizeAssessmentTitle(item.title) === titleSlug
  )

  return sameTitle[index - 1]
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('assessmentRoute', () => {
    const timestamp = new Date('2025-01-01T00:00:00.000Z')
    const assessments: Assessment[] = [
      {
        id: 'a-1',
        classId: 'c-1',
        subjectId: 's-1',
        title: 'Klausur 1',
        type: 'written',
        date: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'a-2',
        classId: 'c-1',
        subjectId: 's-1',
        title: 'Klausur 1',
        type: 'written',
        date: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'a-3',
        classId: 'c-1',
        subjectId: 's-1',
        title: 'Mündliche Prüfung',
        type: 'oral',
        date: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'a-4',
        classId: 'c-2',
        subjectId: 's-2',
        title: 'Klausur 1',
        type: 'written',
        date: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]

    it('builds assessment route segments based on title within subject', () => {
      expect(
        buildAssessmentRouteSegment(assessments, 'c-1', 's-1', 'a-1')
      ).toBe('klausur-1')
      expect(
        buildAssessmentRouteSegment(assessments, 'c-1', 's-1', 'a-2')
      ).toBe('klausur-1-2')
      expect(
        buildAssessmentRouteSegment(assessments, 'c-1', 's-1', 'a-3')
      ).toBe('m%C3%BCndliche-pr%C3%BCfung')
      expect(
        buildAssessmentRouteSegment(assessments, 'c-2', 's-2', 'a-4')
      ).toBe('klausur-1')
    })

    it('finds assessments by route segment within the subject', () => {
      expect(
        findAssessmentByRouteSegment(assessments, 'c-1', 's-1', 'klausur-1')?.id
      ).toBe('a-1')
      expect(
        findAssessmentByRouteSegment(assessments, 'c-1', 's-1', 'klausur-1-2')
          ?.id
      ).toBe('a-2')
      expect(
        findAssessmentByRouteSegment(
          assessments,
          'c-1',
          's-1',
          'm%C3%BCndliche-pr%C3%BCfung'
        )?.id
      ).toBe('a-3')
      expect(
        findAssessmentByRouteSegment(assessments, 'c-2', 's-2', 'klausur-1')?.id
      ).toBe('a-4')
    })
  })
}

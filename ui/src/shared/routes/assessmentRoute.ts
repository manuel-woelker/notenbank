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

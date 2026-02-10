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

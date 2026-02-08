import type { Class } from '../../features/administration/classes/ClassTypes'

const normalizeClassName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '-')

export const buildClassRouteSegment = (classes: Class[], classId: string) => {
  const target = classes.find((item) => item.id === classId)
  if (!target) {
    return encodeURIComponent(normalizeClassName(classId))
  }
  const nameSlug = normalizeClassName(target.name)
  const sameName = classes.filter(
    (item) => normalizeClassName(item.name) === nameSlug
  )
  const index = sameName.findIndex((item) => item.id === classId) + 1
  const safeIndex = index > 0 ? index : 1

  const suffix = safeIndex > 1 ? `-${safeIndex}` : ''
  return encodeURIComponent(`${nameSlug}${suffix}`)
}

export const findClassByRouteSegment = (
  classes: Class[],
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
  const sameName = classes.filter(
    (item) => normalizeClassName(item.name) === nameSlug
  )

  return sameName[index - 1]
}

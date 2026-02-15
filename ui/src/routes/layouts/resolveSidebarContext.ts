import type { Class } from '../../features/administration/classes/ClassTypes'
import type { Subject } from '../../features/administration/subjects/SubjectTypes'
import type { Assessment } from '../../features/assessment/assessments/AssessmentTypes'
import { findClassByRouteSegment } from '../../shared/routes/classRoute'
import { findSubjectByRouteSegment } from '../../shared/routes/subjectRoute'
import { findAssessmentByRouteSegment } from '../../shared/routes/assessmentRoute'

export type SidebarContext = {
  showClassTree: boolean
  selectedKey: string
  openKeys: string[]
  currentClass?: Class
  currentSubject?: Subject
  currentAssessment?: Assessment
}

/* 📖 # Why resolve the sidebar context from the URL?
The navigation tree mirrors routes that are driven by class, subject, and
assessment identifiers. Deriving the active selection from the URL keeps the
sidebar aligned with deep links and refreshes without extra state.
*/
export const resolveSidebarContext = (
  pathname: string,
  classes: Class[],
  subjects: Subject[],
  assessments: Assessment[]
): SidebarContext => {
  const segments = pathname.split('/').filter(Boolean)
  const showClassTree = segments[0] === 'classes'
  let currentClass: Class | undefined
  let currentSubject: Subject | undefined
  let currentAssessment: Assessment | undefined

  if (showClassTree && segments[1]) {
    currentClass = findClassByRouteSegment(classes, segments[1])
    if (currentClass && segments[2] === 'subjects' && segments[3]) {
      currentSubject = findSubjectByRouteSegment(
        subjects,
        currentClass.id,
        segments[3]
      )
      if (currentSubject && segments[4] === 'assessments' && segments[5]) {
        currentAssessment = findAssessmentByRouteSegment(
          assessments,
          currentClass.id,
          currentSubject.id,
          segments[5]
        )
      }
    }
  }

  const selectedKey = currentAssessment
    ? `assessment:${currentAssessment.id}`
    : currentSubject
      ? `subject:${currentSubject.id}`
      : currentClass
        ? `class:${currentClass.id}`
        : showClassTree
          ? 'classes'
          : segments[0] === 'content'
            ? 'content'
            : segments[0] === 'upload'
              ? 'upload'
              : 'dashboard'

  const openKeys: string[] = []
  if (showClassTree) {
    openKeys.push('classes')
    if (currentClass) {
      openKeys.push(`class:${currentClass.id}`)
    }
    if (currentSubject) {
      openKeys.push(`subject:${currentSubject.id}`)
    }
  }

  return {
    showClassTree,
    selectedKey,
    openKeys,
    currentClass,
    currentSubject,
    currentAssessment,
  }
}

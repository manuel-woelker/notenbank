import { useMemo } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import type { BreadcrumbProps } from 'antd'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { useSubjectStore } from '../../features/administration/subjects/SubjectStore'
import { useStudentStore } from '../../features/administration/students/StudentStore'
import {
  buildClassRouteSegment,
  findClassByRouteSegment,
} from '../../shared/routes/classRoute'
import { findSubjectByRouteSegment } from '../../shared/routes/subjectRoute'
import { findStudentByRouteSegment } from '../../shared/routes/studentRoute'

export type BreadcrumbItem = NonNullable<BreadcrumbProps['items']>[number]

/* 📖 # Why map "Up" targets to known routes instead of trimming segments?
Some intermediate segments (like "subjects" or "assessments") are not
navigable pages. Mapping to known parent routes prevents the link from
landing on a non-existent view while still respecting deep links.
*/
export function useBreadcrumbItems(): BreadcrumbItem[] {
  const navigate = useNavigate()
  const location = useLocation()
  const { classes } = useClassStore()
  const { subjects } = useSubjectStore()
  const { students } = useStudentStore()

  return useMemo(() => {
    const clickableCrumb = (label: string, to: string): BreadcrumbItem => ({
      title: (
        <span
          className="nb-breadcrumb-link"
          onClick={() => navigate({ to, search: (prev) => prev })}
        >
          {label}
        </span>
      ),
    })

    const path = location.pathname
    if (path === '/') {
      return [clickableCrumb('Übersicht', '/')]
    }
    if (path.startsWith('/classes')) {
      const parts = path.split('/').filter(Boolean)
      const items: BreadcrumbItem[] = [clickableCrumb('Klassen', '/classes')]
      let classMatch: ReturnType<typeof findClassByRouteSegment>
      let classRouteSegment: string | undefined
      if (parts.length >= 2) {
        const classSegment = parts[1]
        classMatch = classSegment
          ? findClassByRouteSegment(classes, classSegment)
          : undefined
        const classLabel = classMatch?.name ?? decodeURIComponent(classSegment)
        classRouteSegment = classMatch
          ? buildClassRouteSegment(classes, classMatch.id)
          : classSegment
        if (classRouteSegment) {
          items.push(
            clickableCrumb(classLabel, `/classes/${classRouteSegment}`)
          )
        } else {
          items.push({ title: <span>{classLabel}</span> })
        }
      }
      if (parts[2] === 'students') {
        items.push({ title: <span>Schüler</span> })
        if (parts.length >= 4) {
          const studentKey = parts[3]
          const studentMatch = classMatch
            ? findStudentByRouteSegment(students, classMatch.id, studentKey)
            : undefined
          const studentLabel = studentMatch
            ? `${studentMatch.firstName} ${studentMatch.lastName}`
            : decodeURIComponent(studentKey)
          items.push({ title: <span>{studentLabel}</span> })
        }
      }
      if (parts[2] === 'subjects') {
        items.push({ title: <span>Fächer</span> })
        if (parts.length >= 4) {
          const subjectKey = parts[3]
          const subjectMatch = classMatch
            ? findSubjectByRouteSegment(subjects, classMatch.id, subjectKey)
            : undefined
          const subjectLabel =
            subjectMatch?.name ?? decodeURIComponent(subjectKey)
          items.push({ title: <span>{subjectLabel}</span> })
        }
      }
      return items
    }
    if (path.startsWith('/content')) {
      return [clickableCrumb('Inhalte', '/content')]
    }
    if (path.startsWith('/upload')) {
      return [clickableCrumb('Hochladen', '/upload')]
    }
    if (path.startsWith('/aenderungsverlauf')) {
      return [clickableCrumb('Änderungsverlauf', '/aenderungsverlauf')]
    }
    return [clickableCrumb('Übersicht', '/')]
  }, [location.pathname, navigate, classes, subjects, students])
}

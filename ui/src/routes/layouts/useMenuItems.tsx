import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { useSubjectStore } from '../../features/administration/subjects/SubjectStore'
import { useAssessmentStore } from '../../features/assessment/assessments/AssessmentStore'
import { buildClassRouteSegment } from '../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../shared/routes/subjectRoute'
import { buildAssessmentRouteSegment } from '../../shared/routes/assessmentRoute'
import type { SidebarContext } from './resolveSidebarContext'

/* 📖 # Why add an explicit active class for menu nodes?
Ant Design highlights selected leaf items via selectedKeys, but submenu titles
with children do not consistently get the same visual treatment. Adding a
dedicated class lets us style active non-leaf nodes so the most specific
sidebar target is always clearly visible.
*/
const getActiveClassName = (key: string, selectedKey: string): string =>
  key === selectedKey ? 'nb-sidebar-item-active' : ''

/* 📖 # Why derive selected menu from URL location instead of state?
TanStack Router manages navigation via URL changes. By using useLocation() to
determine which menu item should be highlighted, we ensure the menu state stays
in sync with the URL. This provides proper browser back/forward button support
and allows URLs to be bookmarked and shared.
*/
export function useMenuItems(
  sidebarContext: SidebarContext
): MenuProps['items'] {
  const navigate = useNavigate()
  const { classes } = useClassStore()
  const { subjects } = useSubjectStore()
  const { assessments } = useAssessmentStore()

  return useMemo<MenuProps['items']>(() => {
    const classChildren = sidebarContext.showClassTree
      ? classes.map((classItem) => {
          const classSegment = buildClassRouteSegment(classes, classItem.id)
          const isCurrentClass =
            sidebarContext.currentClass?.id === classItem.id
          const subjectChildren = isCurrentClass
            ? subjects
                .filter((subject) => subject.classId === classItem.id)
                .map((subject) => {
                  const subjectSegment = buildSubjectRouteSegment(
                    subjects,
                    classItem.id,
                    subject.id
                  )
                  const isCurrentSubject =
                    sidebarContext.currentSubject?.id === subject.id
                  const assessmentChildren = isCurrentSubject
                    ? assessments
                        .filter(
                          (assessment) =>
                            assessment.classId === classItem.id &&
                            assessment.subjectId === subject.id
                        )
                        .map((assessment) => {
                          const assessmentSegment = buildAssessmentRouteSegment(
                            assessments,
                            classItem.id,
                            subject.id,
                            assessment.id
                          )
                          return {
                            key: `assessment:${assessment.id}`,
                            icon: <FileTextOutlined />,
                            label: assessment.title,
                            onClick: () =>
                              navigate({
                                to: `/classes/${classSegment}/subjects/${subjectSegment}/assessments/${assessmentSegment}`,
                                search: (prev) => prev,
                              }),
                          }
                        })
                    : []
                  const hasAssessments =
                    isCurrentSubject && assessmentChildren.length > 0
                  return {
                    key: `subject:${subject.id}`,
                    className: getActiveClassName(
                      `subject:${subject.id}`,
                      sidebarContext.selectedKey
                    ),
                    icon: <BookOutlined />,
                    label: subject.name,
                    ...(hasAssessments
                      ? {
                          onTitleClick: () =>
                            navigate({
                              to: `/classes/${classSegment}/subjects/${subjectSegment}`,
                              search: (prev) => prev,
                            }),
                          children: assessmentChildren,
                        }
                      : {
                          onClick: () =>
                            navigate({
                              to: `/classes/${classSegment}/subjects/${subjectSegment}`,
                              search: (prev) => prev,
                            }),
                        }),
                  }
                })
            : []
          const hasSubjects = isCurrentClass && subjectChildren.length > 0
          return {
            key: `class:${classItem.id}`,
            className: getActiveClassName(
              `class:${classItem.id}`,
              sidebarContext.selectedKey
            ),
            icon: <TeamOutlined />,
            label: classItem.name,
            ...(hasSubjects
              ? {
                  onTitleClick: () =>
                    navigate({
                      to: `/classes/${classSegment}`,
                      search: (prev) => prev,
                    }),
                  children: subjectChildren,
                }
              : {
                  onClick: () =>
                    navigate({
                      to: `/classes/${classSegment}`,
                      search: (prev) => prev,
                    }),
                }),
          }
        })
      : undefined
    const hasClassChildren = (classChildren?.length ?? 0) > 0

    return [
      {
        key: 'dashboard',
        className: getActiveClassName('dashboard', sidebarContext.selectedKey),
        icon: <UserOutlined />,
        label: 'Übersicht',
        onClick: () => navigate({ to: '/', search: (prev) => prev }),
      },
      {
        key: 'classes',
        className: getActiveClassName('classes', sidebarContext.selectedKey),
        icon: <TeamOutlined />,
        label: <span data-tour="menu-classes">Klassen</span>,
        ...(hasClassChildren
          ? {
              onTitleClick: () =>
                navigate({ to: '/classes', search: (prev) => prev }),
              children: classChildren,
            }
          : {
              onClick: () =>
                navigate({ to: '/classes', search: (prev) => prev }),
            }),
      },
      {
        key: 'changelog',
        className: getActiveClassName('changelog', sidebarContext.selectedKey),
        icon: <HistoryOutlined />,
        label: 'Änderungsverlauf',
        onClick: () =>
          navigate({ to: '/aenderungsverlauf', search: (prev) => prev }),
      },
    ]
  }, [sidebarContext, classes, subjects, assessments, navigate])
}

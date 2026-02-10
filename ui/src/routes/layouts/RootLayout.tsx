import { useEffect, useMemo, useState } from 'react'
import {
  Breadcrumb,
  Button,
  Layout,
  Menu,
  Switch,
  Tag,
  theme,
  type MenuProps,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  Outlet,
  useNavigate,
  useLocation,
  useSearch,
} from '@tanstack/react-router'
import {
  loadClasses,
  useClassStore,
} from '../../features/administration/classes/ClassStore'
import {
  loadSubjects,
  useSubjectStore,
} from '../../features/administration/subjects/SubjectStore'
import {
  loadStudents,
  useStudentStore,
} from '../../features/administration/students/StudentStore'
import { loadAssessmentGrades } from '../../features/assessment/assessments/AssessmentGradeStore'
import {
  loadAssessments,
  useAssessmentStore,
} from '../../features/assessment/assessments/AssessmentStore'
import {
  buildClassRouteSegment,
  findClassByRouteSegment,
} from '../../shared/routes/classRoute'
import {
  buildSubjectRouteSegment,
  findSubjectByRouteSegment,
} from '../../shared/routes/subjectRoute'
import { buildAssessmentRouteSegment } from '../../shared/routes/assessmentRoute'
import { findStudentByRouteSegment } from '../../shared/routes/studentRoute'
import {
  DatabaseMode,
  useDatabaseStore,
} from '../../shared/store/databaseStore'
import {
  ensureExampleDatabaseSeeded,
  resetExampleDatabase,
} from '../../shared/repositories/exampleDatabaseSeed'
import { resolveSidebarContext } from './resolveSidebarContext'

const { Header, Sider, Content, Footer } = Layout

type GitInfo = {
  commitHash: string
  commitDate: string
  commitMessage: string
}

const fallbackGitInfo: GitInfo = {
  commitHash: 'dev',
  commitDate: 'Development',
  commitMessage: 'Development build',
}

/* 📖 # Why derive selected menu from URL location instead of state?
TanStack Router manages navigation via URL changes. By using useLocation() to
determine which menu item should be highlighted, we ensure the menu state stays
in sync with the URL. This provides proper browser back/forward button support
and allows URLs to be bookmarked and shared.
*/

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [dbSwitching, setDbSwitching] = useState(false)
  const [gitInfo, setGitInfo] = useState<GitInfo>(fallbackGitInfo)
  const navigate = useNavigate()
  const location = useLocation()
  const search = useSearch({ from: '__root__' }) as { db?: string }
  const { classes } = useClassStore()
  const { students } = useStudentStore()
  const { subjects } = useSubjectStore()
  const { assessments } = useAssessmentStore()
  const {
    isExample,
    isTemporary,
    dbName,
    setDatabaseMode,
    setTemporaryDatabase,
  } = useDatabaseStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  /* 📖 # Why map "Up" targets to known routes instead of trimming segments?
  Some intermediate segments (like "subjects" or "assessments") are not
  navigable pages. Mapping to known parent routes prevents the link from
  landing on a non-existent view while still respecting deep links.
  */
  const parentPath = useMemo(() => {
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return null

    if (segments[0] === 'classes') {
      if (segments.length === 1) return '/'
      if (segments.length === 2) return '/classes'
      if (segments[2] === 'students') {
        return `/classes/${segments[1]}`
      }
      if (segments[2] === 'subjects') {
        if (segments.length === 4) {
          return `/classes/${segments[1]}`
        }
        if (segments.length >= 6 && segments[4] === 'assessments') {
          return `/classes/${segments[1]}/subjects/${segments[3]}`
        }
      }
      return `/${segments.slice(0, -1).join('/')}`
    }

    if (segments[0] === 'content' || segments[0] === 'upload') {
      return '/'
    }

    return segments.length === 1 ? '/' : `/${segments.slice(0, -1).join('/')}`
  }, [location.pathname])

  /* 📖 # Why load git metadata with a dynamic import?
  The git-info file is generated at build and may be missing in some CI flows.
  A dynamic import lets the UI render with safe defaults when that file is not
  available, while still showing real commit data when it exists.
  */
  useEffect(() => {
    let isMounted = true
    import('../../git-info')
      .then((module) => {
        if (!isMounted) return
        if (module?.GIT_INFO) {
          setGitInfo(module.GIT_INFO as GitInfo)
        }
      })
      .catch(() => {
        if (isMounted) {
          setGitInfo(fallbackGitInfo)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const dbParam = search?.db
    if (dbParam === 'example') {
      if (!isExample) {
        setDatabaseMode('example')
      }
      void ensureExampleDatabaseSeeded()
      return
    }
    if (dbParam) {
      setTemporaryDatabase(dbParam)
      return
    }
    if (isExample || isTemporary) {
      setDatabaseMode('primary')
    }
  }, [isExample, isTemporary, search, setDatabaseMode, setTemporaryDatabase])

  const sidebarContext = useMemo(
    () =>
      resolveSidebarContext(location.pathname, classes, subjects, assessments),
    [location.pathname, classes, subjects, assessments]
  )

  const menuItems = useMemo<MenuProps['items']>(() => {
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
        icon: <UserOutlined />,
        label: 'Übersicht',
        onClick: () => navigate({ to: '/', search: (prev) => prev }),
      },
      {
        key: 'classes',
        icon: <TeamOutlined />,
        label: 'Klassen',
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
        key: 'content',
        icon: <VideoCameraOutlined />,
        label: 'Inhalte',
        onClick: () => navigate({ to: '/content', search: (prev) => prev }),
      },
      {
        key: 'upload',
        icon: <UploadOutlined />,
        label: 'Hochladen',
        onClick: () => navigate({ to: '/upload', search: (prev) => prev }),
      },
    ]
  }, [sidebarContext, classes, subjects, assessments, navigate])

  const breadcrumbItems = useMemo(() => {
    const clickableCrumb = (label: string, to: string) => ({
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
      const items = [clickableCrumb('Klassen', '/classes')]
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
    return [clickableCrumb('Übersicht', '/')]
  }, [location.pathname, navigate, classes, subjects, students])

  const handleDatabaseToggle = async (checked: boolean) => {
    const nextMode: DatabaseMode = checked ? 'example' : 'primary'
    setDbSwitching(true)
    setDatabaseMode(nextMode)
    navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        db: nextMode === 'example' ? 'example' : undefined,
      }),
    })
    try {
      if (nextMode === 'example') {
        await ensureExampleDatabaseSeeded()
      }
      await Promise.all([
        loadClasses(),
        loadStudents(),
        loadSubjects(),
        loadAssessments(),
        loadAssessmentGrades(),
      ])
    } finally {
      setDbSwitching(false)
    }
  }

  const handleExampleReset = async () => {
    if (!isExample) {
      return
    }
    setDbSwitching(true)
    try {
      await resetExampleDatabase()
      await Promise.all([
        loadClasses(),
        loadStudents(),
        loadSubjects(),
        loadAssessments(),
        loadAssessmentGrades(),
      ])
    } finally {
      setDbSwitching(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {collapsed ? 'NB' : 'Notenbank'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          inlineIndent={12}
          selectedKeys={[sidebarContext.selectedKey]}
          openKeys={sidebarContext.openKeys}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'space-between',
              paddingRight: 24,
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined
                  style={{
                    fontSize: '18px',
                    padding: '0 24px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCollapsed(!collapsed)}
                />
              ) : (
                <MenuFoldOutlined
                  style={{
                    fontSize: '18px',
                    padding: '0 24px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCollapsed(!collapsed)}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Button
                  type="link"
                  disabled={!parentPath}
                  onClick={() => {
                    if (!parentPath) return
                    navigate({ to: parentPath, search: (prev) => prev })
                  }}
                >
                  Nach oben
                </Button>
                <Breadcrumb items={breadcrumbItems} style={{ marginTop: 2 }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag color={isExample ? 'gold' : 'blue'}>DB: {dbName}</Tag>
              {isExample ? (
                <Button
                  size="small"
                  disabled={dbSwitching}
                  onClick={() => void handleExampleReset()}
                >
                  Tabula Rasa
                </Button>
              ) : null}
              <span style={{ fontSize: 14 }}>Beispiel-Datenbank</span>
              <Switch
                checked={isExample}
                checkedChildren="An"
                unCheckedChildren="Aus"
                disabled={dbSwitching}
                onChange={(checked) => {
                  void handleDatabaseToggle(checked)
                }}
              />
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Notenbank | Commit:{' '}
          <span title={gitInfo.commitMessage}>{gitInfo.commitHash}</span> |
          Datum: {gitInfo.commitDate}
        </Footer>
      </Layout>
    </Layout>
  )
}

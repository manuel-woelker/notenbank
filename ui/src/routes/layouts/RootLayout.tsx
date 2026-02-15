import { useEffect, useMemo, useState } from 'react'
import { Layout, Spin, Tour, theme } from 'antd'
import {
  Outlet,
  useNavigate,
  useLocation,
  useSearch,
} from '@tanstack/react-router'
import { loadClasses } from '../../features/administration/classes/ClassStore'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { loadSubjects } from '../../features/administration/subjects/SubjectStore'
import { useSubjectStore } from '../../features/administration/subjects/SubjectStore'
import { loadStudents } from '../../features/administration/students/StudentStore'
import { loadAssessmentGrades } from '../../features/assessment/assessments/AssessmentGradeStore'
import { loadAssessments } from '../../features/assessment/assessments/AssessmentStore'
import { useAssessmentStore } from '../../features/assessment/assessments/AssessmentStore'
import { loadChangeLogs } from '../../features/changeTracking/ChangeLogStore'
import { ErrorBoundary } from '../../shared/ErrorBoundary'
import {
  DatabaseMode,
  useDatabaseStore,
} from '../../shared/store/databaseStore'
import {
  ensureExampleDatabaseSeeded,
  resetExampleDatabase,
} from '../../shared/repositories/exampleDatabaseSeed'
import { resolveSidebarContext } from './resolveSidebarContext'
import { buildProductTourSteps } from '../../shared/onboarding/productTour'
import { useTourRoutes } from './useTourRoutes'
import { useBreadcrumbItems } from './useBreadcrumbItems'
import { useMenuItems } from './useMenuItems'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

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

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [dbSwitching, setDbSwitching] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [gitInfo, setGitInfo] = useState<GitInfo>(fallbackGitInfo)
  const [tourOpen, setTourOpen] = useState(false)
  const [tourCurrent, setTourCurrent] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const search = useSearch({ from: '__root__' }) as { db?: string }
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
  const { classes } = useClassStore()
  const { subjects } = useSubjectStore()
  const { assessments } = useAssessmentStore()

  const sidebarContext = useMemo(
    () =>
      resolveSidebarContext(location.pathname, classes, subjects, assessments),
    [location.pathname, classes, subjects, assessments]
  )

  const tourRoutes = useTourRoutes()
  const breadcrumbItems = useBreadcrumbItems()
  const menuItems = useMenuItems(sidebarContext)

  const tourSteps = useMemo(
    () => buildProductTourSteps(tourRoutes),
    [tourRoutes]
  )

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

    if (
      segments[0] === 'content' ||
      segments[0] === 'upload' ||
      segments[0] === 'aenderungsverlauf'
    ) {
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

  useEffect(() => {
    if (!tourOpen) {
      return
    }
    const stepRoute = tourSteps[tourCurrent]?.route
    if (!stepRoute || location.pathname === stepRoute) {
      return
    }
    navigate({ to: stepRoute, search: (prev) => prev })
  }, [location.pathname, navigate, tourCurrent, tourOpen, tourSteps])

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
        loadChangeLogs(),
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
    setResetting(true)
    try {
      await resetExampleDatabase()
      await Promise.all([
        loadClasses(),
        loadStudents(),
        loadSubjects(),
        loadAssessments(),
        loadAssessmentGrades(),
        loadChangeLogs(),
      ])
    } finally {
      setDbSwitching(false)
      setResetting(false)
    }
  }

  /* 📖 # Why force the example database when starting the tour?
  The onboarding walkthrough assumes stable demo data so each step has
  predictable content to point at. Switching to the example database keeps the
  tour consistent without touching the user's primary data.
  */
  const handleStartTour = async () => {
    if (!isExample) {
      await handleDatabaseToggle(true)
    } else {
      await ensureExampleDatabaseSeeded()
      await Promise.all([
        loadClasses(),
        loadStudents(),
        loadSubjects(),
        loadAssessments(),
        loadAssessmentGrades(),
      ])
    }
    setTourCurrent(0)
    setTourOpen(true)
  }

  const handleNavigateUp = () => {
    if (!parentPath) return
    navigate({ to: parentPath, search: (prev) => prev })
  }

  /* 📖 # Why use fixed positioning for header and independent scrolling?
  The fixed header remains visible when scrolling content, improving navigation.
  Independent scroll areas for sidebar and content prevent the whole page from
  scrolling as a single unit, allowing users to reference the menu while
  browsing long content pages.
  */
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {resetting && <Spin fullscreen tip="Datenbank wird zurückgesetzt…" />}
      <Tour
        open={tourOpen}
        current={tourCurrent}
        onChange={(current) => setTourCurrent(current)}
        onClose={() => {
          setTourOpen(false)
          setTourCurrent(0)
        }}
        onFinish={() => {
          setTourOpen(false)
          setTourCurrent(0)
        }}
        steps={tourSteps}
      />
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <AppSidebar
          collapsed={collapsed}
          sidebarContext={sidebarContext}
          menuItems={menuItems}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
          }}
        >
          <AppHeader
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            parentPath={parentPath}
            onNavigateUp={handleNavigateUp}
            breadcrumbItems={breadcrumbItems}
            dbName={dbName}
            isExample={isExample}
            dbSwitching={dbSwitching}
            onDatabaseToggle={handleDatabaseToggle}
            onExampleReset={handleExampleReset}
            onStartTour={handleStartTour}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
            flex: 1,
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
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

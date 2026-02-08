import { useMemo, useState } from 'react'
import { Breadcrumb, Layout, Menu, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { GIT_INFO } from '../../git-info'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import {
  buildClassRouteSegment,
  findClassByRouteSegment,
} from '../../shared/routes/classRoute'

const { Header, Sider, Content, Footer } = Layout

/* 📖 # Why derive selected menu from URL location instead of state?
TanStack Router manages navigation via URL changes. By using useLocation() to
determine which menu item should be highlighted, we ensure the menu state stays
in sync with the URL. This provides proper browser back/forward button support
and allows URLs to be bookmarked and shared.
*/

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { classes } = useClassStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return 'dashboard'
    if (path.startsWith('/classes')) return 'classes'
    if (path.startsWith('/content')) return 'content'
    if (path.startsWith('/upload')) return 'upload'
    return 'dashboard'
  }

  const breadcrumbItems = useMemo(() => {
    const clickableCrumb = (label: string, to: string) => ({
      title: (
        <span className="nb-breadcrumb-link" onClick={() => navigate({ to })}>
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
      if (parts.length >= 2) {
        const classSegment = parts[1]
        const classMatch = classSegment
          ? findClassByRouteSegment(classes, classSegment)
          : undefined
        const classLabel = classMatch?.name ?? decodeURIComponent(classSegment)
        const classRouteSegment = classMatch
          ? buildClassRouteSegment(classes, classMatch.id)
          : classSegment
        if (classRouteSegment) {
          items.push(
            clickableCrumb(classLabel, `/classes/${classRouteSegment}/students`)
          )
        } else {
          items.push({ title: <span>{classLabel}</span> })
        }
      }
      if (parts[2] === 'students') {
        items.push({ title: <span>Schüler</span> })
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
  }, [location.pathname, navigate, classes])

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
          selectedKeys={[getSelectedKey()]}
          items={[
            {
              key: 'dashboard',
              icon: <UserOutlined />,
              label: 'Übersicht',
              onClick: () => navigate({ to: '/' }),
            },
            {
              key: 'classes',
              icon: <TeamOutlined />,
              label: 'Klassen',
              onClick: () => navigate({ to: '/classes' }),
            },
            {
              key: 'content',
              icon: <VideoCameraOutlined />,
              label: 'Inhalte',
              onClick: () => navigate({ to: '/content' }),
            },
            {
              key: 'upload',
              icon: <UploadOutlined />,
              label: 'Hochladen',
              onClick: () => navigate({ to: '/upload' }),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
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
              <h2 style={{ margin: 0 }}>Notenbank</h2>
              <Breadcrumb items={breadcrumbItems} style={{ marginTop: 2 }} />
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
          <span title={GIT_INFO.commitMessage}>{GIT_INFO.commitHash}</span> |
          Datum: {GIT_INFO.commitDate}
        </Footer>
      </Layout>
    </Layout>
  )
}

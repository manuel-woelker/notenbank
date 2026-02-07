import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import './App.css'
import { GIT_INFO } from './git-info'
import { ClassList } from './features/administration/classes/ClassList'

const { Header, Sider, Content, Footer } = Layout

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState('1')
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

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
          selectedKeys={[selectedMenu]}
          onClick={(e) => setSelectedMenu(e.key)}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'classes',
              icon: <TeamOutlined />,
              label: 'Classes',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'Content',
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'Upload',
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
            <h2 style={{ margin: 0 }}>Notenbank</h2>
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
          {selectedMenu === 'classes' ? (
            <ClassList />
          ) : (
            <>
              <h1>Welcome to Notenbank</h1>
              <p>
                This is the main content area. Your application content will go
                here.
              </p>
            </>
          )}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Notenbank | Commit:{' '}
          <span title={GIT_INFO.commitMessage}>{GIT_INFO.commitHash}</span> |
          Date: {GIT_INFO.commitDate}
        </Footer>
      </Layout>
    </Layout>
  )
}

export default App

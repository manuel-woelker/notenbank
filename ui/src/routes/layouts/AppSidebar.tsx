import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import type { SidebarContext } from './resolveSidebarContext'

export interface AppSidebarProps {
  collapsed: boolean
  sidebarContext: SidebarContext
  menuItems: MenuProps['items']
}

export function AppSidebar({
  collapsed,
  sidebarContext,
  menuItems,
}: AppSidebarProps) {
  return (
    <>
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
    </>
  )
}

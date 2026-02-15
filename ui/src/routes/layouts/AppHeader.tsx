import { Button, Breadcrumb, Tag, Switch } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { BreadcrumbItem } from './useBreadcrumbItems'

export interface AppHeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
  parentPath: string | null
  onNavigateUp: () => void
  breadcrumbItems: BreadcrumbItem[]
  dbName: string
  isExample: boolean
  dbSwitching: boolean
  onDatabaseToggle: (checked: boolean) => void
  onExampleReset: () => void
  onStartTour: () => void
}

/* 📖 # Why use fixed positioning for header?
The fixed header remains visible when scrolling content, improving navigation.
Independent scroll areas for sidebar and content prevent the whole page from
scrolling as a single unit.
*/
export function AppHeader({
  collapsed,
  onToggleCollapse,
  parentPath,
  onNavigateUp,
  breadcrumbItems,
  dbName,
  isExample,
  dbSwitching,
  onDatabaseToggle,
  onExampleReset,
  onStartTour,
}: AppHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'space-between',
        paddingRight: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {collapsed ? (
          <MenuUnfoldOutlined
            style={{
              fontSize: '18px',
              padding: '0 24px',
              cursor: 'pointer',
            }}
            onClick={onToggleCollapse}
          />
        ) : (
          <MenuFoldOutlined
            style={{
              fontSize: '18px',
              padding: '0 24px',
              cursor: 'pointer',
            }}
            onClick={onToggleCollapse}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button type="link" disabled={!parentPath} onClick={onNavigateUp}>
            Nach oben
          </Button>
          <Breadcrumb items={breadcrumbItems} style={{ marginTop: 2 }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          data-tour="db-switch"
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Tag color={isExample ? 'gold' : 'blue'}>DB: {dbName}</Tag>
          {isExample ? (
            <Button
              size="small"
              disabled={dbSwitching}
              data-tour="example-reset"
              onClick={onExampleReset}
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
            onChange={onDatabaseToggle}
          />
        </div>
        <Button size="small" type="default" onClick={onStartTour}>
          Tour starten
        </Button>
      </div>
    </div>
  )
}

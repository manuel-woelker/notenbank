import React from 'react'
import { Space, Typography } from 'antd'
import { useClassStore } from './ClassStore'
import { useDatabaseStore } from '../../../shared/store/databaseStore'
import { ClassTable } from './ClassTable'
import { useNavigate } from '@tanstack/react-router'
import { buildClassRouteSegment } from '../../../shared/routes/classRoute'

const { Title } = Typography

/**
 * Main page component for class listing and management
 */
export const ClassList: React.FC = () => {
  const { classes, loading, createClass, updateClass } = useClassStore()
  const { isExample } = useDatabaseStore()
  const navigate = useNavigate()

  const getClassHref = (classId: string) => {
    const classSegment = buildClassRouteSegment(classes, classId)
    if (!classSegment) {
      return isExample ? '#/classes?db=example' : '#/classes'
    }
    return isExample
      ? `#/classes/${classSegment}?db=example`
      : `#/classes/${classSegment}`
  }

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            Klassen
          </Title>
        </div>

        <div data-tour="class-table">
          <ClassTable
            classes={classes}
            loading={loading}
            onSelectClass={(classId) => {
              const classSegment = buildClassRouteSegment(classes, classId)
              navigate({
                to: `/classes/${classSegment}`,
                search: (prev) => prev,
              })
            }}
            onCreateClass={async (name) => {
              await createClass({ name })
            }}
            onUpdateClass={async (id, name) => {
              await updateClass(id, { name })
            }}
            getClassHref={getClassHref}
          />
        </div>
      </Space>
    </div>
  )
}

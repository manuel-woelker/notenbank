import React from 'react'
import { Space, Typography } from 'antd'
import { useClassStore } from './ClassStore'
import { ClassTable } from './ClassTable'
import { useNavigate } from '@tanstack/react-router'

const { Title } = Typography

/**
 * Main page component for class listing and management
 */
export const ClassList: React.FC = () => {
  const { classes, loading, createClass } = useClassStore()
  const navigate = useNavigate()

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            Classes
          </Title>
        </div>

        <ClassTable
          classes={classes}
          loading={loading}
          onSelectClass={(classId) =>
            navigate({ to: `/classes/${classId}/students` })
          }
          onCreateClass={async (name) => {
            await createClass({ name })
          }}
        />
      </Space>
    </div>
  )
}

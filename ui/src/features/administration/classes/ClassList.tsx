import React, { useState } from 'react'
import { Button, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useClassStore } from './ClassStore'
import { ClassTable } from './ClassTable'
import { CreateClassModal } from './CreateClassModal'
import { useNavigate } from '@tanstack/react-router'

const { Title } = Typography

/**
 * Main page component for class listing and management
 */
export const ClassList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { classes, loading } = useClassStore()
  const navigate = useNavigate()

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Classes
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Class
          </Button>
        </div>

        <ClassTable
          classes={classes}
          loading={loading}
          onSelectClass={(classId) =>
            navigate({ to: `/classes/${classId}/students` })
          }
        />
      </Space>

      <CreateClassModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

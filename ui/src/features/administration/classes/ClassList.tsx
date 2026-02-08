import React, { useMemo, useState } from 'react'
import { Button, Drawer, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useClassStore } from './ClassStore'
import { ClassTable } from './ClassTable'
import { CreateClassModal } from './CreateClassModal'
import { CreateStudentModal } from '../students/CreateStudentModal'
import { StudentTable } from '../students/StudentTable'
import { useStudentStore } from '../students/StudentStore'

const { Title } = Typography

/**
 * Main page component for class listing and management
 */
export const ClassList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const { classes, loading } = useClassStore()
  const { students, loading: studentsLoading } = useStudentStore()

  const selectedClass = classes.find((item) => item.id === selectedClassId)
  const classStudents = useMemo(
    () =>
      selectedClassId
        ? students.filter((student) => student.classId === selectedClassId)
        : [],
    [students, selectedClassId]
  )

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
          onSelectClass={(classId) => setSelectedClassId(classId)}
        />
      </Space>

      <CreateClassModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CreateStudentModal
        open={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false)
        }}
        classId={selectedClassId ?? undefined}
      />
      <Drawer
        open={Boolean(selectedClassId)}
        onClose={() => setSelectedClassId(null)}
        title={selectedClass ? `${selectedClass.name} Students` : 'Students'}
        size="large"
      >
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Students
            </Title>
            <Button type="primary" onClick={() => setIsStudentModalOpen(true)}>
              Add Student
            </Button>
          </div>
          <StudentTable students={classStudents} loading={studentsLoading} />
        </Space>
      </Drawer>
    </div>
  )
}

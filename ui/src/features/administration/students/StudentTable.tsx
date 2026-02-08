import React from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Student } from './types'

interface StudentTableProps {
  students: Student[]
  loading: boolean
}

/**
 * Table component for displaying students
 */
export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
}) => {
  const columns: ColumnsType<Student> = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => date.toLocaleString(),
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      width: 200,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={students}
      rowKey="id"
      loading={loading}
      locale={{
        emptyText: 'No students found. Click "Add Student" to create one.',
      }}
      pagination={false}
    />
  )
}

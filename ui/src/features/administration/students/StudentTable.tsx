import React, { useState } from 'react'
import { Button, Input, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Student } from './StudentTypes'

type StudentRow =
  | Student
  | {
      id: 'new'
      isNew: true
      firstName: string
      lastName: string
      classId: string
      createdAt?: Date
      updatedAt?: Date
    }

interface StudentTableProps {
  students: Student[]
  loading: boolean
  onCreateStudent: (input: {
    firstName: string
    lastName: string
  }) => Promise<void>
  onSelectStudent?: (studentId: string) => void
  getStudentHref?: (studentId: string) => string
}

/**
 * Table component for displaying students
 */
export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  onCreateStudent,
  onSelectStudent,
  getStudentHref,
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    if (!trimmedFirst || !trimmedLast) {
      message.error('Bitte Vor- und Nachnamen eingeben.')
      return
    }
    try {
      setSaving(true)
      await onCreateStudent({ firstName: trimmedFirst, lastName: trimmedLast })
      setFirstName('')
      setLastName('')
      message.success('Schüler hinzugefügt.')
    } catch (error) {
      console.error('Failed to add student:', error)
      message.error(
        'Schüler konnte nicht hinzugefügt werden. Bitte erneut versuchen.'
      )
    } finally {
      setSaving(false)
    }
  }

  const shouldHandleNavigation = (event: React.MouseEvent) =>
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.button !== 1 &&
    !event.defaultPrevented

  const columns: ColumnsType<StudentRow> = [
    {
      title: 'Vorname',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      render: (value: string, record) => {
        if ('isNew' in record) {
          return (
            <Input
              placeholder="Vorname"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              onPressEnter={() => void handleCreate()}
            />
          )
        }
        if (!getStudentHref) {
          return value
        }
        const href = getStudentHref(record.id)
        return (
          <a
            href={href}
            onClick={(event) => {
              if (!shouldHandleNavigation(event)) {
                return
              }
              event.preventDefault()
              onSelectStudent?.(record.id)
            }}
          >
            {value}
          </a>
        )
      },
    },
    {
      title: 'Nachname',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      render: (value: string, record) => {
        if ('isNew' in record) {
          return (
            <Input
              placeholder="Nachname"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              onPressEnter={() => void handleCreate()}
            />
          )
        }
        if (!getStudentHref) {
          return value
        }
        const href = getStudentHref(record.id)
        return (
          <a
            href={href}
            onClick={(event) => {
              if (!shouldHandleNavigation(event)) {
                return
              }
              event.preventDefault()
              onSelectStudent?.(record.id)
            }}
          >
            {value}
          </a>
        )
      },
    },
    {
      title: 'Aktionen',
      key: 'actions',
      render: (_, record) => {
        if (!('isNew' in record)) {
          return <span style={{ color: '#999' }}>-</span>
        }
        return (
          <Button
            type="primary"
            onClick={() => void handleCreate()}
            loading={saving}
            disabled={!firstName.trim() || !lastName.trim()}
          >
            Hinzufügen
          </Button>
        )
      },
      width: 120,
    },
  ]

  const dataSource: StudentRow[] = [
    { id: 'new', isNew: true, firstName, lastName, classId: '' },
    ...students,
  ]

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      loading={loading}
      onRow={(record) => {
        if ('isNew' in record) {
          return {}
        }
        return {
          onClick: (event) => {
            if (!shouldHandleNavigation(event)) {
              return
            }
            onSelectStudent?.(record.id)
          },
          style: { cursor: 'pointer' },
        }
      }}
      locale={{
        emptyText:
          'Keine Schüler gefunden. Oben einen neuen Schüler hinzufügen.',
      }}
      pagination={false}
    />
  )
}

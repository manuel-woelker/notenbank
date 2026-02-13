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
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>
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
  onUpdateStudent,
  onSelectStudent,
  getStudentHref,
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingFirstName, setEditingFirstName] = useState('')
  const [editingLastName, setEditingLastName] = useState('')

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

  const startEditing = (record: Student) => {
    setEditingKey(record.id)
    setEditingFirstName(record.firstName)
    setEditingLastName(record.lastName)
  }

  const cancelEditing = () => {
    setEditingKey(null)
    setEditingFirstName('')
    setEditingLastName('')
  }

  const saveEditing = async (record: Student) => {
    const trimmedFirst = editingFirstName.trim()
    const trimmedLast = editingLastName.trim()
    if (!trimmedFirst || !trimmedLast) {
      message.error('Bitte Vor- und Nachnamen eingeben.')
      return
    }
    if (trimmedFirst === record.firstName && trimmedLast === record.lastName) {
      setEditingKey(null)
      setEditingFirstName('')
      setEditingLastName('')
      return
    }
    try {
      await onUpdateStudent(record.id, {
        firstName: trimmedFirst,
        lastName: trimmedLast,
      })
      setEditingKey(null)
      setEditingFirstName('')
      setEditingLastName('')
      message.success('Schüler aktualisiert.')
    } catch (error) {
      console.error('Failed to update student:', error)
      message.error(
        'Schüler konnte nicht aktualisiert werden. Bitte erneut versuchen.'
      )
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
      render: (value: string, record: StudentRow) => {
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
        if (editingKey === record.id) {
          return (
            <Input
              value={editingFirstName}
              onChange={(event) => setEditingFirstName(event.target.value)}
              onPressEnter={() => void saveEditing(record)}
              autoFocus
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
      render: (value: string, record: StudentRow) => {
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
        if (editingKey === record.id) {
          return (
            <Input
              value={editingLastName}
              onChange={(event) => setEditingLastName(event.target.value)}
              onPressEnter={() => void saveEditing(record)}
              onBlur={() => void saveEditing(record)}
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
        if ('isNew' in record) {
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
        }
        if (editingKey === record.id) {
          return (
            <>
              <Button
                type="link"
                onClick={(e) => {
                  e.stopPropagation()
                  void saveEditing(record)
                }}
                style={{ padding: '4px 8px' }}
              >
                Speichern
              </Button>
              <Button
                type="link"
                onClick={(e) => {
                  e.stopPropagation()
                  cancelEditing()
                }}
                style={{ padding: '4px 8px' }}
              >
                Abbrechen
              </Button>
            </>
          )
        }
        return (
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation()
              startEditing(record)
            }}
          >
            Bearbeiten
          </Button>
        )
      },
      width: 160,
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
            if (editingKey !== null || !shouldHandleNavigation(event)) {
              return
            }
            onSelectStudent?.(record.id)
          },
          style: { cursor: editingKey !== null ? 'default' : 'pointer' },
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

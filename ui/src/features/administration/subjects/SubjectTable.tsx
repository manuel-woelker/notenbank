import React, { useState } from 'react'
import { Button, Input, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Subject } from './SubjectTypes'

type SubjectRow =
  | Subject
  | {
      id: 'new'
      isNew: true
      name: string
      classId: string
      createdAt?: Date
      updatedAt?: Date
    }

interface SubjectTableProps {
  subjects: Subject[]
  loading: boolean
  onCreateSubject: (input: { name: string }) => Promise<void>
  onUpdateSubject: (id: string, updates: Partial<Subject>) => Promise<void>
  onSelectSubject?: (subjectId: string) => void
  getSubjectHref?: (subjectId: string) => string
}

/**
 * Table component for displaying subjects
 */
export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  loading,
  onCreateSubject,
  onUpdateSubject,
  onSelectSubject,
  getSubjectHref,
}) => {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      message.error('Bitte einen Fachnamen eingeben.')
      return
    }
    try {
      setSaving(true)
      await onCreateSubject({ name: trimmedName })
      setName('')
      message.success('Fach hinzugefügt.')
    } catch (error) {
      console.error('Failed to add subject:', error)
      message.error(
        'Fach konnte nicht hinzugefügt werden. Bitte erneut versuchen.'
      )
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (record: Subject) => {
    setEditingKey(record.id)
    setEditingName(record.name)
  }

  const cancelEditing = () => {
    setEditingKey(null)
    setEditingName('')
  }

  const saveEditing = async (record: Subject) => {
    const trimmedName = editingName.trim()
    if (!trimmedName) {
      message.error('Bitte einen Fachnamen eingeben.')
      return
    }
    if (trimmedName === record.name) {
      setEditingKey(null)
      setEditingName('')
      return
    }
    try {
      await onUpdateSubject(record.id, { name: trimmedName })
      setEditingKey(null)
      setEditingName('')
      message.success('Fach aktualisiert.')
    } catch (error) {
      console.error('Failed to update subject:', error)
      message.error(
        'Fach konnte nicht aktualisiert werden. Bitte erneut versuchen.'
      )
    }
  }

  const shouldHandleNavigation = (event: React.MouseEvent) =>
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.button !== 1 &&
    !event.defaultPrevented

  const columns: ColumnsType<SubjectRow> = [
    {
      title: 'Fach',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value: string, record: SubjectRow) => {
        if ('isNew' in record) {
          return (
            <Input
              placeholder="Fachname"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onPressEnter={() => void handleCreate()}
            />
          )
        }
        if (editingKey === record.id) {
          return (
            <Input
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              onPressEnter={() => void saveEditing(record)}
              onBlur={() => void saveEditing(record)}
              autoFocus
            />
          )
        }
        if (!getSubjectHref) {
          return value
        }
        const href = getSubjectHref(record.id)
        return (
          <a
            href={href}
            onClick={(event) => {
              if (!shouldHandleNavigation(event)) {
                return
              }
              event.preventDefault()
              onSelectSubject?.(record.id)
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
              onClick={(e) => {
                e.stopPropagation()
                void handleCreate()
              }}
              loading={saving}
              disabled={!name.trim()}
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

  const dataSource: SubjectRow[] = [
    { id: 'new', isNew: true, name, classId: '' },
    ...subjects,
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
            onSelectSubject?.(record.id)
          },
          style: { cursor: editingKey !== null ? 'default' : 'pointer' },
        }
      }}
      locale={{
        emptyText: 'Keine Fächer gefunden. Oben ein neues Fach hinzufügen.',
      }}
      pagination={false}
      size="small"
    />
  )
}

import React, { useState } from 'react'
import { Button, Input, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Class } from './ClassTypes'

type ClassRow =
  | Class
  | {
      id: 'new'
      isNew: true
      name: string
      createdAt?: Date
      updatedAt?: Date
    }

interface ClassTableProps {
  classes: Class[]
  loading: boolean
  onSelectClass: (classId: string) => void
  onCreateClass: (name: string) => Promise<void>
  onUpdateClass: (id: string, name: string) => Promise<void>
  getClassHref?: (classId: string) => string
}

/**
 * Table component for displaying classes
 */
export const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  loading,
  onSelectClass,
  onCreateClass,
  onUpdateClass,
  getClassHref,
}) => {
  const [newClassName, setNewClassName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const isNewRow = (row: ClassRow): row is Extract<ClassRow, { isNew: true }> =>
    'isNew' in row

  const handleCreate = async () => {
    const trimmedName = newClassName.trim()
    if (!trimmedName) {
      message.error('Bitte einen Klassennamen eingeben.')
      return
    }
    try {
      setSaving(true)
      await onCreateClass(trimmedName)
      setNewClassName('')
      message.success('Klasse hinzugefügt.')
    } catch (error) {
      console.error('Failed to add class:', error)
      message.error(
        'Klasse konnte nicht hinzugefügt werden. Bitte erneut versuchen.'
      )
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (record: Class) => {
    setEditingKey(record.id)
    setEditingName(record.name)
  }

  const cancelEditing = () => {
    setEditingKey(null)
    setEditingName('')
  }

  const saveEditing = async (record: Class) => {
    const trimmedName = editingName.trim()
    if (!trimmedName) {
      message.error('Bitte einen Klassennamen eingeben.')
      return
    }
    if (trimmedName === record.name) {
      setEditingKey(null)
      setEditingName('')
      return
    }
    try {
      await onUpdateClass(record.id, trimmedName)
      setEditingKey(null)
      setEditingName('')
      message.success('Klasse aktualisiert.')
    } catch (error) {
      console.error('Failed to update class:', error)
      message.error(
        'Klasse konnte nicht aktualisiert werden. Bitte erneut versuchen.'
      )
    }
  }

  const shouldHandleNavigation = (event: React.MouseEvent) =>
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.button !== 1 &&
    !event.defaultPrevented

  const columns: ColumnsType<ClassRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        if (isNewRow(a) && !isNewRow(b)) return -1
        if (!isNewRow(a) && isNewRow(b)) return 1
        return a.name.localeCompare(b.name)
      },
      defaultSortOrder: 'ascend',
      render: (value: string, record: ClassRow) => {
        if (isNewRow(record)) {
          return (
            <Input
              placeholder="Neuer Klassenname"
              value={newClassName}
              onChange={(event) => setNewClassName(event.target.value)}
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
        if (!getClassHref) {
          return value
        }
        const href = getClassHref(record.id)
        return (
          <a
            href={href}
            onClick={(event) => {
              if (!shouldHandleNavigation(event)) {
                return
              }
              event.preventDefault()
              onSelectClass(record.id)
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
        if (isNewRow(record)) {
          return (
            <Button
              type="primary"
              onClick={() => void handleCreate()}
              loading={saving}
              disabled={!newClassName.trim()}
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

  const dataSource: ClassRow[] = [
    { id: 'new', isNew: true, name: newClassName },
    ...classes,
  ]

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      loading={loading}
      onRow={(record) => ({
        onClick: (event) => {
          if (
            isNewRow(record) ||
            editingKey !== null ||
            !shouldHandleNavigation(event)
          ) {
            return
          }
          onSelectClass(record.id)
        },
        style: {
          cursor:
            isNewRow(record) || editingKey !== null ? 'default' : 'pointer',
        },
      })}
      locale={{
        emptyText: 'Keine Klassen gefunden. Oben eine neue Klasse hinzufügen.',
      }}
      pagination={false}
    />
  )
}

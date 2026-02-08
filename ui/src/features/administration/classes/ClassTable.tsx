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
}

/**
 * Table component for displaying classes
 */
export const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  loading,
  onSelectClass,
  onCreateClass,
}) => {
  const [newClassName, setNewClassName] = useState('')
  const [saving, setSaving] = useState(false)

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
      render: (value: string, record) => {
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
        return value
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
            disabled={!newClassName.trim()}
          >
            Hinzufügen
          </Button>
        )
      },
      width: 120,
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
        onClick: () => {
          if (isNewRow(record)) {
            return
          }
          onSelectClass(record.id)
        },
        style: { cursor: isNewRow(record) ? 'default' : 'pointer' },
      })}
      locale={{
        emptyText: 'Keine Klassen gefunden. Oben eine neue Klasse hinzufügen.',
      }}
      pagination={false}
    />
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest
  const { render, fireEvent, act } = await import('@testing-library/react')

  describe('ClassTable', () => {
    it('triggers onSelectClass with the class id', () => {
      if (!window.matchMedia) {
        window.matchMedia = () =>
          ({
            matches: false,
            media: '',
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          }) as unknown as MediaQueryList
      }
      window.getComputedStyle = () =>
        ({
          getPropertyValue: () => '',
        }) as unknown as CSSStyleDeclaration
      const onSelectClass = vi.fn()
      const onCreateClass = vi.fn().mockResolvedValue(undefined)
      const classes = [
        {
          id: 'class-1',
          name: 'Klasse 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const { getByText } = render(
        <ClassTable
          classes={classes}
          loading={false}
          onSelectClass={onSelectClass}
          onCreateClass={onCreateClass}
        />
      )

      fireEvent.click(getByText('Klasse 1'))

      expect(onSelectClass).toHaveBeenCalledWith('class-1')
    })

    it('calls onCreateClass for the new row', async () => {
      vi.spyOn(message, 'success').mockImplementation(
        () => ({}) as unknown as ReturnType<typeof message.success>
      )
      vi.spyOn(message, 'error').mockImplementation(
        () => ({}) as unknown as ReturnType<typeof message.error>
      )
      const onSelectClass = vi.fn()
      const onCreateClass = vi.fn().mockResolvedValue(undefined)

      const { getByPlaceholderText, getByRole } = render(
        <ClassTable
          classes={[]}
          loading={false}
          onSelectClass={onSelectClass}
          onCreateClass={onCreateClass}
        />
      )

      await act(async () => {
        fireEvent.change(getByPlaceholderText('Neuer Klassenname'), {
          target: { value: 'Klasse B' },
        })
      })

      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Hinzufügen' }))
      })

      expect(onCreateClass).toHaveBeenCalledWith('Klasse B')
    })
  })
}

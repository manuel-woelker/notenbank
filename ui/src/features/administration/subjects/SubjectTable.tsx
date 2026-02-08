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
}

/**
 * Table component for displaying subjects
 */
export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  loading,
  onCreateSubject,
}) => {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

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

  const columns: ColumnsType<SubjectRow> = [
    {
      title: 'Fach',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value: string, record) => {
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
            disabled={!name.trim()}
          >
            Hinzufügen
          </Button>
        )
      },
      width: 120,
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
      locale={{
        emptyText: 'Keine Fächer gefunden. Oben ein neues Fach hinzufügen.',
      }}
      pagination={false}
      size="small"
    />
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest
  const { render, fireEvent, act } = await import('@testing-library/react')

  describe('SubjectTable', () => {
    it('calls onCreateSubject for the new row', async () => {
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

      vi.spyOn(message, 'success').mockImplementation(
        () => ({}) as unknown as ReturnType<typeof message.success>
      )
      vi.spyOn(message, 'error').mockImplementation(
        () => ({}) as unknown as ReturnType<typeof message.error>
      )
      const onCreateSubject = vi.fn().mockResolvedValue(undefined)

      const { getByPlaceholderText, getByRole } = render(
        <SubjectTable
          subjects={[]}
          loading={false}
          onCreateSubject={onCreateSubject}
        />
      )

      await act(async () => {
        fireEvent.change(getByPlaceholderText('Fachname'), {
          target: { value: 'Mathe' },
        })
        fireEvent.click(getByRole('button', { name: 'Hinzufügen' }))
      })

      expect(onCreateSubject).toHaveBeenCalledWith({
        name: 'Mathe',
      })
    })
  })
}

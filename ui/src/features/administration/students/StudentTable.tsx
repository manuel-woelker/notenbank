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
}

/**
 * Table component for displaying students
 */
export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  onCreateStudent,
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
        return value
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
      locale={{
        emptyText:
          'Keine Schüler gefunden. Oben einen neuen Schüler hinzufügen.',
      }}
      pagination={false}
    />
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest
  const { render, fireEvent, act } = await import('@testing-library/react')

  describe('StudentTable', () => {
    it('calls onCreateStudent for the new row', async () => {
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
      const onCreateStudent = vi.fn().mockResolvedValue(undefined)

      const { getByPlaceholderText, getByRole } = render(
        <StudentTable
          students={[]}
          loading={false}
          onCreateStudent={onCreateStudent}
        />
      )

      await act(async () => {
        fireEvent.change(getByPlaceholderText('Vorname'), {
          target: { value: 'Tara' },
        })
        fireEvent.change(getByPlaceholderText('Nachname'), {
          target: { value: 'Student' },
        })
        fireEvent.click(getByRole('button', { name: 'Hinzufügen' }))
      })

      expect(onCreateStudent).toHaveBeenCalledWith({
        firstName: 'Tara',
        lastName: 'Student',
      })
    })
  })
}

import React, { useState } from 'react'
import { Button, Input, Select, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Assessment } from './AssessmentTypes'

interface AssessmentTableProps {
  assessments: Assessment[]
  loading: boolean
  onCreateAssessment: (input: {
    title: string
    type: Assessment['type']
    date: Date
  }) => Promise<void>
  disableCreate?: boolean
}

type AssessmentRow =
  | Assessment
  | {
      id: 'new'
      isNew: true
      title: string
      type?: Assessment['type']
      date?: string
      createdAt?: Date
      updatedAt?: Date
    }

const assessmentTypeLabel = (type: Assessment['type']) => {
  switch (type) {
    case 'written':
      return 'Schriftlich'
    case 'oral':
      return 'Mündlich'
    default:
      return '—'
  }
}

const dateFormatter = new Intl.DateTimeFormat('de-DE')

export const AssessmentTable: React.FC<AssessmentTableProps> = ({
  assessments,
  loading,
  onCreateAssessment,
  disableCreate = false,
}) => {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<Assessment['type'] | undefined>()
  const [dateInput, setDateInput] = useState('')
  const [saving, setSaving] = useState(false)

  const isNewRow = (
    row: AssessmentRow
  ): row is Extract<AssessmentRow, { isNew: true }> => 'isNew' in row

  const handleCreate = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || !type || !dateInput) {
      message.error('Bitte alle Felder ausfüllen.')
      return
    }
    const date = new Date(`${dateInput}T00:00:00`)
    if (Number.isNaN(date.getTime())) {
      message.error('Bitte ein gültiges Datum wählen.')
      return
    }
    try {
      setSaving(true)
      await onCreateAssessment({
        title: trimmedTitle,
        type,
        date,
      })
      setTitle('')
      setType(undefined)
      setDateInput('')
      message.success('Leistungsfeststellung hinzugefügt.')
    } catch (error) {
      console.error('Failed to add assessment:', error)
      message.error(
        'Leistungsfeststellung konnte nicht hinzugefügt werden. Bitte erneut versuchen.'
      )
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnsType<AssessmentRow> = [
    {
      title: 'Bezeichnung',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => {
        if (isNewRow(a) && !isNewRow(b)) return -1
        if (!isNewRow(a) && isNewRow(b)) return 1
        return a.title.localeCompare(b.title)
      },
      defaultSortOrder: 'ascend',
      render: (value: string, record) => {
        if (isNewRow(record)) {
          return (
            <Input
              placeholder="z.B. Klausur 1"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onPressEnter={() => void handleCreate()}
              disabled={disableCreate}
            />
          )
        }
        return value
      },
    },
    {
      title: 'Art',
      dataIndex: 'type',
      key: 'type',
      render: (value: Assessment['type'], record) => {
        if (isNewRow(record)) {
          return (
            <Select
              placeholder="Auswählen"
              options={[
                { label: 'Schriftlich', value: 'written' },
                { label: 'Mündlich', value: 'oral' },
              ]}
              value={type}
              onChange={(newType) => setType(newType)}
              disabled={disableCreate}
            />
          )
        }
        return assessmentTypeLabel(value)
      },
      filters: [
        { text: 'Schriftlich', value: 'written' },
        { text: 'Mündlich', value: 'oral' },
      ],
      onFilter: (value, record) => record.type === value,
      width: 140,
    },
    {
      title: 'Datum',
      dataIndex: 'date',
      key: 'date',
      render: (value: Date, record) => {
        if (isNewRow(record)) {
          return (
            <Input
              type="date"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
              disabled={disableCreate}
              aria-label="Datum"
            />
          )
        }
        return value ? dateFormatter.format(new Date(value)) : '—'
      },
      sorter: (a, b) => {
        if (isNewRow(a) || isNewRow(b)) return 0
        return a.date.getTime() - b.date.getTime()
      },
      width: 180,
    },
    {
      title: 'Aktionen',
      key: 'actions',
      render: (_, record) => {
        if (!isNewRow(record)) {
          return <span style={{ color: '#999' }}>-</span>
        }
        return (
          <Button
            type="primary"
            onClick={() => void handleCreate()}
            loading={saving}
            disabled={
              disableCreate || !title.trim() || !type || !dateInput.trim()
            }
          >
            Hinzufügen
          </Button>
        )
      },
      width: 140,
    },
  ]

  const dataSource: AssessmentRow[] = [
    { id: 'new', isNew: true, title, type, date: dateInput },
    ...assessments,
  ]

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      loading={loading}
      locale={{
        emptyText:
          'Keine Leistungsfeststellungen vorhanden. Neue Einträge hinzufügen.',
      }}
      pagination={false}
    />
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, vi, beforeEach } = import.meta.vitest
  const { render, fireEvent, act } = await import('@testing-library/react')

  describe('AssessmentTable', () => {
    beforeEach(() => {
      if (!globalThis.ResizeObserver) {
        globalThis.ResizeObserver = class {
          observe() {}
          unobserve() {}
          disconnect() {}
        }
      }
    })

    it('renders assessment data', () => {
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

      const { getByText } = render(
        <AssessmentTable
          assessments={[
            {
              id: 'a-1',
              classId: 'class-1',
              subjectId: 'subject-1',
              title: 'Klausur 1',
              type: 'written',
              date: new Date('2025-01-12'),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]}
          loading={false}
          onCreateAssessment={vi.fn()}
        />
      )

      expect(getByText('Klausur 1')).toBeTruthy()
      expect(getByText('Schriftlich')).toBeTruthy()
    })

    it('calls onCreateAssessment for the new row', async () => {
      vi.spyOn(message, 'success').mockImplementation(
        () => ({}) as unknown as ReturnType<typeof message.success>
      )
      vi.spyOn(message, 'error').mockImplementation(
        () => ({}) as unknown as ReturnType<typeof message.error>
      )
      const onCreateAssessment = vi.fn().mockResolvedValue(undefined)

      const { getByPlaceholderText, getByRole, getAllByLabelText, getByText } =
        render(
          <AssessmentTable
            assessments={[]}
            loading={false}
            onCreateAssessment={onCreateAssessment}
          />
        )

      await act(async () => {
        fireEvent.change(getByPlaceholderText('z.B. Klausur 1'), {
          target: { value: 'Test 1' },
        })
      })

      await act(async () => {
        fireEvent.mouseDown(getByRole('combobox'))
      })

      await act(async () => {
        fireEvent.click(getByText('Schriftlich'))
      })

      await act(async () => {
        const dateInput = getAllByLabelText('Datum').find(
          (element) => element.tagName === 'INPUT'
        ) as HTMLInputElement
        fireEvent.change(dateInput, {
          target: { value: '2025-05-12' },
        })
      })

      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Hinzufügen' }))
      })

      expect(onCreateAssessment).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test 1',
          type: 'written',
        })
      )
    })
  })
}

import React from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Class } from './types'

interface ClassTableProps {
  classes: Class[]
  loading: boolean
  onSelectClass: (classId: string) => void
}

/**
 * Table component for displaying classes
 */
export const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  loading,
  onSelectClass,
}) => {
  const columns: ColumnsType<Class> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: 'ascend',
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
      dataSource={classes}
      rowKey="id"
      loading={loading}
      onRow={(record) => ({
        onClick: () => onSelectClass(record.id),
        style: { cursor: 'pointer' },
      })}
      locale={{
        emptyText: 'No classes found. Click "Add Class" to create one.',
      }}
      pagination={false}
    />
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest
  const { render, fireEvent } = await import('@testing-library/react')

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
      const classes = [
        {
          id: 'class-1',
          name: 'Class 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const { getByText } = render(
        <ClassTable
          classes={classes}
          loading={false}
          onSelectClass={onSelectClass}
        />
      )

      fireEvent.click(getByText('Class 1'))

      expect(onSelectClass).toHaveBeenCalledWith('class-1')
    })
  })
}

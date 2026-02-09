import React, { useMemo } from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Grade } from '../../../shared/Grade'
import { GradeInputComponent } from '../../../shared/GradeInputComponent'
import { Student } from '../../administration/students/StudentTypes'

interface AssessmentGradeTableProps {
  students: Student[]
  grades: Record<string, Grade | null>
  onGradeChange: (studentId: string, grade: Grade | null) => void
}

export const AssessmentGradeTable: React.FC<AssessmentGradeTableProps> = ({
  students,
  grades,
  onGradeChange,
}) => {
  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`
        )
      ),
    [students]
  )

  const columns: ColumnsType<Student> = [
    {
      title: 'Schüler',
      key: 'student',
      render: (_, student) => `${student.lastName}, ${student.firstName}`,
    },
    {
      title: 'Note',
      key: 'grade',
      render: (_, student) => (
        <GradeInputComponent
          value={grades[student.id] ?? null}
          onChange={(value) => onGradeChange(student.id, value)}
          ariaLabel={`Note für ${student.firstName} ${student.lastName}`}
        />
      ),
      width: 180,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={sortedStudents}
      rowKey="id"
      pagination={false}
      size="small"
      locale={{
        emptyText: 'Keine Schüler verfügbar.',
      }}
    />
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, vi, beforeEach } = import.meta.vitest
  const { render, fireEvent, act } = await import('@testing-library/react')

  const ensureAntdTestEnvironment = () => {
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
    if (!globalThis.ResizeObserver) {
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    }
  }

  describe('AssessmentGradeTable', () => {
    beforeEach(() => {
      ensureAntdTestEnvironment()
    })

    it('renders student names', () => {
      const { getByText } = render(
        <AssessmentGradeTable
          students={[
            {
              id: 'student-1',
              firstName: 'Lina',
              lastName: 'Meyer',
              classId: 'class-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]}
          grades={{}}
          onGradeChange={vi.fn()}
        />
      )

      expect(getByText('Meyer, Lina')).toBeTruthy()
    })

    it('emits grade changes per student', async () => {
      const onGradeChange = vi.fn()

      const { getByLabelText } = render(
        <AssessmentGradeTable
          students={[
            {
              id: 'student-1',
              firstName: 'Lina',
              lastName: 'Meyer',
              classId: 'class-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]}
          grades={{}}
          onGradeChange={onGradeChange}
        />
      )

      await act(async () => {
        fireEvent.change(getByLabelText('Note für Lina Meyer'), {
          target: { value: '2-' },
        })
      })

      expect(onGradeChange).toHaveBeenCalledWith('student-1', 2.25)
    })
  })
}

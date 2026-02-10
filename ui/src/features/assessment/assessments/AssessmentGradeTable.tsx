import React, { useMemo } from 'react'
import { InputNumber, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Grade, gradeToString } from '../../../shared/Grade'
import { GradeInputComponent } from '../../../shared/GradeInputComponent'
import { Student } from '../../administration/students/StudentTypes'
import { GradingCurveConfig, calculateGradeFromCurve } from './GradingCurve'

const { Text } = Typography

interface AssessmentGradeResult {
  grade: Grade | null
  points?: number | null
  errors?: number | null
}

interface AssessmentGradeTableProps {
  students: Student[]
  results: Record<string, AssessmentGradeResult | null>
  gradingCurve: GradingCurveConfig | null
  onGradeChange: (studentId: string, grade: Grade | null) => void
  onScoreChange: (
    studentId: string,
    result: {
      grade: Grade | null
      points?: number | null
      errors?: number | null
    }
  ) => void
}

export const AssessmentGradeTable: React.FC<AssessmentGradeTableProps> = ({
  students,
  results,
  gradingCurve,
  onGradeChange,
  onScoreChange,
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

  const isCurveEnabled = gradingCurve !== null
  const modeLabel = gradingCurve?.mode === 'errors' ? 'Fehler' : 'Punkte'

  const columns: ColumnsType<Student> = [
    {
      title: 'Schüler',
      key: 'student',
      render: (_, student) => `${student.lastName}, ${student.firstName}`,
    },
    ...(isCurveEnabled
      ? ([
          {
            title: modeLabel,
            key: 'score',
            render: (_, student) => {
              const result = results[student.id]
              const scoreValue =
                gradingCurve?.mode === 'errors'
                  ? (result?.errors ?? null)
                  : (result?.points ?? null)
              return (
                <InputNumber
                  min={0}
                  step={0.5}
                  value={scoreValue ?? null}
                  onChange={(value) => {
                    if (!gradingCurve) {
                      return
                    }
                    const nextValue = typeof value === 'number' ? value : null
                    if (nextValue === null) {
                      onScoreChange(student.id, {
                        grade: null,
                        points: null,
                        errors: null,
                      })
                      return
                    }
                    const computedGrade = calculateGradeFromCurve(
                      nextValue,
                      gradingCurve
                    )
                    onScoreChange(student.id, {
                      grade: computedGrade,
                      points: gradingCurve.mode === 'points' ? nextValue : null,
                      errors: gradingCurve.mode === 'errors' ? nextValue : null,
                    })
                  }}
                  aria-label={`${modeLabel} für ${student.firstName} ${student.lastName}`}
                />
              )
            },
            width: 160,
          },
          {
            title: 'Note',
            key: 'grade',
            render: (_, student) => {
              const grade = results[student.id]?.grade ?? null
              return grade ? (
                <Text>{gradeToString(grade)}</Text>
              ) : (
                <Text type="secondary">—</Text>
              )
            },
            width: 140,
          },
        ] as ColumnsType<Student>)
      : ([
          {
            title: 'Note',
            key: 'grade',
            render: (_, student) => (
              <GradeInputComponent
                value={results[student.id]?.grade ?? null}
                onChange={(value) => onGradeChange(student.id, value)}
                ariaLabel={`Note für ${student.firstName} ${student.lastName}`}
              />
            ),
            width: 180,
          },
        ] as ColumnsType<Student>)),
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
          results={{}}
          gradingCurve={null}
          onGradeChange={vi.fn()}
          onScoreChange={vi.fn()}
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
          results={{}}
          gradingCurve={null}
          onGradeChange={onGradeChange}
          onScoreChange={vi.fn()}
        />
      )

      await act(async () => {
        fireEvent.change(getByLabelText('Note für Lina Meyer'), {
          target: { value: '2-' },
        })
      })

      expect(onGradeChange).toHaveBeenCalledWith('student-1', 2.25)
    })

    it('emits score changes when grading curve is enabled', async () => {
      const onScoreChange = vi.fn()

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
          results={{}}
          gradingCurve={{
            mode: 'points',
            grade1Value: 60,
            grade4Value: 30,
          }}
          onGradeChange={vi.fn()}
          onScoreChange={onScoreChange}
        />
      )

      await act(async () => {
        fireEvent.change(getByLabelText('Punkte für Lina Meyer'), {
          target: { value: '60' },
        })
      })

      expect(onScoreChange).toHaveBeenCalledWith('student-1', {
        grade: 1,
        points: 60,
        errors: null,
      })
    })
  })
}

// @vitest-environment happy-dom
import { render, fireEvent, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AssessmentGradeTable } from './AssessmentGradeTable'

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

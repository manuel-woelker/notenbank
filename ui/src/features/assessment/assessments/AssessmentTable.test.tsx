// @vitest-environment happy-dom
import { render, fireEvent, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { AssessmentTable } from './AssessmentTable'

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
        averageGradesByAssessmentId={{ 'a-1': 2.5 }}
      />
    )

    expect(getByText('Klausur 1')).toBeTruthy()
    expect(getByText('Schriftlich')).toBeTruthy()
    expect(getByText('2,50')).toBeTruthy()
  })

  it('calls onSelectAssessment when a row is clicked', async () => {
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

    const onSelectAssessment = vi.fn()

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
        onSelectAssessment={onSelectAssessment}
      />
    )

    await act(async () => {
      fireEvent.click(getByText('Klausur 1'))
    })

    expect(onSelectAssessment).toHaveBeenCalledWith('a-1')
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

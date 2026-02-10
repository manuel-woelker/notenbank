// @vitest-environment happy-dom
import { render, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { SubjectTable } from './SubjectTable'

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

  it('calls onSelectSubject when a subject row is clicked', async () => {
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

    const onSelectSubject = vi.fn()

    const { getByText } = render(
      <SubjectTable
        subjects={[
          {
            id: 'subject-1',
            name: 'Mathe',
            classId: 'class-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]}
        loading={false}
        onCreateSubject={vi.fn()}
        onSelectSubject={onSelectSubject}
      />
    )

    await act(async () => {
      fireEvent.click(getByText('Mathe'))
    })

    expect(onSelectSubject).toHaveBeenCalledWith('subject-1')
  })
})

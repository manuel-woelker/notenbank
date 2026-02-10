// @vitest-environment happy-dom
import { render, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { StudentTable } from './StudentTable'

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

  it('calls onSelectStudent when a student row is clicked', async () => {
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

    const onSelectStudent = vi.fn()

    const { getByText } = render(
      <StudentTable
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
        loading={false}
        onCreateStudent={vi.fn()}
        onSelectStudent={onSelectStudent}
      />
    )

    await act(async () => {
      fireEvent.click(getByText('Lina'))
    })

    expect(onSelectStudent).toHaveBeenCalledWith('student-1')
  })
})

// @vitest-environment happy-dom
import { render, fireEvent, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateStudentModal } from './CreateStudentModal'

const mockCreateStudent = vi.fn()
const mockClasses = [
  {
    id: 'cls-1',
    name: 'Klasse 5A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cls-2',
    name: 'Klasse 6B',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

vi.mock('./StudentStore', () => ({
  useStudentStore: () => ({
    createStudent: mockCreateStudent,
  }),
}))

vi.mock('../classes/ClassStore', () => ({
  useClassStore: () => ({
    classes: mockClasses,
    loading: false,
  }),
}))

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

describe('CreateStudentModal', () => {
  beforeEach(() => {
    mockCreateStudent.mockReset()
  })

  it('renders the modal title when open', () => {
    const { getByText } = render(
      <CreateStudentModal open={true} onClose={vi.fn()} />
    )
    expect(getByText('Schüler hinzufügen')).toBeTruthy()
  })

  it('renders form fields for first name, last name, and class', () => {
    const { getAllByText } = render(
      <CreateStudentModal open={true} onClose={vi.fn()} />
    )
    expect(getAllByText('Vorname').length).toBeGreaterThan(0)
    expect(getAllByText('Nachname').length).toBeGreaterThan(0)
    expect(getAllByText('Klasse').length).toBeGreaterThan(0)
  })

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()

    const { getAllByRole } = render(
      <CreateStudentModal open={true} onClose={onClose} />
    )

    await act(async () => {
      const buttons = getAllByRole('button', { name: 'Abbrechen' })
      fireEvent.click(buttons[0])
    })

    expect(onClose).toHaveBeenCalled()
  })
})

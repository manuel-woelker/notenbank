// @vitest-environment happy-dom
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { CreateClassModal } from './CreateClassModal'

vi.mock('./ClassStore', () => ({
  useClassStore: () => ({
    createClass: mockCreateClass,
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

const mockCreateClass = vi.fn()

describe('CreateClassModal', () => {
  beforeEach(() => {
    mockCreateClass.mockReset()
  })

  it('renders the modal title when open', () => {
    const { getByText } = render(
      <CreateClassModal open={true} onClose={vi.fn()} />
    )
    expect(getByText('Neue Klasse erstellen')).toBeTruthy()
  })

  it('calls createClass and onClose on successful submit', async () => {
    mockCreateClass.mockResolvedValue({})
    vi.spyOn(message, 'success').mockImplementation(
      () => ({}) as unknown as ReturnType<typeof message.success>
    )
    const onClose = vi.fn()

    const { getAllByPlaceholderText, getAllByRole } = render(
      <CreateClassModal open={true} onClose={onClose} />
    )

    await act(async () => {
      fireEvent.change(
        getAllByPlaceholderText('z. B. Klasse 5A, Jahrgang 10B')[0],
        {
          target: { value: 'Klasse 7B' },
        }
      )
    })

    await act(async () => {
      fireEvent.click(getAllByRole('button', { name: 'Erstellen' })[0])
    })

    await waitFor(() => {
      expect(mockCreateClass).toHaveBeenCalledWith({ name: 'Klasse 7B' })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()

    const { getAllByRole } = render(
      <CreateClassModal open={true} onClose={onClose} />
    )

    await act(async () => {
      fireEvent.click(getAllByRole('button', { name: 'Abbrechen' })[0])
    })

    expect(onClose).toHaveBeenCalled()
  })
})

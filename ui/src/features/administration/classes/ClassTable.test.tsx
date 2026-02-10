// @vitest-environment happy-dom
import { render, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { ClassTable } from './ClassTable'

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
    const onCreateClass = vi.fn().mockResolvedValue(undefined)
    const classes = [
      {
        id: 'class-1',
        name: 'Klasse 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const { getByText } = render(
      <ClassTable
        classes={classes}
        loading={false}
        onSelectClass={onSelectClass}
        onCreateClass={onCreateClass}
      />
    )

    fireEvent.click(getByText('Klasse 1'))

    expect(onSelectClass).toHaveBeenCalledWith('class-1')
  })

  it('calls onCreateClass for the new row', async () => {
    vi.spyOn(message, 'success').mockImplementation(
      () => ({}) as unknown as ReturnType<typeof message.success>
    )
    vi.spyOn(message, 'error').mockImplementation(
      () => ({}) as unknown as ReturnType<typeof message.error>
    )
    const onSelectClass = vi.fn()
    const onCreateClass = vi.fn().mockResolvedValue(undefined)

    const { getByPlaceholderText, getByRole } = render(
      <ClassTable
        classes={[]}
        loading={false}
        onSelectClass={onSelectClass}
        onCreateClass={onCreateClass}
      />
    )

    await act(async () => {
      fireEvent.change(getByPlaceholderText('Neuer Klassenname'), {
        target: { value: 'Klasse B' },
      })
    })

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Hinzufügen' }))
    })

    expect(onCreateClass).toHaveBeenCalledWith('Klasse B')
  })
})

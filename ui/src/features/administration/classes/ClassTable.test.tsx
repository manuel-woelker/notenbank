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
    const onUpdateClass = vi.fn().mockResolvedValue(undefined)
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
        onUpdateClass={onUpdateClass}
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
    const onUpdateClass = vi.fn().mockResolvedValue(undefined)

    const { container } = render(
      <ClassTable
        classes={[]}
        loading={false}
        onSelectClass={onSelectClass}
        onCreateClass={onCreateClass}
        onUpdateClass={onUpdateClass}
      />
    )

    // Use container query to find the input within the rendered component
    // This avoids issues with multiple elements from other tests when isolate: false
    const input = container.querySelector(
      'input[placeholder="Neuer Klassenname"]'
    )
    if (!input) {
      throw new Error('Input not found')
    }

    await act(async () => {
      fireEvent.change(input, {
        target: { value: 'Klasse B' },
      })
    })

    // Use container query to find the enabled button within the rendered component
    // This avoids issues with multiple elements from other tests when isolate: false
    const buttons = Array.from(
      container.querySelectorAll('button.ant-btn-primary')
    ) as HTMLButtonElement[]
    const button = buttons.find((btn) => !btn.disabled)
    if (!button) {
      throw new Error('Enabled submit button not found')
    }

    await act(async () => {
      fireEvent.click(button)
    })

    expect(onCreateClass).toHaveBeenCalledWith('Klasse B')
  })
})

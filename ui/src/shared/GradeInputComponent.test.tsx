// @vitest-environment happy-dom
import { useState } from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Grade } from './Grade'
import { GradeInputComponent } from './GradeInputComponent'

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
}

const StatefulWrapper = ({
  onChange,
}: {
  onChange: (value: Grade | null) => void
}) => {
  const [value, setValue] = useState<Grade | null>(null)

  return (
    <GradeInputComponent
      value={value}
      onChange={(nextValue) => {
        onChange(nextValue)
        setValue(nextValue)
      }}
    />
  )
}

describe('GradeInputComponent', () => {
  beforeEach(() => {
    ensureAntdTestEnvironment()
  })

  it('emits parsed grades for valid german notation', async () => {
    const onChange = vi.fn()

    const { container } = render(<StatefulWrapper onChange={onChange} />)

    // Use container query to avoid test pollution from isolate: false
    const input = container.querySelector('input[aria-label="Note"]')
    if (!input) {
      throw new Error('Grade input not found')
    }

    await act(async () => {
      fireEvent.change(input, {
        target: { value: '2-' },
      })
    })

    expect(onChange).toHaveBeenCalledWith(2.25)
  })

  it('emits null when the input is cleared', async () => {
    const onChange = vi.fn()

    const { container } = render(<StatefulWrapper onChange={onChange} />)

    // Use container query to avoid test pollution from isolate: false
    const input = container.querySelector('input[aria-label="Note"]')
    if (!input) {
      throw new Error('Grade input not found')
    }

    await act(async () => {
      fireEvent.change(input, {
        target: { value: '2' },
      })
      fireEvent.change(input, {
        target: { value: '' },
      })
    })

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('ignores invalid grade strings', async () => {
    const onChange = vi.fn()

    const { container } = render(<StatefulWrapper onChange={onChange} />)

    // Use container query to avoid test pollution from isolate: false
    const input = container.querySelector('input[aria-label="Note"]')
    if (!input) {
      throw new Error('Grade input not found')
    }

    await act(async () => {
      fireEvent.change(input, {
        target: { value: '1-3' },
      })
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('normalizes decimal input on blur', async () => {
    const onChange = vi.fn()

    const { container } = render(<StatefulWrapper onChange={onChange} />)

    // Use container query to avoid test pollution from isolate: false
    const input = container.querySelector(
      'input[aria-label="Note"]'
    ) as HTMLInputElement
    if (!input) {
      throw new Error('Grade input not found')
    }

    await act(async () => {
      fireEvent.change(input, {
        target: { value: '1,0' },
      })
    })

    await act(async () => {
      fireEvent.blur(input)
    })

    expect(input.value).toBe('1')
  })
})

import React, { useMemo, useState } from 'react'
import { Input } from 'antd'
import type { InputProps } from 'antd'
import { Grade, gradeFromString, gradeToString } from './Grade'

export interface GradeInputComponentProps {
  value: Grade | null
  onChange: (value: Grade | null) => void
  placeholder?: string
  disabled?: boolean
  size?: InputProps['size']
  autoFocus?: boolean
  ariaLabel?: string
}

const formatGradeValue = (value: Grade | null): string =>
  value === null ? '' : gradeToString(value)

/* 📖 # Why keep the raw input while typing?
Users should be able to type intermediate strings like "1-" or "1,0" without
losing their place; we only normalize once the input is blurred or confirmed.
*/
export const GradeInputComponent: React.FC<GradeInputComponentProps> = ({
  value,
  onChange,
  placeholder = 'z. B. 2+, 1-2 oder 3,5',
  disabled,
  size,
  autoFocus,
  ariaLabel = 'Note',
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const visibleValue = isFocused ? inputValue : formatGradeValue(value)

  const parsedValue = useMemo(
    () => gradeFromString(visibleValue),
    [visibleValue]
  )
  const trimmed = visibleValue.trim()
  const hasContent = trimmed.length > 0
  const isInvalid = hasContent && parsedValue === null

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextValue = event.target.value
    setInputValue(nextValue)

    const nextTrimmed = nextValue.trim()
    if (nextTrimmed.length === 0) {
      onChange(null)
      return
    }

    const parsed = gradeFromString(nextValue)
    if (parsed !== null) {
      onChange(parsed)
    }
  }

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    setIsFocused(false)
    if (isInvalid) {
      return
    }
    setInputValue(parsedValue ? gradeToString(parsedValue) : '')
  }

  return (
    <Input
      value={visibleValue}
      onChange={handleChange}
      onFocus={() => {
        setInputValue(formatGradeValue(value))
        setIsFocused(true)
      }}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      autoFocus={autoFocus}
      inputMode="decimal"
      aria-label={ariaLabel}
      status={isInvalid ? 'error' : undefined}
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
  }

  const StatefulWrapper = ({
    onChange,
  }: {
    onChange: (value: Grade | null) => void
  }) => {
    const [value, setValue] = React.useState<Grade | null>(null)

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

      const { getByLabelText } = render(<StatefulWrapper onChange={onChange} />)

      await act(async () => {
        fireEvent.change(getByLabelText('Note'), {
          target: { value: '2-' },
        })
      })

      expect(onChange).toHaveBeenCalledWith(2.25)
    })

    it('emits null when the input is cleared', async () => {
      const onChange = vi.fn()

      const { getByLabelText } = render(<StatefulWrapper onChange={onChange} />)

      await act(async () => {
        fireEvent.change(getByLabelText('Note'), {
          target: { value: '2' },
        })
        fireEvent.change(getByLabelText('Note'), {
          target: { value: '' },
        })
      })

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('ignores invalid grade strings', async () => {
      const onChange = vi.fn()

      const { getByLabelText } = render(<StatefulWrapper onChange={onChange} />)

      await act(async () => {
        fireEvent.change(getByLabelText('Note'), {
          target: { value: '1-3' },
        })
      })

      expect(onChange).not.toHaveBeenCalled()
    })

    it('normalizes decimal input on blur', async () => {
      const onChange = vi.fn()

      const { getByLabelText } = render(<StatefulWrapper onChange={onChange} />)

      const input = getByLabelText('Note') as HTMLInputElement

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
}

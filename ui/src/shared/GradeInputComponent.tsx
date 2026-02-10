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

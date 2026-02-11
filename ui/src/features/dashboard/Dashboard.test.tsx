// @vitest-environment happy-dom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dashboard } from './Dashboard'

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

describe('Dashboard', () => {
  it('renders the welcome heading', () => {
    const { getByText } = render(<Dashboard />)
    expect(getByText('Willkommen bei Notenbank')).toBeTruthy()
  })
})

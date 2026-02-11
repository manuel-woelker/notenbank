// @vitest-environment happy-dom
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { Dashboard } from './Dashboard'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
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

describe('Dashboard', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory()
  })

  it('renders the welcome heading', async () => {
    const { getByText } = render(<Dashboard />)
    await waitFor(() => {
      expect(getByText('Willkommen bei Notenbank')).toBeTruthy()
    })
  })
})

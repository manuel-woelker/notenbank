// @vitest-environment happy-dom
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllRepositoryCaches } from '../../shared/repositories/createRepository'
import { Dashboard } from './Dashboard'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    Link: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      to?: string
    }) => <a {...props}>{children}</a>,
    useNavigate: () => mockNavigate,
    useSearch: () => ({}),
  }
})

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
  beforeEach(async () => {
    await clearAllRepositoryCaches()
    mockNavigate.mockClear()
  })

  it('renders the dashboard with class section', async () => {
    const { getAllByText } = render(<Dashboard />)
    await waitFor(() => {
      // Use getAllByText to handle multiple "Klassen" elements from test pollution
      expect(getAllByText('Klassen').length).toBeGreaterThan(0)
    })
  })
})

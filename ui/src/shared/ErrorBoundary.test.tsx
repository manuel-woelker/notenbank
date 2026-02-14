// @vitest-environment happy-dom
import { render, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

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

const ThrowingComponent = () => {
  throw new Error('Test-Fehler')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    ensureAntdTestEnvironment()
    // Suppress console.error output during tests that intentionally throw
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children normally when no error occurs', async () => {
    let container: HTMLElement
    await act(async () => {
      ;({ container } = render(
        <ErrorBoundary>
          <div data-testid="child">Kein Fehler</div>
        </ErrorBoundary>
      ))
    })

    expect(container!.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it('renders fallback UI when a child throws', async () => {
    let container: HTMLElement
    await act(async () => {
      ;({ container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      ))
    })

    expect(container!.textContent?.includes('Ein Fehler ist aufgetreten')).toBe(
      true
    )
  })

  it('renders custom fallback when provided and a child throws', async () => {
    let container: HTMLElement
    await act(async () => {
      ;({ container } = render(
        <ErrorBoundary
          fallback={<div data-testid="custom">Benutzerdefinierter Fehler</div>}
        >
          <ThrowingComponent />
        </ErrorBoundary>
      ))
    })

    expect(container!.querySelector('[data-testid="custom"]')).not.toBeNull()
  })

  it('"Seite neu laden" button calls window.location.reload', async () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    })

    let container: HTMLElement
    await act(async () => {
      ;({ container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      ))
    })

    const button = container!.querySelector('button')
    expect(button).not.toBeNull()
    await act(async () => {
      button!.click()
    })

    expect(reloadMock).toHaveBeenCalled()
  })
})

// @vitest-environment happy-dom
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassList } from './ClassList'

const mockClasses = [
  {
    id: 'cls-1',
    name: 'Klasse 5A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
const mockCreateClass = vi.fn()
const mockNavigate = vi.fn()
let mockIsExample = false

vi.mock('./ClassStore', () => ({
  useClassStore: () => ({
    classes: mockClasses,
    loading: false,
    createClass: mockCreateClass,
  }),
}))

vi.mock('../../../shared/store/databaseStore', () => ({
  useDatabaseStore: () => ({
    isExample: mockIsExample,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
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

describe('ClassList', () => {
  beforeEach(() => {
    mockIsExample = false
  })

  it('renders the Klassen heading', () => {
    const { getByText } = render(<ClassList />)
    expect(getByText('Klassen')).toBeTruthy()
  })

  it('renders the class table with classes', () => {
    const { getAllByText } = render(<ClassList />)
    expect(getAllByText('Klasse 5A').length).toBeGreaterThan(0)
  })
})

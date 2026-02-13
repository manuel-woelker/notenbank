// @vitest-environment happy-dom
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { ChangeLogPage } from './ChangeLogPage'
import { ChangeLog } from '../../shared/changeTracking/ChangeLogTypes'

// Mock the store
const mockChangeLogs: ChangeLog[] = [
  {
    id: 'log-1',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    userId: 'System',
    operation: 'CREATE',
    entityType: 'class',
    entityId: 'class-1',
    entityData: { id: 'class-1', name: '10A' },
    description: "Klasse '10A' erstellt",
    classId: 'class-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'log-2',
    timestamp: new Date('2024-01-15T11:00:00Z'),
    userId: 'System',
    operation: 'UPDATE',
    entityType: 'class',
    entityId: 'class-1',
    entityData: { id: 'class-1', name: '10A Updated' },
    description: "Klasse '10A' aktualisiert",
    classId: 'class-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

vi.mock('./ChangeLogStore', () => ({
  useChangeLogStore: vi.fn(() => ({
    filteredChangeLogs: mockChangeLogs,
    loading: false,
    filters: { entityTypes: [], operations: [] },
    setFilters: vi.fn(),
    clearFilters: vi.fn(),
  })),
}))

// Mock repositories for ChangeLogFilterPanel
vi.mock('../administration/classes/ClassRepository', () => ({
  classRepository: {
    findAll: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../administration/subjects/SubjectRepository', () => ({
  subjectRepository: {
    findAll: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../assessment/assessments/AssessmentRepository', () => ({
  assessmentRepository: {
    findAll: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../administration/students/StudentRepository', () => ({
  studentRepository: {
    findAll: vi.fn().mockResolvedValue([]),
  },
}))

describe('ChangeLogPage', () => {
  beforeEach(() => {
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
  })

  it('renders filter panel and table', async () => {
    const { getByText, getAllByText } = render(<ChangeLogPage />)

    await waitFor(() => {
      // Check for filter panel
      getByText('Filter')

      // Check for table content
      expect(getAllByText(/Klasse '10A' erstellt/).length).toBeGreaterThan(0)
      expect(getAllByText(/Klasse '10A' aktualisiert/).length).toBeGreaterThan(
        0
      )
    })
  })

  it('opens detail modal when Details button is clicked', async () => {
    const { getAllByText, getByText } = render(<ChangeLogPage />)

    await waitFor(() => {
      const detailsButtons = getAllByText('Details')
      fireEvent.click(detailsButtons[0])
    })

    await waitFor(() => {
      getByText('Änderungsdetails')
    })
  })

  it('uses filtered change logs from store', async () => {
    const { getAllByText } = render(<ChangeLogPage />)

    await waitFor(() => {
      // Should display the filtered change logs
      expect(getAllByText(/Klasse '10A' erstellt/).length).toBeGreaterThan(0)
      expect(getAllByText(/Klasse '10A' aktualisiert/).length).toBeGreaterThan(
        0
      )
    })
  })
})

// @vitest-environment happy-dom
import { render, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ChangeLogTable } from './ChangeLogTable'
import { ChangeLog } from '../../shared/changeTracking/ChangeLogTypes'

describe('ChangeLogTable', () => {
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
      entityType: 'student',
      entityId: 'student-1',
      entityData: { id: 'student-1', firstName: 'Max', lastName: 'Mustermann' },
      description: 'Schüler aktualisiert',
      classId: 'class-1',
      studentId: 'student-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'log-3',
      timestamp: new Date('2024-01-15T12:00:00Z'),
      userId: 'System',
      operation: 'DELETE',
      entityType: 'assessment_grade',
      entityId: 'grade-1',
      entityData: { id: 'grade-1', grade: 2.5 },
      description: 'Note gelöscht',
      classId: 'class-1',
      subjectId: 'subject-1',
      assessmentId: 'assessment-1',
      studentId: 'student-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  it('renders change logs in the table', () => {
    const onViewDetails = vi.fn()
    const { getByText } = render(
      <ChangeLogTable
        changeLogs={mockChangeLogs}
        loading={false}
        onViewDetails={onViewDetails}
      />
    )

    getByText("Klasse '10A' erstellt")
    getByText('Schüler aktualisiert')
    getByText('Note gelöscht')
  })

  it('calls onViewDetails when Details button is clicked', () => {
    const onViewDetails = vi.fn()
    const { container } = render(
      <ChangeLogTable
        changeLogs={mockChangeLogs}
        loading={false}
        onViewDetails={onViewDetails}
      />
    )

    // Use container query to find the button within the rendered component
    // This avoids issues with multiple elements from other tests when isolate: false
    const detailsButtons = container.querySelectorAll('button.ant-btn-link')
    fireEvent.click(detailsButtons[0])

    expect(onViewDetails).toHaveBeenCalledWith('log-1')
  })

  it('displays German labels for entity types', () => {
    const onViewDetails = vi.fn()
    const { container } = render(
      <ChangeLogTable
        changeLogs={mockChangeLogs}
        loading={false}
        onViewDetails={onViewDetails}
      />
    )

    // Use container query to avoid issues with multiple elements from other tests when isolate: false
    const tableText = container.textContent || ''
    expect(tableText).toContain('Klasse')
    expect(tableText).toContain('Schüler')
    expect(tableText).toContain('Note')
  })

  it('displays German labels for operations', () => {
    const onViewDetails = vi.fn()
    const { getAllByText } = render(
      <ChangeLogTable
        changeLogs={mockChangeLogs}
        loading={false}
        onViewDetails={onViewDetails}
      />
    )

    expect(getAllByText('Erstellt').length).toBeGreaterThan(0)
    expect(getAllByText('Aktualisiert').length).toBeGreaterThan(0)
    expect(getAllByText('Gelöscht').length).toBeGreaterThan(0)
  })

  it('formats timestamps in German locale', () => {
    const onViewDetails = vi.fn()
    const { getAllByText } = render(
      <ChangeLogTable
        changeLogs={mockChangeLogs}
        loading={false}
        onViewDetails={onViewDetails}
      />
    )

    // Check if timestamp is formatted (contains dots for German date format)
    // Multiple timestamps exist in the table, so use getAllByText
    const timestamps = getAllByText(/\d{2}\.\d{2}\.\d{4}/)
    expect(timestamps.length).toBeGreaterThan(0)
  })

  it('displays loading state', () => {
    const onViewDetails = vi.fn()
    const { container } = render(
      <ChangeLogTable
        changeLogs={[]}
        loading={true}
        onViewDetails={onViewDetails}
      />
    )

    // Ant Design shows a loading spinner when loading is true
    expect(container.querySelector('.ant-spin')).not.toBeNull()
  })

  it('displays empty state when no change logs', () => {
    const onViewDetails = vi.fn()
    const { container } = render(
      <ChangeLogTable
        changeLogs={[]}
        loading={false}
        onViewDetails={onViewDetails}
      />
    )

    // Use container query to avoid issues with multiple elements from other tests when isolate: false
    const tableText = container.textContent || ''
    expect(tableText).toContain('Keine Änderungen gefunden.')
  })
})

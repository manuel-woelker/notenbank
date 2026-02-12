// @vitest-environment happy-dom
import { render, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ChangeLogDetailModal } from './ChangeLogDetailModal'
import { ChangeLog } from '../../shared/changeTracking/ChangeLogTypes'

describe('ChangeLogDetailModal', () => {
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

  const mockChangeLog: ChangeLog = {
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
  }

  const mockUpdateLog: ChangeLog = {
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
  }

  const mockPreviousLog: ChangeLog = {
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
  }

  it('displays change log details', () => {
    const onClose = vi.fn()
    const { getByText } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockChangeLog}
        onClose={onClose}
      />
    )

    getByText('System')
    getByText('Erstellt')
    getByText('Klasse')
    getByText("Klasse '10A' erstellt")
  })

  it('displays context fields when present', () => {
    const logWithContext: ChangeLog = {
      ...mockChangeLog,
      classId: 'class-1',
      subjectId: 'subject-1',
      assessmentId: 'assessment-1',
      studentId: 'student-1',
    }

    const onClose = vi.fn()
    const { getByText } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={logWithContext}
        onClose={onClose}
      />
    )

    getByText('class-1')
    getByText('subject-1')
    getByText('assessment-1')
    getByText('student-1')
  })

  it('shows changed fields for UPDATE operations with previous log', () => {
    const onClose = vi.fn()
    const { getByText } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockUpdateLog}
        previousChangeLog={mockPreviousLog}
        onClose={onClose}
      />
    )

    getByText('Geänderte Felder:')
    getByText('name:')
    getByText('"10A"')
    getByText('"10A Updated"')
  })

  it('calls onClose when modal is closed', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockChangeLog}
        onClose={onClose}
      />
    )

    const closeButton = container.querySelector('.ant-modal-close')
    if (closeButton) {
      fireEvent.click(closeButton)
    }

    expect(onClose).toHaveBeenCalled()
  })

  it('formats timestamp in German locale', () => {
    const onClose = vi.fn()
    const { getByText } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockChangeLog}
        onClose={onClose}
      />
    )

    // Check if timestamp is formatted (contains dots for German date format)
    getByText(/\d{2}\.\d{2}\.\d{4}/)
  })

  it('displays entity data as JSON', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockChangeLog}
        onClose={onClose}
      />
    )

    const preElement = container.querySelector('pre')
    expect(preElement).not.toBeNull()
    expect(preElement?.textContent).toContain('10A')
  })

  it('returns null when changeLog is null', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ChangeLogDetailModal visible={true} changeLog={null} onClose={onClose} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('displays German labels for entity types', () => {
    const onClose = vi.fn()
    const { getByText } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockChangeLog}
        onClose={onClose}
      />
    )

    getByText('Klasse')
  })

  it('displays German labels for operations', () => {
    const onClose = vi.fn()
    const { getByText } = render(
      <ChangeLogDetailModal
        visible={true}
        changeLog={mockChangeLog}
        onClose={onClose}
      />
    )

    getByText('Erstellt')
  })
})

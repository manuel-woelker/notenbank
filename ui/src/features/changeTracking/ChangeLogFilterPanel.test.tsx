// @vitest-environment happy-dom
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ChangeLogFilterPanel } from './ChangeLogFilterPanel'
import { ChangeLogFilters } from './ChangeLogStore'
import { classRepository } from '../administration/classes/ClassRepository'
import { subjectRepository } from '../administration/subjects/SubjectRepository'
import { assessmentRepository } from '../assessment/assessments/AssessmentRepository'
import { studentRepository } from '../administration/students/StudentRepository'

// Mock repositories
vi.mock('../administration/classes/ClassRepository', () => ({
  classRepository: {
    findAll: vi.fn().mockResolvedValue([
      {
        id: 'class-1',
        name: '10A',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'class-2',
        name: '10B',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  },
}))

vi.mock('../administration/subjects/SubjectRepository', () => ({
  subjectRepository: {
    findAll: vi.fn().mockResolvedValue([
      {
        id: 'subject-1',
        name: 'Mathematik',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'subject-2',
        name: 'Deutsch',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  },
}))

vi.mock('../assessment/assessments/AssessmentRepository', () => ({
  assessmentRepository: {
    findAll: vi.fn().mockResolvedValue([
      {
        id: 'assessment-1',
        title: 'Test 1',
        subjectId: 'subject-1',
        classId: 'class-1',
        type: 'written',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  },
}))

vi.mock('../administration/students/StudentRepository', () => ({
  studentRepository: {
    findAll: vi.fn().mockResolvedValue([
      {
        id: 'student-1',
        firstName: 'Max',
        lastName: 'Mustermann',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'student-2',
        firstName: 'Anna',
        lastName: 'Schmidt',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  },
}))

describe('ChangeLogFilterPanel', () => {
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

  const defaultFilters: ChangeLogFilters = {
    entityTypes: [],
    operations: [],
  }

  it('renders filter labels', async () => {
    const onFiltersChange = vi.fn()
    const onClearFilters = vi.fn()

    const { getByText } = render(
      <ChangeLogFilterPanel
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />
    )

    await waitFor(() => {
      getByText('Zeitraum')
      getByText('Entitätstypen')
      getByText('Operationen')
    })
  })

  it('calls onClearFilters when reset button is clicked', async () => {
    const onFiltersChange = vi.fn()
    const onClearFilters = vi.fn()

    const { getByText } = render(
      <ChangeLogFilterPanel
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />
    )

    await waitFor(() => {
      const resetButton = getByText('Filter zurücksetzen')
      fireEvent.click(resetButton)
    })

    expect(onClearFilters).toHaveBeenCalled()
  })

  it('loads data from repositories on mount', async () => {
    const onFiltersChange = vi.fn()
    const onClearFilters = vi.fn()

    render(
      <ChangeLogFilterPanel
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />
    )

    await waitFor(() => {
      expect(classRepository.findAll).toHaveBeenCalled()
      expect(subjectRepository.findAll).toHaveBeenCalled()
      expect(assessmentRepository.findAll).toHaveBeenCalled()
      expect(studentRepository.findAll).toHaveBeenCalled()
    })
  })
})

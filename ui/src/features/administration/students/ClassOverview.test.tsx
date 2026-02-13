// @vitest-environment happy-dom
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllRepositoryCaches } from '../../../shared/repositories/createRepository'
import { classRepository } from '../classes/ClassRepository'
import { studentRepository } from './StudentRepository'
import { subjectRepository } from '../subjects/SubjectRepository'
import { ClassOverview } from './ClassOverview'

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  )
  return {
    ...actual,
    useNavigate: () => () => {},
  }
})

describe('ClassOverview', () => {
  beforeEach(async () => {
    await clearAllRepositoryCaches()
    const existingClasses = await classRepository.findAll()
    await Promise.all(
      existingClasses.map((existingClass) =>
        classRepository.delete(existingClass.id)
      )
    )
    const existingStudents = await studentRepository.findAll()
    await Promise.all(
      existingStudents.map((existingStudent) =>
        studentRepository.delete(existingStudent.id)
      )
    )
    const existingSubjects = await subjectRepository.findAll()
    await Promise.all(
      existingSubjects.map((existingSubject) =>
        subjectRepository.delete(existingSubject.id)
      )
    )
  })

  it('renders students for the selected class', async () => {
    const newClass = await classRepository.create({ name: 'Class A' })
    await studentRepository.create({
      firstName: 'Tara',
      lastName: 'Student',
      classId: newClass.id,
    })
    await subjectRepository.create({
      name: 'Mathe',
      classId: newClass.id,
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

    const { getByText } = render(<ClassOverview classId={newClass.id} />)

    await waitFor(() => {
      expect(getByText('Tara')).toBeTruthy()
    })

    await waitFor(
      () => {
        expect(getByText('Mathe')).toBeTruthy()
      },
      { timeout: 3000 }
    )
  })
})

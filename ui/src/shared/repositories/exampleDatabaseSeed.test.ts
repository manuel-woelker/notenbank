import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { setDatabaseMode } from '../store/databaseStore'
import { classRepository } from '../../features/administration/classes/ClassRepository'
import { studentRepository } from '../../features/administration/students/StudentRepository'
import { subjectRepository } from '../../features/administration/subjects/SubjectRepository'
import { assessmentRepository } from '../../features/assessment/assessments/AssessmentRepository'
import { assessmentGradeRepository } from '../../features/assessment/assessments/AssessmentGradeRepository'
import {
  ensureExampleDatabaseSeeded,
  resetExampleDatabase,
} from './exampleDatabaseSeed'

describe('ensureExampleDatabaseSeeded', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory()
    setDatabaseMode('example')
  })
  afterEach(() => {
    setDatabaseMode('primary')
  })

  it('seeds the example database once', async () => {
    await ensureExampleDatabaseSeeded()

    const classes = await classRepository.findAll()
    const students = await studentRepository.findAll()
    const subjects = await subjectRepository.findAll()
    const assessments = await assessmentRepository.findAll()
    const grades = await assessmentGradeRepository.findAll()

    expect(classes.length).toBeGreaterThan(0)
    expect(students.length).toBeGreaterThan(0)
    expect(subjects.length).toBeGreaterThan(0)
    expect(assessments.length).toBeGreaterThan(0)
    expect(grades.length).toBeGreaterThan(0)

    await ensureExampleDatabaseSeeded()
    const classesAfter = await classRepository.findAll()
    expect(classesAfter).toHaveLength(classes.length)
  }, 30000)

  it('resets and reseeds the example database', async () => {
    await ensureExampleDatabaseSeeded()

    await resetExampleDatabase()

    const classes = await classRepository.findAll()
    const students = await studentRepository.findAll()
    const subjects = await subjectRepository.findAll()
    const assessments = await assessmentRepository.findAll()
    const grades = await assessmentGradeRepository.findAll()

    expect(classes.length).toBeGreaterThan(0)
    expect(students.length).toBeGreaterThan(0)
    expect(subjects.length).toBeGreaterThan(0)
    expect(assessments.length).toBeGreaterThan(0)
    expect(grades.length).toBeGreaterThan(0)
  }, 30000)
})

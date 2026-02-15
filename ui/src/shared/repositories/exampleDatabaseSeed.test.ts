import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setDatabaseMode } from '../store/databaseStore'
import { clearAllRepositoryCaches } from './createRepository'
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
  beforeEach(async () => {
    await clearAllRepositoryCaches()
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
  }, 60000)

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
  }, 60000)

  it('seeds mathematik schriftlich 1 with grading curve', async () => {
    await resetExampleDatabase()

    const assessments = await assessmentRepository.findAll()
    // Get the class 5a ID first
    const classes = await classRepository.findAll()
    const class5a = classes.find((c) => c.name === '5a')
    expect(class5a).toBeDefined()

    // Get subjects for class 5a
    const subjects = await subjectRepository.findAll()
    const matheSubject = subjects.find(
      (s) => s.name === 'Mathematik' && s.classId === class5a!.id
    )
    expect(matheSubject).toBeDefined()

    // Find the Schriftlich 1 assessment for Mathematik in 5a
    const matheAssessment = assessments.find(
      (a) =>
        a.title === 'Schriftlich 1' &&
        a.type === 'written' &&
        a.subjectId === matheSubject!.id
    )

    expect(matheAssessment).toBeDefined()
    expect(matheAssessment?.gradingCurve).toEqual({
      mode: 'points',
      grade1Value: 40,
      grade4Value: 20,
    })
  }, 60000)
})

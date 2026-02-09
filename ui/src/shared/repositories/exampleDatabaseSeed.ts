import { createGrade } from '../Grade'
import { classRepository } from '../../features/administration/classes/ClassRepository'
import { studentRepository } from '../../features/administration/students/StudentRepository'
import { subjectRepository } from '../../features/administration/subjects/SubjectRepository'
import { assessmentRepository } from '../../features/assessment/assessments/AssessmentRepository'
import { assessmentGradeRepository } from '../../features/assessment/assessments/AssessmentGradeRepository'
import { NOTENBANK_EXAMPLE_DB_NAME } from './notenbankDb'
import { getActiveDatabaseName } from '../store/databaseStore'

type SeedClass = { key: string; name: string }
type SeedStudent = {
  key: string
  classKey: string
  firstName: string
  lastName: string
}
type SeedSubject = { key: string; classKey: string; name: string }
type SeedAssessment = {
  key: string
  classKey: string
  subjectKey: string
  title: string
  type: 'written' | 'oral'
  date: Date
}
type SeedAssessmentGrade = {
  assessmentKey: string
  studentKey: string
  grade: number
}

const requireId = (map: Map<string, string>, key: string, label: string) => {
  const id = map.get(key)
  if (!id) {
    throw new Error(`Missing ${label} id for ${key}`)
  }
  return id
}

const seedClasses: SeedClass[] = [
  { key: '5a', name: 'Klasse 5a' },
  { key: '9b', name: 'Klasse 9b' },
]

const seedStudents: SeedStudent[] = [
  {
    key: 'lena-mueller',
    classKey: '5a',
    firstName: 'Lena',
    lastName: 'Müller',
  },
  {
    key: 'jonas-becker',
    classKey: '5a',
    firstName: 'Jonas',
    lastName: 'Becker',
  },
  {
    key: 'sophie-weiss',
    classKey: '5a',
    firstName: 'Sophie',
    lastName: 'Weiß',
  },
  {
    key: 'emil-schroeder',
    classKey: '5a',
    firstName: 'Emil',
    lastName: 'Schröder',
  },
  {
    key: 'marie-schneider',
    classKey: '9b',
    firstName: 'Marie',
    lastName: 'Schneider',
  },
  { key: 'tim-krueger', classKey: '9b', firstName: 'Tim', lastName: 'Krüger' },
  {
    key: 'paul-hoffmann',
    classKey: '9b',
    firstName: 'Paul',
    lastName: 'Hoffmann',
  },
  {
    key: 'alina-fischer',
    classKey: '9b',
    firstName: 'Alina',
    lastName: 'Fischer',
  },
]

const seedSubjects: SeedSubject[] = [
  { key: 'mathe-5a', classKey: '5a', name: 'Mathematik' },
  { key: 'deutsch-5a', classKey: '5a', name: 'Deutsch' },
  { key: 'englisch-5a', classKey: '5a', name: 'Englisch' },
  { key: 'sachkunde-5a', classKey: '5a', name: 'Sachkunde' },
  { key: 'mathe-9b', classKey: '9b', name: 'Mathematik' },
  { key: 'deutsch-9b', classKey: '9b', name: 'Deutsch' },
  { key: 'biologie-9b', classKey: '9b', name: 'Biologie' },
  { key: 'geschichte-9b', classKey: '9b', name: 'Geschichte' },
]

const seedAssessments: SeedAssessment[] = [
  {
    key: 'mathearbeit-5a-1',
    classKey: '5a',
    subjectKey: 'mathe-5a',
    title: 'Mathearbeit 1',
    type: 'written',
    date: new Date('2025-01-14'),
  },
  {
    key: 'diktat-5a-winter',
    classKey: '5a',
    subjectKey: 'deutsch-5a',
    title: 'Diktat: Winter',
    type: 'written',
    date: new Date('2025-02-03'),
  },
  {
    key: 'vokabeltest-5a-1',
    classKey: '5a',
    subjectKey: 'englisch-5a',
    title: 'Vokabeltest 1',
    type: 'written',
    date: new Date('2025-02-18'),
  },
  {
    key: 'klausur-9b-analysis',
    classKey: '9b',
    subjectKey: 'mathe-9b',
    title: 'Klausur: Analysis',
    type: 'written',
    date: new Date('2025-01-20'),
  },
  {
    key: 'muendliche-9b-zellbio',
    classKey: '9b',
    subjectKey: 'biologie-9b',
    title: 'Mündliche Note: Zellbiologie',
    type: 'oral',
    date: new Date('2025-02-05'),
  },
  {
    key: 'test-9b-weimar',
    classKey: '9b',
    subjectKey: 'geschichte-9b',
    title: 'Test: Weimarer Republik',
    type: 'written',
    date: new Date('2025-03-01'),
  },
]

const seedAssessmentGrades: SeedAssessmentGrade[] = [
  { assessmentKey: 'mathearbeit-5a-1', studentKey: 'lena-mueller', grade: 2.0 },
  { assessmentKey: 'mathearbeit-5a-1', studentKey: 'jonas-becker', grade: 3.0 },
  { assessmentKey: 'mathearbeit-5a-1', studentKey: 'sophie-weiss', grade: 1.5 },
  {
    assessmentKey: 'mathearbeit-5a-1',
    studentKey: 'emil-schroeder',
    grade: 2.75,
  },
  { assessmentKey: 'diktat-5a-winter', studentKey: 'lena-mueller', grade: 1.5 },
  { assessmentKey: 'diktat-5a-winter', studentKey: 'jonas-becker', grade: 2.5 },
  { assessmentKey: 'diktat-5a-winter', studentKey: 'sophie-weiss', grade: 2.0 },
  {
    assessmentKey: 'vokabeltest-5a-1',
    studentKey: 'lena-mueller',
    grade: 2.25,
  },
  { assessmentKey: 'vokabeltest-5a-1', studentKey: 'jonas-becker', grade: 3.5 },
  {
    assessmentKey: 'vokabeltest-5a-1',
    studentKey: 'emil-schroeder',
    grade: 2.0,
  },
  {
    assessmentKey: 'klausur-9b-analysis',
    studentKey: 'marie-schneider',
    grade: 2.0,
  },
  {
    assessmentKey: 'klausur-9b-analysis',
    studentKey: 'tim-krueger',
    grade: 3.0,
  },
  {
    assessmentKey: 'klausur-9b-analysis',
    studentKey: 'paul-hoffmann',
    grade: 2.5,
  },
  {
    assessmentKey: 'muendliche-9b-zellbio',
    studentKey: 'marie-schneider',
    grade: 1.75,
  },
  {
    assessmentKey: 'muendliche-9b-zellbio',
    studentKey: 'alina-fischer',
    grade: 2.25,
  },
  {
    assessmentKey: 'muendliche-9b-zellbio',
    studentKey: 'tim-krueger',
    grade: 2.5,
  },
  { assessmentKey: 'test-9b-weimar', studentKey: 'paul-hoffmann', grade: 2.0 },
  { assessmentKey: 'test-9b-weimar', studentKey: 'alina-fischer', grade: 1.5 },
  {
    assessmentKey: 'test-9b-weimar',
    studentKey: 'marie-schneider',
    grade: 2.75,
  },
]

/* 📖 # Why seed the example database only when empty?
Seeding should provide a stable, repeatable dataset without overwriting any
manual edits made during testing sessions. Checking for existing classes avoids
resetting the example data on every toggle while keeping the seed logic simple.
*/
export async function ensureExampleDatabaseSeeded() {
  if (getActiveDatabaseName() !== NOTENBANK_EXAMPLE_DB_NAME) {
    return
  }

  const existingClasses = await classRepository.findAll()
  if (existingClasses.length > 0) {
    return
  }

  const classEntries = await Promise.all(
    seedClasses.map(async (seed) => ({
      key: seed.key,
      entity: await classRepository.create({ name: seed.name }),
    }))
  )
  const classIdByKey = new Map(
    classEntries.map((entry) => [entry.key, entry.entity.id])
  )

  const subjectEntries = await Promise.all(
    seedSubjects.map(async (seed) => ({
      key: seed.key,
      entity: await subjectRepository.create({
        name: seed.name,
        classId: requireId(classIdByKey, seed.classKey, 'class'),
      }),
    }))
  )
  const subjectIdByKey = new Map(
    subjectEntries.map((entry) => [entry.key, entry.entity.id])
  )

  const studentEntries = await Promise.all(
    seedStudents.map(async (seed) => ({
      key: seed.key,
      entity: await studentRepository.create({
        firstName: seed.firstName,
        lastName: seed.lastName,
        classId: requireId(classIdByKey, seed.classKey, 'class'),
      }),
    }))
  )
  const studentIdByKey = new Map(
    studentEntries.map((entry) => [entry.key, entry.entity.id])
  )

  const assessmentEntries = await Promise.all(
    seedAssessments.map(async (seed) => ({
      key: seed.key,
      entity: await assessmentRepository.create({
        classId: requireId(classIdByKey, seed.classKey, 'class'),
        subjectId: requireId(subjectIdByKey, seed.subjectKey, 'subject'),
        title: seed.title,
        type: seed.type,
        date: seed.date,
      }),
    }))
  )
  const assessmentIdByKey = new Map(
    assessmentEntries.map((entry) => [entry.key, entry.entity.id])
  )

  await Promise.all(
    seedAssessmentGrades.map((seed) =>
      assessmentGradeRepository.create({
        assessmentId: requireId(
          assessmentIdByKey,
          seed.assessmentKey,
          'assessment'
        ),
        studentId: requireId(studentIdByKey, seed.studentKey, 'student'),
        grade: createGrade(seed.grade),
      })
    )
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, afterEach } = import.meta.vitest
  const { IDBFactory } = await import('fake-indexeddb')
  const { setDatabaseMode } = await import('../store/databaseStore')

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
    })
  })
}

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
  { key: '5a', name: '5a' },
  { key: '9b', name: '9b' },
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
    key: 'mia-wagner',
    classKey: '5a',
    firstName: 'Mia',
    lastName: 'Wagner',
  },
  {
    key: 'noah-richter',
    classKey: '5a',
    firstName: 'Noah',
    lastName: 'Richter',
  },
  {
    key: 'paula-klein',
    classKey: '5a',
    firstName: 'Paula',
    lastName: 'Klein',
  },
  {
    key: 'felix-hoffmann',
    classKey: '5a',
    firstName: 'Felix',
    lastName: 'Hoffmann',
  },
  {
    key: 'leo-schmitt',
    classKey: '5a',
    firstName: 'Leo',
    lastName: 'Schmitt',
  },
  {
    key: 'anna-maier',
    classKey: '5a',
    firstName: 'Anna',
    lastName: 'Maier',
  },
  {
    key: 'nina-schulz',
    classKey: '5a',
    firstName: 'Nina',
    lastName: 'Schulz',
  },
  {
    key: 'max-koenig',
    classKey: '5a',
    firstName: 'Max',
    lastName: 'König',
  },
  {
    key: 'marie-schneider',
    classKey: '9b',
    firstName: 'Marie',
    lastName: 'Schneider',
  },
  {
    key: 'tim-krueger',
    classKey: '9b',
    firstName: 'Tim',
    lastName: 'Krüger',
  },
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
  {
    key: 'benjamin-wolf',
    classKey: '9b',
    firstName: 'Benjamin',
    lastName: 'Wolf',
  },
  {
    key: 'laura-neumann',
    classKey: '9b',
    firstName: 'Laura',
    lastName: 'Neumann',
  },
  {
    key: 'julian-hartmann',
    classKey: '9b',
    firstName: 'Julian',
    lastName: 'Hartmann',
  },
  {
    key: 'lisa-krause',
    classKey: '9b',
    firstName: 'Lisa',
    lastName: 'Krause',
  },
  {
    key: 'tom-keller',
    classKey: '9b',
    firstName: 'Tom',
    lastName: 'Keller',
  },
  {
    key: 'sarah-meyer',
    classKey: '9b',
    firstName: 'Sarah',
    lastName: 'Meyer',
  },
  {
    key: 'david-lang',
    classKey: '9b',
    firstName: 'David',
    lastName: 'Lang',
  },
  {
    key: 'carla-bergmann',
    classKey: '9b',
    firstName: 'Carla',
    lastName: 'Bergmann',
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

const buildAssessmentsForSubject = (
  subject: SeedSubject,
  subjectIndex: number
): SeedAssessment[] => {
  const writtenCount = 6
  const oralCount = 2
  const baseDate = new Date(2025, 0, 6 + subjectIndex * 3)
  const assessments: SeedAssessment[] = []

  for (let i = 0; i < writtenCount; i += 1) {
    assessments.push({
      key: `${subject.key}-written-${i + 1}`,
      classKey: subject.classKey,
      subjectKey: subject.key,
      title: `Schriftlich ${i + 1}`,
      type: 'written',
      date: new Date(baseDate.getTime() + i * 14 * 24 * 60 * 60 * 1000),
    })
  }

  for (let i = 0; i < oralCount; i += 1) {
    assessments.push({
      key: `${subject.key}-oral-${i + 1}`,
      classKey: subject.classKey,
      subjectKey: subject.key,
      title: `Mündliche Note ${i + 1}`,
      type: 'oral',
      date: new Date(
        baseDate.getTime() + (writtenCount + i) * 14 * 24 * 60 * 60 * 1000
      ),
    })
  }

  return assessments
}

const seedAssessments: SeedAssessment[] = seedSubjects.flatMap(
  (subject, index) => buildAssessmentsForSubject(subject, index)
)

const gradeCycle = [
  1.0, 1.5, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 5.0,
]

const seedAssessmentGrades: SeedAssessmentGrade[] = seedAssessments.flatMap(
  (assessment, assessmentIndex) => {
    const studentsForClass = seedStudents.filter(
      (student) => student.classKey === assessment.classKey
    )
    return studentsForClass.map((student, studentIndex) => ({
      assessmentKey: assessment.key,
      studentKey: student.key,
      grade: gradeCycle[(assessmentIndex + studentIndex) % gradeCycle.length],
    }))
  }
)

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

/* 📖 # Why clear the example data via repository deletes instead of deleting the DB?
Repositories cache their IndexedDB connection. Clearing each store keeps the
cache intact while guaranteeing a clean slate for reseeding.
*/
export async function resetExampleDatabase() {
  if (getActiveDatabaseName() !== NOTENBANK_EXAMPLE_DB_NAME) {
    return
  }

  const [grades, assessments, subjects, students, classes] = await Promise.all([
    assessmentGradeRepository.findAll(),
    assessmentRepository.findAll(),
    subjectRepository.findAll(),
    studentRepository.findAll(),
    classRepository.findAll(),
  ])

  await Promise.all(
    grades.map((entry) => assessmentGradeRepository.delete(entry.id))
  )
  await Promise.all(
    assessments.map((entry) => assessmentRepository.delete(entry.id))
  )
  await Promise.all(subjects.map((entry) => subjectRepository.delete(entry.id)))
  await Promise.all(students.map((entry) => studentRepository.delete(entry.id)))
  await Promise.all(classes.map((entry) => classRepository.delete(entry.id)))

  await ensureExampleDatabaseSeeded()
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
    })
  })
}

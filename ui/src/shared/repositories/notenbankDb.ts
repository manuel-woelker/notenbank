import type { IndexConfig } from './IndexedDBRepository'

export const NOTENBANK_DB_NAME = 'notenbank'
export const NOTENBANK_EXAMPLE_DB_NAME = 'notenbank-example'
export const NOTENBANK_DB_VERSION = 7

const classIndexes: IndexConfig[] = [
  { name: 'name', keyPath: 'name', options: { unique: false } },
  { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
]

const studentIndexes: IndexConfig[] = [
  { name: 'classId', keyPath: 'classId', options: { unique: false } },
  { name: 'lastName', keyPath: 'lastName', options: { unique: false } },
  { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
]

const subjectIndexes: IndexConfig[] = [
  { name: 'classId', keyPath: 'classId', options: { unique: false } },
  { name: 'name', keyPath: 'name', options: { unique: false } },
  { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
]

const assessmentIndexes: IndexConfig[] = [
  { name: 'classId', keyPath: 'classId', options: { unique: false } },
  { name: 'subjectId', keyPath: 'subjectId', options: { unique: false } },
  { name: 'date', keyPath: 'date', options: { unique: false } },
]

const assessmentGradeIndexes: IndexConfig[] = [
  { name: 'assessmentId', keyPath: 'assessmentId', options: { unique: false } },
  { name: 'studentId', keyPath: 'studentId', options: { unique: false } },
  {
    name: 'assessmentStudent',
    keyPath: ['assessmentId', 'studentId'],
    options: { unique: true },
  },
]

const recentAssessmentIndexes: IndexConfig[] = [
  {
    name: 'assessmentId',
    keyPath: 'assessmentId',
    options: { unique: false },
  },
  {
    name: 'accessedAt',
    keyPath: 'accessedAt',
    options: { unique: false },
  },
]

const notenbankStores = {
  classes: classIndexes,
  students: studentIndexes,
  subjects: subjectIndexes,
  assessments: assessmentIndexes,
  assessmentGrades: assessmentGradeIndexes,
  recentAssessments: recentAssessmentIndexes,
}

/* 📖 # Why ensure all stores exist on any upgrade?
Any repository can trigger the IndexedDB version upgrade. We create every known
store during upgrade so a repository doesn't open a DB version without its store.
*/
export function ensureNotenbankStores(db: IDBDatabase) {
  for (const [storeName, indexes] of Object.entries(notenbankStores)) {
    if (!db.objectStoreNames.contains(storeName)) {
      const store = db.createObjectStore(storeName, { keyPath: 'id' })
      indexes.forEach((indexConfig) => {
        store.createIndex(
          indexConfig.name,
          indexConfig.keyPath,
          indexConfig.options
        )
      })
    }
  }
}

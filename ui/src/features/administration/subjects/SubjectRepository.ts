import { z } from 'zod'
import { Subject, CreateSubjectInput } from './SubjectTypes'
import { createRepository } from '../../../shared/repositories/createRepository'
import type { Repository } from '../../../shared/repositories/Repository'
import {
  ensureNotenbankStores,
  NOTENBANK_DB_VERSION,
} from '../../../shared/repositories/notenbankDb'
import { getActiveDatabaseName } from '../../../shared/store/databaseStore'

const STORE_NAME = 'subjects'

export type SubjectRepository = Repository<Subject, CreateSubjectInput>

const subjectSchemas = {
  entity: z.object({
    id: z.string(),
    name: z.string().min(1),
    classId: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  create: z.object({
    name: z.string().min(1),
    classId: z.string().min(1),
  }),
  update: z.object({
    name: z.string().min(1).optional(),
    classId: z.string().min(1).optional(),
  }),
}

export const subjectRepository: SubjectRepository = createRepository<
  Subject,
  CreateSubjectInput
>({
  dbName: getActiveDatabaseName,
  dbVersion: NOTENBANK_DB_VERSION,
  storeName: STORE_NAME,
  indexes: [
    { name: 'classId', keyPath: 'classId', options: { unique: false } },
    { name: 'name', keyPath: 'name', options: { unique: false } },
    { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
  ],
  schemas: subjectSchemas,
  onUpgrade: ensureNotenbankStores,
})

if (import.meta.vitest) {
  const { describe, it, expect, beforeAll } = import.meta.vitest
  const { IDBFactory } = await import('fake-indexeddb')

  describe('subjectRepository', () => {
    beforeAll(() => {
      globalThis.indexedDB = new IDBFactory()
    })

    it('creates and retrieves subjects for a class', async () => {
      const created = await subjectRepository.create({
        name: 'Mathe',
        classId: 'class-1',
      })

      const found = await subjectRepository.findById(created.id)

      expect(found).toMatchObject({
        id: created.id,
        name: 'Mathe',
        classId: 'class-1',
      })
    })
  })
}

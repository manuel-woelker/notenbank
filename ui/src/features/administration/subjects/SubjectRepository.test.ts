import { beforeAll, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { subjectRepository } from './SubjectRepository'

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

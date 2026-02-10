import { describe, expect, it } from 'vitest'
import { generateId } from './generateId'

const KSUID_STRING_LENGTH = 27

describe('generateId', () => {
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()))

    expect(ids.size).toBe(500)
  })

  it('adds the prefix when provided', () => {
    const id = generateId('klasse')

    expect(id.startsWith('klasse-')).toBe(true)
    expect(id.length).toBeGreaterThan('klasse-'.length)
  })

  it('returns base62 ids', () => {
    const id = generateId()

    expect(id).toMatch(/^[0-9A-Za-z]+$/)
  })

  it('returns ids in ksuid length', () => {
    const id = generateId()

    expect(id).toHaveLength(KSUID_STRING_LENGTH)
  })
})

/* 📖 # Why centralize id generation in generateId?
Using a single helper makes it easy to standardize id formats across the app
and keep a secure fallback when `crypto.randomUUID` is not available.
*/
const createRandomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length)

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
    return bytes
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256)
  }

  return bytes
}

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

const createFallbackId = (): string => {
  const timePart = Date.now().toString(36)
  const randomPart = bytesToHex(createRandomBytes(10))
  return `${timePart}-${randomPart}`
}

export const generateId = (prefix?: string): string => {
  const baseId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : createFallbackId()

  return prefix ? `${prefix}-${baseId}` : baseId
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

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

    it('returns lowercase ascii ids', () => {
      const id = generateId()

      expect(id).toMatch(/^[a-z0-9-]+$/)
    })
  })
}

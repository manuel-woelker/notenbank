import { describe, expect, it } from 'vitest'
import { createGrade, gradeFromString, gradeToString } from './Grade'

const canonicalGradeCases: Array<[number, string]> = [
  [0.75, '1+'],
  [1.0, '1'],
  [1.25, '1-'],
  [1.5, '1-2'],
  [1.75, '2+'],
  [2.0, '2'],
  [2.25, '2-'],
  [2.5, '2-3'],
  [2.75, '3+'],
  [3.0, '3'],
  [3.25, '3-'],
  [3.5, '3-4'],
  [3.75, '4+'],
  [4.0, '4'],
  [4.25, '4-'],
  [4.5, '4-5'],
  [4.75, '5+'],
  [5.0, '5'],
  [5.25, '5-'],
  [5.5, '5-6'],
  [5.75, '6+'],
  [6.0, '6'],
]

describe('createGrade', () => {
  it('returns the numeric value unchanged', () => {
    const grade = createGrade(1.7)

    expect(grade).toBe(1.7)
    expect(typeof grade).toBe('number')
  })
})

describe('gradeToString', () => {
  describe('formats every 0.25 increment from 0.75 to 6.0', () => {
    canonicalGradeCases.forEach(([value, label]) => {
      it(`formats ${value} as ${label}`, () => {
        expect(gradeToString(createGrade(value))).toBe(label)
      })
    })
  })

  it('formats out-of-bounds values without throwing', () => {
    const cases: Array<[number, string]> = [
      [0.5, '0.50'],
      [0.25, '0.25'],
      [0.0, '0.00'],
      [-0.25, '-0.25'],
      [6.25, '6.25'],
      [6.5, '6.50'],
      [6.75, '6.75'],
    ]

    cases.forEach(([value, label]) => {
      expect(gradeToString(createGrade(value))).toBe(label)
    })
  })

  it('formats NaN and infinities via decimal fallback', () => {
    const cases: Array<[number, string]> = [
      [Number.NaN, 'NaN'],
      [Number.POSITIVE_INFINITY, 'Infinity'],
      [Number.NEGATIVE_INFINITY, '-Infinity'],
    ]

    cases.forEach(([value, label]) => {
      expect(gradeToString(createGrade(value))).toBe(label)
    })
  })
})

describe('gradeFromString', () => {
  describe('parses canonical grade strings', () => {
    canonicalGradeCases.forEach(([expected, value]) => {
      it(`parses ${value} as ${expected}`, () => {
        expect(gradeFromString(value)).toBe(expected)
      })
    })
  })

  it('parses decimals with dots or commas', () => {
    const cases: Array<[string, number]> = [
      ['0.75', 0.75],
      ['0,75', 0.75],
      ['1.00', 1],
      ['1,00', 1],
      ['2.5', 2.5],
      ['2,5', 2.5],
      [' 2,50 ', 2.5],
      ['-0.25', -0.25],
      ['-0,25', -0.25],
      ['6.75', 6.75],
      ['1.', 1],
      ['1,', 1],
    ]

    cases.forEach(([value, expected]) => {
      expect(gradeFromString(value)).toBe(expected)
    })
  })

  it('returns null for invalid inputs', () => {
    const cases: string[] = [
      '',
      ' ',
      'abc',
      '1,2,3',
      '1.2.3',
      '1--2',
      '2++',
      '2-2',
      '1-3',
      '2-4',
      '+2',
      '-',
      ',',
      '.',
    ]

    cases.forEach((value) => {
      expect(gradeFromString(value)).toBeNull()
    })
  })
})

/* 📖 # Why brand Grade instead of using number directly?
Using a branded type prevents accidentally mixing grades with other numeric values
without adding any runtime cost, while keeping the stored value a number.
*/
export type Grade = number & { readonly __brand: 'Grade' }

export const createGrade = (value: number): Grade => value as Grade

/* 📖 # Why format grades with a dedicated function?
Centralizing formatting keeps UI strings consistent and protects against invalid
grade values, while documenting the German grading conventions in one place.

## Requirement: apply + and - suffix rules to all grades
Grades in 0.25 steps use German suffixes for every value:
- `x.25` => `x-`
- `x.50` => `x-(x+1)`
- `x.75` => `(x+1)+`
*/
/* 📖 # Why avoid range checks in gradeToString?
Out-of-range grades should surface as soft errors in the UI, so formatting stays
non-throwing and lets the UI decide how to communicate validation issues.
*/
export const gradeToString = (grade: Grade): string => {
  if (grade < 0.75 || grade > 6) {
    return grade.toFixed(2)
  }

  const base = Math.floor(grade)
  const fractional = Number((grade - base).toFixed(2))

  if (fractional === 0.75) {
    return `${base + 1}+`
  }

  if (fractional === 0.5) {
    return `${base}-${base + 1}`
  }

  if (fractional === 0.25) {
    return `${base}-`
  }

  if (fractional === 0) {
    return `${base}`
  }

  return grade.toFixed(2).replace(/\.00$/, '')
}

export const gradeFromString = (value: string): Grade | null => {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return null
  }

  const plusMatch = trimmed.match(/^(\d+)\+$/)
  if (plusMatch) {
    return createGrade(Number(plusMatch[1]) - 0.25)
  }

  const minusMatch = trimmed.match(/^(\d+)-$/)
  if (minusMatch) {
    return createGrade(Number(minusMatch[1]) + 0.25)
  }

  const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/)
  if (rangeMatch) {
    const lower = Number(rangeMatch[1])
    const upper = Number(rangeMatch[2])
    if (upper === lower + 1) {
      return createGrade(lower + 0.5)
    }
    return null
  }

  const normalized = trimmed.replace(',', '.')
  if (!/^-?\d+(\.\d*)?$/.test(normalized)) {
    return null
  }

  return createGrade(Number(normalized))
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
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
}

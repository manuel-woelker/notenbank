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

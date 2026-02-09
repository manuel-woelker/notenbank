/* 📖 # Why brand Grade instead of using number directly?
Using a branded type prevents accidentally mixing grades with other numeric values
without adding any runtime cost, while keeping the stored value a number.
*/
export type Grade = number & { readonly __brand: 'Grade' }

export const createGrade = (value: number): Grade => value as Grade

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('createGrade', () => {
    it('returns the numeric value unchanged', () => {
      const grade = createGrade(1.7)

      expect(grade).toBe(1.7)
      expect(typeof grade).toBe('number')
    })
  })
}

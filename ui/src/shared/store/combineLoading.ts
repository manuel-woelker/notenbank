/**
 * Combines multiple loading states into a single boolean
 *
 * @param loadingStates - Array of boolean loading states
 * @returns True if any loading state is true
 *
 * @example
 * ```typescript
 * const isLoading = combineLoading(
 *   classesLoading,
 *   subjectsLoading,
 *   studentsLoading
 * )
 * ```
 */
export function combineLoading(...loadingStates: boolean[]): boolean {
  return loadingStates.some(Boolean)
}

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('combineLoading', () => {
    it('returns false when all states are false', () => {
      expect(combineLoading(false, false, false)).toBe(false)
    })

    it('returns true when any state is true', () => {
      expect(combineLoading(true, false, false)).toBe(true)
      expect(combineLoading(false, true, false)).toBe(true)
      expect(combineLoading(false, false, true)).toBe(true)
    })

    it('returns true when all states are true', () => {
      expect(combineLoading(true, true, true)).toBe(true)
    })

    it('works with a single state', () => {
      expect(combineLoading(false)).toBe(false)
      expect(combineLoading(true)).toBe(true)
    })

    it('works with no states', () => {
      expect(combineLoading()).toBe(false)
    })
  })
}

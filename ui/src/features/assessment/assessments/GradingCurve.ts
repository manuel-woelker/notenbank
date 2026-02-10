import { createGrade, Grade } from '../../../shared/Grade'

export interface GradeCurveAnchors {
  grade1Value: number
  grade4Value: number
}

/* 📖 # Why clamp and round the computed grade?
Teachers enter raw points or errors, but grades must stay within the German
grading scale and be expressed in 0.25 steps. Clamping keeps values within
the allowed band, and rounding to 0.25 ensures consistent output for display
and downstream calculations.
*/
export const calculateLinearGradeFromAnchors = (
  value: number,
  anchors: GradeCurveAnchors
): Grade => {
  if (anchors.grade1Value === anchors.grade4Value) {
    throw new Error('Grade curve anchors must use distinct values.')
  }

  const slope = (4 - 1) / (anchors.grade4Value - anchors.grade1Value)
  const intercept = 1 - slope * anchors.grade1Value

  const rawGrade = value * slope + intercept
  const clamped = Math.min(6, Math.max(0.75, rawGrade))
  const rounded = Math.round(clamped / 0.25) * 0.25
  const finalGrade = Math.min(6, Math.max(0.75, rounded))

  return createGrade(finalGrade)
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('calculateLinearGradeFromAnchors', () => {
    const anchors: GradeCurveAnchors = {
      grade1Value: 60,
      grade4Value: 20,
    }
    const slope = (4 - 1) / (anchors.grade4Value - anchors.grade1Value)
    const intercept = 1 - slope * anchors.grade1Value
    const computeExpected = (value: number) => {
      const rawGrade = value * slope + intercept
      const clamped = Math.min(6, Math.max(0.75, rawGrade))
      const rounded = Math.round(clamped / 0.25) * 0.25

      return Math.min(6, Math.max(0.75, rounded))
    }

    it('maps anchor values to the expected grades', () => {
      expect(
        calculateLinearGradeFromAnchors(anchors.grade1Value, anchors)
      ).toBeCloseTo(1, 10)
      expect(
        calculateLinearGradeFromAnchors(anchors.grade4Value, anchors)
      ).toBeCloseTo(4, 10)
    })

    it('computes grades for every half-point value from 0 to 60', () => {
      const values = Array.from({ length: 121 }, (_, index) => index * 0.5)

      values.forEach((value) => {
        const expected = computeExpected(value)

        expect(calculateLinearGradeFromAnchors(value, anchors)).toBeCloseTo(
          expected,
          10
        )
      })
    })

    it('rejects identical anchors', () => {
      expect(() =>
        calculateLinearGradeFromAnchors(10, {
          grade1Value: 5,
          grade4Value: 5,
        })
      ).toThrow('Grade curve anchors must use distinct values.')
    })
  })
}

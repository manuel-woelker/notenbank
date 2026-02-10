import { createGrade, Grade } from '../../../shared/Grade'

export interface GradeCurveAnchors {
  grade1Value: number
  grade4Value: number
}

export type GradingCurveMode = 'points' | 'errors'

export interface GradingCurveConfig extends GradeCurveAnchors {
  mode: GradingCurveMode
}

export interface GradingTableEntry {
  grade: Grade
  minimumPoints: number
}

const getLinearGradeParameters = (anchors: GradeCurveAnchors) => {
  if (anchors.grade1Value === anchors.grade4Value) {
    throw new Error('Grade curve anchors must use distinct values.')
  }

  const slope = (4 - 1) / (anchors.grade4Value - anchors.grade1Value)
  const intercept = 1 - slope * anchors.grade1Value

  return { slope, intercept }
}

const roundUpToHalfPoint = (value: number) => Math.ceil(value * 2) / 2

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
  const { slope, intercept } = getLinearGradeParameters(anchors)

  const rawGrade = value * slope + intercept
  const clamped = Math.min(6, Math.max(0.75, rawGrade))
  const rounded = Math.ceil(clamped / 0.25) * 0.25
  const finalGrade = Math.min(6, Math.max(0.75, rounded))

  return createGrade(finalGrade)
}

export const calculateGradeFromCurve = (
  value: number,
  curve: GradingCurveConfig
): Grade => {
  if (curve.mode === 'errors') {
    return calculateLinearGradeFromAnchors(-value, {
      grade1Value: -curve.grade1Value,
      grade4Value: -curve.grade4Value,
    })
  }

  return calculateLinearGradeFromAnchors(value, curve)
}

/* 📖 # Why derive grade thresholds from the rounding boundaries?
The grading curve rounds to 0.25 steps, so the minimum points that guarantee
a grade must be aligned to the 0.25 rounding window. Using the upper rounding
boundary and then snapping to 0.5 point increments ensures the table matches
the actual grade calculation and the typical scoring resolution.
*/
export const generateGradingTable = (
  anchors: GradeCurveAnchors
): GradingTableEntry[] => {
  const { slope, intercept } = getLinearGradeParameters(anchors)

  if (slope >= 0) {
    throw new Error(
      'Grading tables require higher values to map to better grades.'
    )
  }

  const grades = Array.from({ length: 22 }, (_, index) =>
    createGrade(0.75 + index * 0.25)
  )

  return grades.map((grade) => {
    const rawUpperBound = Math.min(6, grade)
    const threshold = (rawUpperBound - intercept) / slope
    let minimumPoints = roundUpToHalfPoint(threshold)

    while (calculateLinearGradeFromAnchors(minimumPoints, anchors) > grade) {
      minimumPoints += 0.5
    }

    if (grade < 6) {
      while (
        calculateLinearGradeFromAnchors(minimumPoints - 0.5, anchors) <= grade
      ) {
        minimumPoints -= 0.5
      }
    }

    return { grade, minimumPoints }
  })
}

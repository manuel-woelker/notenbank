import { describe, expect, it } from 'vitest'
import { createGrade } from '../../../shared/Grade'
import {
  calculateGradeFromCurve,
  calculateLinearGradeFromAnchors,
  generateGradingTable,
  GradeCurveAnchors,
  GradingCurveConfig,
  GradingTableEntry,
} from './GradingCurve'

describe('calculateLinearGradeFromAnchors', () => {
  const anchors: GradeCurveAnchors = {
    grade1Value: 60,
    grade4Value: 30,
  }
  const gradeCases: Array<[number, number]> = [
    [0.0, 6.0],
    [0.5, 6.0],
    [1.0, 6.0],
    [1.5, 6.0],
    [2.0, 6.0],
    [2.5, 6.0],
    [3.0, 6.0],
    [3.5, 6.0],
    [4.0, 6.0],
    [4.5, 6.0],
    [5.0, 6.0],
    [5.5, 6.0],
    [6.0, 6.0],
    [6.5, 6.0],
    [7.0, 6.0],
    [7.5, 6.0],
    [8.0, 6.0],
    [8.5, 6.0],
    [9.0, 6.0],
    [9.5, 6.0],
    [10.0, 6.0],
    [10.5, 6.0],
    [11.0, 6.0],
    [11.5, 6.0],
    [12.0, 6.0],
    [12.5, 5.75],
    [13.0, 5.75],
    [13.5, 5.75],
    [14.0, 5.75],
    [14.5, 5.75],
    [15.0, 5.5],
    [15.5, 5.5],
    [16.0, 5.5],
    [16.5, 5.5],
    [17.0, 5.5],
    [17.5, 5.25],
    [18.0, 5.25],
    [18.5, 5.25],
    [19.0, 5.25],
    [19.5, 5.25],
    [20.0, 5.0],
    [20.5, 5.0],
    [21.0, 5.0],
    [21.5, 5.0],
    [22.0, 5.0],
    [22.5, 4.75],
    [23.0, 4.75],
    [23.5, 4.75],
    [24.0, 4.75],
    [24.5, 4.75],
    [25.0, 4.5],
    [25.5, 4.5],
    [26.0, 4.5],
    [26.5, 4.5],
    [27.0, 4.5],
    [27.5, 4.25],
    [28.0, 4.25],
    [28.5, 4.25],
    [29.0, 4.25],
    [29.5, 4.25],
    [30.0, 4.0],
    [30.5, 4.0],
    [31.0, 4.0],
    [31.5, 4.0],
    [32.0, 4.0],
    [32.5, 3.75],
    [33.0, 3.75],
    [33.5, 3.75],
    [34.0, 3.75],
    [34.5, 3.75],
    [35.0, 3.5],
    [35.5, 3.5],
    [36.0, 3.5],
    [36.5, 3.5],
    [37.0, 3.5],
    [37.5, 3.25],
    [38.0, 3.25],
    [38.5, 3.25],
    [39.0, 3.25],
    [39.5, 3.25],
    [40.0, 3.0],
    [40.5, 3.0],
    [41.0, 3.0],
    [41.5, 3.0],
    [42.0, 3.0],
    [42.5, 2.75],
    [43.0, 2.75],
    [43.5, 2.75],
    [44.0, 2.75],
    [44.5, 2.75],
    [45.0, 2.5],
    [45.5, 2.5],
    [46.0, 2.5],
    [46.5, 2.5],
    [47.0, 2.5],
    [47.5, 2.25],
    [48.0, 2.25],
    [48.5, 2.25],
    [49.0, 2.25],
    [49.5, 2.25],
    [50.0, 2.0],
    [50.5, 2.0],
    [51.0, 2.0],
    [51.5, 2.0],
    [52.0, 2.0],
    [52.5, 1.75],
    [53.0, 1.75],
    [53.5, 1.75],
    [54.0, 1.75],
    [54.5, 1.75],
    [55.0, 1.5],
    [55.5, 1.5],
    [56.0, 1.5],
    [56.5, 1.5],
    [57.0, 1.5],
    [57.5, 1.25],
    [58.0, 1.25],
    [58.5, 1.25],
    [59.0, 1.25],
    [59.5, 1.25],
    [60.0, 1.0],
    [60.5, 1.0],
    [61.0, 1.0],
    [61.5, 1.0],
    [62.0, 1.0],
    [62.5, 0.75],
    [63.0, 0.75],
    [63.5, 0.75],
    [64.0, 0.75],
    [64.5, 0.75],
    [65.0, 0.75],
    [65.5, 0.75],
    [66.0, 0.75],
    [66.5, 0.75],
    [67.0, 0.75],
    [67.5, 0.75],
    [68.0, 0.75],
    [68.5, 0.75],
    [69.0, 0.75],
    [69.5, 0.75],
    [70.0, 0.75],
  ]

  it('maps anchor values to the expected grades', () => {
    expect(
      calculateLinearGradeFromAnchors(anchors.grade1Value, anchors)
    ).toBeCloseTo(1, 10)
    expect(
      calculateLinearGradeFromAnchors(anchors.grade4Value, anchors)
    ).toBeCloseTo(4, 10)
  })

  it('computes grades for every half-point value from 0 to 60', () => {
    gradeCases.forEach(([value, expected]) => {
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

describe('calculateGradeFromCurve', () => {
  it('maps error counts to grades by inverting the curve', () => {
    const curve: GradingCurveConfig = {
      mode: 'errors',
      grade1Value: 2,
      grade4Value: 12,
    }

    expect(calculateGradeFromCurve(2, curve)).toBeCloseTo(1, 10)
    expect(calculateGradeFromCurve(12, curve)).toBeCloseTo(4, 10)
    expect(calculateGradeFromCurve(7, curve)).toBeCloseTo(2.5, 10)
  })
})

describe('generateGradingTable', () => {
  const anchors: GradeCurveAnchors = {
    grade1Value: 60,
    grade4Value: 30,
  }

  it('returns thresholds for every grade step from 0.75 to 6.0', () => {
    const table = generateGradingTable(anchors)

    expect(table).toHaveLength(22)
    expect(table[0].grade).toBe(0.75)
    expect(table[table.length - 1].grade).toBe(6)
  })

  it('aligns minimum points to 0.5 steps and satisfies grade thresholds', () => {
    const table = generateGradingTable(anchors)
    const expected: GradingTableEntry[] = [
      { grade: createGrade(0.75), minimumPoints: 62.5 },
      { grade: createGrade(1.0), minimumPoints: 60.0 },
      { grade: createGrade(1.25), minimumPoints: 57.5 },
      { grade: createGrade(1.5), minimumPoints: 55.0 },
      { grade: createGrade(1.75), minimumPoints: 52.5 },
      { grade: createGrade(2.0), minimumPoints: 50.0 },
      { grade: createGrade(2.25), minimumPoints: 47.5 },
      { grade: createGrade(2.5), minimumPoints: 45.0 },
      { grade: createGrade(2.75), minimumPoints: 42.5 },
      { grade: createGrade(3.0), minimumPoints: 40.0 },
      { grade: createGrade(3.25), minimumPoints: 37.5 },
      { grade: createGrade(3.5), minimumPoints: 35.0 },
      { grade: createGrade(3.75), minimumPoints: 32.5 },
      { grade: createGrade(4.0), minimumPoints: 30.0 },
      { grade: createGrade(4.25), minimumPoints: 27.5 },
      { grade: createGrade(4.5), minimumPoints: 25.0 },
      { grade: createGrade(4.75), minimumPoints: 22.5 },
      { grade: createGrade(5.0), minimumPoints: 20.0 },
      { grade: createGrade(5.25), minimumPoints: 17.5 },
      { grade: createGrade(5.5), minimumPoints: 15.0 },
      { grade: createGrade(5.75), minimumPoints: 12.5 },
      { grade: createGrade(6.0), minimumPoints: 10.0 },
    ]

    expect(table).toEqual(expected)
  })

  it('rejects curves where higher values produce worse grades', () => {
    expect(() =>
      generateGradingTable({
        grade1Value: 5,
        grade4Value: 10,
      })
    ).toThrow('Grading tables require higher values to map to better grades.')
  })
})

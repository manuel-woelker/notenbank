import { describe, expect, it } from 'vitest'
import type { Class } from '../../features/administration/classes/ClassTypes'
import type { Subject } from '../../features/administration/subjects/SubjectTypes'
import type { Assessment } from '../../features/assessment/assessments/AssessmentTypes'
import { buildClassRouteSegment } from '../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../shared/routes/subjectRoute'
import { buildAssessmentRouteSegment } from '../../shared/routes/assessmentRoute'
import { resolveSidebarContext } from './resolveSidebarContext'

describe('resolveSidebarContext', () => {
  const timestamp = new Date('2025-01-01T00:00:00.000Z')
  const classes: Class[] = [
    {
      id: 'c-1',
      name: 'Klasse A',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'c-2',
      name: 'Klasse B',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]
  const subjects: Subject[] = [
    {
      id: 's-1',
      classId: 'c-1',
      name: 'Deutsch',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]
  const assessments: Assessment[] = [
    {
      id: 'a-1',
      classId: 'c-1',
      subjectId: 's-1',
      title: 'Klausur 1',
      type: 'written',
      date: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]

  it('selects class context for class routes', () => {
    const classSegment = buildClassRouteSegment(classes, 'c-1')
    const context = resolveSidebarContext(
      `/classes/${classSegment}`,
      classes,
      subjects,
      assessments
    )

    expect(context.showClassTree).toBe(true)
    expect(context.selectedKey).toBe('class:c-1')
    expect(context.openKeys).toEqual(['classes', 'class:c-1'])
  })

  it('selects subject context for subject routes', () => {
    const classSegment = buildClassRouteSegment(classes, 'c-1')
    const subjectSegment = buildSubjectRouteSegment(subjects, 'c-1', 's-1')
    const context = resolveSidebarContext(
      `/classes/${classSegment}/subjects/${subjectSegment}`,
      classes,
      subjects,
      assessments
    )

    expect(context.selectedKey).toBe('subject:s-1')
    expect(context.openKeys).toEqual(['classes', 'class:c-1', 'subject:s-1'])
  })

  it('selects assessment context for assessment routes', () => {
    const classSegment = buildClassRouteSegment(classes, 'c-1')
    const subjectSegment = buildSubjectRouteSegment(subjects, 'c-1', 's-1')
    const assessmentSegment = buildAssessmentRouteSegment(
      assessments,
      'c-1',
      's-1',
      'a-1'
    )
    const context = resolveSidebarContext(
      `/classes/${classSegment}/subjects/${subjectSegment}/assessments/${assessmentSegment}`,
      classes,
      subjects,
      assessments
    )

    expect(context.selectedKey).toBe('assessment:a-1')
    expect(context.openKeys).toEqual(['classes', 'class:c-1', 'subject:s-1'])
  })

  it('falls back to top-level selection outside class routes', () => {
    const context = resolveSidebarContext(
      '/content',
      classes,
      subjects,
      assessments
    )

    expect(context.showClassTree).toBe(false)
    expect(context.selectedKey).toBe('dashboard')
    expect(context.openKeys).toEqual([])
  })

  it('selects changelog menu item for changelog routes', () => {
    const context = resolveSidebarContext(
      '/aenderungsverlauf',
      classes,
      subjects,
      assessments
    )

    expect(context.showClassTree).toBe(false)
    expect(context.selectedKey).toBe('changelog')
    expect(context.openKeys).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'
import { buildProductTourSteps } from './productTour'

describe('buildProductTourSteps', () => {
  it('maps routes to the expected sequence', () => {
    const routes = {
      classList: '/classes',
      classOverview: '/classes/5a',
      subjectOverview: '/classes/5a/subjects/mathe',
      assessmentRoute: '/classes/5a/subjects/mathe/assessments/kl-1',
      studentRoute: '/classes/5a/students/lena-mueller',
    }

    const steps = buildProductTourSteps(routes)

    expect(steps.map((step) => step.route)).toEqual([
      routes.classList,
      routes.classList,
      routes.classList,
      routes.classList,
      routes.classOverview,
      routes.classOverview,
      routes.subjectOverview,
      routes.assessmentRoute,
      routes.assessmentRoute,
      routes.studentRoute,
      routes.studentRoute,
    ])
  })

  it('uses German copy for titles and descriptions', () => {
    const steps = buildProductTourSteps({
      classList: '/classes',
      classOverview: '/classes/5a',
      subjectOverview: '/classes/5a/subjects/mathe',
      assessmentRoute: '/classes/5a/subjects/mathe/assessments/kl-1',
      studentRoute: '/classes/5a/students/lena-mueller',
    })

    steps.forEach((step) => {
      expect(typeof step.title).toBe('string')
      if (typeof step.title === 'string') {
        expect(step.title.length).toBeGreaterThan(0)
      }
      expect(typeof step.description).toBe('string')
      if (typeof step.description === 'string') {
        expect(step.description.length).toBeGreaterThan(0)
      }
    })
  })
})

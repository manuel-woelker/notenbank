import { expect, test } from '@playwright/test'
import { ClassListPage } from '../../pages/ClassListPage'
import { ClassOverviewPage } from '../../pages/ClassOverviewPage'
import { SubjectOverviewPage } from '../../pages/SubjectOverviewPage'
import { createE2eRunId } from '../../support/createE2eRunId'

test('creates an assessment for a subject', async ({ page }) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const subjectName = `Mathe-${runId}`
  const assessmentTitle = `Klausur-${runId}`
  const classListPage = new ClassListPage(page, runId)
  const classOverviewPage = new ClassOverviewPage(page)
  const subjectOverviewPage = new SubjectOverviewPage(page)

  await classListPage.goto()
  await classListPage.createClass(className)
  await classListPage.openClass(className)

  await classOverviewPage.addSubject(subjectName)
  await classOverviewPage.openSubject(subjectName)

  await expect(
    page.getByRole('heading', { name: `Fach ${subjectName}` })
  ).toBeVisible()

  await subjectOverviewPage.createAssessment(
    assessmentTitle,
    'Schriftlich',
    '2025-05-12'
  )

  await expect(page.getByRole('link', { name: assessmentTitle })).toBeVisible()
})

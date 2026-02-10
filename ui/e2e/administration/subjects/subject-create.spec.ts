import { expect, test } from '@playwright/test'
import { ClassListPage } from '../../pages/ClassListPage'
import { ClassOverviewPage } from '../../pages/ClassOverviewPage'
import { createE2eRunId } from '../../support/createE2eRunId'

test('creates a subject in a class', async ({ page }) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const subjectName = `Mathe-${runId}`
  const classListPage = new ClassListPage(page, runId)
  const classOverviewPage = new ClassOverviewPage(page)

  await classListPage.goto()
  await classListPage.createClass(className)
  await classListPage.openClass(className)

  await expect(
    page.getByRole('heading', { name: `Klasse ${className}` })
  ).toBeVisible()

  await classOverviewPage.addSubject(subjectName)

  await expect(page.getByRole('link', { name: subjectName })).toBeVisible()
})

import { expect, test } from '@playwright/test'
import { ClassListPage } from '../../pages/ClassListPage'
import { ClassOverviewPage } from '../../pages/ClassOverviewPage'
import { createE2eRunId } from '../../support/createE2eRunId'

test('creates a student in a class', async ({ page }) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const studentFirstName = 'Tara'
  const studentLastName = `Schueler-${runId}`
  const classListPage = new ClassListPage(page, runId)
  const classOverviewPage = new ClassOverviewPage(page)

  await classListPage.goto()
  await classListPage.createClass(className)
  await classListPage.openClass(className)

  await expect(
    page.getByRole('heading', { name: `Klasse ${className}` })
  ).toBeVisible()

  await classOverviewPage.addStudent(studentFirstName, studentLastName)

  await expect(page.getByText(studentFirstName)).toBeVisible()
  await expect(page.getByText(studentLastName)).toBeVisible()
})

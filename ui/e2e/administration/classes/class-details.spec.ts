import { expect, test } from '@playwright/test'
import { ClassListPage } from '../../pages/ClassListPage'
import { createE2eRunId } from '../../support/createE2eRunId'

test('shows class details with empty subject and student lists', async ({
  page,
}) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const classListPage = new ClassListPage(page, runId)

  await classListPage.goto()
  await classListPage.createClass(className)
  await classListPage.openClass(className)

  await expect(
    page.getByRole('heading', { name: `Klasse ${className}` })
  ).toBeVisible()
  await expect(page.getByPlaceholder('Vorname')).toBeVisible()
  await expect(page.getByPlaceholder('Nachname')).toBeVisible()
  await expect(page.getByPlaceholder('Fachname')).toBeVisible()
})

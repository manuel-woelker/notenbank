import { expect, test } from '@playwright/test'
import { ClassListPage } from './pages/ClassListPage'
import { createE2eRunId } from './support/createE2eRunId'

test('creates a class', async ({ page }) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const classListPage = new ClassListPage(page, runId)

  await classListPage.goto()
  await classListPage.createClass(className)

  await expect(page.getByRole('link', { name: className })).toBeVisible()
})

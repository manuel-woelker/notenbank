import { expect, test } from '@playwright/test'

test('creates a class', async ({ page }) => {
  const runId = `e2e-${Date.now()}`
  const className = `Klasse E2E ${runId}`

  await page.goto(`/#/classes?db=${runId}`)

  await page.getByPlaceholder('Neuer Klassenname').fill(className)
  await page.getByRole('button', { name: 'Hinzufügen' }).click()

  await expect(page.getByRole('link', { name: className })).toBeVisible()
})

import type { Page } from '@playwright/test'

type AssessmentTypeLabel = 'Schriftlich' | 'Mündlich'

export class SubjectOverviewPage {
  constructor(private readonly page: Page) {}

  async createAssessment(
    title: string,
    type: AssessmentTypeLabel,
    date: string
  ) {
    await this.page.getByPlaceholder('z.B. Klausur 1').fill(title)
    await this.page.getByRole('combobox').click()
    await this.page.getByText(type).click()
    await this.page.locator('input[type="date"]').fill(date)
    await this.page.getByRole('button', { name: 'Hinzufügen' }).click()
  }

  async openAssessment(title: string) {
    await this.page.getByRole('link', { name: title }).click()
  }
}

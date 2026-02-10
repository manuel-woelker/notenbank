import type { Page } from '@playwright/test'

export class AssessmentPage {
  constructor(private readonly page: Page) {}

  async setGrade(firstName: string, lastName: string, grade: string) {
    await this.page.getByLabel(`Note für ${firstName} ${lastName}`).fill(grade)
  }
}

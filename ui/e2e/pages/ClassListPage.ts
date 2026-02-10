import type { Page } from '@playwright/test'

export class ClassListPage {
  constructor(
    private readonly page: Page,
    private readonly dbParam: string
  ) {}

  async goto() {
    await this.page.goto(`/#/classes?db=${this.dbParam}`)
  }

  async createClass(name: string) {
    await this.page.getByPlaceholder('Neuer Klassenname').fill(name)
    await this.page.getByRole('button', { name: 'Hinzufügen' }).click()
  }

  async openClass(name: string) {
    await this.page.getByRole('link', { name }).click()
  }
}

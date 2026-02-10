import type { Page } from '@playwright/test'

export class ClassOverviewPage {
  constructor(private readonly page: Page) {}

  async addStudent(firstName: string, lastName: string) {
    await this.page.getByPlaceholder('Vorname').fill(firstName)
    await this.page.getByPlaceholder('Nachname').fill(lastName)
    await this.page.getByPlaceholder('Nachname').press('Enter')
  }

  async addSubject(name: string) {
    await this.page.getByPlaceholder('Fachname').fill(name)
    await this.page.getByPlaceholder('Fachname').press('Enter')
  }

  async openSubject(name: string) {
    await this.page.getByRole('link', { name }).click()
  }

  async openStudent(firstName: string) {
    await this.page.getByRole('link', { name: firstName }).click()
  }
}

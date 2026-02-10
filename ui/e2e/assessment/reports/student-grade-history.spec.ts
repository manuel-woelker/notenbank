import { expect, test } from '@playwright/test'
import { ClassListPage } from '../../pages/ClassListPage'
import { ClassOverviewPage } from '../../pages/ClassOverviewPage'
import { SubjectOverviewPage } from '../../pages/SubjectOverviewPage'
import { AssessmentPage } from '../../pages/AssessmentPage'
import { createE2eRunId } from '../../support/createE2eRunId'

test('shows student grade history for a subject', async ({ page }) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const subjectName = `Bio-${runId}`
  const assessmentTitle = `Klausur-${runId}`
  const studentFirstName = 'Mara'
  const studentLastName = `Schueler-${runId}`
  const classListPage = new ClassListPage(page, runId)
  const classOverviewPage = new ClassOverviewPage(page)
  const subjectOverviewPage = new SubjectOverviewPage(page)
  const assessmentPage = new AssessmentPage(page)

  await classListPage.goto()
  await classListPage.createClass(className)
  await classListPage.openClass(className)

  await classOverviewPage.addStudent(studentFirstName, studentLastName)
  await classOverviewPage.addSubject(subjectName)
  await classOverviewPage.openSubject(subjectName)

  await subjectOverviewPage.createAssessment(
    assessmentTitle,
    'Schriftlich',
    '2025-05-08'
  )
  await subjectOverviewPage.openAssessment(assessmentTitle)
  await assessmentPage.setGrade(studentFirstName, studentLastName, '2-')

  await page.goBack()
  await page.goBack()

  await classOverviewPage.openStudent(studentFirstName)

  await expect(
    page.getByRole('heading', {
      name: `Schüler ${studentFirstName} ${studentLastName}`,
    })
  ).toBeVisible()

  await expect(
    page.getByRole('cell', { name: subjectName }).first()
  ).toBeVisible()
  await expect(page.getByText('2,25')).toBeVisible()
  await expect(page.getByText(assessmentTitle)).toBeVisible()
  await expect(page.getByRole('cell', { name: '2-' }).first()).toBeVisible()
})

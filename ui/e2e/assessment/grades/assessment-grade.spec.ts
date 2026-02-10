import { expect, test } from '@playwright/test'
import { ClassListPage } from '../../pages/ClassListPage'
import { ClassOverviewPage } from '../../pages/ClassOverviewPage'
import { SubjectOverviewPage } from '../../pages/SubjectOverviewPage'
import { AssessmentPage } from '../../pages/AssessmentPage'
import { createE2eRunId } from '../../support/createE2eRunId'

test('records a grade for an assessment', async ({ page }) => {
  const runId = createE2eRunId()
  const className = `Klasse E2E ${runId}`
  const subjectName = `Deutsch-${runId}`
  const assessmentTitle = `Test-${runId}`
  const studentFirstName = 'Lena'
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
    '2025-05-10'
  )
  await subjectOverviewPage.openAssessment(assessmentTitle)

  await expect(
    page.getByRole('heading', {
      name: `Leistungsfeststellung ${assessmentTitle}`,
    })
  ).toBeVisible()

  await assessmentPage.setGrade(studentFirstName, studentLastName, '2-')

  await expect(page.getByText('2,25')).toBeVisible()
})

import type { TourStepProps } from 'antd/es/tour/interface'

export type ProductTourRoutes = {
  classList: string
  classOverview: string
  subjectOverview: string
  assessmentRoute: string
  studentRoute: string
}

export type ProductTourStep = TourStepProps & {
  route?: string
}

const targetFor = (selector: string) => () =>
  (document.querySelector(selector) as HTMLElement | null) ?? document.body

const buttonLabels = {
  next: 'Weiter',
  previous: 'Zurück',
  finish: 'Fertig',
}

export const buildProductTourSteps = (
  routes: ProductTourRoutes
): ProductTourStep[] => {
  const steps: ProductTourStep[] = [
    {
      title: 'Beispiel-Datenbank',
      description:
        'Starte mit der Beispiel-Datenbank, damit du sofort echte Demo-Daten siehst.',
      target: targetFor('[data-tour="db-switch"]'),
      route: routes.classList,
    },
    {
      title: 'Zurücksetzen',
      description:
        'Mit Tabula Rasa setzt du die Beispiel-Datenbank zurück, wenn du neu starten willst.',
      target: targetFor('[data-tour="example-reset"]'),
      route: routes.classList,
    },
    {
      title: 'Klassen-Navigation',
      description:
        'Über die Klassen-Navigation erreichst du Klassen, Fächer und Leistungsfeststellungen.',
      target: targetFor('[data-tour="menu-classes"]'),
      route: routes.classList,
    },
    {
      title: 'Klassenliste',
      description:
        'Hier findest du alle Klassen. Wähle eine Klasse aus, um Schüler und Fächer zu sehen.',
      target: targetFor('[data-tour="class-table"]'),
      route: routes.classList,
    },
    {
      title: 'Fächer einer Klasse',
      description:
        'In der Klassenansicht siehst du alle Fächer und kannst direkt zu den Leistungsfeststellungen springen.',
      target: targetFor('[data-tour="class-subjects"]'),
      route: routes.classOverview,
    },
    {
      title: 'Schüler einer Klasse',
      description:
        'Die Schülerliste zeigt alle Lernenden der Klasse und führt dich zur Notenübersicht.',
      target: targetFor('[data-tour="class-students"]'),
      route: routes.classOverview,
    },
    {
      title: 'Leistungsfeststellungen',
      description:
        'Im Fach-Überblick verwaltest du alle Leistungsfeststellungen des Fachs.',
      target: targetFor('[data-tour="subject-assessments"]'),
      route: routes.subjectOverview,
    },
    {
      title: 'Notenlinie',
      description:
        'Auf der Leistungsfeststellung kannst du eine Notenlinie definieren oder anpassen.',
      target: targetFor('[data-tour="assessment-curve"]'),
      route: routes.assessmentRoute,
    },
    {
      title: 'Einzelergebnisse',
      description:
        'Trage hier die Noten der Schülerinnen und Schüler ein und prüfe den Durchschnitt.',
      target: targetFor('[data-tour="assessment-grades"]'),
      route: routes.assessmentRoute,
    },
    {
      title: 'Fächerübersicht',
      description:
        'Auf der Schülerseite siehst du alle Fächer mit dem gewichteten Durchschnitt.',
      target: targetFor('[data-tour="student-subjects"]'),
      route: routes.studentRoute,
    },
    {
      title: 'Noten pro Fach',
      description:
        'In der Detailtabelle findest du alle Leistungsfeststellungen des gewählten Fachs.',
      target: targetFor('[data-tour="student-grades"]'),
      route: routes.studentRoute,
    },
  ]

  return steps.map((step, index) => ({
    ...step,
    nextButtonProps: {
      ...step.nextButtonProps,
      children:
        index === steps.length - 1 ? buttonLabels.finish : buttonLabels.next,
    },
    prevButtonProps: {
      ...step.prevButtonProps,
      children: buttonLabels.previous,
    },
  }))
}

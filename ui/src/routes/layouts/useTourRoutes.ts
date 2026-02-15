import { useMemo } from 'react'
import { useClassStore } from '../../features/administration/classes/ClassStore'
import { useSubjectStore } from '../../features/administration/subjects/SubjectStore'
import { useStudentStore } from '../../features/administration/students/StudentStore'
import { useAssessmentStore } from '../../features/assessment/assessments/AssessmentStore'
import { buildClassRouteSegment } from '../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../shared/routes/subjectRoute'
import { buildAssessmentRouteSegment } from '../../shared/routes/assessmentRoute'
import { buildStudentRouteSegment } from '../../shared/routes/studentRoute'

export interface TourRoutes {
  classList: string
  classOverview: string
  subjectOverview: string
  assessmentRoute: string
  studentRoute: string
}

/* 📖 # Why calculate tour routes dynamically?
The product tour needs to navigate to actual entity pages to show realistic
content. By building routes from the first available class, subject, assessment,
and student, we ensure the tour always has valid paths even as data changes.
If no entities exist, it falls back to parent routes.
*/
export function useTourRoutes(): TourRoutes {
  const { classes } = useClassStore()
  const { subjects } = useSubjectStore()
  const { students } = useStudentStore()
  const { assessments } = useAssessmentStore()

  return useMemo(() => {
    const classList = '/classes'
    const primaryClass = classes[0]
    const classSegment = primaryClass
      ? buildClassRouteSegment(classes, primaryClass.id)
      : undefined
    const classOverview = classSegment ? `/classes/${classSegment}` : classList
    const classSubjects = primaryClass
      ? subjects.filter((subject) => subject.classId === primaryClass.id)
      : []
    const primarySubject = classSubjects[0]
    const subjectSegment =
      primaryClass && primarySubject
        ? buildSubjectRouteSegment(subjects, primaryClass.id, primarySubject.id)
        : undefined
    const subjectOverview =
      classSegment && subjectSegment
        ? `/classes/${classSegment}/subjects/${subjectSegment}`
        : classOverview
    const subjectAssessments =
      primaryClass && primarySubject
        ? assessments.filter(
            (assessment) =>
              assessment.classId === primaryClass.id &&
              assessment.subjectId === primarySubject.id
          )
        : []
    const primaryAssessment = subjectAssessments[0]
    const assessmentSegment =
      primaryClass && primarySubject && primaryAssessment
        ? buildAssessmentRouteSegment(
            assessments,
            primaryClass.id,
            primarySubject.id,
            primaryAssessment.id
          )
        : undefined
    const assessmentRoute =
      classSegment && subjectSegment && assessmentSegment
        ? `/classes/${classSegment}/subjects/${subjectSegment}/assessments/${assessmentSegment}`
        : subjectOverview
    const classStudents = primaryClass
      ? students.filter((student) => student.classId === primaryClass.id)
      : []
    const primaryStudent = classStudents[0]
    const studentSegment =
      primaryClass && primaryStudent
        ? buildStudentRouteSegment(students, primaryClass.id, primaryStudent.id)
        : undefined
    const studentRoute =
      classSegment && studentSegment
        ? `/classes/${classSegment}/students/${studentSegment}`
        : classOverview

    return {
      classList,
      classOverview,
      subjectOverview,
      assessmentRoute,
      studentRoute,
    }
  }, [classes, subjects, assessments, students])
}

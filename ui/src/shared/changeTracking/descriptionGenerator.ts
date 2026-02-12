import { EntityType, OperationType } from './ChangeLogTypes'
import { Class } from '../../features/administration/classes/ClassTypes'
import { Student } from '../../features/administration/students/StudentTypes'
import { Subject } from '../../features/administration/subjects/SubjectTypes'
import { Assessment } from '../../features/assessment/assessments/AssessmentTypes'
import { AssessmentGrade } from '../../features/assessment/assessments/AssessmentGradeTypes'
import { createGrade } from '../Grade'

/* 📖 # Why generate German descriptions?
 *
 * The change log UI is in German, so we need human-readable descriptions
 * in German for all operations. These descriptions are generated at write
 * time and stored in the change log for fast display without entity lookups.
 *
 * The descriptions provide enough context to understand what changed without
 * needing to view the full entity data.
 */

/**
 * Generate a human-readable German description for a change log entry
 *
 * @param entityType - The type of entity
 * @param operation - The operation performed (CREATE, UPDATE, DELETE)
 * @param entity - The entity data
 * @param relatedData - Optional related entity data for more context (e.g., student name for grades)
 * @returns German description string
 *
 * @example
 * ```typescript
 * generateDescription('class', 'CREATE', { name: '10A' })
 * // Returns: "Klasse '10A' erstellt"
 *
 * generateDescription('student', 'UPDATE', { firstName: 'Max', lastName: 'Mustermann' })
 * // Returns: "Schüler 'Max Mustermann' aktualisiert"
 * ```
 */
export function generateDescription(
  entityType: EntityType,
  operation: OperationType,
  entity: unknown,
  relatedData?: {
    studentName?: string
    subjectName?: string
    assessmentTitle?: string
  }
): string {
  const operationVerb = getOperationVerb(operation)

  switch (entityType) {
    case 'class': {
      const classEntity = entity as Class
      return `Klasse '${classEntity.name}' ${operationVerb}`
    }

    case 'student': {
      const student = entity as Student
      const fullName = `${student.firstName} ${student.lastName}`
      return `Schüler '${fullName}' ${operationVerb}`
    }

    case 'subject': {
      const subject = entity as Subject
      return `Fach '${subject.name}' ${operationVerb}`
    }

    case 'assessment': {
      const assessment = entity as Assessment
      const typeLabel =
        assessment.type === 'written' ? 'Schriftlich' : 'Mündlich'
      return `Leistungskontrolle '${assessment.title}' (${typeLabel}) ${operationVerb}`
    }

    case 'assessment_grade': {
      const grade = entity as AssessmentGrade
      const studentName = relatedData?.studentName || 'Schüler'
      const assessmentTitle =
        relatedData?.assessmentTitle || 'Leistungskontrolle'

      if (operation === 'CREATE') {
        return `Note ${grade.grade} für ${studentName} in '${assessmentTitle}' erstellt`
      } else if (operation === 'UPDATE') {
        return `Note für ${studentName} in '${assessmentTitle}' aktualisiert`
      } else {
        return `Note für ${studentName} in '${assessmentTitle}' gelöscht`
      }
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = entityType
      throw new Error(`Unknown entity type: ${_exhaustive}`)
    }
  }
}

/**
 * Get the German verb for an operation type
 */
function getOperationVerb(operation: OperationType): string {
  switch (operation) {
    case 'CREATE':
      return 'erstellt'
    case 'UPDATE':
      return 'aktualisiert'
    case 'DELETE':
      return 'gelöscht'
    default: {
      const _exhaustive: never = operation
      throw new Error(`Unknown operation: ${_exhaustive}`)
    }
  }
}

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('generateDescription', () => {
    describe('class entity', () => {
      it('should generate description for CREATE', () => {
        const classEntity: Class = {
          id: 'class-1',
          name: '10A',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('class', 'CREATE', classEntity)
        expect(description).toBe("Klasse '10A' erstellt")
      })

      it('should generate description for UPDATE', () => {
        const classEntity: Class = {
          id: 'class-1',
          name: '10A',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('class', 'UPDATE', classEntity)
        expect(description).toBe("Klasse '10A' aktualisiert")
      })

      it('should generate description for DELETE', () => {
        const classEntity: Class = {
          id: 'class-1',
          name: '10A',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('class', 'DELETE', classEntity)
        expect(description).toBe("Klasse '10A' gelöscht")
      })
    })

    describe('student entity', () => {
      it('should generate description for CREATE', () => {
        const student: Student = {
          id: 'student-1',
          firstName: 'Max',
          lastName: 'Mustermann',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('student', 'CREATE', student)
        expect(description).toBe("Schüler 'Max Mustermann' erstellt")
      })

      it('should generate description for UPDATE', () => {
        const student: Student = {
          id: 'student-1',
          firstName: 'Maximilian',
          lastName: 'Mustermann',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('student', 'UPDATE', student)
        expect(description).toBe("Schüler 'Maximilian Mustermann' aktualisiert")
      })

      it('should generate description for DELETE', () => {
        const student: Student = {
          id: 'student-1',
          firstName: 'Max',
          lastName: 'Mustermann',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('student', 'DELETE', student)
        expect(description).toBe("Schüler 'Max Mustermann' gelöscht")
      })
    })

    describe('subject entity', () => {
      it('should generate description for CREATE', () => {
        const subject: Subject = {
          id: 'subject-1',
          name: 'Mathematik',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('subject', 'CREATE', subject)
        expect(description).toBe("Fach 'Mathematik' erstellt")
      })

      it('should generate description for UPDATE', () => {
        const subject: Subject = {
          id: 'subject-1',
          name: 'Mathematik',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('subject', 'UPDATE', subject)
        expect(description).toBe("Fach 'Mathematik' aktualisiert")
      })

      it('should generate description for DELETE', () => {
        const subject: Subject = {
          id: 'subject-1',
          name: 'Mathematik',
          classId: 'class-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription('subject', 'DELETE', subject)
        expect(description).toBe("Fach 'Mathematik' gelöscht")
      })
    })

    describe('assessment entity', () => {
      it('should generate description for written assessment CREATE', () => {
        const assessment: Assessment = {
          id: 'assessment-1',
          classId: 'class-1',
          subjectId: 'subject-1',
          title: 'Klassenarbeit 1',
          type: 'written',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment',
          'CREATE',
          assessment
        )
        expect(description).toBe(
          "Leistungskontrolle 'Klassenarbeit 1' (Schriftlich) erstellt"
        )
      })

      it('should generate description for oral assessment CREATE', () => {
        const assessment: Assessment = {
          id: 'assessment-1',
          classId: 'class-1',
          subjectId: 'subject-1',
          title: 'Referat',
          type: 'oral',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment',
          'CREATE',
          assessment
        )
        expect(description).toBe(
          "Leistungskontrolle 'Referat' (Mündlich) erstellt"
        )
      })

      it('should generate description for UPDATE', () => {
        const assessment: Assessment = {
          id: 'assessment-1',
          classId: 'class-1',
          subjectId: 'subject-1',
          title: 'Klassenarbeit 1',
          type: 'written',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment',
          'UPDATE',
          assessment
        )
        expect(description).toBe(
          "Leistungskontrolle 'Klassenarbeit 1' (Schriftlich) aktualisiert"
        )
      })

      it('should generate description for DELETE', () => {
        const assessment: Assessment = {
          id: 'assessment-1',
          classId: 'class-1',
          subjectId: 'subject-1',
          title: 'Klassenarbeit 1',
          type: 'written',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment',
          'DELETE',
          assessment
        )
        expect(description).toBe(
          "Leistungskontrolle 'Klassenarbeit 1' (Schriftlich) gelöscht"
        )
      })
    })

    describe('assessment_grade entity', () => {
      it('should generate description for CREATE without related data', () => {
        const grade: AssessmentGrade = {
          id: 'grade-1',
          assessmentId: 'assessment-1',
          studentId: 'student-1',
          grade: createGrade(2.5),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment_grade',
          'CREATE',
          grade
        )
        expect(description).toBe(
          "Note 2.5 für Schüler in 'Leistungskontrolle' erstellt"
        )
      })

      it('should generate description for CREATE with related data', () => {
        const grade: AssessmentGrade = {
          id: 'grade-1',
          assessmentId: 'assessment-1',
          studentId: 'student-1',
          grade: createGrade(2.5),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment_grade',
          'CREATE',
          grade,
          {
            studentName: 'Max Mustermann',
            assessmentTitle: 'Klassenarbeit 1',
          }
        )
        expect(description).toBe(
          "Note 2.5 für Max Mustermann in 'Klassenarbeit 1' erstellt"
        )
      })

      it('should generate description for UPDATE with related data', () => {
        const grade: AssessmentGrade = {
          id: 'grade-1',
          assessmentId: 'assessment-1',
          studentId: 'student-1',
          grade: createGrade(2.0),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment_grade',
          'UPDATE',
          grade,
          {
            studentName: 'Max Mustermann',
            assessmentTitle: 'Klassenarbeit 1',
          }
        )
        expect(description).toBe(
          "Note für Max Mustermann in 'Klassenarbeit 1' aktualisiert"
        )
      })

      it('should generate description for DELETE with related data', () => {
        const grade: AssessmentGrade = {
          id: 'grade-1',
          assessmentId: 'assessment-1',
          studentId: 'student-1',
          grade: createGrade(2.0),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const description = generateDescription(
          'assessment_grade',
          'DELETE',
          grade,
          {
            studentName: 'Max Mustermann',
            assessmentTitle: 'Klassenarbeit 1',
          }
        )
        expect(description).toBe(
          "Note für Max Mustermann in 'Klassenarbeit 1' gelöscht"
        )
      })
    })
  })
}

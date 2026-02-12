import { EntityType, ChangeContext } from './ChangeLogTypes'
import { Class } from '../../features/administration/classes/ClassTypes'
import { Student } from '../../features/administration/students/StudentTypes'
import { Subject } from '../../features/administration/subjects/SubjectTypes'
import { Assessment } from '../../features/assessment/assessments/AssessmentTypes'
import { AssessmentGrade } from '../../features/assessment/assessments/AssessmentGradeTypes'
import { createGrade } from '../Grade'

/* 📖 # Why extract context fields at write time?
 *
 * The change log stores denormalized context fields (classId, subjectId, etc.)
 * to enable efficient filtering without parsing JSON entity data.
 *
 * Extracting these fields at write time trades a small amount of processing
 * for significantly faster query performance when filtering changes by context.
 */

/**
 * Extract context fields from an entity for change log filtering
 *
 * @param entityType - The type of entity
 * @param entity - The entity data (may be partial during updates)
 * @param assessmentLookup - Optional function to look up assessment data (needed for grades)
 * @returns Context object with classId, subjectId, assessmentId, and/or studentId
 *
 * @example
 * ```typescript
 * const context = await extractContext('student', studentEntity)
 * // Returns: { classId: 'class-1', studentId: 'student-1' }
 * ```
 */
export async function extractContext(
  entityType: EntityType,
  entity: unknown,
  assessmentLookup?: (assessmentId: string) => Promise<Assessment | null>
): Promise<ChangeContext> {
  switch (entityType) {
    case 'class': {
      const classEntity = entity as Class
      return {
        classId: classEntity.id,
      }
    }

    case 'student': {
      const student = entity as Student
      return {
        classId: student.classId,
        studentId: student.id,
      }
    }

    case 'subject': {
      const subject = entity as Subject
      return {
        classId: subject.classId,
        subjectId: subject.id,
      }
    }

    case 'assessment': {
      const assessment = entity as Assessment
      return {
        classId: assessment.classId,
        subjectId: assessment.subjectId,
        assessmentId: assessment.id,
      }
    }

    case 'assessment_grade': {
      const grade = entity as AssessmentGrade
      const context: ChangeContext = {
        assessmentId: grade.assessmentId,
        studentId: grade.studentId,
      }

      /* 📖 # Why look up assessment data for grades?
       *
       * AssessmentGrade only has assessmentId and studentId.
       * To enable filtering by class or subject, we need to look up the
       * assessment to get its classId and subjectId.
       *
       * This lookup happens at write time, so the UI can filter efficiently
       * without database joins.
       */
      if (assessmentLookup) {
        const assessment = await assessmentLookup(grade.assessmentId)
        if (assessment) {
          context.classId = assessment.classId
          context.subjectId = assessment.subjectId
        }
      }

      return context
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = entityType
      throw new Error(`Unknown entity type: ${_exhaustive}`)
    }
  }
}

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('extractContext', () => {
    it('should extract context from class entity', async () => {
      const classEntity: Class = {
        id: 'class-1',
        name: '10A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const context = await extractContext('class', classEntity)

      expect(context).toEqual({
        classId: 'class-1',
      })
    })

    it('should extract context from student entity', async () => {
      const student: Student = {
        id: 'student-1',
        firstName: 'Max',
        lastName: 'Mustermann',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const context = await extractContext('student', student)

      expect(context).toEqual({
        classId: 'class-1',
        studentId: 'student-1',
      })
    })

    it('should extract context from subject entity', async () => {
      const subject: Subject = {
        id: 'subject-1',
        name: 'Mathematik',
        classId: 'class-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const context = await extractContext('subject', subject)

      expect(context).toEqual({
        classId: 'class-1',
        subjectId: 'subject-1',
      })
    })

    it('should extract context from assessment entity', async () => {
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

      const context = await extractContext('assessment', assessment)

      expect(context).toEqual({
        classId: 'class-1',
        subjectId: 'subject-1',
        assessmentId: 'assessment-1',
      })
    })

    it('should extract context from assessment grade without assessment lookup', async () => {
      const grade: AssessmentGrade = {
        id: 'grade-1',
        assessmentId: 'assessment-1',
        studentId: 'student-1',
        grade: createGrade(2.5),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const context = await extractContext('assessment_grade', grade)

      expect(context).toEqual({
        assessmentId: 'assessment-1',
        studentId: 'student-1',
      })
    })

    it('should extract full context from assessment grade with assessment lookup', async () => {
      const grade: AssessmentGrade = {
        id: 'grade-1',
        assessmentId: 'assessment-1',
        studentId: 'student-1',
        grade: createGrade(2.5),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockAssessment: Assessment = {
        id: 'assessment-1',
        classId: 'class-1',
        subjectId: 'subject-1',
        title: 'Klassenarbeit 1',
        type: 'written',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const assessmentLookup = async (id: string) =>
        id === 'assessment-1' ? mockAssessment : null

      const context = await extractContext(
        'assessment_grade',
        grade,
        assessmentLookup
      )

      expect(context).toEqual({
        classId: 'class-1',
        subjectId: 'subject-1',
        assessmentId: 'assessment-1',
        studentId: 'student-1',
      })
    })

    it('should handle assessment lookup returning null', async () => {
      const grade: AssessmentGrade = {
        id: 'grade-1',
        assessmentId: 'assessment-1',
        studentId: 'student-1',
        grade: createGrade(2.5),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const assessmentLookup = async () => null

      const context = await extractContext(
        'assessment_grade',
        grade,
        assessmentLookup
      )

      expect(context).toEqual({
        assessmentId: 'assessment-1',
        studentId: 'student-1',
      })
    })
  })
}

import React, { useMemo } from 'react'
import { Card, Col, Row, Space, Typography } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import { useClassStore } from '../classes/ClassStore'
import { useStudentStore } from './StudentStore'
import { StudentTable } from './StudentTable'
import { useSubjectStore } from '../subjects/SubjectStore'
import { SubjectTable } from '../subjects/SubjectTable'
import { useDatabaseStore } from '../../../shared/store/databaseStore'
import { buildClassRouteSegment } from '../../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../../shared/routes/subjectRoute'

const { Title, Text } = Typography

interface ClassOverviewProps {
  classId: string
}

/**
 * Page component for listing students in a class
 */
export const ClassOverview: React.FC<ClassOverviewProps> = ({ classId }) => {
  const navigate = useNavigate()
  const { classes, loading: classesLoading } = useClassStore()
  const {
    students,
    loading: studentsLoading,
    createStudent,
  } = useStudentStore()
  const {
    subjects,
    loading: subjectsLoading,
    createSubject,
  } = useSubjectStore()
  const { isExample } = useDatabaseStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const classRouteSegment = buildClassRouteSegment(classes, classId)
  const getSubjectHref = (subjectId: string) => {
    if (!classRouteSegment) {
      return isExample ? '#/classes?db=example' : '#/classes'
    }
    const subjectSegment = buildSubjectRouteSegment(
      subjects,
      classId,
      subjectId
    )
    return isExample
      ? `#/classes/${classRouteSegment}/subjects/${subjectSegment}?db=example`
      : `#/classes/${classRouteSegment}/subjects/${subjectSegment}`
  }
  const classStudents = useMemo(
    () => students.filter((student) => student.classId === classId),
    [students, classId]
  )
  const classSubjects = useMemo(
    () => subjects.filter((subject) => subject.classId === classId),
    [subjects, classId]
  )

  const isLoading = classesLoading || studentsLoading
  const subjectsAreLoading = classesLoading || subjectsLoading

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Klasse {selectedClass?.name ?? '—'}
          </Title>
        </div>
      </div>

      {!selectedClass && !classesLoading ? (
        <Text type="secondary">Klasse nicht gefunden.</Text>
      ) : null}

      {selectedClass ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card title="Fächer" size="small">
              <SubjectTable
                subjects={classSubjects}
                loading={subjectsAreLoading}
                onCreateSubject={async (input) => {
                  await createSubject({ ...input, classId })
                }}
                onSelectSubject={(subjectId) => {
                  if (!classRouteSegment) {
                    return
                  }
                  const subjectSegment = buildSubjectRouteSegment(
                    subjects,
                    classId,
                    subjectId
                  )
                  void navigate({
                    to: `/classes/${classRouteSegment}/subjects/${subjectSegment}`,
                    search: (prev) => prev,
                  })
                }}
                getSubjectHref={getSubjectHref}
              />
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="Schüler" size="small">
              <StudentTable
                students={classStudents}
                loading={isLoading}
                onCreateStudent={async (input) => {
                  await createStudent({ ...input, classId })
                }}
              />
            </Card>
          </Col>
        </Row>
      ) : null}
    </Space>
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, vi } = import.meta.vitest
  const { render, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')
  const { classRepository } = await import('../classes/ClassRepository')
  const { studentRepository } = await import('./StudentRepository')
  const { subjectRepository } = await import('../subjects/SubjectRepository')

  vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual<
      typeof import('@tanstack/react-router')
    >('@tanstack/react-router')
    return {
      ...actual,
      useNavigate: () => () => {},
    }
  })

  describe('ClassOverview', () => {
    beforeEach(async () => {
      globalThis.indexedDB = new IDBFactory()
      const existingClasses = await classRepository.findAll()
      await Promise.all(
        existingClasses.map((existingClass) =>
          classRepository.delete(existingClass.id)
        )
      )
      const existingStudents = await studentRepository.findAll()
      await Promise.all(
        existingStudents.map((existingStudent) =>
          studentRepository.delete(existingStudent.id)
        )
      )
      const existingSubjects = await subjectRepository.findAll()
      await Promise.all(
        existingSubjects.map((existingSubject) =>
          subjectRepository.delete(existingSubject.id)
        )
      )
    })

    it('renders students for the selected class', async () => {
      const newClass = await classRepository.create({ name: 'Class A' })
      await studentRepository.create({
        firstName: 'Tara',
        lastName: 'Student',
        classId: newClass.id,
      })
      await subjectRepository.create({
        name: 'Mathe',
        classId: newClass.id,
      })

      if (!window.matchMedia) {
        window.matchMedia = () =>
          ({
            matches: false,
            media: '',
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          }) as unknown as MediaQueryList
      }
      window.getComputedStyle = () =>
        ({
          getPropertyValue: () => '',
        }) as unknown as CSSStyleDeclaration

      const { getByText } = render(<ClassOverview classId={newClass.id} />)

      await waitFor(() => {
        expect(getByText('Tara')).toBeTruthy()
      })

      await waitFor(() => {
        expect(getByText('Mathe')).toBeTruthy()
      })
    })
  })
}

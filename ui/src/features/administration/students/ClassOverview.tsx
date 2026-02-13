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
import { buildStudentRouteSegment } from '../../../shared/routes/studentRoute'
import { combineLoading } from '../../../shared/store/combineLoading'

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
    updateStudent,
  } = useStudentStore()
  const {
    subjects,
    loading: subjectsLoading,
    createSubject,
    updateSubject,
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
  const getStudentHref = (studentId: string) => {
    if (!classRouteSegment) {
      return isExample ? '#/classes?db=example' : '#/classes'
    }
    const studentSegment = buildStudentRouteSegment(
      students,
      classId,
      studentId
    )
    return isExample
      ? `#/classes/${classRouteSegment}/students/${studentSegment}?db=example`
      : `#/classes/${classRouteSegment}/students/${studentSegment}`
  }
  const classStudents = useMemo(
    () => students.filter((student) => student.classId === classId),
    [students, classId]
  )
  const classSubjects = useMemo(
    () => subjects.filter((subject) => subject.classId === classId),
    [subjects, classId]
  )

  const isLoading = combineLoading(classesLoading, studentsLoading)
  const subjectsAreLoading = combineLoading(classesLoading, subjectsLoading)

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
            <Card title="Fächer" size="small" data-tour="class-subjects">
              <SubjectTable
                subjects={classSubjects}
                loading={subjectsAreLoading}
                onCreateSubject={async (input) => {
                  await createSubject({ ...input, classId })
                }}
                onUpdateSubject={async (id, updates) => {
                  await updateSubject(id, updates)
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
            <Card title="Schüler" size="small" data-tour="class-students">
              <StudentTable
                students={classStudents}
                loading={isLoading}
                onCreateStudent={async (input) => {
                  await createStudent({ ...input, classId })
                }}
                onUpdateStudent={async (id, updates) => {
                  await updateStudent(id, updates)
                }}
                onSelectStudent={(studentId) => {
                  if (!classRouteSegment) {
                    return
                  }
                  const studentSegment = buildStudentRouteSegment(
                    students,
                    classId,
                    studentId
                  )
                  void navigate({
                    to: `/classes/${classRouteSegment}/students/${studentSegment}`,
                    search: (prev) => prev,
                  })
                }}
                getStudentHref={getStudentHref}
              />
            </Card>
          </Col>
        </Row>
      ) : null}
    </Space>
  )
}

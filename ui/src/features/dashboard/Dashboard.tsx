import { Card, Col, List, Row, Typography } from 'antd'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useRecentAssessmentStore } from './recentAssessments/RecentAssessmentStore'
import { useClassStore } from '../administration/classes/ClassStore'
import { useSubjectStore } from '../administration/subjects/SubjectStore'
import { useAssessmentStore } from '../assessment/assessments/AssessmentStore'
import { ClassTable } from '../administration/classes/ClassTable'
import { buildAssessmentRouteSegment } from '../../shared/routes/assessmentRoute'
import { buildClassRouteSegment } from '../../shared/routes/classRoute'
import { buildSubjectRouteSegment } from '../../shared/routes/subjectRoute'
import { rootRoute } from '../../routes/routes'

const { Text } = Typography

function formatAssessmentType(type: 'written' | 'oral'): string {
  return type === 'written' ? 'Schriftlich' : 'Mündlich'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function Dashboard() {
  const navigate = useNavigate()
  const search = useSearch({ from: rootRoute.id })
  const { recentAssessments, loading } = useRecentAssessmentStore()
  const { classes, loading: classesLoading, createClass } = useClassStore()
  const { subjects } = useSubjectStore()
  const { assessments } = useAssessmentStore()

  const getAssessmentUrl = (recentAssessment: {
    assessmentId: string
    classId: string
    subjectId: string
  }) => {
    const classSegment = buildClassRouteSegment(
      classes,
      recentAssessment.classId
    )
    const subjectSegment = buildSubjectRouteSegment(
      subjects,
      recentAssessment.classId,
      recentAssessment.subjectId
    )
    const assessmentSegment = buildAssessmentRouteSegment(
      assessments,
      recentAssessment.classId,
      recentAssessment.subjectId,
      recentAssessment.assessmentId
    )
    return `/classes/${classSegment}/subjects/${subjectSegment}/assessments/${assessmentSegment}`
  }

  const getClassHref = (classId: string) => {
    const classSegment = buildClassRouteSegment(classes, classId)
    const searchParams = search.db ? `?db=${search.db}` : ''
    return `/classes/${classSegment}${searchParams}`
  }

  const handleSelectClass = (classId: string) => {
    const classSegment = buildClassRouteSegment(classes, classId)
    void navigate({
      to: `/classes/${classSegment}`,
      search: search.db ? { db: search.db } : undefined,
    })
  }

  const handleCreateClass = async (name: string): Promise<void> => {
    await createClass({ name })
  }

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    return cls?.name ?? 'Unbekannte Klasse'
  }

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    return subject?.name ?? 'Unbekanntes Fach'
  }

  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Klassen">
            <ClassTable
              classes={classes}
              loading={classesLoading}
              onSelectClass={handleSelectClass}
              onCreateClass={handleCreateClass}
              getClassHref={getClassHref}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Kürzlich verwendete Leistungsfeststellungen"
            loading={loading}
          >
            {recentAssessments.length === 0 ? (
              <Text type="secondary">
                Keine kürzlich verwendeten Leistungsfeststellungen vorhanden.
              </Text>
            ) : (
              <List
                dataSource={recentAssessments}
                renderItem={(item) => (
                  <List.Item style={{ padding: 0, marginBottom: 12 }}>
                    <Link
                      to={getAssessmentUrl(item)}
                      search={search.db ? { db: search.db } : undefined}
                      style={{
                        display: 'block',
                        width: '100%',
                        textDecoration: 'none',
                      }}
                    >
                      <Card
                        size="small"
                        style={{ width: '100%', cursor: 'pointer' }}
                        hoverable
                        styles={{
                          body: {
                            padding: '12px 16px',
                          },
                        }}
                      >
                        <List.Item.Meta
                          title={item.title}
                          description={
                            <>
                              {formatAssessmentType(item.type)} ·{' '}
                              {getClassName(item.classId)} ·{' '}
                              {getSubjectName(item.subjectId)} ·{' '}
                              {formatDate(item.date)}
                            </>
                          }
                        />
                      </Card>
                    </Link>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

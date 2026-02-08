import React from 'react'
import { Space, Typography } from 'antd'
import { useClassStore } from '../classes/ClassStore'
import { useSubjectStore } from './SubjectStore'

const { Title, Text } = Typography

interface SubjectOverviewProps {
  classId: string
  subjectId: string
}

/**
 * Overview page for a subject within a class
 */
export const SubjectOverview: React.FC<SubjectOverviewProps> = ({
  classId,
  subjectId,
}) => {
  const { classes, loading: classesLoading } = useClassStore()
  const { subjects, loading: subjectsLoading } = useSubjectStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const selectedSubject = subjects.find((item) => item.id === subjectId)

  const isLoading = classesLoading || subjectsLoading

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>
          Fach {selectedSubject?.name ?? '—'}
        </Title>
        {selectedClass ? (
          <Text type="secondary">Klasse {selectedClass.name}</Text>
        ) : null}
      </div>

      {!isLoading && !selectedSubject ? (
        <Text type="secondary">Fach nicht gefunden.</Text>
      ) : null}
    </Space>
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { render, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')
  const { classRepository } = await import('../classes/ClassRepository')
  const { subjectRepository } = await import('./SubjectRepository')

  describe('SubjectOverview', () => {
    beforeEach(async () => {
      globalThis.indexedDB = new IDBFactory()
      const existingClasses = await classRepository.findAll()
      await Promise.all(
        existingClasses.map((existingClass) =>
          classRepository.delete(existingClass.id)
        )
      )
      const existingSubjects = await subjectRepository.findAll()
      await Promise.all(
        existingSubjects.map((existingSubject) =>
          subjectRepository.delete(existingSubject.id)
        )
      )
    })

    it('renders the subject and class name', async () => {
      const newClass = await classRepository.create({ name: 'Klasse A' })
      const subject = await subjectRepository.create({
        name: 'Deutsch',
        classId: newClass.id,
      })

      const { getByText } = render(
        <SubjectOverview classId={newClass.id} subjectId={subject.id} />
      )

      await waitFor(() => {
        expect(getByText('Fach Deutsch')).toBeTruthy()
      })

      await waitFor(() => {
        expect(getByText('Klasse Klasse A')).toBeTruthy()
      })
    })
  })
}

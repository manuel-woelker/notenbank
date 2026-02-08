import React, { useMemo, useState } from 'react'
import { Button, Space, Typography } from 'antd'
import { useClassStore } from '../classes/ClassStore'
import { useStudentStore } from './StudentStore'
import { StudentTable } from './StudentTable'
import { CreateStudentModal } from './CreateStudentModal'

const { Title, Text } = Typography

interface ClassStudentsListProps {
  classId: string
}

/**
 * Page component for listing students in a class
 */
export const ClassStudentsList: React.FC<ClassStudentsListProps> = ({
  classId,
}) => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const { classes, loading: classesLoading } = useClassStore()
  const { students, loading: studentsLoading } = useStudentStore()

  const selectedClass = classes.find((item) => item.id === classId)
  const classStudents = useMemo(
    () => students.filter((student) => student.classId === classId),
    [students, classId]
  )

  const isLoading = classesLoading || studentsLoading

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
            Students
          </Title>
          {selectedClass ? (
            <Text type="secondary">{selectedClass.name}</Text>
          ) : null}
        </div>
        <Button
          type="primary"
          onClick={() => setIsStudentModalOpen(true)}
          disabled={!selectedClass}
        >
          Add Student
        </Button>
      </div>

      {!selectedClass && !classesLoading ? (
        <Text type="secondary">Class not found.</Text>
      ) : null}

      <StudentTable students={classStudents} loading={isLoading} />

      <CreateStudentModal
        open={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classId={classId}
      />
    </Space>
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { render, waitFor } = await import('@testing-library/react')
  const { IDBFactory } = await import('fake-indexeddb')
  const { classRepository } = await import('../classes/ClassRepository')
  const { studentRepository } = await import('./StudentRepository')

  describe('ClassStudentsList', () => {
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
    })

    it('renders students for the selected class', async () => {
      const newClass = await classRepository.create({ name: 'Class A' })
      await studentRepository.create({
        firstName: 'Tara',
        lastName: 'Student',
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

      const { getByText } = render(<ClassStudentsList classId={newClass.id} />)

      await waitFor(() => {
        expect(getByText('Tara')).toBeTruthy()
      })
    })
  })
}

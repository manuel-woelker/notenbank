import React, { useEffect, useMemo } from 'react'
import { Form, DatePicker, Checkbox, Select, Button, Card } from 'antd'
import type { Dayjs } from 'dayjs'
import {
  EntityType,
  OperationType,
} from '../../shared/changeTracking/ChangeLogTypes'
import { ChangeLogFilters } from './ChangeLogStore'
import { classRepository } from '../administration/classes/ClassRepository'
import { subjectRepository } from '../administration/subjects/SubjectRepository'
import { assessmentRepository } from '../assessment/assessments/AssessmentRepository'
import { studentRepository } from '../administration/students/StudentRepository'

const { RangePicker } = DatePicker

/* 📖 # Why use German labels for entity types and operations?
 *
 * The UI is German-facing, so we provide user-friendly German labels
 * for all filter options.
 */

const ENTITY_TYPE_OPTIONS: Array<{ label: string; value: EntityType }> = [
  { label: 'Klasse', value: 'class' },
  { label: 'Schüler', value: 'student' },
  { label: 'Fach', value: 'subject' },
  { label: 'Leistungskontrolle', value: 'assessment' },
  { label: 'Note', value: 'assessment_grade' },
]

const OPERATION_OPTIONS: Array<{ label: string; value: OperationType }> = [
  { label: 'Erstellt', value: 'CREATE' },
  { label: 'Aktualisiert', value: 'UPDATE' },
  { label: 'Gelöscht', value: 'DELETE' },
]

interface ChangeLogFilterPanelProps {
  filters: ChangeLogFilters
  onFiltersChange: (filters: Partial<ChangeLogFilters>) => void
  onClearFilters: () => void
}

/**
 * Filter panel component for change logs
 */
export const ChangeLogFilterPanel: React.FC<ChangeLogFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [form] = Form.useForm()
  const [classes, setClasses] = React.useState<
    Array<{ id: string; name: string }>
  >([])
  const [subjects, setSubjects] = React.useState<
    Array<{ id: string; name: string; classId: string }>
  >([])
  const [assessments, setAssessments] = React.useState<
    Array<{ id: string; title: string; subjectId: string }>
  >([])
  const [students, setStudents] = React.useState<
    Array<{ id: string; firstName: string; lastName: string; classId: string }>
  >([])
  const [loading, setLoading] = React.useState(true)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [classesData, subjectsData, assessmentsData, studentsData] =
          await Promise.all([
            classRepository.findAll(),
            subjectRepository.findAll(),
            assessmentRepository.findAll(),
            studentRepository.findAll(),
          ])
        setClasses(classesData)
        setSubjects(subjectsData)
        setAssessments(assessmentsData)
        setStudents(studentsData)
      } catch (error) {
        console.error('Failed to load filter data:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  // Filter subjects by selected class
  const filteredSubjects = useMemo(() => {
    if (!filters.classId) return subjects
    return subjects.filter((s) => s.classId === filters.classId)
  }, [subjects, filters.classId])

  // Filter assessments by selected subject
  const filteredAssessments = useMemo(() => {
    if (!filters.subjectId) return assessments
    return assessments.filter((a) => a.subjectId === filters.subjectId)
  }, [assessments, filters.subjectId])

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (!filters.classId) return students
    return students.filter((s) => s.classId === filters.classId)
  }, [students, filters.classId])

  const handleDateRangeChange = (
    dates: null | [Dayjs | null, Dayjs | null]
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      onFiltersChange({ dateFrom: undefined, dateTo: undefined })
    } else {
      onFiltersChange({
        dateFrom: dates[0].toDate(),
        dateTo: dates[1].toDate(),
      })
    }
  }

  const handleEntityTypesChange = (checkedValues: EntityType[]) => {
    onFiltersChange({ entityTypes: checkedValues })
  }

  const handleOperationsChange = (checkedValues: OperationType[]) => {
    onFiltersChange({ operations: checkedValues })
  }

  const handleClassChange = (classId: string | undefined) => {
    onFiltersChange({
      classId,
      // Reset dependent filters
      subjectId: undefined,
      assessmentId: undefined,
      studentId: undefined,
    })
    form.setFieldsValue({
      subjectId: undefined,
      assessmentId: undefined,
      studentId: undefined,
    })
  }

  const handleSubjectChange = (subjectId: string | undefined) => {
    onFiltersChange({
      subjectId,
      // Reset dependent filters
      assessmentId: undefined,
    })
    form.setFieldsValue({
      assessmentId: undefined,
    })
  }

  const handleAssessmentChange = (assessmentId: string | undefined) => {
    onFiltersChange({ assessmentId })
  }

  const handleStudentChange = (studentId: string | undefined) => {
    onFiltersChange({ studentId })
  }

  const handleClear = () => {
    form.resetFields()
    onClearFilters()
  }

  return (
    <Card title="Filter" size="small">
      <Form form={form} layout="vertical">
        <Form.Item label="Zeitraum">
          <RangePicker
            format="DD.MM.YYYY"
            placeholder={['Von', 'Bis']}
            onChange={handleDateRangeChange}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="Entitätstypen">
          <Checkbox.Group
            options={ENTITY_TYPE_OPTIONS}
            value={filters.entityTypes}
            onChange={handleEntityTypesChange}
          />
        </Form.Item>

        <Form.Item label="Operationen">
          <Checkbox.Group
            options={OPERATION_OPTIONS}
            value={filters.operations}
            onChange={handleOperationsChange}
          />
        </Form.Item>

        <Form.Item name="classId" label="Klasse">
          <Select
            placeholder="Klasse auswählen"
            allowClear
            loading={loading}
            onChange={handleClassChange}
            options={classes.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="subjectId" label="Fach">
          <Select
            placeholder="Fach auswählen"
            allowClear
            loading={loading}
            disabled={!filters.classId}
            onChange={handleSubjectChange}
            options={filteredSubjects.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="assessmentId" label="Leistungskontrolle">
          <Select
            placeholder="Leistungskontrolle auswählen"
            allowClear
            loading={loading}
            disabled={!filters.subjectId}
            onChange={handleAssessmentChange}
            options={filteredAssessments.map((a) => ({
              label: a.title,
              value: a.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="studentId" label="Schüler">
          <Select
            placeholder="Schüler auswählen"
            allowClear
            loading={loading}
            disabled={!filters.classId}
            onChange={handleStudentChange}
            options={filteredStudents.map((s) => ({
              label: `${s.lastName}, ${s.firstName}`,
              value: s.id,
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Button onClick={handleClear} block>
            Filter zurücksetzen
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

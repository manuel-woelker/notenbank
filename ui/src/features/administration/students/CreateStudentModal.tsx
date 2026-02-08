import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Form, Input, Select, Typography, message } from 'antd'
import { useStudentStore } from './StudentStore'
import { useClassStore } from '../classes/ClassStore'

const { Text } = Typography

interface CreateStudentModalProps {
  open: boolean
  onClose: () => void
  classId?: string
}

/**
 * Modal component for creating a new student
 */
export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  open,
  onClose,
  classId,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { createStudent } = useStudentStore()
  const { classes, loading: classesLoading } = useClassStore()

  const classOptions = useMemo(
    () =>
      classes.map((classItem) => ({
        value: classItem.id,
        label: classItem.name,
      })),
    [classes]
  )

  useEffect(() => {
    if (open && classId) {
      form.setFieldsValue({ classId })
    }
  }, [open, classId, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await createStudent({
        firstName: values.firstName,
        lastName: values.lastName,
        classId: values.classId,
      })

      message.success('Schüler erfolgreich hinzugefügt')
      form.resetFields()
      onClose()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('Failed to create student:', error)
      message.error(
        'Schüler konnte nicht hinzugefügt werden. Bitte erneut versuchen.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const hasClasses = classOptions.length > 0
  const isClassLocked = Boolean(classId)

  return (
    <Modal
      title="Schüler hinzufügen"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Hinzufügen"
      cancelText="Abbrechen"
      okButtonProps={{ disabled: !hasClasses && !classId }}
    >
      <Form form={form} layout="vertical" name="createStudent">
        <Form.Item
          name="firstName"
          label="Vorname"
          rules={[
            { required: true, message: 'Bitte einen Vornamen eingeben' },
            { min: 1, message: 'Der Vorname muss mindestens 1 Zeichen haben' },
          ]}
        >
          <Input placeholder="z. B. Alex" autoFocus />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Nachname"
          rules={[
            { required: true, message: 'Bitte einen Nachnamen eingeben' },
            {
              min: 1,
              message: 'Der Nachname muss mindestens 1 Zeichen haben',
            },
          ]}
        >
          <Input placeholder="z. B. Mustermann" />
        </Form.Item>
        <Form.Item
          name="classId"
          label="Klasse"
          rules={[{ required: true, message: 'Bitte eine Klasse auswählen' }]}
        >
          <Select
            placeholder={
              classesLoading ? 'Lade Klassen...' : 'Klasse auswählen'
            }
            options={classOptions}
            loading={classesLoading}
            notFoundContent="Noch keine Klassen"
            showSearch
            optionFilterProp="label"
            disabled={isClassLocked}
          />
        </Form.Item>
        {!classesLoading && !hasClasses && !isClassLocked ? (
          <Text type="secondary">
            Erstelle zuerst eine Klasse, damit du Schüler zuordnen kannst.
          </Text>
        ) : null}
      </Form>
    </Modal>
  )
}

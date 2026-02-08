import React, { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { useClassStore } from './ClassStore'

interface CreateClassModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Modal component for creating a new class
 */
export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { createClass } = useClassStore()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await createClass({ name: values.name })

      message.success('Klasse erfolgreich erstellt')
      form.resetFields()
      onClose()
    } catch (error: unknown) {
      // If it's a validation error, don't show message
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('Failed to create class:', error)
      message.error(
        'Klasse konnte nicht erstellt werden. Bitte erneut versuchen.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Neue Klasse erstellen"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Erstellen"
      cancelText="Abbrechen"
    >
      <Form form={form} layout="vertical" name="createClass">
        <Form.Item
          name="name"
          label="Klassenname"
          rules={[
            { required: true, message: 'Bitte einen Klassennamen eingeben' },
            {
              min: 1,
              message: 'Der Klassenname muss mindestens 1 Zeichen haben',
            },
          ]}
        >
          <Input placeholder="z. B. Klasse 5A, Jahrgang 10B" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  )
}

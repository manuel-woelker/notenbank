import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useClassContext } from './ClassContext';

interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal component for creating a new class
 */
export const CreateClassModal: React.FC<CreateClassModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createClass } = useClassContext();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createClass({ name: values.name });

      message.success('Class created successfully');
      form.resetFields();
      onClose();
    } catch (error: any) {
      // If it's a validation error, don't show message
      if (error.errorFields) {
        return;
      }
      console.error('Failed to create class:', error);
      message.error('Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New Class"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Create"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        name="createClass"
      >
        <Form.Item
          name="name"
          label="Class Name"
          rules={[
            { required: true, message: 'Please enter a class name' },
            { min: 1, message: 'Class name must be at least 1 character' },
          ]}
        >
          <Input placeholder="e.g., Class 5A, Grade 10B" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};

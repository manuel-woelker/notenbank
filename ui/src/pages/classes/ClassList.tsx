import React, { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useClassContext } from '../../contexts/ClassContext';
import { ClassTable } from '../../components/classes/ClassTable';
import { CreateClassModal } from './CreateClassModal';

const { Title } = Typography;

/**
 * Main page component for class listing and management
 */
export const ClassList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { classes, loading } = useClassContext();

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Classes</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Class
          </Button>
        </div>

        <ClassTable classes={classes} loading={loading} />
      </Space>

      <CreateClassModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

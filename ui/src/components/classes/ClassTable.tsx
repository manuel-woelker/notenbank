import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Class } from '../../types/class';

interface ClassTableProps {
  classes: Class[];
  loading: boolean;
}

/**
 * Table component for displaying classes
 */
export const ClassTable: React.FC<ClassTableProps> = ({ classes, loading }) => {
  const columns: ColumnsType<Class> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => date.toLocaleString(),
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <span style={{ color: '#999' }}>-</span>
      ),
      width: 100,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={classes}
      rowKey="id"
      loading={loading}
      locale={{
        emptyText: 'No classes found. Click "Add Class" to create one.',
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} classes`,
      }}
    />
  );
};

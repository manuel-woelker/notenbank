import React from 'react'
import { Button, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ChangeLog,
  EntityType,
  OperationType,
} from '../../shared/changeTracking/ChangeLogTypes'

/* 📖 # Why display German labels for entity types and operations?
 *
 * The UI is German-facing, so we translate internal enum values to
 * user-friendly German text. This mapping is centralized here to ensure
 * consistency across the change tracking UI.
 */

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  class: 'Klasse',
  student: 'Schüler',
  subject: 'Fach',
  assessment: 'Leistungskontrolle',
  assessment_grade: 'Note',
}

const OPERATION_LABELS: Record<OperationType, string> = {
  CREATE: 'Erstellt',
  UPDATE: 'Aktualisiert',
  DELETE: 'Gelöscht',
}

interface ChangeLogTableProps {
  changeLogs: ChangeLog[]
  loading: boolean
  onViewDetails: (logId: string) => void
}

/**
 * Table component for displaying change logs
 */
export const ChangeLogTable: React.FC<ChangeLogTableProps> = ({
  changeLogs,
  loading,
  onViewDetails,
}) => {
  const columns: ColumnsType<ChangeLog> = [
    {
      title: 'Zeitpunkt',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) =>
        new Date(timestamp).toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      width: 180,
    },
    {
      title: 'Benutzer',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: 'Entität',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (entityType: EntityType) => ENTITY_TYPE_LABELS[entityType],
      filters: Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.entityType === value,
      width: 160,
    },
    {
      title: 'Aktion',
      dataIndex: 'operation',
      key: 'operation',
      render: (operation: OperationType) => OPERATION_LABELS[operation],
      filters: Object.entries(OPERATION_LABELS).map(([value, label]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.operation === value,
      width: 120,
    },
    {
      title: 'Beschreibung',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Aktionen',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => onViewDetails(record.id)}>
          Details
        </Button>
      ),
      width: 100,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={changeLogs}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 50,
        showSizeChanger: true,
        showTotal: (total) => `${total} Einträge`,
      }}
      locale={{
        emptyText: 'Keine Änderungen gefunden.',
        filterConfirm: 'OK',
        filterReset: 'Zurücksetzen',
        filterEmptyText: 'Keine Filter',
      }}
    />
  )
}

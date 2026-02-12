import React from 'react'
import { Modal, Descriptions, Typography } from 'antd'
import {
  ChangeLog,
  EntityType,
  OperationType,
} from '../../shared/changeTracking/ChangeLogTypes'

const { Text } = Typography

/* 📖 # Why display German labels for entity types and operations?
 *
 * The UI is German-facing, so we translate internal enum values to
 * user-friendly German text.
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

interface ChangeLogDetailModalProps {
  visible: boolean
  changeLog: ChangeLog | null
  previousChangeLog?: ChangeLog | null
  onClose: () => void
}

/**
 * Modal component for displaying detailed change log information
 */
export const ChangeLogDetailModal: React.FC<ChangeLogDetailModalProps> = ({
  visible,
  changeLog,
  previousChangeLog,
  onClose,
}) => {
  if (!changeLog) {
    return null
  }

  const formatTimestamp = (timestamp: Date) =>
    new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  /* 📖 # Why compare entity data with previous log?
   *
   * For UPDATE operations, we want to show what changed. By comparing
   * the current entity data with the previous change log entry, we can
   * highlight the specific fields that were modified.
   */
  const renderEntityData = () => {
    const currentData = changeLog.entityData as Record<string, unknown>

    if (changeLog.operation === 'UPDATE' && previousChangeLog) {
      const previousData = previousChangeLog.entityData as Record<
        string,
        unknown
      >
      const changedFields: Array<{
        key: string
        oldValue: unknown
        newValue: unknown
      }> = []

      // Find changed fields
      Object.keys(currentData).forEach((key) => {
        if (
          JSON.stringify(currentData[key]) !== JSON.stringify(previousData[key])
        ) {
          changedFields.push({
            key,
            oldValue: previousData[key],
            newValue: currentData[key],
          })
        }
      })

      if (changedFields.length === 0) {
        return <pre>{JSON.stringify(currentData, null, 2)}</pre>
      }

      return (
        <div>
          <Text strong>Geänderte Felder:</Text>
          {changedFields.map((field) => (
            <div key={field.key} style={{ marginTop: 8 }}>
              <Text strong>{field.key}:</Text>
              <br />
              <Text delete style={{ color: '#999' }}>
                {JSON.stringify(field.oldValue)}
              </Text>
              {' → '}
              <Text style={{ color: '#52c41a' }}>
                {JSON.stringify(field.newValue)}
              </Text>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Text strong>Vollständige Daten:</Text>
            <pre>{JSON.stringify(currentData, null, 2)}</pre>
          </div>
        </div>
      )
    }

    return <pre>{JSON.stringify(currentData, null, 2)}</pre>
  }

  return (
    <Modal
      title="Änderungsdetails"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Zeitpunkt">
          {formatTimestamp(changeLog.timestamp)}
        </Descriptions.Item>
        <Descriptions.Item label="Benutzer">
          {changeLog.userId}
        </Descriptions.Item>
        <Descriptions.Item label="Aktion">
          {OPERATION_LABELS[changeLog.operation]}
        </Descriptions.Item>
        <Descriptions.Item label="Entitätstyp">
          {ENTITY_TYPE_LABELS[changeLog.entityType]}
        </Descriptions.Item>
        <Descriptions.Item label="Beschreibung">
          {changeLog.description}
        </Descriptions.Item>
        {changeLog.classId && (
          <Descriptions.Item label="Klasse-ID">
            {changeLog.classId}
          </Descriptions.Item>
        )}
        {changeLog.subjectId && (
          <Descriptions.Item label="Fach-ID">
            {changeLog.subjectId}
          </Descriptions.Item>
        )}
        {changeLog.assessmentId && (
          <Descriptions.Item label="Leistungskontrolle-ID">
            {changeLog.assessmentId}
          </Descriptions.Item>
        )}
        {changeLog.studentId && (
          <Descriptions.Item label="Schüler-ID">
            {changeLog.studentId}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Entitätsdaten">
          {renderEntityData()}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

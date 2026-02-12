import React, { useState } from 'react'
import { Row, Col } from 'antd'
import { ChangeLogTable } from './ChangeLogTable'
import { ChangeLogFilterPanel } from './ChangeLogFilterPanel'
import { ChangeLogDetailModal } from './ChangeLogDetailModal'
import { useChangeLogStore } from './ChangeLogStore'
import { ChangeLog } from '../../shared/changeTracking/ChangeLogTypes'

/**
 * Main page component for change tracking
 */
export const ChangeLogPage: React.FC = () => {
  const { filteredChangeLogs, loading, filters, setFilters, clearFilters } =
    useChangeLogStore()
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const selectedLog = selectedLogId
    ? filteredChangeLogs.find((log) => log.id === selectedLogId) || null
    : null

  /* 📖 # Why find the previous log for the same entity?
   *
   * For UPDATE operations, we want to show what changed. The previous log
   * entry for the same entity gives us the "before" state, allowing us to
   * highlight the differences in the detail modal.
   */
  const findPreviousLog = (currentLog: ChangeLog | null): ChangeLog | null => {
    if (!currentLog || currentLog.operation !== 'UPDATE') {
      return null
    }

    // Find all logs for the same entity, sorted by timestamp descending
    const entityLogs = filteredChangeLogs
      .filter(
        (log) =>
          log.entityId === currentLog.entityId &&
          log.entityType === currentLog.entityType &&
          log.timestamp < currentLog.timestamp
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return entityLogs[0] || null
  }

  const previousLog = findPreviousLog(selectedLog)

  const handleViewDetails = (logId: string) => {
    setSelectedLogId(logId)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedLogId(null)
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        <Col span={6}>
          <ChangeLogFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
        </Col>
        <Col span={18}>
          <ChangeLogTable
            changeLogs={filteredChangeLogs}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
        </Col>
      </Row>
      <ChangeLogDetailModal
        visible={modalVisible}
        changeLog={selectedLog}
        previousChangeLog={previousLog}
        onClose={handleCloseModal}
      />
    </div>
  )
}

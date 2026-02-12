/* 📖 # Why define change tracking types separately?
 * Separating types enables type-safe usage across repository layer and UI components.
 * It also allows for easy extension of entity types and operations without circular dependencies.
 */

/**
 * Types of entities that can be tracked in the change log
 */
export type EntityType =
  | 'class'
  | 'student'
  | 'subject'
  | 'assessment'
  | 'assessment_grade'

/**
 * Types of operations that can be performed on entities
 */
export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * Context information extracted from entities for efficient filtering
 * These fields are denormalized from the entity data to enable fast queries
 */
export interface ChangeContext {
  classId?: string
  subjectId?: string
  assessmentId?: string
  studentId?: string
}

/**
 * Main change log entry that captures all modifications to tracked entities
 */
export interface ChangeLog {
  /** Unique identifier for the change log entry */
  id: string

  /** When the change occurred */
  timestamp: Date

  /** User who made the change (currently always "System") */
  userId: string

  /** Type of operation performed */
  operation: OperationType

  /** Type of entity that was changed */
  entityType: EntityType

  /** ID of the specific entity that was changed */
  entityId: string

  /** Complete snapshot of the entity data at the time of change (stored as JSON) */
  entityData: unknown

  /** Human-readable German description of what changed */
  description: string

  /** Context fields for filtering (denormalized from entity data) */
  classId?: string
  subjectId?: string
  assessmentId?: string
  studentId?: string

  /* 📖 # Why include createdAt and updatedAt?
   * ChangeLog needs these to satisfy BaseEntity constraint, but they're redundant.
   * We use `timestamp` as the primary field. createdAt/updatedAt are set to timestamp
   * during creation for compatibility.
   */
  createdAt: Date
  updatedAt: Date
}

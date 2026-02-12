# U3 Change Tracking

## Overview

The Change Tracking use case provides a comprehensive audit trail for all modifications made to critical data in the Notenbank student administration system. This enables administrators and teachers to understand when, how, and by whom data was modified, supporting accountability, error recovery, and data integrity verification.

All changes to the following entities are tracked:
- **Students** - Creation, updates, and deletion
- **Classes** - Creation, updates, and deletion
- **Subjects** - Creation, updates, and deletion
- **Assessments** - Creation, updates, and deletion
- **Assessment Results** - Creation, updates, and deletion (student grades)

## Data Model Overview

### Change Log Table

The system maintains a dedicated `change_log` table with the following structure:

**Core Fields:**
- `id` - Unique identifier for the change record
- `timestamp` - Date and time when the change occurred (ISO 8601 format)
- `entity_type` - Type of entity changed (e.g., "student", "class", "subject", "assessment", "assessment_result")
- `entity_id` - ID of the specific entity that was changed
- `operation` - Type of operation performed: "CREATE", "UPDATE", or "DELETE"
- `user_id` - ID of the user who made the change (for future authentication integration)
- `user_name` - Display name of the user who made the change

**Context Fields:**
- `class_id` - ID of the associated class (for filtering by class)
- `subject_id` - ID of the associated subject (for filtering by subject, null if not applicable)
- `assessment_id` - ID of the associated assessment (for filtering by assessment, null if not applicable)
- `student_id` - ID of the associated student (for filtering by student, null if not applicable)

**Change Details:**
- `entity_data` - Complete entity row data as JSON object containing all fields:
  - For CREATE operations: the new entity data after creation
  - For UPDATE operations: the new entity data after the update
  - For DELETE operations: the entity data before deletion
- `description` - Human-readable description of the change (e.g., "Created student 'Max Mustermann'", "Updated student 'Max Mustermann'", "Deleted class '10A'")

**Notes on entity_data:**
- The `entity_data` field always contains the complete entity row, not just changed fields
- To determine what changed in an UPDATE operation, compare the `entity_data` with the previous change log entry for the same entity
- This approach simplifies change tracking implementation and ensures complete data recovery capability

### Relationship Examples

**Student Creation:**
- `entity_type`: "student"
- `entity_id`: [student_id]
- `operation`: "CREATE"
- `class_id`: [associated class]
- `student_id`: [student_id]
- `entity_data`: `{"id": "123", "firstName": "Max", "lastName": "Mustermann", "classId": "10a", "dateOfBirth": "2008-05-15"}`
- `description`: "Created student 'Max Mustermann' in class '10A'"

**Assessment Result Update:**
- `entity_type`: "assessment_result"
- `entity_id`: [result_id]
- `operation`: "UPDATE"
- `class_id`: [class_id]
- `subject_id`: [subject_id]
- `assessment_id`: [assessment_id]
- `student_id`: [student_id]
- `entity_data`: `{"id": "456", "assessmentId": "789", "studentId": "123", "grade": 2.0, "points": 45, "maxPoints": 50}`
- `description`: "Updated grade for Max Mustermann in 'Mathematik Klassenarbeit'"

**Class Deletion:**
- `entity_type`: "class"
- `entity_id`: [class_id]
- `operation`: "DELETE"
- `class_id`: [class_id]
- `entity_data`: `{"id": "10a", "name": "10A", "schoolYear": "2024/2025", "grade": 10}`
- `description`: "Deleted class '10A'"

## User Stories

### Viewing Change History

**View all changes**
As an administrator, I want to view a chronological list of all changes in the system, so that I can audit system-wide activity.

**View changes for a specific class**
As a teacher, I want to view all changes related to a specific class, so that I can track what has been modified in my class.

**View changes for a specific subject**
As a teacher, I want to view all changes related to a specific subject, so that I can see the history of assessments and results for that subject.

**View changes for a specific assessment**
As a teacher, I want to view all changes related to a specific assessment, so that I can see who entered or modified results.

**View changes for a specific student**
As a teacher, I want to view all changes related to a specific student, so that I can see the complete history of their data and grades.

### Filtering and Searching

**Filter by date range**
As an administrator, I want to filter changes by date range, so that I can focus on changes made during a specific time period.

**Filter by operation type**
As an administrator, I want to filter changes by operation type (CREATE/UPDATE/DELETE), so that I can focus on specific types of modifications.

**Filter by entity type**
As an administrator, I want to filter changes by entity type, so that I can see only changes to students, assessments, or other specific entities.

**Filter by user**
As an administrator, I want to filter changes by user, so that I can see what changes a specific teacher or administrator made.

**Combine multiple filters**
As an administrator, I want to combine multiple filters (e.g., class + date range + operation type), so that I can narrow down changes to exactly what I'm looking for.

### Change Details

**View detailed change information**
As an administrator, I want to view detailed information about a specific change, including the complete entity state, so that I can understand exactly what was modified. For UPDATE operations, I want to see a comparison with the previous state to identify what changed.

**View change context**
As a teacher, I want to see the context of a change (e.g., which class, subject, and student were involved), so that I can understand the full scope of the modification.

**Export change log**
As an administrator, I want to export filtered change logs to CSV or PDF, so that I can share or archive audit records.

### Grade Change Tracking

**View all grade changes for a student**
As a teacher, I want to see all grade changes for a specific student across all subjects, so that I can verify grading accuracy.

**View all grade changes for an assessment**
As a teacher, I want to see all grade changes for a specific assessment, so that I can identify which students' grades were modified after initial entry.

**Highlight recent changes**
As a teacher, I want to see recently changed grades highlighted in the assessment view, so that I can quickly identify what was modified.

### Change Notifications

**View recent changes dashboard**
As an administrator, I want to see a dashboard of recent changes, so that I can monitor system activity at a glance.

**Identify unusual activity**
As an administrator, I want to be alerted to unusual patterns (e.g., many deletions, bulk grade changes), so that I can investigate potential issues.

## Additional Considerations

### Terminology

- The system should use the German label "Änderungsverlauf" or "Verlauf" in the UI for the change log.
- Individual change entries could be labeled as "Änderung" (singular) or "Änderungen" (plural).

### Performance and Storage

**Retention Policy**
- Change logs should be retained indefinitely by default.
- System should support archiving old change logs (e.g., older than 2 years) to separate storage.
- Archived logs should remain accessible but may have slower query performance.

**Indexing Strategy**
- Primary index on `timestamp` for chronological queries.
- Indexes on `class_id`, `subject_id`, `assessment_id`, `student_id` for filtering.
- Composite indexes for common filter combinations.

**Data Volume Considerations**
- For large change sets, implement pagination (e.g., 100 entries per page).
- Provide export functionality for large filtered result sets.
- Consider summarization views for bulk operations.

### Privacy and Security

**Access Control**
- Teachers should only see changes related to their own classes and subjects.
- Administrators should have access to all change logs.
- Change logs themselves should be immutable (cannot be edited or deleted).

**Sensitive Data**
- Personal student data should be handled according to data protection regulations.
- Consider masking sensitive fields in exported change logs unless specifically authorized.

**User Attribution**
- Currently, user tracking uses `user_id` and `user_name` fields.
- Future authentication integration should populate these fields automatically.
- During development/testing phase, system may use placeholder values (e.g., "System", "Admin").

### Change Tracking Implementation

**Automatic Tracking**
- Changes should be tracked automatically at the data access layer (repository level).
- No manual change log entries should be required from UI components.
- All CRUD operations (Create, Read, Update, Delete) on tracked entities should trigger change log entries (except Read operations).
- The complete entity row data should be serialized to JSON and stored in the `entity_data` field.
- Context fields (`class_id`, `subject_id`, `assessment_id`, `student_id`) should be extracted from the entity data for efficient filtering.

**Bulk Operations**
- When multiple entities are changed in a single operation (e.g., entering grades for entire class), each individual change should be logged separately.
- A `batch_id` field could be added to group related changes from the same operation.

**Change Description Generation**
- Human-readable descriptions should be generated automatically based on the entity data.
- Description should include entity type and meaningful identifiers extracted from the entity data.
- For students: include student name and class (e.g., "Created student 'Max Mustermann' in class '10A'")
- For assessments: include assessment name/title and subject (e.g., "Created assessment 'Klassenarbeit Algebra' for Mathematik")
- For assessment results: include student name and assessment name (e.g., "Updated grade for Max Mustermann in 'Mathematik Klassenarbeit'")
- For classes: include class name (e.g., "Deleted class '10A'")
- For subjects: include subject name and class (e.g., "Created subject 'Mathematik' in class '10A'")

### UI Presentation

**Change Log Table Columns**
- Timestamp (date and time)
- User (who made the change)
- Entity (type of entity changed)
- Operation (CREATE/UPDATE/DELETE)
- Description (human-readable summary)
- Details button (to view full before/after values)

**Filter Panel**
- Date range picker (from/to dates)
- Entity type dropdown (All, Student, Class, Subject, Assessment, Assessment Result)
- Operation type checkboxes (Create, Update, Delete)
- Class selector (dropdown or autocomplete)
- Subject selector (dropdown or autocomplete, filtered by class if selected)
- Student selector (dropdown or autocomplete, filtered by class if selected)
- Assessment selector (dropdown or autocomplete, filtered by subject if selected)

**Detail View**
- Full change context (timestamp, user, entity type, operation)
- Complete entity data as JSON (formatted and readable)
- For UPDATE operations: automatic comparison with previous change log entry to highlight what changed
- For CREATE operations: show the complete new entity data
- For DELETE operations: show the complete deleted entity data
- Navigation to related entities (e.g., click student name to view student details)

**Change Comparison (for UPDATE operations)**
- To show what changed, the UI compares the `entity_data` from the current change log entry with the `entity_data` from the previous change log entry for the same entity
- Display fields side-by-side: field name, old value, new value
- Highlight only the fields that changed between the two states
- If no previous entry exists, show all fields as "new"

### Error Recovery

**Audit Trail for Corrections**
- When a teacher corrects an error (e.g., wrong grade entered), both the original entry and the correction are logged.
- This provides a complete audit trail showing the mistake and its correction.

**Data Recovery Support**
- For DELETE operations, the `entity_data` field stores the complete entity state before deletion as JSON.
- This allows manual recovery of accidentally deleted data by administrators.
- For UPDATE operations, previous states can be reconstructed by examining earlier change log entries.

### Reporting

**Common Reports**
- All changes in the last 24 hours / 7 days / 30 days
- All grade changes for a specific assessment
- All changes made by a specific user
- All deletions in a date range
- Grade change summary per class/subject

**Export Formats**
- CSV export with all visible columns and filters applied
- PDF export with formatted table and filter summary header
- Include metadata in exports (export date, filters applied, user who exported)

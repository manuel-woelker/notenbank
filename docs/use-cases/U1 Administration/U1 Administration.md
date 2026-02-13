# U1 Administration

## Overview

The Administration use case enables administrators to manage the core entities of the Notenbank student administration system:
- **Classes** - Organizational units that contain students and subjects
- **Students** - Individual students who belong to a class
- **Subjects** - Academic subjects that are specific to each class

## Data Model Overview

The system maintains the following relationships:
- Each student belongs to exactly one class
- Each subject belongs to exactly one class (subjects are not shared between classes)
- Each class can have multiple students and multiple subjects

## User Stories

### Class Management

**Create a new class**
As an administrator, I want to create a new class, so that I can organize students and subjects within it.

**View a list of all classes**
As an administrator, I want to view a list of all classes, so that I can see what classes exist in the system.

**View details of a specific class**
As an administrator, I want to view the details of a specific class, so that I can see its students and subjects.

**Edit/update class information**
As an administrator, I want to edit class information, so that I can keep class data up to date.

**Delete a class**
As an administrator, I want to delete a class, so that I can remove classes that are no longer needed.

### Student Management

**Add a new student to a class**
As an administrator, I want to add a new student to a class, so that the student can be part of the system.

**View a list of all students**
As an administrator, I want to view a list of all students with their assigned class, so that I can see all students in the system.

**View details of a specific student**
As an administrator, I want to view the details of a specific student, so that I can see their information and class assignment.

**Edit/update student information**
As an administrator, I want to edit student information, so that I can keep student data current and accurate.

**Remove a student**
As an administrator, I want to remove a student from the system, so that students who are no longer enrolled are not tracked.

### Subject Management

**Add a new subject to a class**
As an administrator, I want to add a new subject to a class, so that the class can have subjects associated with it.

**View a list of all subjects**
As an administrator, I want to view a list of all subjects with their assigned class, so that I can see what subjects exist in the system.

**View details of a specific subject**
As an administrator, I want to view the details of a specific subject, so that I can see its information and class assignment.

**Edit/update subject information**
As an administrator, I want to edit subject information, so that I can keep subject data current.

**Remove a subject**
As an administrator, I want to remove a subject from a class, so that subjects that are no longer taught can be removed.

## Additional Considerations

**Class Deletion**
When a class is deleted, the system should handle associated students and subjects appropriately (e.g., prevent deletion if students/subjects exist, or cascade deletion with appropriate warnings).

**Validation Rules**
- Students must be assigned to an existing class
- Subjects must be assigned to an existing class
- Class names should be unique or otherwise identifiable
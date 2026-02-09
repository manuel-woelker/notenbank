# U2 Assessment

## Overview

The Assessment use case enables teachers to define, record, and evaluate student performance for a class. It covers written tests and oral performance, combines them into a final grade, and produces a grade overview per class and per student.

## Data Model Overview

The system maintains the following relationships:
- Each assessment belongs to exactly one class and one subject
- Each assessment has a type (e.g., written test or oral performance)
- Each student can have multiple assessment results per subject
- A final grade is derived from the assessment results of a student per subject

## User Stories

### Assessment Setup

**Define assessment types and weights**
As a teacher, I want to define assessment types (e.g., written test, oral grade) and their weights, so that final grades are calculated consistently.

**Create an assessment**
As a teacher, I want to create an assessment for a class and subject with a date and type, so that I can record results later.

**Edit an assessment**
As a teacher, I want to edit assessment metadata (date, type, weight), so that I can correct mistakes.

**Delete an assessment**
As a teacher, I want to delete an assessment, so that outdated or incorrect entries can be removed.

### Recording Results

**Enter results for a class**
As a teacher, I want to enter results for all students in a class for a given assessment, so that the assessment is complete.

**Enter or update a single result**
As a teacher, I want to edit a single student's result, so that late changes or corrections are possible.

**Handle missing results**
As a teacher, I want to mark a result as missing (e.g., absent), so that calculations and reports are accurate.

### Grade Calculation

**Calculate final grade per subject**
As a teacher, I want the system to calculate a student's final grade per subject using the defined weights, so that grading is consistent and transparent.

**Preview calculation**
As a teacher, I want to preview how the final grade is calculated from written and oral grades, so that I can verify correctness.

### Reporting

**View grade overview per class**
As a teacher, I want to see a class overview of assessments and grades, so that I can monitor progress.

**View student grade history**
As a teacher, I want to see all assessments and grades for a student in a subject, so that I can explain their final grade.

## Additional Considerations

**Terminology**
- The system should use the German label "Leistungsfeststellung" in the UI.

**Calculation Rules**
- Grades are numeric in 0.25 increments.
- Weighting is defined per subject as a ratio (e.g., "Written: 2 / Oral: 1").
- No rounding is applied to final grades.
- Missing results are excluded from calculations.

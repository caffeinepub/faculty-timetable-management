# Faculty Timetable Management System

## Current State

Version 21 deployed. Key files:
- `LoginPage.tsx` has Tabs with Internet Identity + Username/Password tabs
- `ExamMarksPage.tsx` uses hardcoded `CURRENT_TEACHER_ID = "teacher-1"`, no lock after submit
- `StudentAttendancePage.tsx` uses hardcoded `CURRENT_TEACHER_ID = "teacher-1"`, has `alreadySubmitted` check but still renders editable form below it
- `useStudentAttendanceStore.ts` has `hasSubmitted()` and `submitAttendance()`
- `useStudentExamStore.ts` has `saveMarks()` but no `hasSubmitted()` check
- Stores: useBillingStore, useTimetableStore, useAttendanceStore, useLeaveStore, usePerformanceStore, useStudentExamStore, useStudentStore, useCourseStore - no cascade delete helpers yet

## Requested Changes (Diff)

### Add
- `useStudentExamStore`: add `hasSubmittedMarks(teacherId, className, paperCode, examType)` function
- `StudentAttendancePage.tsx`: when `alreadySubmitted === true`, show a read-only view of the submitted attendance with a PDF download button. Hide the editable input fields entirely.
- `ExamMarksPage.tsx`: after submit, mark the submission as locked. Add `hasSubmittedMarks` check; when already submitted show read-only table with PDF download button. Use profile prop or credential session ID for teacherId instead of hardcoded value.
- PDF download: use `window.print()` with a print-specific CSS class to generate PDF for both marks and attendance pages. Add a "Download PDF" button that triggers a formatted print view.
- Cascade delete helpers in all stores (see spec v22 above)
- Internet Identity tab removal from LoginPage

### Modify
- `ExamMarksPage.tsx`: 
  - Replace `CURRENT_TEACHER_ID = "teacher-1"` with prop-based or session-based teacher ID (read from localStorage `ftms_session` for credential users)
  - After `handleSubmit()` succeeds, set a `submitted` state to true — switch to read-only view
  - On page load, if `hasSubmittedMarks` returns true for selected class/paper/examType, show read-only view immediately
  - Read-only view shows same table but with plain text instead of Input fields, plus a "Download PDF" button
- `StudentAttendancePage.tsx`:
  - Replace `CURRENT_TEACHER_ID = "teacher-1"` with session-based ID
  - When `alreadySubmitted === true`: do NOT render the editable table or Submit button. Instead show a read-only table of the submitted records (fetched via `getRecordsBySubmission`) plus a "Download PDF" button
  - The "Load Students" button should also be hidden when already submitted
- `useStudentExamStore.ts`: add `hasSubmittedMarks(teacherId, className, paperCode, examType): boolean` — checks if marks already saved for this combination

### Remove
- Editable inputs when attendance/marks already submitted
- Internet Identity tab from LoginPage

## Implementation Plan

1. **LoginPage.tsx** - Remove Tabs wrapper and II tab. Render credentials form directly.
2. **useStudentExamStore.ts** - Add `hasSubmittedMarks(teacherId, className, paperCode, examType)` function.
3. **ExamMarksPage.tsx** - Fix teacher ID, add submit lock (read-only after submit), add PDF download.
4. **StudentAttendancePage.tsx** - Fix teacher ID, enforce read-only when submitted, add PDF download.
5. **Store cascade helpers** - Add to all 8 stores.
6. **FacultyManagement.tsx** - Wire cascade delete with confirmation dialog.
7. **CourseManagement.tsx** - Wire assignment cascade delete.
8. **Validate** - lint fix + typecheck + build.

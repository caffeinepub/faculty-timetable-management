# Faculty Timetable Management

## Current State

The Teacher portal has two separate billing pages:
1. **BillSubmission** (`/teacher/bills`) — daily class bill entry using subject+batch, date, hours.
2. **CourseClassBillingPage** (`/teacher/course-billing`) — course-wise class entry with monthly limit enforcement.

Existing stores: `useBillingStore` (DailyClassBill, workflow Draft→Submitted→Checked→Approved), `useCourseClassStore`, `useCourseStore` (Course + CourseAssignment), `useDepartmentStore`, `useTimetableStore` (TimetableEntry with roomId, subjectId, teacherId).

## Requested Changes (Diff)

### Add
- New `FacultyBillEntry.tsx` at `/teacher/bill-entry` combining both old pages
- Cascading form: Department (only where teacher has assignments) → Course → Class → Subject → Paper Code (auto read-only) → Room No (auto from timetable lookup)
- Date: max=today, no future dates; selecting date auto-fills Month and Year (read-only)
- Start Time and End Time: hour-only AM/PM dropdowns (8 AM, 9 AM...6 PM). No minutes.
- No. of Hours: auto-calculated integer (End hour - Start hour), read-only
- Remarks: optional free-text (bilingual label: if master timetable not followed)
- Monthly limit check before save (₹45,000 default, course-configurable). Block if exceeded.
- TDS 10% on gross, show Gross/TDS/Net summary
- Class usage progress bars (current month)
- Bill table: Date, Dept, Course, Class, Subject, Paper Code, Room, Start, End, Hours, Gross, TDS, Net, Remarks, Status, Submit/Delete
- Entries saved as DailyClassBill (status Draft) → feeds existing checker/admin approval workflow

### Modify
- `CourseAssignment` model: add `departmentId?: string`
- `DailyClassBill` model: add `departmentId, courseId, className, subjectName, paperCode, roomNo, startTime, endTime, hoursCalculated, remarks` fields
- `useCourseStore`: add departmentId to SAMPLE_ASSIGNMENTS; add helper `getAssignmentsByDeptAndTeacher`
- `App.tsx`: remove `/teacher/bills` and `/teacher/course-billing` routes+sidebar; add `/teacher/bill-entry`

### Remove
- Old `BillSubmission.tsx` and `CourseClassBillingPage.tsx` (unlinked from routing)
- Sidebar nav items for old bill pages

## Implementation Plan

1. Update `CourseAssignment` and `DailyClassBill` types in `models.ts`
2. Update `useCourseStore.ts` sample data with departmentId
3. Update `useBillingStore.ts` to accept extended fields
4. Create `FacultyBillEntry.tsx` with full cascading UI, time selectors, auto-calc, usage bars, bill table
5. Update `App.tsx` routing and sidebar

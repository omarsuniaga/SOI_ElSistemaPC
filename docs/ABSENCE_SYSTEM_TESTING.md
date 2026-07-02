---
doc_id: PORTAL-008
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\ABSENCE_SYSTEM_TESTING.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-008
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Absence System — Testing Documentation

## Overview

This document summarizes the complete test coverage for the Absence (Ausencias) system, including unit tests, integration tests, and end-to-end (E2E) tests.

---

## Test Coverage Summary

| Layer       | Suite                        | Tests |
|-------------|------------------------------|-------|
| Unit        | ausenciaValidator            | 13    |
| Unit        | ausenciaService              | 8     |
| Unit        | ausenciasApi                 | 6     |
| Unit        | ausenciaModal (component)    | 10    |
| Unit        | ausenciasDirectorView        | 4     |
| Unit        | ausenciasAdminView           | 4     |
| Integration | ausencia-workflow            | 18    |
| E2E         | ausenciaModal.e2e            | 21    |
| **Total**   |                              | **84**|

All 84 tests pass.

---

## Test Execution Results

```
Unit Tests
  ausenciaValidator        13/13 passed
  ausenciaService           8/8  passed
  ausenciasApi              6/6  passed
  ausenciaModal            10/10 passed
  ausenciasDirectorView     4/4  passed
  ausenciasAdminView        4/4  passed

Integration Tests
  ausencia-workflow        18/18 passed

E2E Tests
  ausenciaModal.e2e        21/21 passed

─────────────────────────────────────
Total                      84/84 passed
```

---

## Running the Tests

### All tests

```bash
npm test
```

### Unit tests only

```bash
npm run test:unit
```

### Integration tests only

```bash
npm run test:integration
```

### E2E tests only

```bash
npm run test:e2e
```

### Single suite

```bash
# Example: run only the validator suite
npx vitest run src/tests/unit/ausenciaValidator.test.ts
```

### Watch mode (development)

```bash
npm run test:watch
```

### Coverage report

```bash
npm run test:coverage
```

---

## Test File Locations

```
src/
└── tests/
    ├── unit/
    │   ├── ausenciaValidator.test.ts
    │   ├── ausenciaService.test.ts
    │   ├── ausenciasApi.test.ts
    │   ├── ausenciaModal.test.ts
    │   ├── ausenciasDirectorView.test.ts
    │   └── ausenciasAdminView.test.ts
    ├── integration/
    │   └── ausencia-workflow.test.ts
    └── e2e/
        └── ausenciaModal.e2e.ts
```

---

## What Each Suite Covers

### Unit — `ausenciaValidator` (13 tests)
- Required field validation (student, date, reason, type)
- Date range validation (cannot be future-dated beyond policy window)
- Duplicate absence detection
- Character limits on justification text
- Edge cases: empty strings, null values, boundary dates

### Unit — `ausenciaService` (8 tests)
- Create absence record
- Update absence status (pending → approved / rejected)
- Fetch absences by student
- Fetch absences by course and date range
- Delete absence (admin only)
- Business rules: max absences threshold triggers alert

### Unit — `ausenciasApi` (6 tests)
- `GET /absences` — list with filters
- `POST /absences` — create
- `PUT /absences/:id` — update status
- `DELETE /absences/:id` — delete
- Error responses: 400, 403, 404
- Authentication header propagation

### Unit — `ausenciaModal` (10 tests)
- Renders form fields correctly
- Submit button disabled while form is invalid
- Shows validation errors inline
- Calls `onSave` callback with correct payload on valid submit
- Calls `onClose` on cancel
- Loading state disables all inputs
- Displays existing record data in edit mode
- Clears form on modal close

### Unit — `ausenciasDirectorView` (4 tests)
- Renders absence list for director's courses
- Filters by date range
- Displays student name and absence count
- Shows alert badge when threshold exceeded

### Unit — `ausenciasAdminView` (4 tests)
- Renders full absence list with admin controls
- Bulk approve action
- Export to CSV
- Pagination

### Integration — `ausencia-workflow` (18 tests)
- Full create → approve → notify workflow
- Director submits absence, admin receives notification
- Rejection flow with reason propagation
- Concurrent absence creation (race condition guard)
- Role-based access: student cannot approve
- Role-based access: director cannot delete
- Audit log entries created on status change
- Email notification triggered on approval
- Dashboard counters update after create/delete

### E2E — `ausenciaModal.e2e` (21 tests)
- Open modal from director view
- Fill and submit new absence
- Validation errors appear without page reload
- Cancel closes modal without saving
- Edit existing absence pre-populates fields
- Approve absence from admin panel
- Reject absence with reason text
- Student view shows approved/rejected status
- Absence appears in export after creation
- Session timeout handling mid-flow
- Accessibility: modal traps focus correctly
- Keyboard navigation through form fields
- Screen reader labels present on all inputs

---

## Manual Testing Checklist

Use this checklist for release sign-off when automated tests cannot cover environment-specific behavior.

### Authentication & Authorization
- [ ] Student logs in — absence list shows only their own records
- [ ] Director logs in — sees only courses they are assigned to
- [ ] Admin logs in — sees all absences across all courses
- [ ] Unauthenticated request to `/absences` returns 401

### Absence Creation (Director)
- [ ] Form opens without console errors
- [ ] All required fields show validation message when left empty
- [ ] Date picker blocks future dates beyond allowed window
- [ ] Submitting valid form creates record and closes modal
- [ ] New absence appears immediately in the list (optimistic UI or refetch)

### Absence Approval / Rejection (Admin)
- [ ] Admin can approve a pending absence
- [ ] Admin can reject with a written reason
- [ ] Status badge updates without full page reload
- [ ] Notification appears in director's notification bell after approval

### Threshold Alerts
- [ ] Alert badge appears on student row when absence count reaches threshold
- [ ] Alert clears if absences are deleted below threshold

### Export
- [ ] CSV export downloads with correct headers and data
- [ ] Export respects active filters (date range, course)

### Accessibility
- [ ] Modal closes on Escape key
- [ ] Tab order moves logically through form fields
- [ ] Error messages are announced by screen reader (aria-live)

### Mobile / Responsive
- [ ] Absence list scrolls horizontally on small screens without overflow
- [ ] Modal is usable on 375 px viewport

---

## Known Limitations

1. **E2E environment**: E2E tests run against a mocked Supabase instance. Tests do not cover actual network latency or Supabase rate limits.

2. **Email delivery**: Integration tests assert that the notification service is called; actual email delivery is not verified in automated tests. Manual verification is required against a staging SMTP endpoint.

3. **Concurrent writes**: The race condition guard in the integration suite uses in-memory locks. Behavior under high concurrency in production (Postgres row-level locking) is not covered by current tests.

4. **Offline / PWA cache**: No automated tests cover the Service Worker caching layer for the absence flow. Manual testing on a throttled connection is recommended before each release.

5. **Browser compatibility**: E2E suite runs in Chromium only. Firefox and Safari compatibility relies on manual QA.

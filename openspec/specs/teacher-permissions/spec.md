# teacher-permissions Specification

## Purpose

Admin-managed boolean permission flags per teacher (`puede_registrar_alumnos`, `puede_inscribir_clases`) with full audit trail. Portal Maestros enforces flags at render time to conditionally show/hide registration UI.

## Requirements

### Requirement: Teacher Permission List

The admin panel MUST display all teachers with their `puede_registrar_alumnos` and `puede_inscribir_clases` status as toggle switches.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| List renders | an authenticated admin | they navigate to "Permisos de Maestros" | a table renders all teachers with both permission toggles |
| Empty roster | no teachers exist | the admin views the page | an empty-state message shows "No hay maestros registrados" |

### Requirement: Toggle Teacher Permission

Admin MUST toggle each permission independently per teacher using optimistic UI (update immediately, persist, rollback on failure). Each change MUST record `concedido_por` (admin UUID) and `updated_at` timestamp.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Grant permission | admin on permissions table | they toggle off → on | toggle switches immediately; change persists; success toast; audit records admin ID |
| Revoke permission | teacher has active permission | admin toggles on → off | toggle switches immediately; change persists; audit records revoker ID |
| Network failure | admin toggles a permission | persistence call fails | toggle reverts to previous state; error toast "Error al actualizar permiso" |

### Requirement: Portal Permission Enforcement

Portal Maestros MUST check `permisoService.fetchCurrent()` at render time before showing registration UI. The permission check SHALL occur on every view transition (hash-based SPA navigation).

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Permission granted | teacher authenticated | `fetchCurrent()` returns `puede_registrar_alumnos: true` | "Registrar Alumno" nav item visible; registration route accessible |
| Permission denied | teacher authenticated | `fetchCurrent()` returns `puede_registrar_alumnos: false` | nav item hidden; route shows "no autorizado" |
| Permission revoked mid-session | teacher had permission on prior page load | they navigate away and return | nav item hidden on next render; route shows "no autorizado" |

## Acceptance Criteria

- [ ] Admin permission list renders toggles for all teachers
- [ ] Optimistic toggle with rollback on network error
- [ ] Every permission change records `concedido_por` + `updated_at`
- [ ] Teacher sees registration UI only when `puede_registrar_alumnos` is true
- [ ] Revoked permission hidden on next portal page load
- [ ] Full flow works in Demo mode (mock data)

# Proposal: Teacher-Authorized Student Registration (registro-alumnos)

## Intent

Only admins can register students today, forcing teachers to wait for admin availability during enrollment. This change lets teachers register students in their own classes when an admin explicitly grants permission — removing the bottleneck without sacrificing control.

## Scope

### In Scope
- `permisos_maestros` table (maestro_id, puede_registrar_alumnos, puede_inscribir_clases, concedido_por, timestamps)
- `src/modules/permisos/` with DataAdapter pattern (mock + supabase + api dispatcher)
- Admin "Permisos de Maestros" section — teacher table with boolean toggles
- `src/portal-maestros/services/permisoService.js` — permission checks for current teacher
- `src/portal-maestros/views/registroAlumnoView.js` — registration form + class enrollment
- Portal routing via `portalRouter.js` — conditional nav based on permissions
- Mock data: `permisos.json`, `alumnos.json` updates for in-memory create

### Out of Scope
- No changes to existing admin alumnos CRUD, auth, or other modules
- No email/SMS notifications on registration
- No student self-registration portal

## Capabilities

### New Capabilities
- `teacher-permissions`: Boolean permission flags per teacher (puede_registrar_alumnos, puede_inscribir_clases). Admin grants/revokes; portal checks at render time.
- `student-registration`: Teacher workflow to register a new student and optionally enroll them in a class. Reuses existing alumnos table and alumnos_clases junction.

### Modified Capabilities
None — existing specs (ruta-player-view, notification-polling, enterprise-docs) are unaffected.

## Approach

New module `src/modules/permisos/` follows the established DataAdapter pattern (alumnos module as reference). Admin panel adds a "Permisos" entry to the 12-module sidebar. Portal checks permissions via `permisoService` at render time (not route-guard, simpler and equally secure). Mock-first: entire flow works in demo mode before Supabase.

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/permisos/` | **New** | Full module: api/, models/, hooks/, views/ |
| `src/main.js` | Modified | Add `permisos` to MODULES_REGISTRY |
| `src/portal-maestros/services/permisoService.js` | **New** | Fetch current teacher's permissions |
| `src/portal-maestros/views/registroAlumnoView.js` | **New** | Registration form + class enrollment |
| `src/portal-maestros/router/portalRouter.js` | Modified | Wire `registro-alumno` route |
| `src/assets/data/mocks/permisos.json` | **New** | Mock permission data |
| `src/assets/data/mocks/alumnos.json` | Modified | Mock in-memory persistence support |
| `supabase/migrations/*_permisos_maestros.sql` | **New** | DB migration for new table |

## Key Decisions

- **Boolean flags over RBAC**: Simpler to implement, audit, and understand. Upgradable to roles later.
- **Two independent flags**: `puede_registrar_alumnos` (can add student) + `puede_inscribir_clases` (can enroll into class). Admin can grant registration-only.
- **Application-level checks**: No RLS policies initially. Permissions checked at render time.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| New module follows known DataAdapter pattern | Low | alumnos module and existing 12 modules are direct references |
| Portal view is additive, zero touch to existing views | Low | No existing view changes needed |
| Mock must handle in-memory create persistence | Medium | Same pattern as `alumnosMock.js` — array push with generated ID |

## Rollback

Single `git revert` of merge commit. New table is additive (no existing table depends on it). Module and view unreferenced until routing is wired. No data migration needed.

## Success Criteria

- [ ] Admin can grant/revoke `puede_registrar_alumnos` per teacher via admin UI
- [ ] Teacher sees "Registrar Alumno" nav item ONLY when permission is granted
- [ ] Teacher fills form and new student appears in class roster
- [ ] Teacher without permission sees no registration UI
- [ ] Full flow works in Demo mode (mock data)
- [ ] All existing tests pass (`npm run test:run`)

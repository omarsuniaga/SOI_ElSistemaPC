# Tasks: RLS + Permisos Flexibles para Maestros

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250 - 350 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | SQL Infrastructure & RLS (P0/P1/P2) | PR 1 | Base SQL, helpers, and policies |
| 2 | Frontend Permiso Model & Service | PR 1 | Integration with new array-based permissions |

## Phase 1: SQL Infrastructure & Migration

- [x] 1.1 Create migration `supabase/migrations/20260518_rls_permisos_maestros.sql`
- [x] 1.2 Implement `maestro_actual()` and `tiene_permiso(text)` helpers
- [x] 1.3 Add `permisos` and `solicitudes` columns to `permisos_maestros`
- [x] 1.4 Implement data migration from boolean columns to `permisos` array
- [x] 1.5 Create performance indexes for RLS (P0-P2 tables)

## Phase 2: RLS Implementation (P0, P1, P2)

- [x] 2.1 Enable RLS and add policies for P0 tables (plan_indicadores, asistencias, etc.)
- [x] 2.2 Enable RLS and add policies for P1 tables (alumnos, clases, sesiones)
- [x] 2.3 Enable RLS and add policies for P2 tables (ausencias, progresos, etc.)
- [x] 2.4 Add GRANTS for helpers to `authenticated` role

## Phase 3: Frontend Model & Services

- [x] 3.1 Update `src/modules/permisos/models/permiso.model.js` to include `permisos` array
- [x] 3.2 Update `src/assets/data/mocks/permisos.json` with mock array data
- [x] 3.3 Update `src/modules/permisos/api/permisosSupabase.js` to fetch/save `permisos`
- [x] 3.4 Update `src/modules/permisos/api/permisosMock.js` to return `permisos` array
- [x] 3.5 Refactor `src/modules/permisos/api/permisoService.js` to map array → booleano flags

## Phase 4: Verification & Testing

- [x] 4.1 SQL Test: Verify `maestro_actual()` returns correct ID for authenticated user
- [x] 4.2 SQL Test: Verify RLS isolation (Teacher A cannot see Teacher B's data)
- [x] 4.3 Unit Test: Update `src/__tests__/permisoService.test.js` for array mapping logic
- [x] 4.4 Integration Test: Verify end-to-end permission flow in Portal Maestros

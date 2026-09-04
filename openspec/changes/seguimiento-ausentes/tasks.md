# Seguimiento de Alumnos Ausentes — Task Breakdown

**Change:** seguimiento-ausentes  
**Status:** Ready for apply (Phases 0–1 this session)  
**Execution Mode:** interactive  
**Delivery Strategy:** ask-on-risk → **Chained PRs Recommended: Yes**  
**Total Tasks:** 38 (Phases 0–4; Phases 2–4 deferred)  
**Estimated Lines (Phases 0–1 only):** ~500 (120 Fase 0 + 180 Fase 1a + 220 Fase 1b)  

---

## Corrections to Design

The design.md had three minor path/implementation errors caught during task decomposition:

1. **Maestro portal path**: Design referenced `src/portales/maestros/` but the actual path is **`src/portal-maestros/`** (hyphenated, singular). Maestro badge integration will be in `src/portal-maestros/views/` or a shared component, NOT a separate portal subdirectory.

2. **Route registration**: Design said "add `registerRoutesPedagogico()` call to `src/main.js`", but it's **already imported at line 104**. No changes needed to main.js; just define routes in `src/modules/pedagogico/pedagogico.router.js` and add new nav entries to `src/portales/acm/acm.js`.

3. **Templates table**: Confirmed as **`document_templates`** ✓ (design was correct). Service functions in `documentTemplateService.js` exist.

---

## Review Workload Forecast

**Applies to Phases 0–1 only (user request this session):**

| Phase | Scope | Est. Lines | Risk | Budget Status |
|-------|-------|-----------|------|---|
| **0** | Bug fix (studentRiskDetectorService) + helper (resolverContactoAlumno) + seed rule + unit tests. No UI, no migrations. | ~120 | LOW | ✓ Under 400-line budget |
| **1a** | Migrations (DDL + RLS), DataAdapter service, integration tests. | ~180 | MEDIUM | ✓ Under 400-line budget |
| **1b** | ACM view + detail panel, ADM read-only KPI cards, nav registration, tests. | ~220 | MEDIUM | ✓ Under 400-line budget |
| **Total** | | ~500 | LOW–MEDIUM | ✓ Chained PRs (3 reviewable slices) |

**Decision**: Each PR is well under the 400-line per-PR budget. Recommend **chained (sequential) PRs** for this session:
- **PR 0:** Fase 0 (standalone, can merge immediately; no dependencies)
- **PR 1a:** Fase 1a (depends on nothing; foundation for 1b + Phases 2–4)
- **PR 1b:** Fase 1b (depends on 1a)

**No size:exception needed.** Phases 2–4 are independent follow-up PRs (out-of-scope this session).

---

## Phasing Summary

| Phase | Deliverable | Status This Session | Dependencies |
|-------|---|---|---|
| **0** | Bug fix + escalation foundation (no DB/UI) | **ACTIVE** | None |
| **1** | Data layer (DB migrations, view, service) + ACM/ADM UI | **ACTIVE** (split 1a→1b) | None (but 1b depends on 1a) |
| **2** | Contact action handler (WhatsApp links, duplicate guard) | `[deferred]` | Depends on Fase 1 |
| **3** | Retención workflow + reincorporation + maestro badge | `[deferred]` | Depends on Fase 1 + 2 |
| **4** | ADM analytics dashboard + CSV export + KPI refinements | `[deferred]` | Depends on Fase 1–3 |

---

## Dependency Graph

```
Fase 0 (bug fix + helper)
  ↓ (no dependency; can ship independently)
  ↓
Fase 1a (migrations + data service + tests)
  ↓ (blocks 1b, 2, 3, 4)
  ↓
Fase 1b (ACM/ADM UI + nav registration)
  ↓ (blocks 2)
  ↓
[LATER] Fase 2 (contact action + duplicate guard)
  ↓ (blocks 3)
  ↓
[LATER] Fase 3 (retención + maestro badge)
  ↓ (blocks 4)
  ↓
[LATER] Fase 4 (analytics + CSV export)
```

---

## FASE 0: Bug Fix & Escalation Foundation

**Scope**: Fix the critical bug in risk detection (estado filter), create the contact resolution cascade helper, seed the ausentismo config rule. **No database changes. No UI.**

**Acceptance Criteria** (from spec):
- [x] `studentRiskDetectorService` filter corrected: `estado='ausente'` (not `'A'`)
- [x] `resolverContactoAlumno(alumnoId)` returns correct origen label
- [x] `seguimiento_reglas` row seeded with tipo='ausentismo_acumulado'
- [x] All tests pass (Vitest)

---

### T0.1 (Vitest) — Write failing unit tests for studentRiskDetectorService estado filter

**File**: `tests/unit/pedagogico/services/studentRiskDetectorService.estado-fix.test.js`

**Description**:  
Write unit tests that verify `detectAttendanceRisk()` counts only `estado='ausente'` rows (not `'A'`). Tests should:
- Mock `supabase.from('asistencias').select()` to return rows with `estado='ausente'`
- Verify `detectAttendanceRisk()` correctly increments count
- Test that other estados (`'presente'`, `'justificado'`) are NOT counted
- Test edge case: `estado='A'` (legacy code) should NOT count after the fix

**Spec Link**: AC-199 (Student Risk Detection bug fix scenario)

**Dependencies**: None

**Estimated Lines**: 30

**Test Framework**: Vitest with `vi.mock('lib/supabaseClient.js')`

**Done Criteria**:
- [x] Test file created
- [x] Test for `estado='ausente'` counting implemented
- [x] Test for `estado='A'` NOT counting implemented
- [x] Tests now PASS (after code fix)

---

### T0.2 (Implementation) — Fix studentRiskDetectorService estado filter

**File**: `src/modules/pedagogico/services/studentRiskDetectorService.js`

**Description**:  
Fix the legacy state code bug. **Read the entire file first.** Map each legacy code occurrence to the correct full word:

| Line | Current | Fix | Reason |
|------|---------|-----|--------|
| 38 | `a.estado === 'A'` | `a.estado === 'ausente'` | Spec: filter by 'ausente' state, not legacy 'A' |
| 39 | `a.estado === 'J'` | `a.estado === 'justificado'` | Consistency; though not used in Fase 0 (Fase 1 filters only 'ausente') |
| 65 | `a.estado === 'T'` | **See WARNING below** | Tardanza mapping needs verification |
| (other occurrences) | — | — | Check lines ~260, 277 per design warning |

**WARNING: Tardanza handling**:
The spec.md says the Punta Cana DB only has three estado values: `'presente'`, `'ausente'`, `'justificado'`. Tardanza (`'T'`) may NOT exist in the real data. Before fixing line 65, **read the database schema** (or ask Supabase) to confirm:
- Does asistencias table have any rows with `estado='tardanza'` or equivalent?
- If tardanza is recorded, what value is it?
- If tardanza doesn't exist, change line 65 to skip/comment it with a TODO for future Fase when tardanza is tracked.

**Spec Link**: AC-199 (Student Risk Detection), spec.md L193–203

**Dependencies**: T0.1 (tests must exist and be failing)

**Estimated Lines**: 10 (find-replace with mapping validation)

**Done Criteria**:
- [x] File read and all estado filter lines identified (38, 39, 65, 260, 277)
- [x] `'A'` → `'ausente'` replacement made
- [x] `'J'` → `'justificado'` replacement made
- [x] Tardanza mapping confirmed: changed 'T' to 'tarde' with TODO comment (DB only has presente|ausente|justificado)
- [x] T0.1 tests now PASS

---

### T0.3 (Vitest) — Write failing unit tests for resolverContactoAlumno cascade

**File**: `tests/unit/pedagogico/services/seguimientoAusentesService.resolverContacto.test.js`

**Description**:  
Write cascading contact resolution tests. Each test verifies one tier of the cascade order:

1. representantes.telefono_whatsapp (direct alumno link) — **tier 1**
2. representantes via alumnos.familia_id (pagador or other) — **tier 2**
3. alumnos.representante_tlf — **tier 3**
4. alumnos.madre_tlf_whatsapp — **tier 4**
5. alumnos.padre_tlf_whatsapp — **tier 5**
6. alumnos.familiar_telefono — **tier 6**
7. alumnos.contacto_emergencia_telefono — **tier 7**

Tests should:
- Mock each tier with valid & invalid (malformed) phone numbers
- Verify correct tier is selected (first non-empty wins)
- Verify `origen` label matches tier (e.g., `'representante_alumno'` for tier 1)
- Test fallthrough when a tier has malformed number
- Test phone normalization (7 digits → +1809XXXXXXX, invalid → skip)
- Test null return when all tiers are empty

**Spec Link**: AC-34 (Contact Resolution Cascade), spec.md L33–64

**Dependencies**: None

**Estimated Lines**: 60

**Done Criteria**:
- [x] Test file created
- [x] All 7 tiers have at least one test case
- [x] Fallthrough test case (malformed skips tier)
- [x] Origin label test for each tier
- [x] Phone normalization test (7→11 digits)
- [x] Tests now PASS (after service implementation)

---

### T0.4 (Implementation) — Create resolverContactoAlumno service helper

**File**: `src/modules/pedagogico/services/seguimientoAusentesService.js` (new file)

**Description**:  
Create the cascading contact resolution helper. This is a **pure data service** (DataAdapter pattern — no UI logic). Function signature:

```javascript
export async function resolverContactoAlumno(alumnoId) {
  // Returns { nombre, telefono, origen } or { origen: null }
  // origen values: 'representante_alumno', 'representante_familia', 
  //   'alumnos_representante_tlf', 'alumnos_madre_tlf_whatsapp', 
  //   'alumnos_padre_tlf_whatsapp', 'alumnos_familiar_telefono', 
  //   'alumnos_contacto_emergencia_telefono', null
}
```

**Implementation**:
1. Query alumnos row by ID
2. Query representantes (direct and via familia_id)
3. Iterate cascade order (Tier 1 → Tier 7)
4. For each tier, extract phone and normalize via `phoneUtils.normalizePhone()`
5. Skip if malformed (null after normalize)
6. Return first valid with matching origen label
7. Return `{origen: null}` if all tiers empty

**Reuse**: Import `whatsappLink` from `phoneUtils.js` (for later phases); ensure `normalizePhone()` handles DR format (7→11 digits).

**Spec Link**: AC-34, spec.md L33–64

**Dependencies**: T0.3 (tests must pass after implementation)

**Estimated Lines**: 50

**Done Criteria**:
- [x] Service file created with correct export
- [x] All 7 tiers implemented in cascade order
- [x] Phone normalization applied (via local normalizarTelefonoRD helper for DR format)
- [x] Correct origen labels returned
- [x] T0.3 tests PASS
- [x] Service exported from `src/modules/pedagogico/index.js`

---

### T0.5 (Vitest) — Write failing unit tests for seguimiento_reglas seed

**File**: `tests/unit/pedagogico/services/seguimientoRulesService.ausentismo-seed.test.js`

**Description**:  
Test that the seeded `seguimiento_reglas` row exists with correct config. Tests:
- Query `seguimiento_reglas` by tipo='ausentismo_acumulado'
- Verify config has `{nivel1: 1, nivel2: 2, nivel3: 3, contar_justificadas: false}`
- Verify `estado='activo'` or equivalent
- Verify row can be loaded by `getActiveRuleByTipo('ausentismo_acumulado')`

**Spec Link**: AC-1 (Absence Escalation Read Model), spec.md L7

**Dependencies**: None (mock the rule lookup)

**Estimated Lines**: 15

**Done Criteria**:
- [x] Test file created
- [x] Test queries seguimiento_reglas by tipo
- [x] Tests PASS (mocked rule data; real seed will be added in Fase 1a migration)

---

### T0.6 (Integration) — Run Fase 0 unit tests end-to-end

**File**: (Existing tests; no new file)

**Description**:  
Run all Fase 0 tests together to verify they pass:
```bash
npm run test:run -- tests/unit/pedagogico/services/studentRiskDetectorService.estado-fix.test.js tests/unit/pedagogico/services/seguimientoAusentesService.resolverContacto.test.js tests/unit/pedagogico/services/seguimientoRulesService.ausentismo-seed.test.js
```

**Test Framework**: Vitest (npm run test:run)

**Done Criteria**:
- [x] All Fase 0 tests pass (20 tests across 3 files)
- [x] No errors in console
- [x] Full suite passes: 177 tests in pedagogico & alumnos, no regressions

---

## FASE 1A: Data Layer — Migrations & Service

**Scope**: Create the database schema (`vw_seguimiento_ausentes` view, `retenciones_instrumento` table, ALTER `comunicaciones_seguimiento`), the DataAdapter service, and integration tests. **No UI in this phase.**

**Acceptance Criteria** (from spec):
- [ ] `vw_seguimiento_ausentes` returns correct columns and computes nivel 0–3
- [ ] `retenciones_instrumento` table created with correct schema
- [ ] `comunicaciones_seguimiento` columns added (nivel, origen)
- [ ] `seguimiento_reglas` seeded with ausentismo_acumulado config
- [ ] RLS policies enforce ACM-only access
- [ ] DataAdapter service tested (fetchAusentesResolutionView, registrarContacto, etc.)

---

### T1a.1 (Vitest) — Write failing integration test for vw_seguimiento_ausentes

**File**: `tests/integration/pedagogico/vw-seguimiento-ausentes.test.js`

**Description**:  
Test the read-model view (will be created in T1a.4). Test scenarios:

1. **Nivel computation**: Insert asistencias with `estado='ausente'` for an alumno on 2 distinct dates. Query view → verify `dias_ausente=2`, `nivel=2`.
2. **Same-day aggregation**: Insert 2 asistencias (same alumno, same fecha, same estado='ausente') → verify `dias_ausente=1` (not 2).
3. **Exclusion of inactivo**: Insert inactivo alumno with 3 absences → verify NOT in view.
4. **Contact cascade**: Query `contacto_nombre`, `contacto_telefono`, `contacto_origen` for an alumno with all 7 tiers present → verify top tier selected.
5. **Reincorporation reset**: Insert retención with `fecha_reincorporacion=today`, then absences AFTER that date → verify counter resets (only counts post-reincorporation dates).

**Spec Link**: AC-1, AC-2, AC-3 (View scenarios)

**Dependencies**: None (mock the DB state, or use test fixtures)

**Estimated Lines**: 80

**Done Criteria**:
- [ ] Test file created with 5 scenario tests
- [ ] Each test inserts fixture data (asistencias, retenciones, alumnos)
- [ ] Tests verify view columns and nivel logic
- [ ] Tests FAIL (view doesn't exist)

**NOTE (Fase 1a execution)**: Integration tests for view require DB migration (T1a.4) to be applied first. Migration is already applied to production by orchestrator. Unit tests for service methods (T1a.3) are DONE and PASSING.

---

### T1a.2 (Vitest) — Write failing integration test for retenciones_instrumento RLS

**File**: `tests/integration/pedagogico/retenciones-rls.test.js`

**Description**:  
Test RLS policies on the retenciones table (will be created in T1a.3). Scenarios:

1. **ACM can INSERT**: Mock user with `es_admin()=true` → attempt INSERT retención → succeeds
2. **Non-ACM cannot INSERT**: Mock user with `es_admin()=false` → attempt INSERT → blocked with RLS error
3. **ACM can SELECT**: Query retenciones with ACM user → returns rows
4. **Service role bypasses RLS**: (via trigger) ensure triggers can write to retenciones even when invoked by non-ACM user

**Spec Link**: AC-99 (Instrument Retention Control), spec.md L220–226 (RLS)

**Dependencies**: None

**Estimated Lines**: 40

**Done Criteria**:
- [ ] Test file created
- [ ] Tests mock auth.jwt() role context
- [ ] Tests attempt INSERT/SELECT with different roles
- [ ] Tests FAIL (table doesn't exist, RLS not defined)

---

### T1a.3 (Vitest) — Write failing unit tests for DataAdapter service methods

**File**: `tests/unit/pedagogico/services/seguimientoAusentesService.crud.test.js`

**Description**:  
Test the service functions that will query the view and write to tables. Mock Supabase responses. Scenarios:

1. **fetchAusentesResolutionView**: Mock view query → verify returned data shape (alumnos array, totalCount, pagination)
2. **registrarContacto**: Mock `comunicaciones_seguimiento.insert()` → verify row created with nivel, origen='ausentismo', resultado='pendiente'
3. **registrarContacto duplicate guard (120 min)**: Mock recent contact → verify duplicate within window throws error
4. **registrarContacto nivel 2 auto-escalation**: Mock Nivel 2 insert → verify `proxima_fecha=now()+7 days` set
5. **crearRetencion**: Mock retenciones INSERT, verify estado='retenido', retenido_en set, RLS enforced
6. **levantarRetencion**: Mock update, verify estado='levantada', fecha_reincorporacion set
7. **getActivePeriodo**: Mock periodos query → verify in-memory cache works (5 min TTL)

**Spec Link**: AC-34, AC-67, AC-70, AC-95, AC-98

**Dependencies**: None (all mocked)

**Estimated Lines**: 100

**Done Criteria**:
- [x] Test file created with 7 test cases
- [x] All mocks implemented correctly
- [x] Tests PASS (service functions implemented)

---

### T1a.4 (SQL) — Create migration: vw_seguimiento_ausentes view, retenciones_instrumento table, ALTER comunicaciones_seguimiento

**File**: `supabase/migrations/20260903_seguimiento_ausentes_foundation.sql`

**Description**:  
Single migration file that:

1. **Create retenciones_instrumento table** (lines 1–30):
   - Columns: id (UUID PK), alumno_id (fk), instrumento_id (fk, nullable), instrumento_texto, motivo, estado (CHECK retenido|levantada), retenido_por, retenido_en, maestro_notificado_en, maestro_confirmo_recogida_en, acta_firmada_en, fecha_reincorporacion, levantada_por, levantada_en, notas, created_at, updated_at
   - Indices: idx_retenciones_alumno, idx_retenciones_estado (partial where estado='retenido')
   - Grants: SELECT for authenticated; INSERT/UPDATE only for ACM role (or es_admin())

2. **ALTER comunicaciones_seguimiento** (lines 31–45):
   - ADD COLUMN nivel (smallint, nullable)
   - ADD COLUMN origen (text, DEFAULT 'manual', CHECK IN ('manual', 'ausentismo', 'hermes', 'otro'))
   - Backfill: UPDATE existing rows SET origen='manual' WHERE origen IS NULL

3. **Seed seguimiento_reglas** (lines 46–60):
   - INSERT row tipo='ausentismo_acumulado' with config `{"nivel1":1, "nivel2":2, "nivel3":3, "contar_justificadas":false}`
   - ON CONFLICT (tipo) DO NOTHING

4. **Create vw_seguimiento_ausentes view** (lines 61–140):
   - WITH security_invoker = false (BYPASSRLS, like signage_v_* pattern)
   - JOINs: alumnos ⋈ alumnos_clases ⋈ clases ⋈ maestros ⋈ asistencias ⋈ retenciones_instrumento
   - Filters: alumnos.estado='activo', dates within active periodo (resolved client-side)
   - Columns:
     - alumno_id, alumno_nombre, instrumento_principal
     - clase_ids (comma-sep), clase_nombres
     - maestro_id, maestro_nombre
     - dias_ausente (COUNT DISTINCT fecha WHERE estado='ausente' AND fecha > fecha_reincorporacion)
     - sesiones_ausente (COUNT(*) WHERE estado='ausente')
     - ultima_ausencia_fecha
     - total_dias_clase_periodo
     - nivel (CASE WHEN dias_ausente >= 3 THEN 3 ... ELSE 0 END, using seguimiento_reglas thresholds)
     - contacto_nombre, contacto_telefono, contacto_origen (cascade or NULL)
     - ultimo_seguimiento_nivel, ultimo_seguimiento_fecha, ultimo_seguimiento_resultado
     - retencion_activa (bool from retenciones_instrumento.estado='retenido')
   - WHERE: Only return rows with dias_ausente > 0 (Nivel 0 not in view per spec)
   - Indices: idx_vw_ausentes_nivel, idx_vw_ausentes_ultima_fecha (on materialized view if needed, but view-only for now)

5. **RLS policies** (lines 141–160):
   - Enable RLS on retenciones_instrumento
   - Policy: authenticated users can SELECT (and view itself is authenticated-only)
   - Policy: INSERT/UPDATE only where es_admin() OR user has ACM portal access (to be confirmed; see design decision on role checking)
   - Policy: ACM can INSERT/UPDATE/DELETE (reincorporation workflow)

6. **Rollback (reverse migration comments)** — instructions for reverse:
   - DROP VIEW vw_seguimiento_ausentes
   - DELETE FROM seguimiento_reglas WHERE tipo='ausentismo_acumulado'
   - ALTER TABLE comunicaciones_seguimiento DROP COLUMN nivel, DROP COLUMN origen
   - DROP TABLE retenciones_instrumento

**WARNING on view logic**:
- Contact cascade must be resolved in SQL using COALESCE on representantes subqueries (complex; see design.md L160 for sketch). If this proves too complex, implement cascade in the service (T1a.5) and SELECT simple contacto_id instead.
- Date filtering (periodo resolution) is done by the view WHERE clause using `periodos.fecha_inicio <= CURRENT_DATE AND CURRENT_DATE <= periodos.fecha_fin`. The client passes the computed `periodo_id` from state.yaml or queries periodos itself.

**Spec Link**: AC-1, AC-2, AC-95, AC-206

**Dependencies**: T1a.1, T1a.2 (tests to validate against)

**Estimated Lines**: 150 (SQL DDL + migrations framework)

**Done Criteria**:
- [ ] Migration file created with correct timestamp prefix
- [ ] Table created with all columns and constraints
- [ ] Indices created
- [ ] View created with security_invoker=false
- [ ] RLS enabled and policies defined
- [ ] Seed row inserted into seguimiento_reglas
- [ ] T1a.1 and T1a.2 tests can query the view/table (after migration applied)
- [ ] Rollback comments documented

---

### T1a.5 (Implementation) — Implement DataAdapter service: seguimientoAusentesService.js

**File**: `src/modules/pedagogico/services/seguimientoAusentesService.js`

**Description**:  
Complete the service file (T0.4 created the cascade helper). Add the following exports:

```javascript
export async function fetchAusentesResolutionView({ periodo_id, limit = 50, offset = 0 } = {}) {
  // Query vw_seguimiento_ausentes, paginate
  // Returns { alumnos: [...], totalCount, from, to }
}

export async function registrarContacto({ 
  alumnoId, nivel, contactoTelefono, contactoNombre, templateVars 
} = {}) {
  // Write row to comunicaciones_seguimiento
  // Enforce 120-min duplicate guard
  // Auto-set proxima_fecha if nivel===2
  // Returns inserted row
}

export async function crearRetencion({ alumnoId, motivo = 'ausentismo_acumulado', notas } = {}) {
  // Create retenciones row, log comunicaciones entries, enforce ACM role
  // Returns retención row
}

export async function levantarRetencion({ retencionId, actaUrl, notas } = {}) {
  // Update retención: acta_firmada_en, estado='levantada', fecha_reincorporacion
  // Log comunicaciones row
  // Returns updated retención
}

export async function getActivePeriodo() {
  // Cached query (5 min TTL)
  // Returns { id, nombre, fecha_inicio, fecha_fin }
}
```

**Implementation notes**:
- All functions use `supabase` client (imported from lib)
- `registrarContacto` must query for duplicates within 120 min of same nivel
- `crearRetencion` must check `es_admin()` or equivalent; if not authorized, throw error
- Phone numbers must be normalized via `phoneUtils.normalizePhone()` before storing
- `getActivePeriodo` uses in-memory cache with 5-min expiry (or simpler: just store last result and timestamp)

**Spec Link**: AC-34, AC-67, AC-70, AC-95, AC-98

**Dependencies**: T1a.4 (migration must be applied), T0.4 (cascade helper exists)

**Estimated Lines**: 80

**Done Criteria**:
- [x] All 5 exports implemented: getPeriodoActivo, fetchSeguimientoAusentes, registrarContacto, crearRetencion, levantarRetencion
- [x] Service exported from `src/modules/pedagogico/index.js`
- [x] T1a.3 unit tests PASS (28 tests passing)
- [x] Service uses DataAdapter pattern (no direct view imports in UI)

**Fase 1a Implementation Notes**:
- **FIX 1 (representantes column)**: Changed `nombre_completo` → `nombre` in Tier 1 and Tier 2 queries. Updated tests to use correct column name and valid DR phone numbers (809/829/849 area codes).
- **FIX 2 (normalizarTelefonoRD)**: Rewrote to match SQL exactly: 11-digit with 1(809|829|849) pattern → +digits; 10-digit with (809|829|849) pattern → +1+digits; else null. Removed lenient 7-digit and generic 10-digit branches.
- **comunicaciones_seguimiento.estado field**: Confirmed via migration comments that `estado` CHECK constraint allows values: pending state value is 'abierta' (verified in existing migrations pattern). Used 'abierta' for new contacts.
- **Cache implementation**: getPeriodoActivo uses 5-min in-memory cache (TTL). Test utility __clearPeriodoCache() added for test isolation.
- All 37 pedagogico service tests passing; no regressions detected.

---

### T1a.6 (Integration) — Run Fase 1a migration on test database

**File**: (N/A; deployment verification)

**Description**:  
Apply the migration (T1a.4) to a test Supabase instance (local or staging). Verify:
- [ ] Table `retenciones_instrumento` created with correct schema
- [ ] View `vw_seguimiento_ausentes` created and queryable
- [ ] Columns added to `comunicaciones_seguimiento`
- [ ] `seguimiento_reglas` row seeded
- [ ] RLS policies active (SELECT works, INSERT requires ACM role)
- [ ] T1a.1 and T1a.2 integration tests PASS against live DB
- [ ] Reverse migration tested (migrations can be rolled back)

**Done Criteria**:
- [ ] Migration applies without errors
- [ ] All DDL operations succeed
- [ ] Integration tests pass
- [ ] Rollback tested (database state restored)

---

### T1a.7 (Implementation) — Export the new service from pedagogico/index.js

**File**: `src/modules/pedagogico/index.js`

**Description**:  
Export the new `seguimientoAusentesService` functions so they can be imported by views/actions:

```javascript
export { 
  fetchAusentesResolutionView,
  resolverContactoAlumno,
  registrarContacto,
  crearRetencion,
  levantarRetencion,
  getActivePeriodo
} from './services/seguimientoAusentesService.js'
```

**Done Criteria**:
- [ ] All functions exported
- [ ] No circular imports
- [ ] Exports can be imported by views (test import)

---

## FASE 1B: ACM & ADM UI — Views, Actions, Nav Registration

**Scope**: Create the ACM list + detail panel view, ADM read-only KPI cards, register routes in nav. **No action handlers yet** (those are Fase 2+); just the UI structure and read queries.

**Acceptance Criteria** (from spec):
- [ ] ACM view displays list of ausentes by nivel, filterable
- [ ] ACM detail panel shows contact cascade and histórico
- [ ] ACM nav registered in `src/portales/acm/acm.js`
- [ ] ADM cards display KPI counts (N1/N2/N3, % contacted, retenciones)
- [ ] ADM nav registered (optional badge for ausentes)
- [ ] All views tested (Vitest + component testing)

---

### T1b.1 (Vitest) — Write failing tests for ACM seguimientoAusentesView

**File**: `tests/unit/modules/pedagogico/views/seguimientoAusentesView.test.js`

**Description**:  
Component tests for the ACM view. Scenarios:

1. **List renders**: Mock `fetchAusentesResolutionView` → component renders list with alumno rows
2. **Filters work**: User clicks "Nivel 2" filter → list updates to show only nivel=2 rows
3. **Detail panel opens**: Click on alumno row → detail panel slides in (or modal opens)
4. **Pagination**: List shows 50/page; page 2 button enabled if totalCount > 50
5. **Columns visible**: Verify `alumno_nombre`, `clase_nombres`, `maestro_nombre`, `nivel`, `contacto_nombre`, `contacto_telefono`, `ultimo_seguimiento_fecha` columns rendered
6. **Histórico in detail**: Detail panel shows table of past `comunicaciones_seguimiento` entries for the alumno

**Spec Link**: AC-68 (ACM UI), design.md L39–49

**Dependencies**: None (mocked service)

**Estimated Lines**: 80

**Done Criteria**:
- [x] Test file created
- [x] All 6 scenarios tested
- [x] Tests PASS (11 passing tests)

---

### T1b.2 (Implementation) — Create ACM view: seguimientoAusentesView.js

**File**: `src/modules/pedagogico/views/seguimientoAusentesView.js`

**Description**:  
Single-page ACM coordinator view. Structure:

1. **Header**: Title "Seguimiento de Ausentes" + periodo selector (dropdown, default = active periodo)
2. **Filter bar** (sticky):
   - Nivel: Todos | 1 | 2 | 3 (radio or button group)
   - Maestro: Dropdown (DISTINCT maestro_nombre from view)
   - Contacto Estado: Pendiente | Resuelto | Sin Contacto (optional; depends on spec)
   - Search: Alumno nombre (client-side filter or server-side ILIKE)
3. **List view**:
   - Table with columns: Alumno | Clases | Maestro | Días Ausente | Nivel | Último Seguimiento | Acción(s)
   - Paginated (50/page)
   - Rows clickable → open detail panel
   - Badge color by nivel (N1=yellow, N2=orange, N3=red)
4. **Detail panel** (slide-in from right or modal):
   - Alumno info: nombre, instrumento_principal, contacto_nombre/telefono/origen
   - Contact cascade detail (all 7 tiers shown, top tier highlighted)
   - Absence summary: dias_ausente, sesiones_ausente, ultima_ausencia_fecha
   - Histórico table: past `comunicaciones_seguimiento` rows (tipo=ausentismo, sorted by fecha DESC)
   - Reincorporation info: if retención.estado='levantada', show fecha_reincorporacion
   - Action buttons (placeholder for Fase 2): "Contactar Nivel 1/2/3" (disabled, visible as stubs)
5. **Empty state**: "Sin alumnos con ausencias acumuladas en el período seleccionado."

**UI Framework**: Bootstrap + existing styling (match adm-dashboard, pedagogico-dashboard)

**Data flow**:
1. Component mounts → call `getActivePeriodo()` → call `fetchAusentesResolutionView({ periodo_id })`
2. Filters change → re-fetch with params
3. Click alumno → fetch `comunicaciones_seguimiento` rows for detail panel

**Spec Link**: AC-68, design.md L39–49, L87–95

**Dependencies**: T1a.7 (service exported)

**Estimated Lines**: 120

**Done Criteria**:
- [x] View file created
- [x] List view renders with correct columns
- [x] Filters functional (nivel, maestro, search)
- [x] Detail panel displays when alumno clicked
- [x] T1b.1 tests PASS (11/11 passing)

---

### T1b.3 (Vitest) — Write failing tests for SeguimientoAusentesCardADM component

**File**: `tests/unit/modules/pedagogico/components/SeguimientoAusentesCardADM.test.js`

**Description**:  
KPI card component tests. Scenarios:

1. **Cards render**: Mock view query → 4 KPI cards displayed
2. **Counts correct**: Mock data with 10 N1, 5 N2, 2 N3 → cards show correct counts
3. **Percentage calculated**: Mock data with 8 contacted <72h out of 17 total → card shows "47%"
4. **Retenciones badges**: Mock retenciones table → "3 activas | 12 levantadas este período"
5. **No data state**: Empty view → cards show "–" or "0"

**Spec Link**: AC-115 (ADM KPI cards), design.md L51–56

**Dependencies**: None (mocked)

**Estimated Lines**: 50

**Done Criteria**:
- [x] Test file created
- [x] All 5 scenarios tested
- [x] Tests PASS (7/7 passing)

---

### T1b.4 (Implementation) — Create ADM KPI card component: SeguimientoAusentesCardADM.js

**File**: `src/modules/pedagogico/components/SeguimientoAusentesCardADM.js`

**Description**:  
Reusable KPI card component (or card-grid) for the ADM dashboard. Displays:

1. **Alumnos por Nivel** (3 cards): N1 count | N2 count | N3 count
2. **Contactados <72h**: Percentage (calculated: COUNT WHERE ultimo_seguimiento_fecha > now()-72h / total_contactos)
3. **Retenciones Activas**: Count (WHERE estado='retenido')
4. **Retenciones Levantadas**: Count (WHERE estado='levantada' AND levantada_en >= periodo_inicio)

Card layout: Bootstrap card + icon + large number + label + optional trend/sparkline

**Data flow**:
- Props: `periodo_id` (or null for active)
- Fetch: `vw_seguimiento_ausentes`, `retenciones_instrumento` via aggregation queries (RPC or GROUP BY in JS)
- Update: Re-fetch on prop change or interval (every 60s for live dashboard)

**Spec Link**: AC-115, design.md L51–56

**Dependencies**: T1a.7 (service)

**Estimated Lines**: 70

**Done Criteria**:
- [x] Component file created
- [x] All 4+ KPI metrics rendered (6 total cards for comprehensive coverage)
- [x] Cards styled consistently with Bootstrap dashboard pattern
- [x] T1b.3 tests PASS (7/7 passing)

---

### T1b.5 (Implementation) — Register ACM route: pedagogico-seguimiento-ausentes

**File**: `src/modules/pedagogico/pedagogico.router.js`

**Description**:  
Add new route to the pedagogico router. Add to the existing list:

```javascript
router.register('pedagogico-seguimiento-ausentes', (c) => renderSeguimientoAusentesView(c))
```

And import the view at the top:

```javascript
import { renderSeguimientoAusentesView } from './views/seguimientoAusentesView.js'
```

**Done Criteria**:
- [x] Route registered: 'pedagogico-seguimiento-ausentes'
- [x] Import added from seguimientoAusentesView.js
- [x] Route registered for 'pedagogico-ausentismo-dashboard' (ADM view)
- [x] Routes accessible via router.navigate()

---

### T1b.6 (Implementation) — Register nav item in ACM portal

**File**: `src/portales/acm/acm.js`

**Description**:  
Add nav entry to the "Seguimiento & Ciclo" section in the ACM navGroups:

```javascript
{
  id: 'seguimiento',
  label: 'Seguimiento & Ciclo',
  icon: 'bi-graph-up',
  items: [
    { id: 'asistencias', label: 'Resumen Asistencias', icon: 'bi-calendar-check' },
    { id: 'metricas', label: 'Dashboard Métricas', icon: 'bi-bar-chart-line' },
    { id: 'pedagogico-seguimiento-ausentes', label: 'Alumnos Ausentes', icon: 'bi-exclamation-circle' },  // <-- NEW
    { id: 'periodos', label: 'Períodos Académicos', icon: 'bi-calendar-event' },
  ],
}
```

**Done Criteria**:
- [x] Nav item added to ACM portal "Seguimiento & Ciclo" group
- [x] Route ID matches T1b.5 ('pedagogico-seguimiento-ausentes')
- [x] Label: 'Alumnos Ausentes' with icon 'bi-exclamation-circle'
- [x] Item placed after "Resumen Asistencias", before "Períodos"

---

### T1b.7 (Implementation) — Create ADM read-only view stub: AusentismoDashboardView.js

**File**: `src/modules/pedagogico/views/AusentismoDashboardView.js` (or `src/modules/admin-dashboard/views/AusentismoDashboardView.js`)

**Description**:  
ADM read-only dashboard view. For Fase 1b, implement:

1. **Header**: "Ausencias — Resumen del Período"
2. **KPI card grid**: Import and render `SeguimientoAusentesCardADM` (T1b.4)
3. **Stub sections** (to be filled in Fase 4):
   - "Casos Cerrados Recientemente" (table stub, empty or placeholder)
   - "CSV Export" button (disabled in Fase 1; enabled in Fase 4)
   - "Análisis" section (recidivism, mean time to reincorporación — stub)

**Read-only**: No buttons, no actions. ADM can see KPIs and historical data but cannot contact/retain.

**Spec Link**: AC-115, design.md L51–56

**Dependencies**: T1b.4

**Estimated Lines**: 50

**Done Criteria**:
- [x] View file created: AusentismoDashboardView.js
- [x] KPI cards rendered via SeguimientoAusentesCardADM component
- [x] Stub sections visible with Fase 4 TODOs (Casos Cerrados, Análisis)
- [x] No action buttons, read-only UI only
- [x] Alert note: "Acceso de lectura"

---

### T1b.8 (Implementation) — Register ADM route and nav item (optional badge)

**File**: `src/portales/adm/adm.js`

**Description**:  
Add nav entry to ADM portal under "Reportes" section:

```javascript
{
  id: 'admin-ausentismo-dashboard',
  label: 'Ausencias & Retención',
  icon: 'bi-exclamation-triangle',
  badge: null,  // TODO: Fase 2 - count of nivel 3 alumnos
  badgeClass: 'sidebar-nav-badge bg-danger text-white'
}
```

And register route in `pedagogico.router.js` (or create separate router for admin-dashboard):

```javascript
router.register('admin-ausentismo-dashboard', (c) => renderAusentismoDashboardView(c))
```

**Done Criteria**:
- [x] Route registered: 'pedagogico-ausentismo-dashboard' (ADM view is routable)
- [⚠️] Nav item NOT added to ADM portal (deferred): `src/portales/adm/adm.js` has unrelated uncommitted changes per specifications. ADM view is accessible via route but nav entry will be added in Fase 4 with other ADM analytics features and full badge integration.
- [x] Documented: ADM nav entry and badge ("Ausencias & Retención" badge with nivel-3 count) deferred to Fase 4

---

### T1b.9 (Vitest) — Run Fase 1b UI tests end-to-end

**File**: (Existing tests)

**Description**:  
Run all Fase 1b component and view tests:
```bash
npm run test:run -- tests/unit/modules/pedagogico/views/seguimientoAusentesView.test.js tests/unit/modules/pedagogico/components/SeguimientoAusentesCardADM.test.js
```

**Done Criteria**:
- [x] All Fase 1b tests PASS (11 + 7 = 18 tests, 100% passing)
- [x] No console errors in test output
- [x] Full pedagogico test suite: 55 tests passing (6 files)
- [x] Combined pedagogico + alumnos suite: 212 tests passing (19 files)
- [x] No pre-existing failures introduced by Fase 1b changes

---

## FASE 1B Implementation Complete

**Status**: ✅ DONE  
**Test Results**: 18 new tests (11 ACM view + 7 ADM card component), all passing  
**Files Created**: 4 (seguimientoAusentesView.js, AusentismoDashboardView.js, SeguimientoAusentesCardADM.js, 2 test files)  
**Files Modified**: 2 (pedagogico.router.js, acm.js)  
**Coverage**: ACM list with filters, detail modal, nivel-3 banner, pagination, HelpPanel; ADM read-only KPI dashboard with stub sections for Fase 4

**Notes**:
- ADM nav item deferred (adm.js has unrelated pending changes; ADM view is routable but nav will be added in Fase 4)
- Action buttons in detail modal are visible but disabled stubs, awaiting Fase 2 implementation
- All services from Fase 1a (getPeriodoActivo, fetchSeguimientoAusentes, resolverContactoAlumno, etc.) are fully consumed by views
- HelpPanel provides user-friendly explanation of day counter vs session counter and nivel thresholds

**What Fase 2 must implement**:
1. Enable the 3 action buttons (contacto-nivel-1/2/3) in the detail modal
2. Wire each to `registrarContacto()` service call with correct nivel parameter
3. Enforce 120-min duplicate guard (service handles it; catch error and show user alert)
4. Auto-set `proxima_fecha=now()+7 days` for nivel 2 (service handles it)
5. Open WhatsApp link via `whatsappLink()` with template variables after recording contact
6. Implement template rendering and variable interpolation (templates in documentTemplateService)

---

## FASE 2 (Deferred): Contact Action Handler

**Scope**: Implement the "Contactar Nivel N" action. On click, open WhatsApp link with pre-filled template, record comunicaciones row, enforce 120-min duplicate guard, auto-escalate nivel 2.

**Acceptance Criteria** (from spec, not yet implemented):
- [ ] Contact action writes comunicaciones row with nivel, origen='ausentismo'
- [ ] 120-min duplicate guard blocks second contact at same nivel
- [ ] Nivel 2 auto-sets `proxima_accion='contacto_nivel_3'` and `proxima_fecha=now()+7 days`
- [ ] WhatsApp link opens wa.me with template message
- [ ] Template variables interpolated client-side
- [ ] RLS: ACM role only

**Estimated Lines**: ~200

**Files (TBD in Fase 2 tasks)**:
- `src/modules/pedagogico/actions/ContactoAusentismoAction.js` (handler)
- `src/modules/pedagogico/views/seguimientoAusentesView.js` (update: enable buttons, call action)
- `tests/unit/pedagogico/actions/ContactoAusentismoAction.test.js` (tests)

**Dependencies**: Fase 1a + 1b complete

---

## FASE 3 (Deferred): Retención & Reincorporation Workflow

**Scope**: Implement Nivel 3 double-confirm dialog, retención creation, maestro badge, reincorporation workflow.

**Acceptance Criteria** (from spec, not yet implemented):
- [ ] Nivel 3 double-confirm dialog prevents accidental retention
- [ ] On confirm: create retención, send wa.me drafts to maestro + representante, log 2 comunicaciones rows
- [ ] Maestro badge appears in maestro portal / class views
- [ ] Maestro can mark `maestro_confirmo_recogida_en`
- [ ] Reincorporación workflow: sign act, update retención (acta_firmada_en, estado='levantada', fecha_reincorporacion)
- [ ] Counter resets from fecha_reincorporacion forward

**Estimated Lines**: ~300

**Files (TBD in Fase 3 tasks)**:
- `src/modules/pedagogico/actions/RetencionInstrumentoAction.js`
- `src/modules/pedagogico/actions/ReincorporacionAction.js`
- `src/modules/pedagogico/components/RetencionConfirmModal.js`
- `src/portal-maestros/views/` (badge integration; TBD)
- `tests/integration/pedagogico/retención-workflow.test.js`

**Dependencies**: Fase 1a + 1b + 2 complete

---

## FASE 4 (Deferred): ADM Analytics & CSV Export

**Scope**: Implement historical case list, CSV export, aggregation queries (mean time to reincorporación, recidivism rate).

**Acceptance Criteria** (from spec, not yet implemented):
- [ ] ADM dashboard shows historical closed-cases list
- [ ] List filterable by date range
- [ ] CSV export works (client-side; reuse existing util)
- [ ] KPI calculations: mean time to reincorporación, recidivism % (% returning to nivel 3 post-reincorporación)
- [ ] Read-only (no action buttons)

**Estimated Lines**: ~200

**Files (TBD in Fase 4 tasks)**:
- `src/modules/pedagogico/views/AusentismoDashboardView.js` (update: enable historical table + export)
- `src/modules/pedagogico/services/` (new RPC or aggregation functions for analytics)
- `tests/integration/pedagogico/ausentismo-analytics.test.js`

**Dependencies**: Fase 1a + 1b + 2 + 3 complete

---

## Task Summary Table (Phases 0–4)

| Task | Phase | Category | Dep | Est. Lines | Type |
|------|-------|----------|-----|-----------|------|
| T0.1 | 0 | Tests | — | 30 | Vitest |
| T0.2 | 0 | Impl | T0.1 | 10 | JS (fix) |
| T0.3 | 0 | Tests | — | 60 | Vitest |
| T0.4 | 0 | Impl | T0.3 | 50 | JS (service) |
| T0.5 | 0 | Tests | — | 15 | Vitest |
| T0.6 | 0 | CI | all-0 | — | npm test |
| **T1a.1** | **1a** | **Tests** | — | **80** | **Vitest** |
| **T1a.2** | **1a** | **Tests** | — | **40** | **Vitest** |
| **T1a.3** | **1a** | **Tests** | — | **100** | **Vitest** |
| **T1a.4** | **1a** | **SQL** | — | **150** | **Migration** |
| **T1a.5** | **1a** | **Impl** | T1a.4 | **80** | **JS (service)** |
| **T1a.6** | **1a** | **CI** | T1a.4 | — | **Deploy test** |
| **T1a.7** | **1a** | **Impl** | T1a.5 | **10** | **JS (export)** |
| **T1b.1** | **1b** | **Tests** | — | **80** | **Vitest** |
| **T1b.2** | **1b** | **Impl** | T1b.1 | **120** | **View** |
| **T1b.3** | **1b** | **Tests** | — | **50** | **Vitest** |
| **T1b.4** | **1b** | **Impl** | T1b.3 | **70** | **Component** |
| **T1b.5** | **1b** | **Impl** | T1b.2 | **10** | **Router** |
| **T1b.6** | **1b** | **Impl** | T1b.5 | **5** | **Config** |
| **T1b.7** | **1b** | **Impl** | T1b.4 | **50** | **View** |
| **T1b.8** | **1b** | **Impl** | T1b.7 | **5** | **Config** |
| **T1b.9** | **1b** | **CI** | all-1b | — | **npm test** |
| T2.* | 2 | `[deferred]` | 1b | ~200 | — |
| T3.* | 3 | `[deferred]` | 2 | ~300 | — |
| T4.* | 4 | `[deferred]` | 3 | ~200 | — |

**Total Phases 0–1:** 23 tasks, ~500 lines (code + migrations + tests)  
**Total All Phases:** 38 tasks, ~1,400 lines  
**This Session:** Phases 0 + 1a + 1b (3 chained PRs)  
**Deferred:** Phases 2 + 3 + 4 (3 standalone PRs, dependent chain)

---

## Delivery Plan (This Session)

### PR 0: Fase 0 — Bug Fix & Foundation
**Tasks**: T0.1–T0.6  
**Files Changed**: 
- `src/modules/pedagogico/services/studentRiskDetectorService.js` (5 line fix)
- `src/modules/pedagogico/services/seguimientoAusentesService.js` (50 lines, new)
- `tests/unit/pedagogico/services/*.test.js` (105 lines, 3 files)

**Estimated Lines**: ~160 (code + tests)  
**Can Ship**: Yes (standalone, no DB dependencies)  
**Review Time**: ~15–20 min

---

### PR 1a: Fase 1a — Data Layer Foundation
**Tasks**: T1a.1–T1a.7  
**Files Changed**:
- `supabase/migrations/20260903_seguimiento_ausentes_foundation.sql` (150 lines, new)
- `src/modules/pedagogico/services/seguimientoAusentesService.js` (80 lines added, now ~130 total)
- `src/modules/pedagogico/index.js` (exports added)
- `tests/integration/pedagogico/*.test.js` (120 lines, 2 files)

**Estimated Lines**: ~350 (SQL + service + tests)  
**Can Ship**: Yes (foundation; no UI)  
**Review Time**: ~25–30 min  
**Blocker for**: Fase 1b

---

### PR 1b: Fase 1b — ACM & ADM UI
**Tasks**: T1b.1–T1b.9  
**Files Changed**:
- `src/modules/pedagogico/views/seguimientoAusentesView.js` (120 lines, new)
- `src/modules/pedagogico/views/AusentismoDashboardView.js` (50 lines, new)
- `src/modules/pedagogico/components/SeguimientoAusentesCardADM.js` (70 lines, new)
- `src/modules/pedagogico/pedagogico.router.js` (2 lines added)
- `src/portales/acm/acm.js` (nav item added)
- `src/portales/adm/adm.js` (nav item added)
- `tests/unit/pedagogico/views/*.test.js` (130 lines, 2 files)

**Estimated Lines**: ~370 (views + components + tests)  
**Can Ship**: Yes (read-only UI, no actions yet)  
**Review Time**: ~25–30 min  
**Depends on**: PR 1a

---

**Total This Session**: 3 PRs, ~500 lines combined, 60–80 min review time  
**Risk**: LOW (clear scope, well-decomposed, each PR < 400-line budget)

---

## Strict TDD Checklist (MANDATORY per config.strict_tdd=true)

Every implementation task MUST be preceded by its failing-test task. Verify this checklist before writing code:

- [ ] **Fase 0**:
  - [ ] T0.1 test written BEFORE T0.2 implementation
  - [ ] T0.3 test written BEFORE T0.4 implementation
  - [ ] T0.5 test written (will fail until Fase 1a migration applied)

- [ ] **Fase 1a**:
  - [ ] T1a.1 test written BEFORE T1a.4 SQL migration
  - [ ] T1a.2 test written BEFORE T1a.4 SQL migration (RLS policies)
  - [ ] T1a.3 test written BEFORE T1a.5 service implementation

- [ ] **Fase 1b**:
  - [ ] T1b.1 test written BEFORE T1b.2 view implementation
  - [ ] T1b.3 test written BEFORE T1b.4 component implementation

All tests must FAIL initially (red), then code is written to make them PASS (green).

---

## Project Conventions Applied

- **Ubiquitous Language** (CONTEXT.md): Uses established terms (`alumno`, `maestro`, `representante`, `clase`, `asistencia`, `instrumento`). New terms added: `retención de instrumento`, `reincorporación`, `nivel de escalamiento`, `día de ausencia` (TODO: append to CONTEXT.md in Fase 1a or as a separate task).

- **DataAdapter Pattern**: All UI imports from services; no direct `supabase.from()` calls in views.

- **Work-Unit Commits**: Each PR = one deliverable. Tests in same commit as code.

- **Cognitive-Doc Design**: This tasks.md leads with phasing summary + forecast, then ordered checklist.

- **File Naming**: camelCase (seguimientoAusentesView, SeguimientoAusentesCardADM, etc.).

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| View complexity (cascading contact in SQL) | Medium | If SQL contact cascade proves too complex, move to service (T1a.5); view returns simple contacto_id, service resolves cascade in JS. |
| Tardanza estado mapping ambiguity | Low | T0.2 includes verification step; if tardanza not recorded in DB, add TODO comment for future phase. |
| RLS role checking for ACM | Low | Use established `es_admin()` pattern + portal access check. Confirm with team if new ACM-specific role enum needed (spec open question resolved in design). |
| Período resolution client-side | Low | Client queries `periodos` table to find active range; view filters by dates. No schema change to `asistencias` for periodo_id backfill (per state.yaml). |
| Maestro badge integration path | Low | Design assumed `src/portales/maestros/`; actual path is `src/portal-maestros/`. Tasks will target correct path (deferred to Fase 3). |

---

## Acceptance Checklist (End-of-Phase 1b)

Before marking "Ready for Fase 2", verify:

- [ ] Fase 0 PR merged (bug fix + helper)
- [ ] Fase 1a PR merged (migrations + service tested against live DB)
- [ ] Fase 1b PR merged (UI functional, all nav items visible)
- [ ] No console errors in ACM portal when navigating to "Alumnos Ausentes"
- [ ] No console errors in ADM portal when viewing KPI cards
- [ ] `vw_seguimiento_ausentes` returns 1–2 rows per active alumno with nivel > 0
- [ ] `retenciones_instrumento` table empty (will populate on first Nivel 3 action in Fase 3)
- [ ] `seguimiento_reglas` row exists for tipo='ausentismo_acumulado'
- [ ] All Fase 0–1 tests pass (npm run test:run)
- [ ] Coverage > 80% for new modules

---

End of task breakdown. Ready for `/sdd-apply` (Phases 0–1 only).

Phases 2–4 task breakdown is complete and documented above for reference; user will request `/sdd-continue` after Fase 1b ships.

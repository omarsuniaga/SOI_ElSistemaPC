# Tasks: Arquitectura de Tres Planos para Currículo y Planificación

## Status

**OPEN DEPENDENCIES**: Spec and Design artifacts NOT YET AVAILABLE. Tasks inferred from Proposal only. Spec must define exact schema migrations and rollback strategies before apply. Design must define ACM/Maestro UI wireframes and parser output schema before implementation.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800–1200 (migrations: 150–200, services: 300–400, UIs: 250–350, tests: 100–150) |
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |
| Suggested split | **Feature branch chain**: `feature/curriculo-tres-planos` base accumulator |
| Delivery strategy | `auto-chain` (slices per work unit) |
| Chain strategy | stacked-to-main (each slice autonomous, mergeable independently) |

Decision needed before apply: **Yes** — confirm chain strategy before sdd-apply launches
Chained PRs recommended: **Yes**
Chain strategy: stacked-to-main
400-line budget risk: High

### Work Unit Breakdown

| Unit | Goal | Likely PR | Base Branch | Dependencies |
|------|------|-----------|-------------|--------------|
| 1 | Schema: Create `objetivos` tier; migrate `nodes.objective` | PR #1 | master | None (foundation) |
| 2 | Schema: Extend `route_status` enum; add columns to `route_versions` | PR #2 | PR #1 branch | Requires PR #1 merged |
| 3 | Service: Fix `weeklyPlanSupabase.js` — replace `acm_*` reads with `route_versions` derives | PR #3 | PR #2 branch | Requires PR #2 merged |
| 4 | Service: Fix `routeSupabase.js` — remove `plan_*` deprecated reads | PR #4 | PR #3 branch | Requires PR #3 merged |
| 5 | Service: Enhance `planningParserService.js` — chunking, borrador mode, schema validation, 4-level mapping | PR #5 | PR #4 branch | Requires PR #4 merged |
| 6 | Service: Implement progression engine `fn_objetivo_actual_alumno()` SQL function | PR #6 | PR #5 branch | Requires PR #5 merged |
| 7 | UI: ACM review proposals — maestro proposals queue, publish/return flow | PR #7 | PR #6 branch | Requires PR #6 merged |
| 8 | UI: Maestro upload & review — file upload → parser → draft review → save as propuesta | PR #8 | PR #7 branch | Requires PR #7 merged |
| 9 | Tests: Mocks + unit tests (DataAdapter pattern: both Supabase + Demo impls) | PR #9 | PR #8 branch | Requires PR #8 merged |
| 10 | E2E test: Pilot upload → parse → review → propose → publish → grade with progression | PR #10 | PR #9 branch | Requires PR #9 merged; final integration slice |

---

## Phase 1: Database Schema Foundation

### 1.1 Create `objetivos` tier migration

- [ ] Create migration file: `supabase/migrations/{timestamp}_create_objetivos_tier.sql`
- [ ] Implement: `CREATE TABLE objetivos (id uuid primary key, node_id uuid references nodes(id), title text, orden int, created_at timestamp, updated_at timestamp)`
- [ ] Add RLS policy: `objetivos.node.route.route_catalog.owner == auth.uid()`
- [ ] Create index on `(node_id, orden)` for query performance
- [ ] **Test**: Verify table structure, RLS policy enforces owner check, foreign key constraint present
- [ ] **Rollback**: Provide inverse migration (drop `objetivos` only, keep data in staging for verification)

**Commit**: `feat(curriculo-tres-planos): 1.1 schema-objetivos-tier`

### 1.2 Migrate existing `nodes.objective` data to `objetivos` table

- [ ] Create migration file: `supabase/migrations/{timestamp}_migrate_nodes_objective.sql`
- [ ] Query: `SELECT id, objective FROM nodes WHERE objective IS NOT NULL`
- [ ] Insert into `objetivos`: one row per unique `node.objective` (handle duplicates per node; clarify in Spec whether node.objective is unique or repeatable)
- [ ] Update `indicators.node_id` → `indicators.objetivo_id` (migration logic: `SELECT objetivo_id FROM objetivos WHERE node_id = indicators.node_id`)
- [ ] Drop column `nodes.objective` (post-migration cleanup, can be separate commit if needed for rollback clarity)
- [ ] **Test**: Verify all non-null objectives migrated, no orphaned indicators, `indicators.objetivo_id` is NOT NULL where expected
- [ ] **Rollback**: Reverse script to restore column and drop mapping (tested in staging first)

**Commit**: `feat(curriculo-tres-planos): 1.2 schema-migrate-nodes-to-objetivos`

---

## Phase 2: Route Status & Authorship Schema

### 2.1 Extend `route_status` enum with `propuesta` and `devuelta`

- [ ] Create migration file: `supabase/migrations/{timestamp}_extend_route_status_enum.sql`
- [ ] Execute: `ALTER TYPE route_status ADD VALUE 'propuesta' BEFORE 'publicada'` (non-transactional — use `IF NOT EXISTS` guard or separate transaction)
- [ ] Execute: `ALTER TYPE route_status ADD VALUE 'devuelta' AFTER 'publicada'`
- [ ] Verify enum order in downstream code doesn't assume a fixed position (search codebase for `route_status` switches/comparisons)
- [ ] **Test**: New enum values readable; no schema validation errors on insert
- [ ] **Rollback**: Enum values cannot be dropped in Postgres < 14. Document as permanent addition; no user data will be in `propuesta`/`devuelta` until UI launches.

**Commit**: `feat(curriculo-tres-planos): 2.1 schema-extend-route-status-enum`

### 2.2 Add authorship columns to `route_versions`

- [ ] Create migration file: `supabase/migrations/{timestamp}_add_route_authorship_columns.sql`
- [ ] Add columns to `route_versions`:
  - `origen` (enum: `'acm'` | `'maestro'`, default `'acm'`)
  - `propuesta_por` (uuid, nullable, references `auth.users(id)` — the maestro/teacher user who proposed)
  - `clase_id` (uuid, nullable, references `clases(id)` — scopes maestro proposals to a single class)
  - `feedback` (text, nullable — ACM's reason for returning a proposal)
- [ ] Add constraint: `IF origen = 'maestro' THEN propuesta_por IS NOT NULL AND clase_id IS NOT NULL`
- [ ] Update RLS policies to enforce scope: maestro can only view/edit their own `clase_id` proposals
- [ ] Add index on `(origen, clase_id, route_status)` for filtering maestro proposals by class
- [ ] **Test**: Columns present with correct types/defaults; constraints enforced; RLS policy guards access by clase_id
- [ ] **Rollback**: Drop columns in reverse migration

**Commit**: `feat(curriculo-tres-planos): 2.2 schema-add-authorship-columns`

---

## Phase 3: Service Layer — Data Access Fixes

### 3.1 Fix `weeklyPlanSupabase.js` — derive weekly plans from `route_versions` published

- [ ] Locate: `src/modules/planificacion/api/weeklyPlanSupabase.js`
- [ ] Current issue: reads from phantom `acm_weekly_plans`, `acm_active_routes` tables (0 rows, errors swallowed)
- [ ] Replace: query `route_versions WHERE status = 'publicada' AND routes.route_catalog.owner = current_user` instead
- [ ] Implement: map `route_versions` columns → weekly plan structure expected by ACM UI
  - `route_versions.id` → plan identifier
  - `route_versions.levels` → week structure (if levels encode weeks; clarify in Spec)
  - `route_versions.nodes` / `objectives` / `indicators` → teaching content
- [ ] Add caching layer if performance is critical (deduce from current implementation)
- [ ] Implement DataAdapter pattern: both Supabase and Demo mocks for new query signature
- [ ] **Test**: Weekly plan derivation returns same structure as before; no phantom table reads; demo mock returns equivalent data
- [ ] **Rollback**: Revert to phantom table reads (no data loss; just silently null again)

**Commit**: `feat(curriculo-tres-planos): 3.1 services-fix-weeklyPlanSupabase`

### 3.2 Fix `routeSupabase.js` — remove deprecated `plan_*` table reads

- [ ] Locate: `src/modules/planificacion/api/routeSupabase.js`
- [ ] Find all reads from tables: `plan_*` (identify exact tables via grep)
- [ ] Replace with: equivalent reads from `route_versions` / canonical tables
- [ ] Implement DataAdapter pattern: both Supabase and Demo mocks
- [ ] **Test**: No deprecated table reads; routes API returns expected structure; demo mock functional
- [ ] **Rollback**: Restore deprecated reads (backward compatible; no data affected)

**Commit**: `feat(curriculo-tres-planos): 3.2 services-fix-routeSupabase-remove-deprecated`

### 3.3 Enhance `planningParserService.js` — chunking, borrador mode, validation, 4-level mapping

- [ ] Locate: `src/portal-maestros/services/planningParserService.js`
- [ ] Current issue: code exists but unused; truncates to 8000 chars silently; no schema validation
- [ ] **Chunking**: Implement logic to split documents > 8000 chars into semantic chunks (paragraph/section boundaries, not char boundaries)
- [ ] **Merge strategy**: Combine partial parsing results (clarify in Spec: how to merge "Tema 1 Objetivo A, Objetivo B" from chunk 1 + "Objetivo C" from chunk 2)
- [ ] **Output mode**: Wrap parser output in borrador state — DO NOT auto-save; always require maestro review before `route_version` created
- [ ] **Schema validation**: Validate parser JSON output against expected schema (defined in Spec: must have `{ levels: [ { name, temas: [ { name, objetivos: [ { name, indicadores: [...] } ] } ] } ] }` or equivalent)
- [ ] **4-level mapping**: Map parser output (4 levels: nivel→tema→objetivo→indicador) to updated spine (`levels→nodes(temas)→objetivos→indicators`)
- [ ] **Error handling**: If chunk fails parsing, surface error to maestro with chunk context (never auto-truncate)
- [ ] Implement DataAdapter pattern: both Supabase and Demo mocks
- [ ] **Test**: Parse sample PDF → borrador state (no DB insert); validate schema rejection on malformed output; chunking preserves all content for long documents; demo parser returns equivalent borrador
- [ ] **Rollback**: Revert to unused state (code removed or feature-flagged)

**Commit**: `feat(curriculo-tres-planos): 3.3 services-enhance-planningParserService`

---

## Phase 4: Progression Engine

### 4.1 Create SQL function `fn_objetivo_actual_alumno(student_id, route_version_id)`

- [ ] Create migration: `supabase/migrations/{timestamp}_create_fn_objetivo_actual.sql`
- [ ] Function signature: `fn_objetivo_actual_alumno(student_id UUID, route_version_id UUID) RETURNS TABLE (objetivo_id UUID, objetivo_title TEXT, tema_id UUID, tema_name TEXT, nivel_id UUID, nivel_order INT, estado TEXT)`
- [ ] Logic: 
  - Query `indicator_attempts` for this student on this `route_version`
  - Find first `objetivo` with obligatory indicators that are NOT approved (aggregate `indicator_attempts.estado` per objetivo)
  - Return blocked estado, or "completado" if all objetivos in the version are approved
  - Calculate cascading unlock: tema_id depends on all previous temas' objetivos approved; nivel_id depends on all previous niveles' temas approved
- [ ] **Test**: Single student, multiple objectives; some approved, some pending → returns next objetivo correctly; all approved → returns "completado"
- [ ] **Rollback**: Drop function

**Commit**: `feat(curriculo-tres-planos): 4.1 services-progression-function`

### 4.2 Implement progression calculation in backend API (nuevo endpoint o extend existing)

- [ ] Create new endpoint (or extend existing): `GET /api/rutas/{route_version_id}/alumno/{student_id}/progresion`
- [ ] Use function from 4.1; format response for UI
- [ ] Implement caching if progression queries are expensive (clarify in Spec)
- [ ] Implement DataAdapter pattern: both Supabase and Demo mocks
- [ ] **Test**: Endpoint returns progression state; demo mock returns equivalent structure
- [ ] **Rollback**: Remove endpoint (no database data affected)

**Commit**: `feat(curriculo-tres-planos): 4.2 services-progression-endpoint`

---

## Phase 5: ACM UI — Proposal Review

### 5.1 Create ACM proposals queue UI component

- [ ] Locate or create: `src/modules/planificacion/views/` (clarify path in Design)
- [ ] Build maestro proposals list: fetch `route_versions WHERE origen='maestro' AND status='propuesta' AND user.role='acm'`
- [ ] Display: proposal metadata (teacher name, class, submission date, feedback from previous return if any)
- [ ] **Test**: Component renders proposal list; status reflects database state; demo mock provides test data
- [ ] **Rollback**: Remove component

**Commit**: `feat(curriculo-tres-planos): 5.1 ui-acm-proposals-queue`

### 5.2 Create ACM review/decision UI (publish or return with feedback)

- [ ] Locate or create: `src/modules/planificacion/views/` detail view
- [ ] Build: view full proposal content (levels→temas→objetivos→indicadores)
- [ ] Actions: "Publicar" (→ `status='publicada'`) or "Devolver" (→ `status='devuelta'`, require feedback text)
- [ ] **Test**: Button actions trigger correct mutations; feedback text persisted; status updated in database
- [ ] **Rollback**: Remove component

**Commit**: `feat(curriculo-tres-planos): 5.2 ui-acm-decision-publish-return`

---

## Phase 6: Maestro UI — Planning Upload & Proposal

### 6.1 Create maestro planning file upload component

- [ ] Locate or create: `src/portal-maestros/views/` (clarify path in Design)
- [ ] Build file input (accept PDF, DOCX, MD)
- [ ] Trigger `planningParserService.parseDocument()` on upload
- [ ] Display borrador result in read-only preview (do NOT auto-save)
- [ ] **Test**: File upload triggers parser; demo parser returns borrador structure
- [ ] **Rollback**: Remove component

**Commit**: `feat(curriculo-tres-planos): 6.1 ui-maestro-file-upload`

### 6.2 Create maestro borrador review & correction UI

- [ ] Locate or create: `src/portal-maestros/views/` detail view
- [ ] Display borrador preview (levels→temas→objetivos→indicadores)
- [ ] Allow maestro to correct/edit structure (if Design permits) or just confirm
- [ ] Action: "Guardar como propuesta" → create `route_version` with `origen='maestro'`, `status='propuesta'`, `clase_id={maestro's class}`, `propuesta_por={maestro's uid}`
- [ ] **Test**: Save action creates route_version; class scope enforced; status='propuesta' confirmed; demo mock stores proposal
- [ ] **Rollback**: Remove component; proposals remain in DB (can be manually cleaned if needed)

**Commit**: `feat(curriculo-tres-planos): 6.2 ui-maestro-borrador-review`

---

## Phase 7: Testing & Integration

### 7.1 Unit tests for services (TDD mode)

- [ ] Create test suite: `src/modules/planificacion/api/__tests__/weeklyPlanSupabase.test.js`
  - Test: weekly plan derivation from `route_versions` published
  - Test: no phantom table reads
  - Mock: both Supabase (via `@supabase/supabase-js` mock) and Demo adapter
- [ ] Create test suite: `src/modules/planificacion/api/__tests__/routeSupabase.test.js`
  - Test: no deprecated plan_* reads
  - Mock: both Supabase and Demo adapter
- [ ] Create test suite: `src/portal-maestros/services/__tests__/planningParserService.test.js`
  - Test: chunking on documents > 8000 chars
  - Test: schema validation rejects malformed output
  - Test: 4-level mapping correct
  - Mock: Groq parser response + error cases
- [ ] **Test**: All unit tests pass with both Supabase and Demo mocks
- [ ] **Rollback**: Remove test files

**Commit**: `feat(curriculo-tres-planos): 7.1 tests-services-unit`

### 7.2 Integration tests for progression engine

- [ ] Create test suite: `src/modules/progresos/__tests__/progression.test.js`
  - Test: `fn_objetivo_actual_alumno()` returns first incomplete objetivo
  - Test: cascading unlock (tema→nivel)
  - Test: "completado" when all approved
- [ ] **Test**: All progression tests pass against local Supabase (via `npm run test:run`)
- [ ] **Rollback**: Remove test files

**Commit**: `feat(curriculo-tres-planos): 7.2 tests-progression-integration`

### 7.3 E2E test — pilot slice

- [ ] Create E2E test: `cypress/e2e/curriculo-tres-planos.cy.js` or `playwright/tests/curriculo-tres-planos.spec.ts`
- [ ] Scenario:
  1. Maestro logs in, uploads planning document
  2. Parser produces borrador (mock Groq with real output, or use a small test document)
  3. Maestro reviews and saves as propuesta
  4. ACM logs in, sees proposal in queue
  5. ACM publishes (or returns with feedback, then maestro corrects and resubmits)
  6. Route becomes `publicada`; derived in weekly plans
  7. Student receives grade on an indicator → progression engine shows next objetivo
  8. Verify progression endpoint returns correct blocked/completado state
- [ ] Run against demo adapter (no live Supabase/Groq required for green state)
- [ ] **Test**: Full flow end-to-end; all status transitions correct; progression visible
- [ ] **Rollback**: Remove test file

**Commit**: `feat(curriculo-tres-planos): 7.3 tests-e2e-pilot`

---

## Phase 8: Cleanup & Documentation (if needed)

### 8.1 Update API documentation

- [ ] Locate: `docs/API.md` or equivalent
- [ ] Add section: "Proposal Workflow (`route_status: propuesta/devuelta`)"
- [ ] Add section: "Progression Engine (`fn_objetivo_actual_alumno`)"
- [ ] Add section: "Planning Parser Bridge (`planningParserService`)"
- [ ] **Test**: Documentation reflects current API signatures
- [ ] **Rollback**: Revert to previous docs

**Commit**: `feat(curriculo-tres-planos): 8.1 docs-api`

### 8.2 Add feature flags for gradual rollout (if Design requires)

- [ ] If Design specifies: create feature flag `FEATURE_TRES_PLANOS_ENABLED`
- [ ] Gate ACM proposals UI behind flag
- [ ] Gate maestro upload UI behind flag
- [ ] Progression engine always enabled (read-only, no side effects on existing grading)
- [ ] **Test**: Both flags ON → new features visible; flags OFF → old behavior intact
- [ ] **Rollback**: Revert flag defaults to OFF; existing code paths unchanged

**Commit**: `feat(curriculo-tres-planos): 8.2 ops-feature-flags` (if applicable)

---

## Decisions Before Apply

**1. Chain Strategy**: Confirm with Omar whether to use **stacked-to-main** (each PR merges independently after review) or **feature-branch-chain** (all PRs accumulate on a feature/curriculo-tres-planos branch before final merge to main).

**2. Spec & Design**: **BLOCKING** — Tasks are inferred from Proposal alone. Before apply:
   - [ ] Spec must document exact migration rollback strategies, schema constraints, and data migration logic for `nodes.objective` → `objetivos`
   - [ ] Spec must document exact `planningParserService` output schema (JSON structure expected from parser)
   - [ ] Design must provide ACM & Maestro UI wireframes, component hierarchy, and routing structure
   - [ ] Design must define whether maestro can edit borrador before saving, or only review & confirm

**3. Historical Data**: Omar's call on Open Question: migrate `planificaciones` jsonb or freeze? This affects PR #9 scope (whether to include migration batch job).

**4. Materialization**: Omar's call on `alumnos_rutas` caching — on-the-fly progression (current plan) or materialize in staging/prod?

---

## Notes for Apply Phase

- **TDD Mode Active**: Each task includes test assertions. Implement RED (failing test) → GREEN (pass test) → REFACTOR for each commit.
- **DataAdapter Pattern**: Both `SupabaseAdapter` and `DemoAdapter` required for any new data access. Tests must pass with both.
- **Demo Mocks**: E2E test (7.3) must work end-to-end with demo parser (no live Groq required for green state). Integration with real Groq deferred to production deployment.
- **Feature Flags**: Plan for gradual rollout. Progression engine can be default-on (read-only); UI features can be default-off.
- **Rollback Confidence**: Every commit is individually reversible. No accumulated dependencies that force a "revert all" scenario.
- **Staging Validation**: Before merging to main, all migrations must be dry-run against staging copy of `SOI_DDBB_EL_SISTEMAPC`. No auto-migration.

---

## Summary

**Total Tasks**: 23 (across 10 work units / stacked PRs)
**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5/6 (parallel) → Phase 7 → Phase 8
**Estimated Duration**: 10–14 dev days (including review, testing, staging validation)
**Review Workload**: 800–1200 lines across 10 PRs (~80–120 lines per PR on average)
**Decision Needed**: Yes — confirm chain strategy + confirm Spec/Design completion + Omar's answers on historical data & materialization

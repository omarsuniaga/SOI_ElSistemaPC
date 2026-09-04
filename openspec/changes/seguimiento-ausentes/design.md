# Design: Seguimiento de Alumnos Ausentes

## Technical Approach

The Absence Escalation system implements a 3-level workflow (nivel 1-3) that detects cumulative unjustified absences, escalates contact attempts via WhatsApp, and enforces instrument retention as a corrective measure for severe absenteeism. Phase 0 fixes a critical bug in risk detection; Phases 1-4 add the data layer (read-model view), coordinator UI, contact registry, instrument retention workflow, and ADM analytics. The architecture follows the DataAdapter pattern (no direct Supabase calls from views), reuses existing `comunicaciones_seguimiento` with new columns (`nivel`, `origen`), and employs `SECURITY INVOKER = false` views to bypass per-maestro RLS for cross-departmental visibility. All actions are manual (WhatsApp links, no queue automation) to ensure human review before family contact.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale & Evidence |
|----------|--------|--------------------------|--------|
| **Counter unit: DAY not SESSION** | COUNT(DISTINCT asistencias.fecha) where estado='ausente' and that date has NO 'presente' record; 2 absences same day = 1 day-count | Raw count of asistencia rows (sesión-level granularity) | Spec requirement (spec.md L2-9): "The counter is by DAY, not by session" + user decision in state.yaml. Matches pedagogical intent: 1 class attendance saved any day = day is not absence. Implementation: `vw_seguimiento_ausentes` uses DISTINCT on fecha. `sesiones_ausente` is a separate column for detail panel only. |
| **Counter reset mechanism** | Add `fecha_reincorporacion TIMESTAMP` to `retenciones_instrumento` table. View counts only asistencias where `fecha >= MAX(fecha_reincorporacion)` for that alumno (or full período if no reincorporación). | Separate counter table per alumno; manual UI reset; trigger-based reset | Reincorporación is an event tied to a retención (student signs commitment act). Storing it on the retención row keeps the causal chain clear and queryable. Spec.md L99: "reset absence counter (mark with reincorporacion marker date)". View-level logic avoids N+1: single LEFT JOIN to retenciones_instrumento per alumno, filtered in WHERE. |
| **View security model** | `security_invoker = false` (definer mode, BYPASSRLS) on `vw_seguimiento_ausentes` | `security_invoker = true` (invoker mode, respects per-maestro RLS) | Spec requirement (spec.md L223): "ACM/ADM must see ALL alumnos". Per-maestro RLS on `asistencias` (line 28 in 20260519_*.sql: `maestro_en_clase(clase_id)` guard) would empty the view for non-owning maestros. Evidence: signage_v_* views (20260831120000_*.sql L138-139, L167-168) deliberately use `security_invoker = false` with comment "la SPA lee datos no sensibles del horario sin necesitar SELECT directo". Same pattern applied here: ACM/ADM need institutional data bypassing role-based restrictions. |
| **ACM role checking** | RLS: call `es_admin()` function (defined in 20260519_*.sql L13-18: checks `auth.jwt()->>'role' = 'admin'`). Client-side: check `user.rol === 'admin'` OR portal access `has_portal_access('ACM', uid)`. | Define new role enum; create role_acm table | RLS: `es_admin()` is the established pattern in codebase (used in asistencias_admin_all, obs_admin_all policies). Client-side: acm.js L7 states "rol 'admin' por ahora". No new role table needed; reuse portal access system (20260827_*.sql) for fine-grained access. |
| **Contact cascade order** | representante_alumno → representante_familia (via alumnos.familia_id → payador) → alumnos.representante_tlf → alumnos.madre_tlf_whatsapp → alumnos.padre_tlf_whatsapp → alumnos.familiar_telefono → alumnos.contacto_emergencia_telefono | Single source (one fixed field per alumno) | Spec.md L35-43: cascade order is explicit. Real-world coverage: state.yaml reports 236/278 (85%) activos contactables. Implementation: `resolverContactoAlumno(alumnoId)` service function (no view logic) tries each tier, normalizes via `phoneUtils.normalizePhone()`, returns first valid + origen label. |
| **Templates in DB vs code** | Seed 4 templates in `document_templates` table via migration (canonical text in spec.md). Render via `buildResolvedDocument()` client-side. | Hardcode templates in JS; fetch from external CMS | Spec.md L126-171: templates are institutional messaging (scalable in future, audit trail via document_templates history). Matches existing pattern (documentTemplateService.js uses table). Seed in migration ensures templates exist on first deploy; UI can override via config portal. |
| **Nivel computed in SQL vs JS** | Compute `nivel` in view SQL: `CASE WHEN dias_ausente >= 3 THEN 3 WHEN dias_ausente >= 2 THEN 2 WHEN dias_ausente >= 1 THEN 1 ELSE 0 END` using thresholds from `seguimiento_reglas` config. | Compute in JavaScript after fetching from view | SQL computation: single query, no post-fetch logic, correct even for edge cases (e.g., timezone). View becomes the source of truth for nivel. Evidence: `studentRiskDetectorService.js` L16-22 shows `_bucketLevel(count, cfg)` pattern already in codebase (JS logic). For escalation system, prefer SQL to centralize rules and enable querying alumnos-by-nivel directly. |
| **One unified view vs separate queries** | Single `vw_seguimiento_ausentes` with all columns (alumno, nivel, contacto, retención, histórico). Data service filters by período, adds client-side pagination. | Separate views for each nivel; JOIN historicals on demand in JS | Single view: schema is stable, indexed for performance (on entidad_id, nivel, ultima_ausencia_fecha), re-usable for ACM + ADM + maestro badges. Avoids multiple roundtrips. Trade-off: view payload is larger; mitigated by client-side `limit/offset`. |
| **Manual WhatsApp vs queue** | Manual: operator clicks button → writes `comunicaciones_seguimiento` row FIRST → opens `wa.me` link (if write succeeds). No async queue. | Async queue (HERMES notificaciones_asistencia); auto-send templated message | Spec.md L67: "manual…operador revisa y envía desde teléfono". Proposal L72 (Out of Scope): "Envío automático por HERMES…a futuro como Phase 5+". Manual approach: human-in-loop (operator approves tone, fills template vars if missing), lower risk of miscommunication, fits current org workflow. |
| **Nivel 2 auto-escalation deadline** | On Nivel 2 contact insert, set `proxima_accion='contacto_nivel_3'` and `proxima_fecha = now() + 7 days` (auto-escalation). | Operator manually sets next action | Spec.md L71: "Nivel 2 MUST auto-set proxima_accion='contacto_nivel_3' and proxima_fecha=now()+7 days". Automatic escalation prevents "stuck cases" and ensures system-wide consistency. Operator can override proxima_fecha if needed. |
| **Reincorporación workflow** | (1) Alumno + representante sign commitment act in person (CaseLetterModal). (2) ACM coordinator updates `retenciones_instrumento.acta_firmada_en`, sets `estado='levantada'`, sets `fecha_reincorporacion=now()`. (3) Counter resets from that date forward in same período. | Auto-reincorporate on N days absence-free | Spec.md L99: manual workflow with act signature (audit trail). Not automatic to preserve institutional control + ensure family commitment. Acts as both enforcement and educational tool. |
| **Maestro task/badge scope** | Badge visible in maestro portal IF retención.estado='retenido' for any of their classes. Shows "Instrumento retenido — {alumno}". Maestro can mark `maestro_confirmo_recogida_en`. | Email notification; Hermes task creation | Proposal L82: "Task/badge en maestro portal". Inline badge: immediate visibility (no email delays), clear action (collect instrument), minimizes confusion. Implementation: LEFT JOIN `retenciones_instrumento` in maestro-class queries; filter `estado='retenido'`. |

## Data Flow

**Escalation Detection → Contact → Retention:**

```
[Asistencias table]
     ↓ (triggers updated; manual INSERT/UPDATE)
[vw_seguimiento_ausentes view]
     ├─ JOINs: alumnos ⋈ alumnos_clases ⋈ clases ⋈ maestros
     ├─ LATERAL subquery: MAX(comunicaciones_seguimiento.fecha) per nivel
     ├─ LEFT JOIN retenciones_instrumento → retencion_activa flag, fecha_reincorporacion
     ├─ COUNT(DISTINCT asistencias.fecha WHERE estado='ausente' AND fecha > reincorporacion)
     ├─ CASE WHEN count >= thresholds from seguimiento_reglas config
     └─ COALESCE cascade: representante → madre → padre → emergencia contacts
         ↓
[ACM UI: seguimientoAusentesView.js]
    ├─ List view: 50 per page, filterable by nivel/maestro/contacto_estado
    ├─ Detail panel: full alumno record, histórico, sesiones_ausente count
    ├─ Action: "Contactar Nivel N" button
    │    └─→ Resolves template variables; writes comunicaciones_seguimiento row
    │        └─→ Opens wa.me link (manual send)
    └─ Nivel 3 only: Double-confirm dialog
         └─→ Creates retenciones_instrumento row
         └─→ Opens 2 wa.me drafts (representante + maestro)
         └─→ Logs 2 comunicaciones_seguimiento rows (origen='ausentismo')
         └─→ Badge appears in maestro portal
             ↓
[ADM UI: seguimientoAusentesCardADM.js + AusentismoDashboardView.js]
    ├─ Read-only KPI cards (N1/N2/N3 counts, % contacted <72h, retenciones)
    ├─ Historical table: filterable by date range
    ├─ CSV export (client-side)
    └─ Aggregate queries (mean time to reincorporación, recidivism %)
        ↓
[Reincorporación trigger]
    └─→ Coordinator marks acta_firmada_en + estado='levantada'
    └─→ fecha_reincorporacion set to now()
    └─→ Counter resets for next cumulative period
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260903000000_seguimiento_ausentes_*` | Create | Migration: `vw_seguimiento_ausentes` (view with security_invoker=false), `retenciones_instrumento` table, ALTER `comunicaciones_seguimiento` ADD `nivel` + `origen`, seed `seguimiento_reglas` row tipo='ausentismo_acumulado', RLS policies, indices. |
| `src/modules/pedagogico/services/seguimientoAusentesService.js` | Create | DataAdapter: `fetchAusentesResolutionView({periodo_id, limit, offset})`, `resolverContactoAlumno(alumnoId)` (cascading lookup + normalization), `registrarContacto({alumnoId, nivel, telefono, template_vars, canal})`, `crearRetencion({alumnoId, motivo, notas})`, `levantarRetencion({retencionId, acta_url})`, `getActivePeriodo()` cached. |
| `src/modules/pedagogico/views/seguimientoAusentesView.js` | Create | ACM view: list + detail panel + contact actions. Renders list with nivel/maestro/estado filters, paginated. Detail panel shows histórico, sesiones count, contact resolution cascade, templates (N1/N2/N3). "Contactar Nivel N" button; Nivel 3 with double-confirm dialog. |
| `src/modules/pedagogico/components/SeguimientoAusentesCardADM.js` | Create | Card component: KPI layout (N1/N2/N3 counts, % contacted, retenciones activas/levantadas). Uses `selectAusentesMetricas()` RPC or view aggregation. |
| `src/modules/admin-dashboard/views/AusentismoDashboardView.js` | Create | ADM read-only dashboard: KPI cards + historical closed-cases table + CSV export. Filterable by date range. Queries: `SELECT COUNT(*) WHERE nivel=N`, mean time to reincorporación, recidivism rate. |
| `src/modules/pedagogico/services/studentRiskDetectorService.js` | Modify | Fix line 38: change `a.estado === 'A'` to `a.estado === 'ausente'` (and lines 39, 65, 260, 277 for consistency). This corrects the bug preventing detection of actual absences. |
| `src/modules/pedagogico/actions/ContactoAusentismoAction.js` | Create | Action handler: on "Contactar" click, resolve template, write comunicaciones_seguimiento row, open wa.me link. Enforce 120-min duplicate guard + rol check (ACM only). |
| `src/modules/pedagogico/actions/RetencionInstrumentoAction.js` | Create | Action handler: on "Retener" (Nivel 3), double-confirm dialog, create retención, send wa.me to maestro + representante, log comunicaciones rows. Only ACM role. |
| `src/modules/pedagogico/actions/ReincorporacionAction.js` | Create | Action handler: on reincorporación submit (after CaseLetterModal signature), update retención (acta_firmada_en, estado='levantada', fecha_reincorporacion), log comunicaciones row, trigger counter reset. |
| `src/modules/config/services/documentTemplateService.js` | Modify | Seed 4 templates: `seguimiento_ausencia_n1`, `seguimiento_ausencia_n2`, `seguimiento_ausencia_n3_representante`, `seguimiento_ausencia_n3_maestro` (via migration). Extract variables for client-side template preview/validation. |
| `src/shared/utils/phoneUtils.js` | Modify | Ensure `whatsappLink(phone, message)` (L85+) handles null/invalid gracefully; update normalizePhone() to handle DR format (7-11 digits → +1809/829/849). **Already implemented** — no changes needed. |
| `src/portales/maestros/` | Modify | Integrate maestro retención badge: query `retenciones_instrumento WHERE estado='retenido' AND clase_id IN (maestro's classes)` in class views / attendance grid. Show inline badge "Instrumento retenido — {alumno}". |
| `src/portales/acm/acm.js` | Modify | Register route `pedagogico-seguimiento-ausentes` in navGroups (new menu item under Seguimiento & Ciclo section). |
| `src/main.js` | Modify | Add `registerRoutesPedagogico()` call (if not already present) to wire pedagogico routes. |
| `tests/unit/pedagogico/services/seguimientoAusentesService.*.test.js` | Create | Unit tests: `resolverContactoAlumno` cascading logic (all 7 tiers), phone normalization, `registrarContacto` duplicate guard (120 min), `crearRetencion` permission check (ACM only). Vitest + mock Supabase. |
| `tests/integration/pedagogico/seguimientoAusentes.flow.test.js` | Create | Integration test: E2E flow — alumno with 3+ absences → Nivel 3 → double-confirm action → retención created + comunicaciones rows logged → maestro badge visible → reincorporación updates estado + counter resets. Mock período. |

## Interfaces / Contracts

### Service: `seguimientoAusentesService.js`

```javascript
// Data adapter interface
export async function fetchAusentesResolutionView({ periodo_id, limit = 50, offset = 0 } = {}) {
  // Returns { alumnos: [{ alumno_id, alumno_nombre, instrumento_principal, clase_nombres, 
  //           maestro_nombre, dias_ausente, sesiones_ausente, nivel, contacto_nombre, 
  //           contacto_telefono, ultimo_seguimiento_nivel, retencion_activa, ...}], 
  //           totalCount, from, to }
}

// Contact resolution cascade
export async function resolverContactoAlumno(alumnoId) {
  // Returns { nombre, telefono, origen } or { origen: null }
  // origen: 'representante_alumno' | 'representante_familia' | 'alumnos_representante_tlf' | 
  //         'alumnos_madre_tlf_whatsapp' | 'alumnos_padre_tlf_whatsapp' | 
  //         'alumnos_familiar_telefono' | 'alumnos_contacto_emergencia_telefono' | null
}

// Contact action + registry
export async function registrarContacto({ 
  alumnoId, nivel, contactoTelefono, contactoNombre, templateTipo, templateVars 
} = {}) {
  // Writes row to comunicaciones_seguimiento: nivel, origen='ausentismo', 
  // fecha=now(), resultado='pendiente'. Enforces 120-min duplicate guard.
  // If nivel===2, auto-sets proxima_accion='contacto_nivel_3', proxima_fecha=now()+7days.
  // Returns { id, nivel, resultado, fecha }
  // Throws if duplicate within 120 min or template vars incomplete.
}

// Retención workflow
export async function crearRetencion({ alumnoId, motivo = 'ausentismo_acumulado', notas } = {}) {
  // Creates retenciones_instrumento row: estado='retenido', retenido_por=auth.uid(), 
  // retenido_en=now(). Also logs 2 comunicaciones_seguimiento rows (representante + maestro).
  // Requires es_admin() || ACM role.
  // Returns { id, alumno_id, estado, retenido_en, ... }
}

export async function levantarRetencion({ retencionId, actaUrl, notas } = {}) {
  // Updates retenciones_instrumento: acta_firmada_en=now(), estado='levantada', 
  // fecha_reincorporacion=now(), levantada_por=auth.uid().
  // Logs comunicaciones_seguimiento row: resultado='resuelto', origen='ausentismo'.
  // Returns updated retención row.
  // Counter resets from fecha_reincorporacion forward.
}

// Utility
export async function getActivePeriodo() {
  // Queries periodos table: finds row where fecha_inicio <= today <= fecha_fin.
  // Cached in-memory (5 min TTL). Returns { id, nombre, fecha_inicio, fecha_fin, ... }
}
```

### Database Schema (DDL sketches)

**vw_seguimiento_ausentes** (view with security_invoker = false):
```sql
SELECT
  a.id                              as alumno_id,
  a.nombre_completo                 as alumno_nombre,
  a.instrumento_principal,
  (SELECT string_agg(DISTINCT c.nombre, ', ') 
   FROM alumnos_clases ac 
   JOIN clases c ON c.id=ac.clase_id 
   WHERE ac.alumno_id=a.id AND c.periodo_id=periodos.id)  as clase_nombres,
  m.nombre_completo                 as maestro_nombre,
  COUNT(DISTINCT ast.fecha) FILTER (WHERE ast.estado='ausente' AND 
    (ret.fecha_reincorporacion IS NULL OR ast.fecha > ret.fecha_reincorporacion))
    as dias_ausente,
  COUNT(*) FILTER (WHERE ast.estado='ausente')  as sesiones_ausente,
  CASE WHEN COUNT(DISTINCT ...) >= (SELECT config->>'nivel3' FROM seguimiento_reglas WHERE tipo='ausentismo_acumulado') THEN 3
       WHEN COUNT(DISTINCT ...) >= (SELECT config->>'nivel2' FROM seguimiento_reglas WHERE tipo='ausentismo_acumulado') THEN 2
       WHEN COUNT(DISTINCT ...) >= (SELECT config->>'nivel1' FROM seguimiento_reglas WHERE tipo='ausentismo_acumulado') THEN 1
       ELSE 0 END  as nivel,
  (SELECT contacto_nombre FROM (SELECT * FROM representantes WHERE alumno_id=a.id LIMIT 1) UNION ... ) as contacto_nombre,
  (SELECT contacto_telefono FROM ...) as contacto_telefono,
  (SELECT nivel FROM comunicaciones_seguimiento WHERE alumno_id=a.id ORDER BY fecha DESC LIMIT 1) as ultimo_seguimiento_nivel,
  (SELECT fecha FROM comunicaciones_seguimiento WHERE alumno_id=a.id ORDER BY fecha DESC LIMIT 1) as ultimo_seguimiento_fecha,
  ret.estado = 'retenido'  as retencion_activa,
  ...
FROM alumnos a
LEFT JOIN alumnos_clases ac ON ac.alumno_id = a.id
LEFT JOIN clases c ON c.id = ac.clase_id AND c.activo
LEFT JOIN maestros m ON m.id = c.maestro_principal_id
LEFT JOIN asistencias ast ON ast.alumno_id = a.id 
  AND ast.fecha >= periodos.fecha_inicio AND ast.fecha <= periodos.fecha_fin
LEFT JOIN retenciones_instrumento ret ON ret.alumno_id = a.id 
  AND ret.estado IN ('retenido','levantada')
WHERE a.activo = true
  AND periodos.fecha_inicio <= CURRENT_DATE AND CURRENT_DATE <= periodos.fecha_fin
GROUP BY a.id, periodos.id, ret.id, ...
```

**retenciones_instrumento** (table):
```sql
CREATE TABLE public.retenciones_instrumento (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id               uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  instrumento_id          uuid REFERENCES public.instrumentos(id) ON DELETE SET NULL,
  instrumento_texto       text,
  motivo                  text NOT NULL DEFAULT 'ausentismo_acumulado',
  estado                  text NOT NULL DEFAULT 'retenido'
    CHECK (estado IN ('retenido', 'levantada')),
  retenido_por            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  retenido_en             timestamptz NOT NULL DEFAULT now(),
  maestro_notificado_en   timestamptz,
  maestro_confirmo_recogida_en  timestamptz,
  acta_firmada_en         timestamptz,
  fecha_reincorporacion   timestamptz,     -- set on levantarRetencion()
  levantada_por           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  levantada_en            timestamptz,
  notas                   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_retenciones_alumno ON public.retenciones_instrumento(alumno_id);
CREATE INDEX idx_retenciones_estado ON public.retenciones_instrumento(estado) WHERE estado='retenido';
```

**ALTER comunicaciones_seguimiento**:
```sql
ALTER TABLE public.comunicaciones_seguimiento ADD COLUMN nivel smallint;
ALTER TABLE public.comunicaciones_seguimiento ADD COLUMN origen text DEFAULT 'manual'
  CHECK (origen IN ('manual', 'ausentismo', 'hermes', 'otro'));
-- Backfill: UPDATE ... SET origen='manual' WHERE origen IS NULL;
```

**seguimiento_reglas seed** (via migration):
```sql
INSERT INTO public.seguimiento_reglas 
  (nombre, tipo, descripcion, config, activo, prioridad)
VALUES (
  'Ausentismo acumulado',
  'ausentismo_acumulado',
  'Escalamiento de contactos por inasistencias injustificadas acumuladas.',
  '{"periodo":"academico", "nivel1":1, "nivel2":2, "nivel3":3, "contar_justificadas":false}'::jsonb,
  true,
  5
)
ON CONFLICT (tipo) DO NOTHING;
```

## State Machines

### Contact State (comunicaciones_seguimiento.resultado)

```
┌─────────────┐
│  pendiente  │  — Initial state when contact action is registered
└──────┬──────┘
       │ (within 72h for Nivel 1/2)
       │ (manual follow-up OR auto-escalation to next nivel)
       ├─→ (Nivel advances automatically at 7-day window expiry)
       └─→ ┌──────────┐
           │ resuelto │  — Family justified absence OR alumno reincorporated
           └──────────┘
```

### Retención State (retenciones_instrumento.estado)

```
┌─────────────────────────────────────────────────────┐
│                    Nivel 3 Triggered                 │
└──────────────┬────────────────────────────────────────┘
               │ ACM creates retención (double-confirm)
               ↓
        ┌────────────────┐
        │   retenido     │  — Instrument held; maestro collects; badge visible
        └────────┬───────┘
                 │ Alumno + family sign commitment act
                 │ ACM marks acta_firmada_en + sets estado='levantada'
                 ↓
        ┌────────────────┐
        │   levantada    │  — Counter resets at fecha_reincorporacion
        └────────────────┘
```

### Nivel Escalation (automatic per 7-day windows)

```
No absences  ──────────────→  Nivel 0 (nothing happens)
                               (dias_ausente < 1)

1+ absences  ──→  Nivel 1  ──────→  [Contact at Nivel 1; no auto-escalation if justified]
                 [dia 1]              ↓
                                   7 days later (if unresolved)
                                      ↓
             ──→  Nivel 2  ──────→  [Contact at Nivel 2; auto-sets proxima_fecha=now()+7]
                 [dia 2]              ↓
                                   7 days later (if unresolved)
                                      ↓
             ──→  Nivel 3  ──────→  [Retención + commitment act + reincorporation]
                 [dia 3+]             ↓
                                   Reincorporation  ──→  Counter resets
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit** | `resolverContactoAlumno()` cascading logic (all 7 tiers, malformed numbers skip) | Vitest + mock Supabase rows. Test each tier in isolation + fallthrough. |
| | `registrarContacto()` duplicate guard (120 min) | Mock supabase.from().select() to simulate recent rows. Assert 2nd contact within window throws. |
| | `crearRetencion()` ACM role enforcement | Mock auth.uid() + test both `es_admin()` true/false paths. |
| | Phone normalization (7→11 digits, DR codes) | Vitest parameterized tests: '+1809555'→'+18091234567', 'abc123'→null, etc. |
| **Integration** | E2E flow: alumno 3+ absences → Nivel 3 → double-confirm → retención row + 2 comunicaciones rows → fecha_reincorporacion resets counter | Mock entire período + asistencias + retenciones. Check DB state post-each action. |
| | View `vw_seguimiento_ausentes` returns correct columns + niveau logic | Query view with known data; verify dias_ausente, nivel, contacto_cascade. |
| | Nivel 2 auto-sets proxima_fecha | Insert Nivel 2 comunicaciones; verify proxima_fecha set to +7 days. |
| **RLS** | ACM can update retenciones; maestro cannot | pgTAP or mock auth.jwt() with admin role vs non-admin. Test RLS policy enforcement. |
| | ADM sees read-only (no INSERT/UPDATE on retenciones) | Mock ADM user; attempt action handler; verify RLS blocks. |

## Migration / Rollout

**Deployment order (single migration file):**

1. Create `retenciones_instrumento` table + indices + grants
2. ALTER `comunicaciones_seguimiento`: ADD `nivel`, ADD `origen` (backfill existing rows with `origen='manual'`)
3. Create `vw_seguimiento_ausentes` view with security_invoker=false + RLS policies
4. Seed `seguimiento_reglas` row tipo='ausentismo_acumulado'
5. Create RLS policies on `retenciones_instrumento` (ACM only for INSERT/UPDATE)

**Rollback (single reverse migration):**
1. DROP VIEW `vw_seguimiento_ausentes`
2. DROP TABLE `retenciones_instrumento`
3. DELETE FROM `seguimiento_reglas` WHERE tipo='ausentismo_acumulado'
4. ALTER TABLE `comunicaciones_seguimiento` DROP COLUMN nivel, DROP COLUMN origen

**Validation checklist:**
- View returns 1-2 rows per alumno with nivel > 0 (active periodo)
- Retenciones table empty (no test data needed; will populate on first Nivel 3 action)
- `seguimiento_reglas` row exists and can be loaded by service
- RLS: `has_portal_access('ACM', uid)` OR `es_admin()` can INSERT retenciones; others cannot

## Open Questions / Risks

**None — all 3 decision points resolved with evidence.**

- **Decision 1 (counter reset)**: Confirmed via spec.md + state.yaml. Mechanism: `fecha_reincorporacion` on retención row, view filters by date.
- **Decision 2 (security_invoker)**: Confirmed via signage_v_* pattern + spec requirement for ACM/ADM visibility. Use `security_invoker = false`.
- **Decision 3 (ACM role check)**: Confirmed via acm.js (rol='admin') + es_admin() function. RLS uses `es_admin()` + portal access check on client.

---

## Tradeoffs & Justification

| Tradeoff | Choice | Rationale |
|----------|--------|-----------|
| **Nivel computed in SQL vs JS** | SQL (view WHERE clause) | Single source of truth, queryable at DB layer (e.g., "show all Nivel 3 alumnos"). Eliminates post-fetch logic in service. Trade-off: view DDL is complex; mitigated by clear CASE logic + thresholds from config table. |
| **One unified view vs separate views per nivel** | Unified `vw_seguimiento_ausentes` | Stable schema, single query for ACM + ADM + maestro badges. Denormalization acceptable (view is read-only). Trade-off: payload larger; mitigated by pagination (50/page limit) + client-side filtering. |
| **Templates in DB vs hardcoded in JS** | DB (`document_templates` table) with seed migration | Scalable (future edits via config UI), audit trail (templateService logs history), matches existing pattern. Trade-off: requires migration + seed; mitigated by one-time cost, standard practice. |
| **Manual WhatsApp + operator approval vs auto-send via HERMES** | Manual (operator click = wa.me link, manual send). | Human-in-loop ensures tone is appropriate + variables resolved. Prevents accidental miscommunication. Out-of-scope Phase 5+: async queue + HERMES auto-send. Trade-off: slower (operator latency); acceptable for MVP, acceptable org SLA. |
| **security_invoker = false (BYPASSRLS) vs explicit RLS policies** | `security_invoker = false` on view + authenticated SELECT policy | Mirrors signage_v_* established pattern. Per-maestro RLS on asistencias would break cross-departmental queries. Trade-off: view downer (postgres role) has all powers; mitigated by immutable view + policy on view itself (authenticated only) + audit via comunicaciones_seguimiento. |

## Phasing & Effort Estimates

Confirming Phases 0-4 from proposal; adjusted SLA per delivery strategy:

| Phase | Scope | Est. Lines | Risk | Notes | PR Strategy |
|-------|-------|------------|------|-------|------------|
| **0** | Fix `studentRiskDetectorService` estado filter; create `resolverContactoAlumno()` helper; seed `ausentismo_acumulado` rule; unit tests. **No UI.** | ~120 | LOW | Isolated fix + utility function + seed. No DB changes. Tests verify logic in Vitest. | Standalone PR: Fase-0-bugfix-escalation-foundation. Can merge immediately. |
| **1** | Migration: `vw_seguimiento_ausentes`, `retenciones_instrumento`, ALTER `comunicaciones_seguimiento`. DataAdapter service. ACM list view + detail panel + filters. ADM KPI cards (read-only). | ~400 | MEDIUM | View complexity, 5 columns added, new table, 3 new RLS policies. Recommend split: 1a (migration + data service + tests), 1b (ACM/ADM UI). | **Two chained PRs**: (1a) Fase-1a-data-layer (~180 lines), (1b) Fase-1b-acm-adm-ui (~220 lines). |
| **2** | Contact action handler: WhatsApp link generation, `registrarContacto()`, 120-min duplicate guard, template rendering, `comunicaciones_seguimiento` insert. | ~200 | MEDIUM | Write + validation logic. Tests: contact action → row insertion, guard enforcement. | Standalone PR: Fase-2-contact-action-whatsapp. |
| **3** | Retención action handler: double-confirm dialog, `crearRetencion()`, `levantarRetencion()`, maestro notification wa.me, badge integration in maestro portal. | ~300 | MEDIUM | UI dialog + action handler + badge query. Tests: permission checks, state transitions, maestro queries. | Standalone PR: Fase-3-retention-and-reincorporation. |
| **4** | ADM dashboard: historical cases, CSV export, aggregation queries (mean time, recidivism %). KPI updates. | ~200 | LOW | View + aggregation RPC. Tests: query correctness, date range filtering. | Standalone PR: Fase-4-adm-analytics-and-export. |
| **Total** | | **~1,400** | — | User request: **Fase 0 + Fase 1 together this session.** Recommend: deliver Fase 0 + Fase 1a + 1b as 3 consecutive reviewable PRs (no holding back pending Fase 2+). | 5 PRs total (as chained/stacked if delivery_strategy='auto-chain'). |

**Recommended batch this session**: Fase 0 + Fase 1a + Fase 1b (~500 lines combined). Prerequisite for Fases 2-4 (depend on view + service + tables being live).

**Decision on 400-line budget risk**: Fase 1 split into 1a (migrations + service) and 1b (UI) keeps each under 250 lines, well below budget. Recommend proceeding with chained PR approach.

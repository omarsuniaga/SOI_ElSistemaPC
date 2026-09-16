# Design: Justificación de Actividades Emergentes (Institucionales)

## Technical Approach

This change extends the existing institutional activity workflow (`sesiones_clase` root sessions with `clase_id = NULL` and `emergente_id` auto-justification) to enable **multi-maestro confirmation**, **scope filtering**, and **audit-trail tracking** of who confirms which institutional activities apply to their classes. The asistencias pipeline will be fixed to respect `emergente_id` as a valid justification marker, eliminating false "sin asistencias" reports. Notification flow uses the existing `registros_pendientes` + `notificaciones` escalation system (GREEN→YELLOW→RED) to reach affected maestros without building a parallel notification layer.

## Architecture Decisions

### Decision: FK Targets auth.users, Not maestros

**Choice**: All audit columns (`respondido_por`, `creado_por`) reference `auth.users(id)` with `ON DELETE SET NULL`.

**Alternatives considered**:
- Reference `maestros(id)` — breaks RLS policies that compare `auth.uid()` with column values.
- Reference `personas(id)` — adds indirection; existing patterns use `auth.users`.

**Rationale**: The entire codebase stores `auth.uid()` in audit columns (confirmed in `evaluacion_indicador`, `retenciones_instrumento`). This preserves identity even if a maestro record is deleted and ensures RLS predicates (`auth.uid() = respondido_por`) work correctly.

### Decision: Reuse registros_pendientes + notificaciones (Not New System)

**Choice**: Leverage existing escalation system: insert rows into `registros_pendientes` (tipo='confirmacion_emergente_pendiente') and let the trigger send notifications via `notificaciones`.

**Alternatives considered**:
- Create new `notificaciones_actividades` table — duplicates existing infrastructure.
- Use direct RPC-to-WhatsApp layer — breaks audit trail and bypasses rate-limiting.

**Rationale**: Maestros already trust the GREEN→YELLOW→RED flow. Reusing it avoids maintenance overhead and rate-limit logic (which the existing trigger already handles). Scope filtering is RPC-side; notification delivery is unchanged.

### Decision: Store alcance as JSONB in sesiones_clase (Not Separate Table)

**Choice**: Add `alcance_tipo` (enum) and `alcance_config` (JSONB) to root `sesiones_clase` rows (clase_id IS NULL). Examples: `alcance_tipo='programa'`, `alcance_config={'programa_id': '...'}`.

**Alternatives considered**:
- Normalize to `actividades_alcance` table — slower for read; adds JOINs.
- Flatten all fields — bloats schema; hard to extend for new scope types.

**Rationale**: Writes are rare (one activity per registro); reads are frequent (filtering affected maestros). JSONB is fast for simple reads. Scope types (institución, orquesta, coro, programa, grupo, maestros_específicos) are defined; config shape is documented. Easy to index by scope_tipo.

### Decision: One Confirmation per Maestro+Actividad+Fecha (UNIQUE Constraint)

**Choice**: `UNIQUE (actividad_id, maestro_id, fecha)` in `confirmaciones_emergentes`. UPSERT on re-save.

**Alternatives considered**:
- No unique constraint — allows duplicate confirmations; reporting is complex.
- Unique by (actividad_id, maestro_id) only — conflates same activity on different dates (edge case but possible).

**Rationale**: A maestro can only confirm "this activity applied to me (sí/no/no_aplica/no_sé)" once per event. UPSERT ensures idempotence (retry safety) and simplifies RLS (one state per tuple).

### Decision: RPC for Maestro-Scope Filtering (Deterministic, Idempotent)

**Choice**: Create `fn_maestros_afectados_por_alcance(actividad_id, alcance_tipo, alcance_config)` — pure function returning `maestro_id[]`. Call this RPC once at activity registration; then insert notifications for those maestros.

**Alternatives considered**:
- Compute scope at query-time for each confirmation request — slower and hard to test.
- Hard-code scope logic in frontend — weak, not auditable.

**Rationale**: RPC ensures scope logic is version-controlled, testable, and deterministic. Result is logged (who was notified when). No risk of frontend divergence.

## Data Flow

```
Maestro registers institutional activity
  ↓
(claseEmergenteModal.js → emergenteJustificacionService.js)
  ↓
UPSERT root sesiones_clase row (clase_id=NULL, emergente_id=id)
Set lugar, alcance_tipo, alcance_config
Auto-justify own classes: UPDATE sesiones_clase SET emergente_id (existing behavior)
  ↓
Call RPC fn_maestros_afectados_por_alcance(...)
  ↓ [returns maestro_id[] matching scope]
  ↓
INSERT registros_pendientes (maestro_id, tipo='confirmacion_emergente_pendiente')
  ↓ [existing notificacion trigger fires]
  ↓
Portal Maestros: Badge + deep-link to confirm
  ↓
Maestro confirms: Sí/No/No_aplica/No_sé
  ↓
UPSERT confirmaciones_emergentes
  ↓
Trigger: Update registros_pendientes.estado → resolved (if Sí/No/No_aplica)
         Or escalate (if No_sé unresolved after 24h)
  ↓
Pipeline (vw_asistencias_consolidada, getSesionesPorRango):
Check emergente_id OR confirmacion='si' → not "sin asistencias"
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260914HHMMSS_emergentes_confirmaciones.sql` | Create | DDL: ALTER sesiones_clase, CREATE confirmaciones_emergentes, CREATE RPC fn_maestros_afectados_por_alcance, CREATE RPC fn_confirmar_actividad_emergente |
| `src/portal-maestros/services/confirmacionesEmergentesAdapter.js` | Create | DataAdapter: demo/supabase mode selector |
| `src/portal-maestros/services/confirmacionesEmergentesMock.js` | Create | Mock data: sample activities, confirmations, scope filtering |
| `src/portal-maestros/services/confirmacionesEmergentesService.js` | Create | Supabase impl: UPSERT confirmación, list pending for maestro, fetch scope-filtered activities |
| `src/modules/asistencias/api/asistenciasSupabase.js` | Modify | Fix `getSesionesPorRango()`: check `emergente_id` before marking "sin asistencias"; add to result payload |
| `src/modules/asistencias/services/asistenciaDataService.js` | Modify | Fix query logic to respect `emergente_id` in classification |
| `src/shared/components/ActividadEmergenteBandeja.js` | Create | Portal Maestros UI: list pending confirmations, modal for each (Sí/No/No_aplica/No_sé) |
| `src/modules/academic-admin/components/ActividadEmergenteManagerView.js` | Create | Portal ACM: create/edit/view activities, list maestros pending/confirmed, validate "no_sé" |
| `src/modules/admin-reports/components/ActividadEmergenteAuditView.js` | Create | Portal ADM: read-only query, filter by maestro/fecha/state, view audit trail |
| `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` | Create | Vitest suite: RPC calls, RLS, idempotence, demo mode |
| `src/shared/components/__tests__/ActividadEmergenteBandeja.test.js` | Create | Vitest suite: UI interactions, modal states, deep-link routing |

## Interfaces / Contracts

### DDL — New/Modified Tables

```sql
-- Root sesiones_clase row (clase_id IS NULL) now includes:
ALTER TABLE sesiones_clase ADD COLUMN IF NOT EXISTS
  lugar VARCHAR(255),
  alcance_tipo TEXT DEFAULT 'institucion'
    CHECK (alcance_tipo IN ('institucion','orquesta','coro','programa','grupo','maestros_especificos')),
  alcance_config JSONB DEFAULT '{}';

-- New: Maestro confirmations
CREATE TABLE confirmaciones_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  respuesta TEXT NOT NULL
    CHECK (respuesta IN ('si','no','no_aplica','no_se')),
  estado_validacion TEXT DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente','validado','rechazado')),
  respondido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  respondido_at TIMESTAMPTZ,
  clases_afectadas JSONB DEFAULT '[]',
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (actividad_id, maestro_id, fecha)
);
CREATE INDEX idx_confirmaciones_maestro_fecha ON confirmaciones_emergentes(maestro_id, fecha);
CREATE INDEX idx_confirmaciones_actividad ON confirmaciones_emergentes(actividad_id);
CREATE INDEX idx_confirmaciones_estado ON confirmaciones_emergentes(estado_validacion);

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION tg_confirmaciones_touch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER trg_confirmaciones_touch BEFORE UPDATE ON confirmaciones_emergentes
  FOR EACH ROW EXECUTE FUNCTION tg_confirmaciones_touch();
```

### RLS Policies

```sql
ALTER TABLE confirmaciones_emergentes ENABLE ROW LEVEL SECURITY;

-- Maestro sees own confirmations + activities that apply by scope
CREATE POLICY confirmaciones_select_maestro ON confirmaciones_emergentes
  FOR SELECT TO authenticated
  USING (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

-- ACM (Coordinación Académica) sees all
-- NOTE: corrected — public.tiene_rol() does NOT exist anywhere in this schema
-- (verified against all migrations). 'coordinacion_academica' IS a valid
-- profiles.rol value per the CHECK constraint added in
-- 20260719_fix_profiles_schema_and_triggers.sql. Use a direct EXISTS predicate
-- against profiles, matching the pattern used by 20260822010000_registrar_pago_transaccional.sql
-- and 20260815000005_contactos_alianzas.sql.
CREATE POLICY confirmaciones_select_acm ON confirmaciones_emergentes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('coordinacion_academica', 'admin', 'superadmin')
    )
  );

-- Maestro can upsert own confirmations only
CREATE POLICY confirmaciones_upsert_maestro ON confirmaciones_emergentes
  FOR INSERT TO authenticated
  WITH CHECK (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    AND respondido_por = auth.uid()
  );

CREATE POLICY confirmaciones_update_maestro ON confirmaciones_emergentes
  FOR UPDATE TO authenticated
  USING (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  )
  WITH CHECK (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    AND respondido_por = auth.uid()
  );

-- ADM read-only (reuses existing public.es_admin() helper: rol IN ('admin','inventarista'))
CREATE POLICY confirmaciones_select_adm ON confirmaciones_emergentes
  FOR SELECT TO authenticated
  USING (public.es_admin());

-- sesiones_clase: extend existing RLS to include new columns
-- (no new policy needed; existing policies already guard access)
-- Verify: Maestro can see own root sessions; admin sees all.
```

### RPC Functions

```sql
-- Deterministic scope filtering: return maestro_id[] affected by activity
CREATE OR REPLACE FUNCTION fn_maestros_afectados_por_alcance(
  p_actividad_id UUID,
  p_alcance_tipo TEXT,
  p_alcance_config JSONB,
  p_fecha DATE
) RETURNS UUID[] LANGUAGE plpgsql STABLE AS $$
-- CORRECTED: was marked IMMUTABLE, but this function reads sesiones_clase/clases
-- (mutable table data) — IMMUTABLE is incorrect here and risks the planner
-- caching stale results. STABLE is the correct volatility for a read-only
-- function whose result can change between statements.
DECLARE
  v_result UUID[];
BEGIN
  CASE p_alcance_tipo
    WHEN 'institucion' THEN
      -- All maestros with classes that day
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      WHERE sc.fecha = p_fecha
        AND sc.clase_id IS NOT NULL
        AND sc.emergente_id IS NULL;

    WHEN 'programa' THEN
      -- Maestros of classes in specific programa_id
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      JOIN clases c ON sc.clase_id = c.id
      WHERE sc.fecha = p_fecha
        AND c.programa_id = (p_alcance_config->>'programa_id')::UUID
        AND sc.emergente_id IS NULL;

    WHEN 'orquesta' THEN
      -- CORRECTED: 'orquesta' is a clases.tipo_clase value, not a separate table
      -- (verified: clases_tipo_clase_check CHECK IN (..., 'orquesta', 'coro', ...))
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      JOIN clases c ON sc.clase_id = c.id
      WHERE sc.fecha = p_fecha
        AND c.tipo_clase = 'orquesta'
        AND sc.emergente_id IS NULL;

    WHEN 'coro' THEN
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      JOIN clases c ON sc.clase_id = c.id
      WHERE sc.fecha = p_fecha
        AND c.tipo_clase = 'coro'
        AND sc.emergente_id IS NULL;

    WHEN 'grupo' THEN
      -- CORRECTED: `clases` has NO `grupo_id` column (verified against
      -- schema_reference.sql). A "grupo" in this domain IS a `clase` row
      -- (tipo_clase='grupal' or similar) — alcance_config stores the explicit
      -- clase_id(s) selected in the ACM form, not a separate grupo_id.
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      WHERE sc.fecha = p_fecha
        AND sc.clase_id = ANY (
          SELECT jsonb_array_elements_text(p_alcance_config->'clase_ids')::UUID
        )
        AND sc.emergente_id IS NULL;

    WHEN 'maestros_especificos' THEN
      -- Explicit maestro_id array in config.
      -- CORRECTED: JSONB cannot be cast directly to UUID[] in Postgres;
      -- must unnest via jsonb_array_elements_text first.
      SELECT ARRAY_AGG(x::UUID) INTO v_result
      FROM jsonb_array_elements_text(p_alcance_config->'maestro_ids') AS x;

    ELSE
      v_result := ARRAY[]::UUID[];
  END CASE;

  RETURN COALESCE(v_result, ARRAY[]::UUID[]);
END $$;

-- Idempotent confirmation upsert + notification trigger
CREATE OR REPLACE FUNCTION fn_confirmar_actividad_emergente(
  p_actividad_id UUID,
  p_maestro_id UUID,
  p_fecha DATE,
  p_respuesta TEXT,
  p_observaciones TEXT DEFAULT NULL
) RETURNS confirmaciones_emergentes LANGUAGE plpgsql AS $$
DECLARE
  v_conf confirmaciones_emergentes;
  v_actividad sesiones_clase;
  v_maestro maestros;
BEGIN
  -- Validate actividad exists and is root (clase_id IS NULL)
  SELECT * INTO v_actividad
  FROM sesiones_clase
  WHERE id = p_actividad_id AND clase_id IS NULL;
  
  IF v_actividad IS NULL THEN
    RAISE EXCEPTION 'Actividad not found or not a root session';
  END IF;

  -- Validate maestro exists
  SELECT * INTO v_maestro FROM maestros WHERE id = p_maestro_id;
  IF v_maestro IS NULL THEN
    RAISE EXCEPTION 'Maestro not found';
  END IF;

  -- UPSERT confirmation
  INSERT INTO confirmaciones_emergentes (
    actividad_id, maestro_id, fecha, respuesta, 
    respondido_por, respondido_at, observaciones
  ) VALUES (
    p_actividad_id, p_maestro_id, p_fecha, p_respuesta,
    auth.uid(), now(), p_observaciones
  )
  ON CONFLICT (actividad_id, maestro_id, fecha)
  DO UPDATE SET
    respuesta = EXCLUDED.respuesta,
    respondido_por = EXCLUDED.respondido_por,
    respondido_at = EXCLUDED.respondido_at,
    observaciones = EXCLUDED.observaciones,
    updated_at = now()
  RETURNING * INTO v_conf;

  -- Trigger: Update registros_pendientes if respuesta in ('si','no','no_aplica')
  -- (separate trigger handles this; can also be inline here if preferred)

  RETURN v_conf;
END $$;
```

### Service Layer (DataAdapter Pattern)

**File**: `src/portal-maestros/services/confirmacionesEmergentesAdapter.js`

```javascript
import { config } from '../../core/config/config.js'
import * as mock from './confirmacionesEmergentesMock.js'
import * as supabaseImpl from './confirmacionesEmergentesService.js'

const impl = config.isDemoMode ? mock : supabaseImpl

export const confirmarActividad = (datos) => impl.confirmarActividad(datos)
export const obtenerConfirmacionesPendientes = (maestroId) => impl.obtenerConfirmacionesPendientes(maestroId)
export const obtenerActividadPorId = (actividad_id) => impl.obtenerActividadPorId(actividad_id)
export const obtenerActividadesPorAlcance = (maestroId, fecha) => impl.obtenerActividadesPorAlcance(maestroId, fecha)
```

**File**: `src/portal-maestros/services/confirmacionesEmergentesService.js` (Supabase)

```javascript
import { supabase } from '../../lib/supabaseClient.js'

export async function confirmarActividad(datos) {
  const { actividad_id, maestro_id, fecha, respuesta, observaciones } = datos
  
  const { data, error } = await supabase.rpc('fn_confirmar_actividad_emergente', {
    p_actividad_id: actividad_id,
    p_maestro_id: maestro_id,
    p_fecha: fecha,
    p_respuesta: respuesta,
    p_observaciones: observaciones
  })
  
  if (error) throw error
  return data
}

export async function obtenerConfirmacionesPendientes(maestroId) {
  const { data, error } = await supabase
    .from('registros_pendientes')
    .select('sesion_id, actividad_id:sesion_id(...), estado, created_at')
    .eq('maestro_id', maestroId)
    .eq('tipo', 'confirmacion_emergente_pendiente')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function obtenerActividadPorId(actividad_id) {
  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('*')
    .eq('id', actividad_id)
    .is('clase_id', null)
    .single()
  
  if (error) throw error
  return data
}

export async function obtenerActividadesPorAlcance(maestroId, fecha) {
  // Query activities by scope; filter those matching maestro
  const { data, error } = await supabase
    .from('confirmaciones_emergentes')
    .select('actividad_id, respuesta, respondido_at')
    .eq('maestro_id', maestroId)
    .eq('fecha', fecha)
    .order('respondido_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

## Testing Strategy

| Layer | What to Test | Approach | Files |
|-------|-------------|----------|-------|
| Unit | RPC `fn_maestros_afectados_por_alcance`: scope filtering (institucion, programa, grupo, maestros_especificos); null/edge cases | Vitest; mock Supabase; test each alcance_tipo | confirmacionesEmergentesService.test.js |
| Unit | UPSERT idempotence: re-confirm same activity returns same row; no duplicates | Vitest; call RPC twice, compare IDs | confirmacionesEmergentesService.test.js |
| Unit | RLS isolation: maestro A cannot see/update maestro B's confirmations; ACM sees all | Vitest + @supabase/auth-helpers; mock auth context | confirmacionesEmergentesService.test.js (RLS policies) |
| Unit | Demo mode: mock data returns same shape as Supabase; adapter switches correctly | Vitest; spy on config.isDemoMode | confirmacionesEmergentesAdapter.test.js |
| Integration | Modal state machine: save confirmation, UI reflects state (pending→confirmed/rejected), button disable logic | Vitest + @testing-library/dom; mount ActividadEmergenteBandeja; interact | ActividadEmergenteBandeja.test.js |
| Integration | Deep-link routing: push from notification → deep-link → bandeja opens + highlights activity | Vitest + history mock | ActividadEmergenteBandeja.test.js |
| Integration | No regression: existing `getSesionesPorRango()` still respects emergente_id; no false "sin asistencias" | Vitest; mock emergente_id session; verify count | asistenciasSupabase.test.js (extension) |
| E2E | User flow: registro actividad → RPC detects scope → notifications sent → confirm→audit → report correct | Strict TDD; Vitest snapshots; mock Supabase RPC | confirmacionesEmergentesService.test.js + integration test |
| E2E | Mobile modal: confirm button responsive, no overflow, touch-friendly | Vitest + @testing-library/dom; viewport='375px' | ActividadEmergenteBandeja.test.js |
| E2E | Build: no console warnings, tree-shake OK, dev server starts | Vitest build target; check vite warnings | confirmacionesEmergentes.test.js (build) |

**15 Mandatory Test Cases** (user requirement):

1. ✅ Reintento no duplica confirmación (UPSERT idempotence)
2. ✅ RLS aislamiento: maestro A ≠ maestro B confirmaciones
3. ✅ RLS escalación: ACM ve todas las confirmaciones
4. ✅ Alcance institución filtra todos maestros del día
5. ✅ Alcance programa filtra solo maestros de ese programa
6. ✅ Alcance grupo filtra solo maestros de ese grupo
7. ✅ Alcance maestros_específicos respeta array explícito
8. ✅ Confirmación "sí" → registros_pendientes.estado='resuelto'
9. ✅ Confirmación "no_sé" → escalación a ACM después de 24h
10. ✅ Modal renderiza 4 botones (Sí/No/No_aplica/No_sé) correctamente
11. ✅ Deep-link actividad → bandeja se abre y destaca fila
12. ✅ Vista móvil (375px) sin overflow; buttons touchable
13. ✅ Demo mode (config.isDemoMode=true) retorna mock data correctamente
14. ✅ Build sin regresiones: vite warnings=0, imports tree-shake OK
15. ✅ getSesionesPorRango() respeta emergente_id → no false "sin asistencias"

## Migration / Rollout

**Phase 1: DDL + RPC** (20260914HHMMSS_emergentes_confirmaciones.sql)
- Add columns to `sesiones_clase` (NULLABLE, DEFAULT)
- Create `confirmaciones_emergentes` table
- Create RPC functions (deterministic, no side effects)
- Create RLS policies
- Create indexes
- Create triggers (updated_at, event escalation)

**Phase 2: Service Layer** (backend API ready)
- Deploy `confirmacionesEmergentesAdapter.js` + impl files
- Deploy asistencias pipeline fixes (`getSesionesPorRango`, views)
- All writes via RPC; all reads respect RLS

**Phase 3: Portal Maestros UI** (Frontend)
- Deploy `ActividadEmergenteBandeja.js`
- Add route/menu link in Portal Maestros
- Test notification deep-link routing

**Phase 4: Portal ACM UI** (Coordination)
- Deploy `ActividadEmergenteManagerView.js`
- Enable ACM to create activities, validate "no_sé", see aggregates

**Phase 5: Portal ADM UI** (Audit)
- Deploy `ActividadEmergenteAuditView.js`
- Enable read-only query, filter, audit trail

**Rollback Plan**:
- If confirmaciones table is problematic: Set read-only, revert code to ignore confirmaciones. Existing emergente_id behavior (auto-justify) remains intact.
- If scope filtering is wrong: Re-run RPC with updated logic; existing confirmations unaffected (they store respuesta only).
- Complete rollback: DROP `confirmaciones_emergentes`, revert DDL on `sesiones_clase`, revert pipeline changes.

## Open Questions

- [ ] **24h timeout for "no_sé"**: Should a confirmation in "no_sé" auto-resolve to "pendiente_validacion" after 24h, or stay pending indefinitely until ACM reviews? (Recommend: timeout → escalate to ACM yellow-flag.)
- [ ] **Notification batching**: Should the RPC batch notifications if 50+ maestros are affected by one activity, or send all 50 at once? (Recommend: batch by 10/trigger, rate-limit in existing notificaciones trigger.)
- [ ] **Portal ACM location**: Should "Crear Actividad Emergente" live in a standalone module (`modules/academic-admin`) or inside `modules/asistencias`? (Recommend: standalone for clarity; import shared components from `shared/`.)


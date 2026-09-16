# Proposal: Justificación de Actividades Emergentes (Institucionales)

## Intent

**Problem**: When a maestro registra an institutional activity (concierto, masterclass), the system auto-justifies their own sessions that day via `sesiones_clase.emergente_id`, but:
1. The asistencias pipeline ignores `emergente_id`, falsely marking justified sessions as "sin asistencia"
2. Other maestros with classes that day never learn about the activity — cannot confirm if it applied to them
3. No audit trail of who confirmed what, when, and under what scope

**Why now**: Maestros are reporting incorrect pending sessions for days when institutional activities occurred. Academic coordinators (ACM) cannot verify scope (institución/orquesta/programa/grupo/specific maestros) or track confirmations.

**Success**: When a maestro registers an institutional activity, the system (1) correctly marks their sessions as justified, (2) notifies affected maestros for confirmation, (3) tracks each confirmation with audit metadata, and (4) correctly classifies days by state (completo/justificado/pendiente/etc.).

---

## Scope

### In Scope
- **Data model**: Extend `sesiones_clase` (root sessions with `clase_id = NULL`) with `lugar` and `alcance_tipo`/`alcance_config`. Create `confirmaciones_emergentes` table for maestro responses.
- **Pipeline fix**: Update `getSesionesPorRango()`, `vw_asistencias_consolidada`, and `registros_pendientes` trigger to check `emergente_id` before classifying as "sin asistencias".
- **Confirmation UI/Portal**: Portal Maestros: modal/bandeja for one-off confirmations per activity+date (not per session). Portal ACM: view pending, validate "no_sé", see justificadas/pendientes grouped by maestro+fecha. Portal ADM: read-only access, query confirmations.
- **Notification system**: Trigger sends notifications to affected maestros (by scope) when activity is registered. Use existing `registros_pendientes` + `notificaciones` or new mechanism (TBD with design phase).
- **Day-state classification**: Compute 8 states (completo, sin_sesion, borrador, sesion_sin_asistencias, justificado_por_actividad, pendiente_de_confirmar_actividad, actividad_no_aplicable, pendiente_validacion_academica, excepcion_periodo).
- **Audit trail**: Track maestro_id, confirmación, timestamp, user, clases afectadas, validación changes. No CASCADE deletes (use ON DELETE SET NULL).

### Out of Scope
- Retroactive bulk backfill of past institutional activities (can be added later as separate migration).
- Auto-timeout to resolve "no_sé" responses (will be design/task decision).
- SMS/WhatsApp rate-limiting logic (notification system design phase).
- Admin panel for editing maestro confirmations (read-only ACM dashboard only).
- `clases_emergentes` + `asistencias_emergentes` feature (separate "refuerzo" system — NOT touched).

---

## Capabilities

### New Capabilities
- `institutional-activity-confirmation`: Maestro confirms if institutional activity applied to their classes that day (Sí/No/No aplica/No sé). Single confirmation per maestro+actividad+fecha, auditable.
- `activity-scope-filtering`: System filters which maestros see a confirmation based on activity alcance (institución/orquesta/coro/programa/grupo/maestros_especificos).
- `day-state-classification`: Compute pedagogical state of a maestro+fecha (completo, justificado_por_actividad, pendiente_de_confirmar, etc.).

### Modified Capabilities
- `asistencia-classification`: Now checks `emergente_id` to avoid false "sin asistencias" when sessions are justificadas. Query logic in `getSesionesPorRango()` and view `vw_asistencias_consolidada`.
- `institutional-activity-registration`: Extends the root `sesiones_clase` (clase_id IS NULL) workflow to include `lugar` and `alcance` fields.

---

## Approach

### 1. Data Model (DDL)
```sql
-- Extend sesiones_clase (root sessions only)
ALTER TABLE sesiones_clase
  ADD COLUMN lugar VARCHAR(255),
  ADD COLUMN alcance_tipo TEXT DEFAULT 'institucion',
      CHECK (alcance_tipo IN ('institucion','orquesta','coro','programa','grupo','maestros_especificos')),
  ADD COLUMN alcance_config JSONB DEFAULT '{}';

-- New confirmations table
CREATE TABLE confirmaciones_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  fecha DATE NOT NULL,
  respuesta TEXT NOT NULL CHECK (respuesta IN ('si','no','no_aplica','no_se')),
  estado_validacion TEXT DEFAULT 'pendiente', -- 'pendiente','validado','rechazado'
  respondido_por UUID REFERENCES usuarios(id),
  respondido_at TIMESTAMPTZ,
  clases_afectadas JSONB, -- [{clase_id, hora_inicio, hora_fin, alumnos_count}, ...]
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (actividad_id, maestro_id, fecha)
);
CREATE INDEX idx_confirmaciones_maestro_fecha ON confirmaciones_emergentes(maestro_id, fecha);
```

### 2. Asistencias Pipeline Fix
- `getSesionesPorRango()`: Before marking as "sin asistencias", check `emergente_id IS NOT NULL` OR exists validated confirmation.
- `vw_asistencias_consolidada`: Add column `emergente_id`, compute flag `es_justificada_por_emergente`.
- `registros_pendientes` trigger: Don't flag "asistencia_pendiente" if `emergente_id IS NOT NULL` unless confirmation = 'no'.

### 3. Notification + Confirmation Flow
- When maestro registers activity: Identify affected maestros by scope. Create notification in `registros_pendientes` or custom table. Trigger sends to Portal Maestros.
- Maestro confirms: UPSERT `confirmaciones_emergentes`. Update `registros_pendientes` state. Trigger validation (if "no_sé", flag for ACM).

### 4. Portals
- **Portal Maestros**: Bandeja/modal for active confirmations. Shows: activity name, date, affected classes, 4 buttons (Sí/No/No aplica/No sé). One-off per activity+date.
- **Portal ACM**: Create/edit activities (form for nombre, fecha, hora, motivo, lugar, alcance_tipo, alcance_config). View pending confirmations. Validate "no_sé" responses. See summary: maestros por fecha, justificadas/pendientes/no_aplica counts.
- **Portal ADM**: Read-only query of activities and confirmations. Filter by maestro, fecha, state. See audit trail (respondido_por, respondido_at, cambios).

### 5. Day-State Rules
Compute for (maestro_id, fecha) tuple:
1. **completo**: All sessions have asistencias registered.
2. **sin_sesion**: No sessions that date.
3. **borrador**: At least one session in state 'borrador'.
4. **sesion_sin_asistencias**: At least one session with 0 asistencias rows, emergente_id IS NULL.
5. **justificado_por_actividad**: All relevant sessions have emergente_id IS NOT NULL OR confirmed confirmacion='si'.
6. **pendiente_de_confirmar_actividad**: Actividad exists but confirmacion IS NULL for this maestro.
7. **actividad_no_aplicable**: confirmacion='no_aplica'.
8. **pendiente_validacion_academica**: confirmacion='no_se' and estado_validacion='pendiente'.
9. **excepcion_periodo**: Within `periodo_excepciones` range.

---

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `sesiones_clase` table | Modified | Add `lugar`, `alcance_tipo`, `alcance_config` columns (root sessions only) |
| `confirmaciones_emergentes` table | New | Maestro confirmations; indexed by maestro_id, fecha; auditable metadata |
| `getSesionesPorRango()` in `asistenciasSupabase.js` | Modified | Check `emergente_id` before classifying as "sin asistencias" |
| `vw_asistencias_consolidada` view | Modified | Add `emergente_id` column; compute `es_justificada_por_emergente` flag |
| `registros_pendientes` trigger | Modified | Don't flag "asistencia_pendiente" if emergente_id exists (unless confirmed 'no') |
| Portal Maestros | New UI | Confirmation bandeja + modal for institutional activities |
| Portal ACM | New UI/Mgmt | Create/edit activities; view pending confirmations; validate "no_sé" |
| Portal ADM | New UI | Read-only query of activities + confirmations; audit trail |

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Notification rate-limit (1000s of messages if 50 activities×20 maestros) | Med | Batch notifications in RPC or rate-limit trigger. Design phase to decide. |
| Retroactive events (backfill past activities without confirmations) | Med | Mark auto-created confirmations as 'no_aplica' to prevent indefinite pending state. Separate task if needed. |
| Maestro never confirms ("no_sé" or ignores) | Med | Design phase to define: auto-timeout (24h→assume 'no'?), ACM escalation, or manual review. |
| CASCADE vs. SET NULL (data loss risk) | Low | Use ON DELETE SET NULL everywhere. Confirmations stay, activity reference is nulled. Auditable. |
| RLS bypass (service_role in frontend) | Low | Strict rule: NO service_role in frontend. All mutations via RPC with explicit policies. |
| Scope misconfiguration (wrong maestros notified) | High | Comprehensive testing in design phase. Scope filtering logic must be battle-tested. |

---

## Rollback Plan

1. **If confirmations table is problematic**: Set `confirmaciones_emergentes` read-only. Keep existing `emergente_id` behavior (auto-justify). No cascade needed because table has ON DELETE SET NULL.
2. **If pipeline fix breaks asistencias**: Revert `getSesionesPorRango()` to ignore `emergente_id`. Sessions revert to "sin asistencias" classification (pre-fix behavior).
3. **If scope filtering is wrong**: Rebuild notifications to broaden/narrow alcance_config. Existing confirmations unaffected.
4. **Complete rollback**: DROP `confirmaciones_emergentes` table (auditable, reversible). Revert DDL on `sesiones_clase` (alter column drops). Revert query logic in pipeline. Activities revert to current behavior.

---

## Dependencies

- Existing `sesiones_clase`, `asistencias`, `registros_pendientes`, `notificaciones` tables (already in place).
- RLS policies on `sesiones_clase` must be reviewed/extended to new columns (design phase).
- Portal infrastructure (Maestros, ACM, ADM) must support new forms/modals (design phase).

---

## Success Criteria

- [ ] Root sessions (clase_id IS NULL) correctly capture `lugar` and `alcance`.
- [ ] When maestro registers activity, only affected maestros (by scope) see confirmation request.
- [ ] Confirmation is recorded, auditable, and idempotent (UNIQUE constraint).
- [ ] `getSesionesPorRango()` returns `emergente_id` in result; asistencias pipeline correctly classifies justified sessions.
- [ ] Day-state computed for maestro+fecha matches one of 8 states; no orphaned pendientes.
- [ ] No CASCADE deletes; all deletions preserve audit history.
- [ ] No service_role in frontend; all writes via RPC with explicit RLS.
- [ ] ACM sees aggregated view: how many confirmaciones pending, by scope, by maestro.

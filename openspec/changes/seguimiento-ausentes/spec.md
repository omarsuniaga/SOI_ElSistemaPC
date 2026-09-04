# Delta Spec: Seguimiento de Alumnos Ausentes

## ADDED Requirements

### Requirement: Absence Escalation Read Model

The system MUST create a PostgreSQL view `vw_seguimiento_ausentes` that returns one row per active alumno with accumulated unjustified absence **days** in the active periodo. The view MUST compute `nivel` (0-3) dynamically by comparing `dias_ausente` against thresholds from `seguimiento_reglas` row `tipo='ausentismo_acumulado'` config `{nivel1:1, nivel2:2, nivel3:3, contar_justificadas:false}`. Nivel 0 = no absence days; nivel 1 = ≥1; nivel 2 = ≥2; nivel 3 = ≥3.

**The counter is by DAY, not by session.** `dias_ausente` MUST be `COUNT(DISTINCT asistencias.fecha)` where `estado='ausente'` (and no `presente` record exists for that same `fecha` — a day with any attendance is not an absence day). If an alumno misses 2 classes/sessions on the same date, that counts as **1** toward `dias_ausente` and toward `nivel`. A day with at least one `presente` is never an absence day, regardless of other same-day `ausente` rows.

View MUST include columns: `alumno_id`, `alumno_nombre`, `instrumento_principal`, `clase_ids` (comma-separated), `clase_nombres`, `maestro_id`, `maestro_nombre`, `dias_ausente` (distinct absence dates in active periodo — drives `nivel`), `sesiones_ausente` (raw count of `estado='ausente'` rows — for the detail panel only, NOT for `nivel`), `ultima_ausencia_fecha`, `total_dias_clase_periodo`, `nivel`, `contacto_nombre`, `contacto_telefono`, `contacto_origen` (cascade source or null), `ultimo_seguimiento_nivel`, `ultimo_seguimiento_fecha`, `ultimo_seguimiento_resultado`, `retencion_activa` (bool from `retenciones_instrumento.estado='retenido'`).

Period window MUST be resolved client-side by querying `periodos` table to find row whose date range contains today; NO `periodo_id` backfill on historical `asistencias` rows.

#### Scenario: Alumno with 0 absences not in view

- GIVEN alumno is activo with 0 unjustified absences in active periodo
- WHEN view is queried
- THEN alumno does not appear in result set

#### Scenario: Nivel computed from accumulated count

- GIVEN alumno has 2 unjustified absences in active periodo
- WHEN view computes nivel
- THEN nivel = 2

#### Scenario: View excludes alumno if inactivo

- GIVEN alumno.estado = 'inactivo'
- WHEN view is queried
- THEN alumno is excluded

### Requirement: Contact Resolution Cascade

The system MUST provide `resolverContactoAlumno(alumnoId)` helper that returns `{nombre, telefono, origen}` or `{origen: null}` if no contact found. Cascade order (first non-empty wins):

1. `representantes.telefono_whatsapp` where `representantes.alumno_id=alumnoId`
2. `representantes.telefono_whatsapp` via `alumnos.familia_id → representantes.familia_id` (prefer `es_pagador=true` then `relacion`)
3. `alumnos.representante_tlf`
4. `alumnos.madre_tlf_whatsapp`
5. `alumnos.padre_tlf_whatsapp`
6. `alumnos.familiar_telefono`
7. `alumnos.contacto_emergencia_telefono`

Phone normalization MUST use Dominican Republic format: extract digits, prepend `+1` if 10 digits, prepend `+1809/829/849` if 7 digits. Malformed numbers skip tier; continue cascade. WhatsApp link built via `phoneUtils.whatsappLink()`.

#### Scenario: Cascade finds representante tier 1

- GIVEN `representantes.alumno_id=X` has `telefono_whatsapp=+18091234567`
- WHEN `resolverContactoAlumno(X)` is called
- THEN returns `{nombre: representante_nombre, telefono: '+18091234567', origen: 'representante_alumno'}`

#### Scenario: No contact across all tiers

- GIVEN alumno_id has no non-null, non-empty phone in any tier
- WHEN `resolverContactoAlumno(id)` is called
- THEN returns `{origen: null}`

#### Scenario: Malformed number skips tier

- GIVEN tier 2 has `telefono_whatsapp='abc123'` (invalid) but tier 3 has valid `representante_tlf='+1809555'`
- WHEN cascade evaluates
- THEN skips tier 2, uses tier 3 phone

### Requirement: Contact Action & Registry

The system MUST allow ACM to open `wa.me/{phone}?text={template}` link for a given alumno at a specific nivel (1/2/3). On link open, system MUST write row to `comunicaciones_seguimiento`: `alumno_id`, `contacto_nombre`, `contacto_telefono`, `canal='whatsapp'`, `fecha=now()`, `resultado='pendiente'`, `responsable_id=current_user`, `nivel` (1|2|3), `origen='ausentismo'`, optional `notas`.

System MUST enforce 120-minute duplicate guard: no second contact at same nivel within 120 min of previous attempt.

Nivel 2 MUST auto-set `proxima_accion='contacto_nivel_3'` and `proxima_fecha=now()+7 days` on insert.

States: `resultado='pendiente'` → `'resuelto'` when alumno receives justificacion OR reincorporates.

#### Scenario: Contact at nivel 1 recorded

- GIVEN operator clicks WhatsApp for alumno at nivel 1
- WHEN link opens and contact is registered
- THEN `comunicaciones_seguimiento` row exists with `nivel=1, resultado='pendiente', canal='whatsapp'`

#### Scenario: Duplicate guard prevents second nivel 1 within 120 min

- GIVEN first nivel 1 contact registered at 10:00
- WHEN operator attempts second nivel 1 at 11:00
- THEN system blocks insert with duplicate alert

#### Scenario: Nivel 2 sets escalation deadline

- GIVEN nivel 2 contact registered on 2026-09-03
- WHEN row is inserted
- THEN `proxima_fecha` = 2026-09-10

### Requirement: Instrument Retention Control

The system MUST create table `retenciones_instrumento` (id UUID pk, alumno_id UUID not null fk, instrumento_id UUID nullable fk, instrumento_texto text, motivo text default 'ausentismo_acumulado', estado text `retenido|levantada`, retenido_por UUID, retenido_en timestamptz, maestro_notificado_en timestamptz, maestro_confirmo_recogida_en timestamptz, acta_firmada_en timestamptz, levantada_por UUID, levantada_en timestamptz, notas text).

Nivel 3 action (ACM role only) MUST require double-confirm dialog. On confirm: create retención row, open two `wa.me` drafts (maestro + representante with templates N3_maestro & N3_representante), log both as `comunicaciones_seguimiento` rows. Optionally set `instrumentos.estado='retenido'` if `instrumentos` row exists for alumno.

Reincorporación action: register `acta_firmada_en`, set `estado='levantada'`, restore `instrumentos.estado`, log resolved `comunicaciones_seguimiento` row, reset absence counter (mark with reincorporacion marker date).

Maestro portal: badge "Instrumento retenido — {alumno}" visible while `estado='retenido'`; maestro can mark `maestro_confirmo_recogida_en`.

#### Scenario: Nivel 3 retención requires double-confirm

- GIVEN ACM initiates nivel 3 retention
- WHEN first dialog shown
- THEN second dialog required; clicking "Confirmar" again creates retención row

#### Scenario: Reincorporación resets counter

- GIVEN alumno has nivel 3 with active retención
- WHEN acta_firmada_en is set and retención levantada
- THEN subsequent absence counts begin fresh (periodo-aware reset)

### Requirement: Absence Analytics Dashboard

ADM dashboard MUST display (read-only, no action buttons): KPI cards (alumnos por nivel 1/2/3, % contactados <72h, retenciones activas, retenciones levantadas en periodo), historical closed-cases list filterable by date range, CSV export (client-side, reuse existing util). Queries MUST calculate: mean time to reincorporación, recidivism rate (% returning to nivel 3 post-reincorporación).

#### Scenario: KPI aggregation by nivel

- GIVEN 42 alumnos at nivel 1, 18 at nivel 2, 3 at nivel 3
- WHEN dashboard loads
- THEN cards display correct counts

### Requirement: Message Templates

The system MUST store 4 message templates in `documentTemplateService` with tipos `seguimiento_ausencia_n1`, `seguimiento_ausencia_n2`, `seguimiento_ausencia_n3_representante`, `seguimiento_ausencia_n3_maestro`. Variables supported: `{alumno}` (nombre completo), `{primer_nombre}` (del alumno), `{instrumento}`, `{instrumento_codigo}`, `{fecha_ausencia}`, `{n_ausencias}`, `{fecha_limite}`, `{maestro}`, `{fecha}`.

Tone escalates by level: N1 cálido y preventivo; N2 formal e institucional con fecha límite; N3 firme pero de apoyo, cita el reglamento y ofrece la vía de regreso. Todos en español dominicano institucional, trato de "usted". Destinatarios: N1 y N2 → representante; N3 → un mensaje al representante y otro al maestro. El texto final siempre lo revisa y aprueba una persona antes de enviar (envío manual).

#### Canonical Templates

**N1 → Representante** (tipo `seguimiento_ausencia_n1`)

```
Estimada familia de {alumno}: desde El Sistema Punta Cana notamos que {primer_nombre} no asistió a su clase de {instrumento} del {fecha_ausencia}. Queremos asegurarnos de que todo esté bien.

Si hubo un motivo, puede responder este mensaje para justificar la inasistencia. ¡Contamos con {primer_nombre} en el aula!

— Coordinación Académica
```

**N2 → Representante** (tipo `seguimiento_ausencia_n2`)

```
Estimada familia de {alumno}: {primer_nombre} acumula {n_ausencias} inasistencias sin justificar en {instrumento} durante este período. La continuidad es esencial para su proceso musical y para el grupo con el que ensaya.

Le solicitamos comunicarse con Coordinación Académica antes del {fecha_limite} para conversar sobre la situación y registrar cualquier justificación pendiente.

— Coordinación Académica · El Sistema Punta Cana / FUNEYCA-PC
```

**N3 → Representante** (tipo `seguimiento_ausencia_n3_representante`)

```
Estimada familia de {alumno}: ante {n_ausencias} inasistencias sin justificar en este período, y conforme al reglamento del programa, el instrumento asignado a {primer_nombre} ({instrumento_codigo}) queda temporalmente retenido en la sede a partir del {fecha}.

Para desbloquear la retención y reincorporar a {primer_nombre}, la familia debe presentarse en Coordinación Académica y firmar un acta de compromiso. Estamos para acompañarles en este proceso.

— Coordinación Académica · El Sistema Punta Cana
```

**N3 → Maestro** (tipo `seguimiento_ausencia_n3_maestro`)

```
Prof. {maestro}: por acumulación de inasistencias se ordena la retención temporal del instrumento de {alumno} ({instrumento} · {instrumento_codigo}).

Por favor recoja el instrumento al cierre de la próxima clase y confírmelo en el sistema. El alumno no se reincorpora hasta que Coordinación levante la retención.

— Coordinación Académica
```

#### Scenario: N1 se dirige al representante con tono cálido

- GIVEN un alumno alcanza nivel 1
- WHEN se abre la plantilla `seguimiento_ausencia_n1`
- THEN el texto se dirige a "la familia de {alumno}", nombra la clase y la fecha de la ausencia, e invita a justificar sin lenguaje sancionador

#### Scenario: N3 produce dos mensajes distintos

- GIVEN un coordinador ACM ejecuta la retención de nivel 3
- WHEN se generan los borradores de WhatsApp
- THEN se produce un mensaje para el representante (instrucciones de desbloqueo) y otro para el maestro (orden de recogida del instrumento), con textos diferentes

#### Scenario: Variables sin resolver bloquean el envío

- GIVEN la ficha del alumno no tiene `instrumento_codigo`
- WHEN se renderiza una plantilla que lo requiere (N3)
- THEN la variable faltante se marca y el operador debe completarla antes de que el botón de envío se habilite

## MODIFIED Requirements

### Requirement: Student Risk Detection (Bug Fix)

The system MUST filter `asistencias` by `estado = 'ausente'` ONLY (not `'A'/'J'/'T'/'P'` legacy codes). Previously: filtered by `estado IN ('A','J','T','P')`, which was incorrect mapping and never detected absences.

(Previously: `studentRiskDetectorService` filtered by legacy state codes, rendering alerts non-functional.)

#### Scenario: Risk detector identifies absences correctly

- GIVEN `asistencias` rows with `estado='ausente'`
- WHEN risk detection runs
- THEN alerts are generated for matching criteria

### Requirement: Contact Resolution Unified Registry

The system MUST extend `comunicaciones_seguimiento` with columns `nivel` (smallint, nullable) and `origen` (text, default 'manual'). New contacts from escalation system set `origen='ausentismo'`. All existing rows backfilled with `origen='manual'`. Queries MAY filter by origin to segregate escalation contacts from manual follow-ups.

(Previously: no nivel/origen tracking; cannot distinguish escalation source or severity.)

#### Scenario: New contact row includes nivel and origen

- GIVEN nivel 2 escalation contact is created
- WHEN row inserted
- THEN columns present with `nivel=2, origen='ausentismo'`

---

## RLS & Permissions

- `retenciones_instrumento`: SELECT for `authenticated`; INSERT/UPDATE only where `es_admin()` OR the user holds the ACM role. Reincorporación (setting `acta_firmada_en` / `estado='levantada'`) restricted to ACM coordinators.
- New `comunicaciones_seguimiento` columns inherit the table's existing RLS; escalation writes require `es_admin()` OR ACM role.
- `vw_seguimiento_ausentes`: SELECT for `authenticated`. **DESIGN DECISION (open):** the view must return the WHOLE school's alumnos for ACM/ADM, so per-maestro RLS on `asistencias` would empty it. Either (a) `security_invoker = false` (definer, BYPASSRLS) mirroring the `signage_v_*` pattern, or (b) explicit `authenticated`-can-read policies on the base tables. Design phase decides; whichever is chosen must be justified against the "security_definer_view" linter warning.
- ADM users see read-only UI (no action buttons); ACM users see the full UI with contact and retención actions.
- How the app resolves "ACM role" for `auth.uid()` MUST reuse the existing pattern — verify in `src/portales/_shared/` and existing migrations before implementing (do not invent a new role table).

## Acceptance Criteria

- [ ] `vw_seguimiento_ausentes` returns correct columns and computes nivel 0-3 per config.
- [ ] `resolverContactoAlumno` cascades in order; returns correct origen; normalizes DR phones.
- [ ] Contact action writes row with nivel/origen; 120-min guard blocks duplicate.
- [ ] Nivel 2 auto-sets escalation deadline.
- [ ] `retenciones_instrumento` table created; Nivel 3 requires double-confirm.
- [ ] Reincorporación workflow resets counter.
- [ ] ADM dashboard aggregates KPIs; CSV export works.
- [ ] Message templates stored; variables interpolate.
- [ ] `studentRiskDetectorService` filter fixed: `estado='ausente'`.
- [ ] All scenarios testable via Vitest (unit/integration).
- [ ] RLS policies enforce ACM-only actions.

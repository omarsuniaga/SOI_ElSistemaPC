# bitacora-de-clase

Objective: implement the class log ("Bitácora de clase") from `docs/planning/SPEC_BITACORA_DE_CLASE.md`, phase by phase.
This document tracks phase **F1 · Live record panel (no new writes)**. F0 (offline queue) is PR #152.

- TDD: enabled (CLAUDE.md "Strict TDD Mode: enabled" + AGENTS.md "Diagnosing Bugs"), runner `npx vitest run`.
- Delivery strategy: ask-on-risk. Forecast F1 ≈ 450 authored lines (parser + tests ≈ 250, panel + tests ≈ 200), so one PR, possibly two slices.
- Branch: `feat/bitacora-f1-live-panel` from `origin/master` (7338798c).

## Scope (authorized)

F1 only: a pure shared interpreter and a read-only live panel under the observations editor. No new tables, no new writes, saving behaves as today. Report consumers keep their own parsers until F4.

## Interpreter contract — `parseBitacora(text, { roster, attendance })`

File: `src/shared/utils/bitacoraParser.js` (pure, no DOM, deterministic).

Returns:

```
{
  registros: [{ id, tipo, alcance, alumnoIds, texto, evidencia: { inicio, fin, texto }, origen: 'escrito' }],
  sinAsignar: [{ texto, inicio, fin }],
  avisos: [{ tipo: 'ausente', alumnoId, nombre } | { tipo: 'ambiguo', nombre }],
  cobertura: { presentes, conRegistro, frasesSinAsignar }
}
```

Rules:

1. Segment the note at mention groups `#Nombre` / `#todos` (case/accent-insensitive, longest match, name must be unique in the roster, `#A y #B` = one group). Same behaviour as `splitByMentions` in `src/portal-maestros/utils/lessonReview.js`.
2. Inside a segment, `[..]` → `contenido`, `(..)` → `refuerzo`, `{..}` → `tarea`, remaining plain text with letters → `desempeno`. Each yields its own registro for the segment's recipients.
3. `#todos` → `alcance: 'grupo'`, `alumnoIds` = present students.
4. Text without a mention: `[..]` → `contenido` with `alcance: 'grupo'` (current usage; teacher confirms in F2). Plain text, `( )` and `{ }` without a mention → `sinAsignar` (BR-04: never assigned to an unmentioned student).
5. Present = attendance state in `P, T, presente, tarde, tardanza`. A mentioned student with an explicit non-present state (A, J, …) → aviso `ausente` and is excluded from `alumnoIds`; a registro left without recipients goes to `sinAsignar`. Unmarked attendance produces no aviso and the student stays a recipient in the preview (attendance is often taken after writing); BR-02 is enforced at close in F2. Coverage counts present students only.
6. A mention written inside a token (`[#Ana escala]`) belongs to that token: it keeps its type, the mention is the recipient, and it never splits the note.
7. `#Name` matching two roster students → aviso `ambiguo`, not a mention.
8. Lossless: evidencias + `sinAsignar` cover every letter/number of the note.
9. `cobertura.conRegistro` = present students reached by at least one registro (group registros reach all present).
10. Registro `id` is stable for the same text (derived from offsets), so the panel can re-render without flicker.

## Tasks

- [x] T1 Commit spec + this document. Route: inline (docs only).
- [x] T2 `parseBitacora` + tests (RED → GREEN). Route: delegated writer (non-trivial new module + tests).
- [x] T3 `BitacoraPanel` read-only component under the editor, live update (debounced), coverage counter, "Sin asignar", avisos; mounted in `asistenciaView`. Route: delegated writer (2+ non-trivial files).
- [x] T4 `lessonReview.splitByMentions` reuses the shared mention logic (single interpreter in the portal); existing lessonReview tests stay green. Route: delegated writer.
- [x] T5 Verify: full `npx vitest run src/portal-maestros tests/portal-maestros src/shared`, `npm run build`, diff review. Route: inline.

## Acceptance

- The 2026-10-20 incident note yields one registro per student sentence, `#Santa … y #Yereni …` shared, `#todos` as group; no sentence repeated across students.
- Panel shows "x/y presentes con registro", the "Sin asignar" block and absent/ambiguous warnings; it never writes.
- No change to what gets saved.

## Progress / evidence

- T1 291e24a1 (spec + plan).
- T2 1d2f9fc4 parser (RED: module missing → GREEN 16 tests). T3 53095952 panel (RED → GREEN 9 tests) + asistenciaView mount. T4 c2a56186 refactor; 17-input byte-identical comparison of splitByMentions vs previous version.
- Independent verifier: PASS, 2 should-fix (mention inside brackets lost type / split a bracket) fixed in the next commit with 3 tests (RED → GREEN).
- Verification: `npx vitest run src/portal-maestros tests/portal-maestros src/shared` 146 files / 1164+ tests green; `npm run build` OK. Risk tier (gentle-ai assess): medium; RDD off (clone-local), so no native review.
- Not verified visually (no logged-in local session).

## Next

F2 · Transactional close: `registros_sesion` migration + `cerrar_sesion` RPC + "Cerrar clase" UI (needs decision D2, canonical indicator table).

---

# Phase F2 · Transactional close (`registros_sesion` + `cerrar_sesion`)

Branch: `feat/bitacora-f2-close`, stacked on `feat/bitacora-f1-live-panel` (PR #154). Decision D2 resolved on 2026-10-20: `maestro_indicadores` is the canonical indicator table.

## Findings that shape the design (verified 2026-10-20)

- Migrations are applied **by hand** (Dashboard SQL editor); merging to `master` never touches the database; `supabase db push` is forbidden (ledger divergence). Nothing in this phase is applied to production without explicit user authorization.
- RLS today: teachers write `asistencias` through the permissive policies `asistencias_admin_insert/update` (owner of the session, or `maestro_en_clase`). No teacher holds `asistencias:write` (19 rows in `permisos_maestros`, none with it), so the `ALL` policy that requires it never applies.
- `sesiones_clase.estado` check allows `registrada`; `asistencias.estado` allows `presente|ausente|tarde|justificado`; `asistencias.valoracion` is `smallint` 0–5; UNIQUE `(sesion_clase_id, alumno_id)` and `(clase_id, alumno_id, fecha)` on `asistencias`.
- Helpers: `maestro_actual()` (SECURITY DEFINER, `auth.uid()`), `maestro_en_clase(uuid)`, `es_admin()`.
- Policy script: R1 needs the literal `'registros_sesion'` under `src/`; R3 exemption must sit inside the `CREATE TABLE` column list.
- Local DB tests: Docker is available. Pattern to copy: `supabase/tests/documentos-qr/` (`start_pg.sh`, `00_supabase_bootstrap.sql`, `run_tests.mjs`).
- Pilot gating precedent: `src/modules/repertoire/api/repertoirePilotAccess.js` (`VITE_*` allowlist of `maestros.id`, client side, cosmetic). The real control is server side.

## Design

**Table `registros_sesion`** (spec §7.1): one row per record × recipient (`alcance='alumno'`) or one row with frozen `destinatarios_ids` (`alcance='grupo'`); `grupo_registro_id` ties the rows born from one idea; `indicador_id` FK `maestro_indicadores(id)` `on delete set null`; `estado` borrador|confirmado|descartado; `seguimiento` only for refuerzo/tarea; `reemplaza_id` nullable (unused until corrections). RLS enabled: SELECT for the session owner / `maestro_en_clase` / `es_admin()`; **no** INSERT/UPDATE/DELETE policy and no DML grants, so the only write path is the RPC.

**RPC `cerrar_sesion(p_payload jsonb) returns jsonb`**, `SECURITY DEFINER`, `SET search_path = public`, `REVOKE ALL FROM public, anon`, `GRANT EXECUTE TO authenticated`. Payload:

```
{ sesion_id, contenido,
  asistencia:   [{ alumno_id, estado }],                    // presente|ausente|tarde|justificado
  registros:    [{ id, grupo_registro_id, tipo, alcance, alumno_id?, texto, evidencia,
                   evidencia_inicio?, evidencia_fin?, indicador_id?, origen }],
  valoraciones: [{ alumno_id, valoracion }] }               // 0..5, optional
```

Server rules (one transaction; any violation raises and nothing is written):

1. Caller must have `maestro_actual()`; the session must exist, be locked `FOR UPDATE`, and belong to the caller (`maestro_id = maestro_actual()` or `maestro_en_clase(clase_id)`), else `42501`.
2. Upsert `asistencias` on `(sesion_clase_id, alumno_id)` with the session's `clase_id` and `fecha`, `registrado_por = auth.uid()`.
3. Present set = rows of that session with `presente|tarde` after the upsert (BR-02/BR-03).
4. `alcance='alumno'` requires `alumno_id` ∈ present set; `alcance='grupo'` stores `destinatarios_ids` = present set computed by the server (client value ignored) and requires at least one present student.
5. Registros: `insert … on conflict (id) do update`, only when the existing row belongs to the same session; `estado='confirmado'`, `confirmado_por = maestro_actual()`, `confirmado_at = now()`; `seguimiento='abierto'` for refuerzo/tarea on insert (BR-07). Confirmed rows of the session that are not in the payload become `descartado` (re-closing after an edit).
6. Valoraciones only for present students; updates `asistencias.valoracion/valorada_por/valorada_at`.
7. Update `sesiones_clase`: `contenido` (BR-11), `asistencia` jsonb, `borrador=false`, `estado='registrada'`, `updated_at`.
8. Idempotent (BR-10): the same payload twice leaves the same state. Returns `{ sesion_id, presentes, asistencias, registros, descartados, valoraciones }`.

**Client**: `src/portal-maestros/services/bitacoraCloseService.js` (`buildCierrePayload`, `cerrarSesion`, `getRegistrosSesion`), plus an `rpc` operation in the offline queue (`queueSyncHandler`) so an offline close is queued as **one** preserved item with its ids fixed (retry-safe).

**UI (F2b)**: "Cerrar clase" panel behind a pilot flag; legacy "Guardar sesión" and "Evaluar presentes" stay untouched for everyone else.

## Tasks

- [x] T0 Decision D2 recorded in spec; F2 design documented here. Route: inline.
- [ ] T1 Migration + rollback + local Docker SQL suite (RED → GREEN, mutation checks). Route: delegated writer.
- [ ] T2 Offline queue `rpc` operation. Route: delegated writer.
- [ ] T3 `bitacoraCloseService` (payload builder from `parseBitacora`, RPC call, offline fallback, reader). Route: delegated writer.
- [ ] T4 Verification of T1–T3 (suite, build, `npm run policy:check` must not grow the debt, independent verifier). Route: inline + verifier.
- [ ] T5 (F2b) "Cerrar clase" UI behind pilot flag. Route: delegated writer, after T4.
- [ ] T6 Production apply (manual, Dashboard) — **only with explicit user authorization**; record first real row and its date (R1).

## R1 declaration (to carry in the PR)

Writer: RPC `cerrar_sesion`, called from `src/portal-maestros/services/bitacoraCloseService.js`. Who produces the first real row: a pilot teacher closing a class with the new flow after the migration is applied by hand. Proposed date: **2026-11-03** (to be confirmed by the user). Exemption R3: production has no `instituciones` table or `institucion_id` on the core tables (same exemption as `20261018120000_documentos_publicos_qr.sql`); plan: add the column to the model when the multi-institution model exists (spec §7.5).

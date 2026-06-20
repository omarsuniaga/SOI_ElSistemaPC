# Emergente Auto-Justificación — Design

**Date:** 2026-05-30  
**Status:** Approved  

---

## Context

When a teacher registers an emergent class (concert, masterclass, institutional event) on a day that already has scheduled classes, two things need to happen:

1. The emergent session appears in the calendar/drawer instead of the scheduled classes.
2. Each scheduled class for that day is automatically marked with all students justified, with an auto-generated observation noting the emergent activity.

This creates a coherent historical record: the scheduled classes still exist but are marked as "covered by emergent activity," and the teacher can see everything from a single day view.

---

## Scope

- Auto-justification on emergent save (silent, no confirmation).
- No rollback on emergent deletion (out of scope; `ON DELETE SET NULL` handles the DB side gracefully).
- No UI for manually triggering or undoing auto-justification.

---

## Data Model

### Migration

```sql
ALTER TABLE sesiones_clase
  ADD COLUMN emergente_id UUID REFERENCES sesiones_clase(id) ON DELETE SET NULL;
```

`ON DELETE SET NULL` means if the emergent session is later deleted, the auto-justified sessions lose their link but keep their data (students stay justified, observation stays).

### Session state when auto-justified

| Field | Value |
|---|---|
| `clase_id` | ID of the scheduled class |
| `fecha` | Same date as the emergent |
| `maestro_id` | Teacher ID |
| `emergente_id` | ID of the originating emergent session |
| `estado` | `'registrada'` |
| `borrador` | `false` |
| `asistencia` | All enrolled students with `estado: 'justificado'` |
| `contenido` | Auto-generated observation text |

**Auto-generated observation format:**
```
Clase suspendida por actividad especial: "<nombre>".
Motivo: <motivo>. Todos los alumnos quedan justificados.
```

---

## Architecture

### New file: `emergenteJustificacionService.js`

```
src/portal-maestros/services/emergenteJustificacionService.js
```

Single export: `autoJustificarClasesProgramadas(emergente, maestroId)`

**Flow:**

```
emergente saved
      │
      ▼
1. Resolve day-of-week from emergente.fecha
2. Fetch all classes for teacher that have a schedule entry for that weekday
3. For each scheduled class:
   a. Fetch enrolled students from alumnos_clases
   b. UPSERT sesiones_clase:
      - conflict target: (clase_id, fecha, maestro_id)
      - set: emergente_id, estado, borrador, asistencia, contenido
4. Return { justificadas: N, errores: [] }
```

The UPSERT ensures idempotency — re-saving the same emergent doesn't duplicate sessions.

### Modified: `claseEmergenteModal.js`

After successful emergent insert:

```js
import { autoJustificarClasesProgramadas } from '../../portal-maestros/services/emergenteJustificacionService.js'

const resultado = await autoJustificarClasesProgramadas(emergente, maestroId)
if (resultado.justificadas > 0) {
  AppToast.info(`${resultado.justificadas} clase(s) marcada(s) como justificadas.`)
}
```

### Modified: `calendarioView.js`

**`_calcularEstadoMes`:**
- `todasSesiones` already fetches all sessions including auto-justified ones.
- New check: if a session has `emergente_id != null` → state `cubierta-emergente` (takes priority over `registrada`).
- State priority order: `cubierta-emergente` > `registrada` > `pendiente` > `vencida`.

**`_openActionDrawer`:**
- Detect auto-justified sessions: `sesiones.filter(s => s.clase_id && s.emergente_id)`.
- If emergent sessions exist for the date, render two sections:
  1. **Actividad especial** — the emergent session (existing behavior, orange border).
  2. **Clases suspendidas** — auto-justified scheduled sessions (blue badge, reduced opacity, "Ver" button only).
- If no emergent sessions, fall back to current programmed-classes-only view.

---

## Calendar Colors

| State | Color | Meaning |
|---|---|---|
| `registrada` | `var(--pm-success)` green | Class taught normally |
| `cubierta-emergente` | `#0891b2` teal/blue | Covered by special activity |
| `pendiente` | `var(--pm-warning)` orange | Overdue, no attendance |
| `vencida` | `var(--pm-danger)` red | >7 days without registration |
| `sin-clase` | grey | No class scheduled |

Calendar legend gains a new entry: **Cubierta por actividad especial**.

CSS addition:
```css
.pm-cal-day.estado-cubierta-emergente { background: #0891b2; color: white; }
```

---

## Drawer Layout (combined view)

```
┌─────────────────────────────────────────┐
│  jueves 29 de mayo                       │
│  ⚡ 1 actividad especial                 │
├─────────────────────────────────────────┤
│  ACTIVIDAD ESPECIAL                      │
│  ⚡ 18:00–20:00  Concierto Institucional  │
│                          [Ver asistencia]│
├─────────────────────────────────────────┤
│  CLASES SUSPENDIDAS                      │
│  🔵 16:00–17:00  Guitarra I              │
│  Justificada · Auto-registrada           │
│                          [Ver]           │
│  🔵 17:00–18:00  Piano Avanzado          │
│  Justificada · Auto-registrada           │
│                          [Ver]           │
└─────────────────────────────────────────┘
```

Auto-justified sessions show:
- Blue left border
- "Justificada · Auto-registrada" subtitle
- Check icon (success color)
- "Ver" button → navigates to `#/asistencia?clase=<id>&fecha=<fecha>`
- No "Pasar asistencia" button (already done)

---

## Files Affected

| File | Change |
|---|---|
| `supabase/migrations/YYYYMMDD_emergente_id.sql` | New migration |
| `src/portal-maestros/services/emergenteJustificacionService.js` | New file |
| `src/modules/planificacion/components/claseEmergenteModal.js` | Call service after save |
| `src/portal-maestros/views/calendarioView.js` | New state, color, drawer sections |
| `src/portal-maestros/styles/portalMaestros.css` (or equivalent) | New CSS state |

---

## Error Handling

- If auto-justification fails for one class, log the error and continue with the others.
- The emergent session is always saved regardless of auto-justification outcome.
- Errors surface via `AppToast.warning` if partial failures occur.

---

## Out of Scope

- Rollback when emergent is deleted.
- Manual trigger for auto-justification.
- Editing auto-justified sessions from the drawer (use existing attendance view).
- Bulk undo of auto-justification.

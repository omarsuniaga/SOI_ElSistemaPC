# Emergente Auto-Justificación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a teacher saves an emergent class, automatically create justified sessions for every scheduled class that day, and display both in the calendar with distinct visual states.

**Architecture:** A new isolated service (`emergenteJustificacionService.js`) handles the auto-justification side-effect. The calendar view gains a new `cubierta-emergente` state. The drawer renders two sections when both an emergent and scheduled sessions exist for a date.

**Tech Stack:** Supabase (PostgreSQL + JS client), vanilla JS ES modules, CSS custom properties.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260530_emergente_id_sesiones.sql` | Create | Add `emergente_id` column + unique constraint to `sesiones_clase` |
| `src/portal-maestros/services/emergenteJustificacionService.js` | Create | Auto-justify scheduled classes when emergent is saved |
| `src/portal-maestros/views/calendarioView.js` | Modify | New `cubierta-emergente` state in `_calcularEstadoMes`; combined drawer sections in `_openActionDrawer` |
| `src/portal-maestros/styles/05-views.css` | Modify | CSS rule for `.estado-cubierta-emergente` and its `::after` dot |

> `claseEmergenteModal.js` is NOT modified — the save callback lives in `calendarioView.js:_abrirModalClaseEmergente`.

---

## Task 1: DB Migration — `emergente_id` column + unique constraint

**Files:**
- Create: `supabase/migrations/20260530_emergente_id_sesiones.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260530_emergente_id_sesiones.sql

-- Link auto-justified sessions back to their originating emergent session.
-- ON DELETE SET NULL: if the emergent is deleted, justified sessions keep their data.
ALTER TABLE sesiones_clase
  ADD COLUMN IF NOT EXISTS emergente_id UUID REFERENCES sesiones_clase(id) ON DELETE SET NULL;

-- Required for UPSERT idempotency in emergenteJustificacionService.
-- A class can only have one session per date per teacher.
ALTER TABLE sesiones_clase
  ADD CONSTRAINT sesiones_clase_clase_fecha_maestro_unique
  UNIQUE (clase_id, fecha, maestro_id);
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: migration runs without error. If `sesiones_clase_clase_fecha_maestro_unique` already has duplicate rows (pre-existing data), the constraint will fail. In that case, deduplicate first:

```sql
-- Run in Supabase SQL editor if constraint fails:
DELETE FROM sesiones_clase s1
USING sesiones_clase s2
WHERE s1.ctid < s2.ctid
  AND s1.clase_id = s2.clase_id
  AND s1.fecha = s2.fecha
  AND s1.maestro_id = s2.maestro_id;
```

Then re-run `npx supabase db push`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260530_emergente_id_sesiones.sql
git commit -m "feat(db): add emergente_id and unique constraint to sesiones_clase"
```

---

## Task 2: `emergenteJustificacionService.js` — auto-justify scheduled classes

**Files:**
- Create: `src/portal-maestros/services/emergenteJustificacionService.js`

The service receives the saved emergent session object (with `id`, `fecha`, `actividad`, `motivo`) and the teacher's ID. It finds all scheduled classes for that weekday, loads their enrolled students, and upserts a justified session for each.

- [ ] **Step 1: Create the service file**

```js
// src/portal-maestros/services/emergenteJustificacionService.js
import { supabase } from '../../lib/supabaseClient.js'

const DIAS_ES_LARGO = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

/**
 * Auto-creates a justified session for every scheduled class on emergente.fecha.
 * Idempotent — re-calling with the same emergent updates existing sessions.
 *
 * @param {{ id: string, fecha: string, actividad: string, motivo: string }} emergente
 * @param {string} maestroId
 * @returns {Promise<{ justificadas: number, errores: string[] }>}
 */
export async function autoJustificarClasesProgramadas(emergente, maestroId) {
  const errores = []
  let justificadas = 0

  const [y, m, d] = emergente.fecha.split('-').map(Number)
  const fechaLocal = new Date(y, m - 1, d)
  const diaSemana = DIAS_ES_LARGO[fechaLocal.getDay()]

  // 1. Find classes for this teacher scheduled on this weekday
  const { data: clases, error: clError } = await supabase
    .from('clases')
    .select('id, nombre')
    .or(
      `maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId},maestro_id.eq.${maestroId}`,
    )

  if (clError || !clases?.length) return { justificadas: 0, errores: [] }

  const claseIds = clases.map((c) => c.id)

  const { data: horarios, error: hError } = await supabase
    .from('clase_horarios')
    .select('clase_id, hora_inicio, hora_fin')
    .in('clase_id', claseIds)
    .eq('dia', diaSemana)

  if (hError || !horarios?.length) return { justificadas: 0, errores: [] }

  const clasesDelDia = horarios.map((h) => ({
    ...h,
    nombre: clases.find((c) => c.id === h.clase_id)?.nombre || '',
  }))

  // 2. For each class: load students and upsert justified session
  for (const clase of clasesDelDia) {
    try {
      const { data: inscripciones } = await supabase
        .from('alumnos_clases')
        .select('alumno_id')
        .eq('clase_id', clase.clase_id)
        .eq('activo', true)

      const asistencia = (inscripciones || []).map((i) => ({
        alumno_id: i.alumno_id,
        estado: 'justificado',
      }))

      const contenido =
        `Clase suspendida por actividad especial: "${emergente.actividad || 'Actividad especial'}".` +
        (emergente.motivo ? ` Motivo: ${emergente.motivo}.` : '') +
        ' Todos los alumnos quedan justificados.'

      const { error: upsertError } = await supabase.from('sesiones_clase').upsert(
        {
          clase_id: clase.clase_id,
          fecha: emergente.fecha,
          maestro_id: maestroId,
          emergente_id: emergente.id,
          hora_inicio: clase.hora_inicio,
          hora_fin: clase.hora_fin,
          estado: 'registrada',
          borrador: false,
          asistencia,
          contenido,
        },
        { onConflict: 'clase_id,fecha,maestro_id' },
      )

      if (upsertError) {
        errores.push(`${clase.nombre}: ${upsertError.message}`)
      } else {
        justificadas++
      }
    } catch (err) {
      errores.push(`${clase.nombre}: ${err.message}`)
    }
  }

  return { justificadas, errores }
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

```bash
node --check src/portal-maestros/services/emergenteJustificacionService.js
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/portal-maestros/services/emergenteJustificacionService.js
git commit -m "feat(service): add emergenteJustificacionService auto-justify scheduled classes"
```

---

## Task 3: Wire service into `calendarioView.js` save callback

**Files:**
- Modify: `src/portal-maestros/views/calendarioView.js`

The save callback for a new emergent is in `_abrirModalClaseEmergente` (bottom of the file). After the successful insert, call the service and show a toast.

- [ ] **Step 1: Add the import at the top of the file**

Find the existing import block at the top of `src/portal-maestros/views/calendarioView.js` (after the last import line) and add:

```js
import { autoJustificarClasesProgramadas } from '../services/emergenteJustificacionService.js'
```

- [ ] **Step 2: Call the service after the successful insert**

Locate this block in `_abrirModalClaseEmergente` (around line 679–690):

```js
        if (error) throw error

        // Redirigir a asistencia
        const drawer = document.getElementById('pm-action-drawer')
        if (drawer) drawer.classList.remove('open')

        window.location.hash = `#/asistencia?sesion=${data.id}&fecha=${datos.fecha}`
        AppToast.success('Clase emergente creada. Procedé a pasar asistencia.')
```

Replace with:

```js
        if (error) throw error

        // Auto-justify scheduled classes for the same date
        const resultado = await autoJustificarClasesProgramadas(data, getMaestroLocal().id)
        if (resultado.errores.length > 0) {
          console.warn('[calendario] Auto-justificación parcial:', resultado.errores)
          AppToast.warning(
            `Clase emergente creada. ${resultado.justificadas} clase(s) justificada(s) automáticamente (${resultado.errores.length} con error).`,
          )
        } else if (resultado.justificadas > 0) {
          AppToast.success(
            `Clase emergente creada. ${resultado.justificadas} clase(s) programada(s) marcada(s) como justificadas.`,
          )
        } else {
          AppToast.success('Clase emergente creada. Procedé a pasar asistencia.')
        }

        // Navigate to attendance
        const drawer = document.getElementById('pm-action-drawer')
        if (drawer) drawer.classList.remove('open')

        window.location.hash = `#/asistencia?sesion=${data.id}&fecha=${datos.fecha}`
```

- [ ] **Step 3: Verify syntax**

```bash
node --check src/portal-maestros/views/calendarioView.js
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/portal-maestros/views/calendarioView.js
git commit -m "feat(calendario): wire auto-justificacion after emergente save"
```

---

## Task 4: New calendar state `cubierta-emergente` in `_calcularEstadoMes`

**Files:**
- Modify: `src/portal-maestros/views/calendarioView.js`

`todasSesiones` already includes auto-justified sessions. We need to detect them (`emergente_id != null`) and assign the new state.

- [ ] **Step 1: Add emergente-covered detection in `_calcularEstadoMes`**

In `_calcularEstadoMes`, locate this existing block (around line 106–117):

```js
  const sesiones = todasSesiones.filter((s) => {
    const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
    const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
    return (
      s.estado === 'registrada' ||
      s.estado === 'cerrada' ||
      tieneAsistencia ||
      (s.borrador === false && tieneContenido)
    )
  })

  const fechasRegistradas = new Set(sesiones.map((s) => s.fecha))
```

After `const fechasRegistradas = ...`, add:

```js
  // Dates where a scheduled class was auto-justified due to an emergent session
  const fechasCubiertasEmergente = new Set(
    todasSesiones
      .filter((s) => s.clase_id && s.emergente_id)
      .map((s) => s.fecha),
  )
```

- [ ] **Step 2: Apply `cubierta-emergente` state with highest priority**

Locate the "Fechas pasadas: marcar como registrada" block:

```js
    // Fechas pasadas: marcar como registrada si tienen sesión registrada
    if (diffDias > 0 && fechasRegistradas.has(fecha)) {
      estadoMap.set(fecha, 'registrada')
      continue
    }
```

Replace with:

```js
    // Fechas pasadas: cubierta-emergente has priority over registrada
    if (diffDias > 0 && fechasCubiertasEmergente.has(fecha)) {
      estadoMap.set(fecha, 'cubierta-emergente')
      continue
    }
    if (diffDias > 0 && fechasRegistradas.has(fecha)) {
      estadoMap.set(fecha, 'registrada')
      continue
    }
```

- [ ] **Step 3: Handle `cubierta-emergente` for today (diffDias === 0)**

Inside the `if (diffDias === 0)` block, after the `if (tieneAsistencia)` check, add before the `horaFinDia` check:

```js
      // If today has an auto-justified scheduled class → cubierta-emergente
      if (sesionHoy && sesionHoy.clase_id && sesionHoy.emergente_id) {
        estadoMap.set(fecha, 'cubierta-emergente')
        continue
      }
```

The full `diffDias === 0` block becomes:

```js
    if (diffDias === 0) {
      const sesionHoy = todasSesiones.find((s) => s.fecha === fecha)
      const tieneAsistencia =
        sesionHoy && Array.isArray(sesionHoy.asistencia) && sesionHoy.asistencia.length > 0

      if (tieneAsistencia) {
        estadoMap.set(fecha, 'registrada')
        continue
      }

      if (sesionHoy && sesionHoy.clase_id && sesionHoy.emergente_id) {
        estadoMap.set(fecha, 'cubierta-emergente')
        continue
      }

      const horaFinDia = horaFinPorDia.get(diaEs)
      if (horaFinDia) {
        const ahora = new Date()
        const [hFinStr, minFinStr] = horaFinDia.split(':')
        const horaFinMs = parseInt(hFinStr) * 60 * 60 * 1000 + parseInt(minFinStr || 0) * 60 * 1000
        const ahoraMs = ahora.getHours() * 60 * 60 * 1000 + ahora.getMinutes() * 60 * 1000

        if (ahoraMs < horaFinMs) {
          estadoMap.set(fecha, 'sin-clase')
          continue
        }
      }

      estadoMap.set(fecha, 'pendiente')
      continue
    }
```

- [ ] **Step 4: Verify syntax**

```bash
node --check src/portal-maestros/views/calendarioView.js
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/views/calendarioView.js
git commit -m "feat(calendario): add cubierta-emergente calendar state"
```

---

## Task 5: Update legend in `_renderCalendario`

**Files:**
- Modify: `src/portal-maestros/views/calendarioView.js`

- [ ] **Step 1: Add new legend entry**

Locate this HTML block in `_renderCalendario`:

```js
      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div> Pendiente
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div> Sin registro >7 días
        </div>
</div>
```

Replace with:

```js
      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#0891b2"></div> Cubierta por actividad especial
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div> Pendiente
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div> Sin registro >7 días
        </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/views/calendarioView.js
git commit -m "feat(calendario): add cubierta-emergente legend entry"
```

---

## Task 6: CSS — `.estado-cubierta-emergente`

**Files:**
- Modify: `src/portal-maestros/styles/05-views.css`

The existing state rules live at lines 781–799. The pattern uses a background color for the cell and a `::after` pseudo-element for the indicator dot.

- [ ] **Step 1: Add new CSS rules**

Locate these lines in `05-views.css`:

```css
.pm-cal-day.estado-registrada { background: var(--pm-success-bg); color: var(--pm-success-text); }
.pm-cal-day.estado-pendiente   { background: var(--pm-warning-bg); color: var(--pm-warning-text); }
.pm-cal-day.estado-vencida     { background: var(--pm-danger-bg); color: var(--pm-danger-text); }
.pm-cal-day.estado-sin-clase   { color: var(--pm-text-muted); }
.pm-cal-day.otro-mes           { opacity: .3; pointer-events: none; }
```

Add the new rule after `.estado-vencida`:

```css
.pm-cal-day.estado-registrada     { background: var(--pm-success-bg); color: var(--pm-success-text); }
.pm-cal-day.estado-pendiente      { background: var(--pm-warning-bg); color: var(--pm-warning-text); }
.pm-cal-day.estado-vencida        { background: var(--pm-danger-bg);  color: var(--pm-danger-text); }
.pm-cal-day.estado-cubierta-emergente { background: #e0f2fe; color: #0c4a6e; }
.pm-cal-day.estado-sin-clase      { color: var(--pm-text-muted); }
.pm-cal-day.otro-mes              { opacity: .3; pointer-events: none; }
```

Then locate the `::after` dot rules:

```css
.pm-cal-day.estado-registrada::after { display: block; background: var(--pm-success); }
.pm-cal-day.estado-pendiente::after   { display: block; background: var(--pm-warning); }
.pm-cal-day.estado-vencida::after    { display: block; background: var(--pm-danger); }
```

Add after `.estado-vencida::after`:

```css
.pm-cal-day.estado-registrada::after          { display: block; background: var(--pm-success); }
.pm-cal-day.estado-pendiente::after           { display: block; background: var(--pm-warning); }
.pm-cal-day.estado-vencida::after             { display: block; background: var(--pm-danger); }
.pm-cal-day.estado-cubierta-emergente::after  { display: block; background: #0891b2; }
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/styles/05-views.css
git commit -m "feat(styles): add estado-cubierta-emergente calendar cell color"
```

---

## Task 7: Drawer — combined view with suspended classes section

**Files:**
- Modify: `src/portal-maestros/views/calendarioView.js`

When the drawer opens for a date with emergent sessions, it must show:
1. **Actividad especial** section — the emergent (already implemented from previous fix)
2. **Clases suspendidas** section — auto-justified scheduled sessions with `emergente_id != null`

- [ ] **Step 1: Detect auto-justified sessions in `_openActionDrawer`**

At the top of the drawer data-fetching block, the sessions are already loaded:
```js
const { data: s } = await supabase
  .from('sesiones_clase')
  .select('*')
  .eq('maestro_id', maestro.id)
  .eq('fecha', fecha)
sesiones = s || []
```

After `sesiones = s || []`, add:

```js
const sesionesAutoJustificadas = sesiones.filter((s) => s.clase_id && s.emergente_id)
```

- [ ] **Step 2: Build the "Clases suspendidas" HTML section**

Locate the existing `emergentesSesiones` block (added in the previous fix). After it is defined and `clasesHTML` is built for emergentes, add a second HTML variable for suspended classes.

Find the block that ends with:
```js
  } else if (clasesProgramadas.length > 0) {
    clasesHTML = clasesProgramadas
      ...
  }
```

After the closing `}` of that entire `if/else if` chain, add:

```js
  let suspendidaSeccionHTML = ''
  if (sesionesAutoJustificadas.length > 0) {
    suspendidaSeccionHTML = `
      <div style="margin-top:0.75rem;">
        <p style="font-size:0.7rem; font-weight:600; color:#0891b2; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.5rem;">
          <i class="bi bi-slash-circle"></i> Clases suspendidas
        </p>
        ${sesionesAutoJustificadas
          .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
          .map((s) => {
            const clase = clasesDelMaestro.find((c) => c.id === s.clase_id)
            return `
            <div class="pm-drawer-clase-item" style="border-left:3px solid #0891b2; opacity:0.85;">
              <div class="pm-drawer-clase-info">
                <span class="pm-drawer-clase-hora">${(s.hora_inicio || '--:--').slice(0, 5)} - ${(s.hora_fin || '--:--').slice(0, 5)}</span>
                <span class="pm-drawer-clase-nombre">${escHTML(clase?.nombre || 'Clase')}</span>
                <span class="pm-drawer-clase-instrumento" style="color:#0891b2;">
                  <i class="bi bi-check-circle-fill"></i> Justificada · Auto-registrada
                </span>
              </div>
              <div class="pm-drawer-clase-actions">
                <button class="pm-btn btn-ver-clase-suspendida" data-clase="${s.clase_id}"
                  style="background:#0891b2; border-color:#0891b2; color:white;">
                  <i class="bi bi-eye"></i> Ver
                </button>
              </div>
            </div>
          `
          })
          .join('')}
      </div>
    `
  }
```

- [ ] **Step 3: Inject `suspendidaSeccionHTML` into the drawer body**

Locate the drawer `innerHTML` assignment. Find the drawer body section:

```js
      <div class="pm-drawer-body">
        ${clasesHTML || '<p style="text-align:center;color:var(--pm-text-muted);padding:2rem 1rem;">No hay clases programadas para esta fecha</p>'}
```

Replace with:

```js
      <div class="pm-drawer-body">
        ${clasesHTML || '<p style="text-align:center;color:var(--pm-text-muted);padding:2rem 1rem;">No hay clases programadas para esta fecha</p>'}
        ${suspendidaSeccionHTML}
```

- [ ] **Step 4: Wire the "Ver" button event listener**

After the existing event listener block for `.btn-ver-sesion-emergente`, add:

```js
  drawer.querySelectorAll('.btn-ver-clase-suspendida').forEach((btn) => {
    btn.addEventListener('click', () => {
      const claseId = btn.dataset.clase
      close()
      window.location.hash = `#/asistencia?clase=${claseId}&fecha=${fecha}`
    })
  })
```

- [ ] **Step 5: Verify syntax**

```bash
node --check src/portal-maestros/views/calendarioView.js
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/portal-maestros/views/calendarioView.js
git commit -m "feat(calendario): show suspended classes section in drawer"
```

---

## Task 8: End-to-end smoke test

No automated tests exist for these flows in the current test suite (Supabase env is not set up for unit tests). Manual verification:

- [ ] **Step 1: Open the app and navigate to the teacher portal calendar**

```bash
npm run dev
```

Open `http://localhost:5173` (or whichever port Vite uses).

- [ ] **Step 2: Create an emergent class on a day with scheduled classes**

Pick a weekday that has at least one scheduled class. Click that day → "Crear Clase Emergente" → fill the form → save.

Expected:
- Toast: "Clase emergente creada. X clase(s) programada(s) marcada(s) como justificadas."
- Redirected to the emergent session's attendance view.

- [ ] **Step 3: Go back to the calendar and click the same day**

Expected:
- The day cell shows the teal/blue color (`.estado-cubierta-emergente`)
- The drawer shows two sections: "Actividad especial" (emergent, orange border) and "Clases suspendidas" (blue border, "Justificada · Auto-registrada")

- [ ] **Step 4: Click "Ver" on a suspended class**

Expected:
- Navigates to `#/asistencia?clase=<id>&fecha=<date>`
- All students show as `justificado`
- The observation field contains the auto-generated text

- [ ] **Step 5: Click "Ver asistencia" on the emergent**

Expected:
- Navigates to `#/asistencia?sesion=<id>&fecha=<date>`
- Shows the emergent session's attendance view normally

---

## Summary of commits produced

```
feat(db): add emergente_id and unique constraint to sesiones_clase
feat(service): add emergenteJustificacionService auto-justify scheduled classes
feat(calendario): wire auto-justificacion after emergente save
feat(calendario): add cubierta-emergente calendar state
feat(calendario): add cubierta-emergente legend entry
feat(styles): add estado-cubierta-emergente calendar cell color
feat(calendario): show suspended classes section in drawer
```

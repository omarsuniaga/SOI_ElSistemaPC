# Session Summary Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un panel de resumen pedagógico interactivo post-sesión que permite al maestro ver los progresos y alertas de la clase, editar estados directamente, y compartir el resumen por WhatsApp.

**Architecture:** Nuevo componente `SessionSummaryPanel.js` (patrón factory igual que `ProgressPreviewPanel.js`) montado sobre el overlay existente. Se agrega un botón "📊 Resumen pedagógico" en el overlay post-guardado de `asistenciaView.js`. El panel carga datos de `progresos` por `sesion_clase_id`, permite editar estados con upsert inmediato a Supabase, y genera texto WhatsApp con URL encode.

**Tech Stack:** Vanilla JS ES Modules, Supabase JS v2, Bootstrap Icons, `window.open` para WhatsApp.

---

## Contexto del proyecto

- **Repo:** `C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa`
- **Patrón a seguir:** `src/portal-maestros/components/ProgressPreviewPanel.js` — mismo patrón factory, misma función `esc()`, mismo ciclo LOGRADO → EN_PROGRESO → INICIADO
- **Overlay existente:** `src/portal-maestros/views/asistenciaView.js` línea ~1962 — `overlay.innerHTML` con botones `#btn-editar-asistencia`, `#btn-reporte-dia-overlay`, etc.
- **Tabla DB:** `progresos` — columnas relevantes: `id`, `alumno_id`, `contenido_dsl`, `estado`, `observacion`, `tarea`, `alerta`, `alertaTipo`, `scope`, `alumnos` (array JSON de nombres)

---

## Archivos

| Archivo | Acción |
|---------|--------|
| `src/portal-maestros/components/SessionSummaryPanel.js` | **Crear** — componente completo |
| `src/portal-maestros/views/asistenciaView.js` | **Modificar** — import + botón en overlay + wire |

---

## Task 1: Crear SessionSummaryPanel.js

**Files:**
- Create: `src/portal-maestros/components/SessionSummaryPanel.js`

---

- [ ] **Step 1: Crear el archivo con el esqueleto del componente**

```js
/**
 * SessionSummaryPanel.js
 *
 * Shows AI-generated progress records for a saved session.
 * Teacher can edit estado (cycles LOGRADO → EN_PROGRESO → INICIADO) with
 * immediate upsert to Supabase, and share a plain-text summary via WhatsApp.
 *
 * Usage:
 *   const panel = createSessionSummaryPanel()
 *   panel.open({ sesionId, claseNombre, fecha, supabase })
 *   panel.close()
 */

const ESTADO_LABELS = {
  LOGRADO:     { label: 'Logrado',     color: 'var(--pm-success, #198754)', bg: '#19875418' },
  EN_PROGRESO: { label: 'En Progreso', color: 'var(--pm-primary, #0d6efd)', bg: '#0d6efd18' },
  INICIADO:    { label: 'Iniciado',    color: 'var(--pm-muted,   #6c757d)', bg: '#6c757d18' },
}

const ESTADOS_CYCLE = ['LOGRADO', 'EN_PROGRESO', 'INICIADO']

const ALERT_TYPE_LABELS = {
  CONDUCTA:          { label: 'Conducta',              icon: '🚨' },
  ATENCION:          { label: 'Atención y concentración', icon: '🔔' },
  RIESGO_PEDAGOGICO: { label: 'Riesgo pedagógico',     icon: '📉' },
}

/** Escapes HTML special chars to prevent XSS in innerHTML. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function createSessionSummaryPanel() {
  let _panelEl = null
  let _records = []
  let _supabase = null

  // Placeholder — filled in next steps
  function _render(claseNombre, fecha) {}
  function _renderRecord(rec, idx) { return '' }
  function _buildWhatsAppText(claseNombre, fecha) { return '' }
  async function _cycleEstado(idx, claseNombre, fecha) {}

  function open({ sesionId, claseNombre, fecha, supabase }) {}
  function close() {}

  return { open, close }
}
```

---

- [ ] **Step 2: Implementar `_renderRecord` — renderiza una card individual**

Reemplazar la función `_renderRecord` placeholder por:

```js
function _renderRecord(rec, idx) {
  const isAlerta = !!rec.alerta
  const alumnosStr = Array.isArray(rec.alumnos) && rec.alumnos.length
    ? rec.alumnos.join(', ')
    : (rec.scope === 'grupo' || rec.scope === 'all') ? 'Todos los presentes' : '—'

  if (isAlerta) {
    const alertInfo = ALERT_TYPE_LABELS[rec.alertaTipo] ?? { label: 'Alerta', icon: '⚠️' }
    return `
      <div class="ssp-card ssp-card--alerta">
        <div class="ssp-card-header">
          <span class="ssp-alerta-badge">${alertInfo.icon} ${esc(alertInfo.label)}</span>
          <span class="ssp-alumno">${esc(alumnosStr)}</span>
        </div>
        <div class="ssp-contenido ssp-contenido--alerta">${esc(rec.contenido_dsl) || '—'}</div>
        ${rec.observacion ? `<div class="ssp-obs">${esc(rec.observacion)}</div>` : ''}
        ${rec.tarea ? `<div class="ssp-tarea">📝 ${esc(rec.tarea)}</div>` : ''}
      </div>
    `
  }

  const estadoInfo = ESTADO_LABELS[rec.estado] ?? ESTADO_LABELS.EN_PROGRESO
  return `
    <div class="ssp-card">
      <div class="ssp-card-header">
        <span class="ssp-alumno">${esc(alumnosStr)}</span>
        <button
          class="ssp-estado-btn"
          data-idx="${idx}"
          style="color:${estadoInfo.color};background:${estadoInfo.bg};border-color:${estadoInfo.color}"
          title="Click para cambiar estado"
        >${estadoInfo.label}</button>
      </div>
      <div class="ssp-contenido">${esc(rec.contenido_dsl) || '—'}</div>
      ${rec.observacion ? `<div class="ssp-obs">${esc(rec.observacion)}</div>` : ''}
      ${rec.tarea ? `<div class="ssp-tarea">📝 ${esc(rec.tarea)}</div>` : ''}
    </div>
  `
}
```

---

- [ ] **Step 3: Implementar `_buildWhatsAppText` — genera el texto para compartir**

Reemplazar la función `_buildWhatsAppText` placeholder por:

```js
function _buildWhatsAppText(claseNombre, fecha) {
  const fechaFmt = (() => {
    try {
      const [y, m, d] = fecha.split('-')
      return `${d}/${m}/${y}`
    } catch { return fecha }
  })()

  const alertas = _records.filter(r => r.alerta)
  const progresos = _records.filter(r => !r.alerta)

  const lines = [`📚 Resumen clase ${claseNombre} — ${fechaFmt}`]

  if (alertas.length) {
    lines.push('', '⚠️ Alertas:')
    for (const r of alertas) {
      const alumno = Array.isArray(r.alumnos) && r.alumnos.length ? r.alumnos[0] : 'Alumno'
      const info = ALERT_TYPE_LABELS[r.alertaTipo] ?? { label: 'Alerta' }
      const tarea = r.tarea ? ` — ${r.tarea}` : ''
      lines.push(`• ${alumno}: ${info.label}${tarea}`)
    }
  }

  if (progresos.length) {
    lines.push('', '✅ Logros:')
    for (const r of progresos) {
      const alumno = Array.isArray(r.alumnos) && r.alumnos.length
        ? r.alumnos.join(', ')
        : 'Todos'
      const estado = ESTADO_LABELS[r.estado]?.label ?? r.estado
      lines.push(`• ${alumno}: ${r.contenido_dsl || '—'} — ${estado}`)
    }
  }

  lines.push('', '🎯 El Sistema PC')
  return lines.join('\n')
}
```

---

- [ ] **Step 4: Implementar `_render` — arma y monta el HTML del panel**

Reemplazar la función `_render` placeholder por:

```js
function _render(claseNombre, fecha) {
  if (!_panelEl) return

  const alertas  = _records.filter(r => r.alerta)
  const progresos = _records.filter(r => !r.alerta)
  const hasRecords = _records.length > 0

  _panelEl.innerHTML = `
    <div class="ssp-backdrop"></div>
    <div class="ssp-dialog" role="dialog" aria-modal="true" aria-label="Resumen pedagógico">
      <div class="ssp-header">
        <span class="ssp-icon">📊</span>
        <div>
          <strong>Resumen Pedagógico</strong>
          <div class="ssp-subtitle">${esc(claseNombre)} · ${esc(fecha)}</div>
        </div>
      </div>

      ${!hasRecords ? `
        <div class="ssp-empty">
          No hay registros de progreso para esta sesión.<br>
          Usá el botón 🎯 <strong>Analizar</strong> en el editor para generarlos.
        </div>
      ` : `
        ${alertas.length ? `
          <div class="ssp-section-title ssp-section-title--alerta">⚠️ Alertas (${alertas.length})</div>
          ${alertas.map((r, i) => _renderRecord(r, i)).join('')}
        ` : ''}

        ${progresos.length ? `
          <div class="ssp-section-title">✅ Progresos (${progresos.length})</div>
          ${progresos.map((r, i) => _renderRecord(r, alertas.length + i)).join('')}
        ` : ''}
      `}

      <div class="ssp-footer">
        <button class="pm-btn pm-btn-success ssp-btn-wa" id="ssp-whatsapp">
          <i class="bi bi-whatsapp"></i> Compartir WhatsApp
        </button>
        <button class="pm-btn pm-btn-outline ssp-btn-close" id="ssp-close">✕ Cerrar</button>
      </div>
    </div>
  `

  _injectStyles()

  // Wire estado cycle buttons
  _panelEl.querySelectorAll('.ssp-estado-btn').forEach(btn => {
    btn.onclick = () => _cycleEstado(parseInt(btn.dataset.idx), claseNombre, fecha)
  })

  // Wire WhatsApp
  _panelEl.querySelector('#ssp-whatsapp').onclick = () => {
    const text = _buildWhatsAppText(claseNombre, fecha)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Wire close
  _panelEl.querySelector('#ssp-close').onclick = close
  _panelEl.querySelector('.ssp-backdrop').onclick = close
}
```

---

- [ ] **Step 5: Implementar `_cycleEstado` — edita estado con upsert a Supabase**

Reemplazar la función `_cycleEstado` placeholder por:

```js
async function _cycleEstado(idx, claseNombre, fecha) {
  const rec = _records[idx]
  if (!rec || !_supabase) return

  const currentIdx = ESTADOS_CYCLE.indexOf(rec.estado)
  const nextEstado = ESTADOS_CYCLE[(currentIdx + 1) % ESTADOS_CYCLE.length]

  // Optimistic update
  _records[idx] = { ...rec, estado: nextEstado }
  _render(claseNombre, fecha)

  // Persist to DB
  const { error } = await _supabase
    .from('progresos')
    .update({ estado: nextEstado })
    .eq('id', rec.id)

  if (error) {
    console.error('[SessionSummaryPanel] Error actualizando estado:', error)
    // Rollback
    _records[idx] = rec
    _render(claseNombre, fecha)
  }
}
```

---

- [ ] **Step 6: Implementar `open` y `close`**

Reemplazar las funciones `open` y `close` placeholder por:

```js
async function open({ sesionId, claseNombre, fecha, supabase }) {
  _supabase = supabase

  // Mount panel element
  if (!_panelEl) {
    _panelEl = document.createElement('div')
    _panelEl.className = 'ssp-wrapper'
    document.body.appendChild(_panelEl)
  }
  _panelEl.style.display = 'flex'

  // Show loading state
  _panelEl.innerHTML = `
    <div class="ssp-backdrop"></div>
    <div class="ssp-dialog">
      <div class="ssp-header">
        <span class="ssp-icon">📊</span>
        <div><strong>Resumen Pedagógico</strong><div class="ssp-subtitle">${esc(claseNombre)}</div></div>
      </div>
      <div class="ssp-loading">Cargando registros...</div>
    </div>
  `
  _injectStyles()
  _panelEl.querySelector('.ssp-backdrop').onclick = close

  // Load data
  const { data, error } = await supabase
    .from('progresos')
    .select('id, alumno_id, contenido_dsl, estado, observacion, tarea, alerta, alertaTipo, scope, alumnos')
    .eq('sesion_clase_id', sesionId)
    .order('alerta', { ascending: false })

  if (error) {
    console.error('[SessionSummaryPanel] Error cargando progresos:', error)
    _records = []
  } else {
    _records = data || []
  }

  _render(claseNombre, fecha)
}

function close() {
  if (_panelEl) {
    _panelEl.style.display = 'none'
    _panelEl.innerHTML = ''
  }
  _records = []
  _supabase = null
}
```

---

- [ ] **Step 7: Agregar `_injectStyles` con todos los estilos del panel**

Agregar al final del archivo, fuera de la función `createSessionSummaryPanel`:

```js
function _injectStyles() {
  if (document.getElementById('ssp-styles')) return
  const style = document.createElement('style')
  style.id = 'ssp-styles'
  style.textContent = `
    /* ── Wrapper & backdrop ────────────────────────── */
    .ssp-wrapper {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .ssp-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
    }

    /* ── Dialog ────────────────────────────────────── */
    .ssp-dialog {
      position: relative;
      z-index: 1;
      background: var(--pm-surface, #fff);
      border-radius: var(--pm-radius, 12px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.22);
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Header ────────────────────────────────────── */
    .ssp-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .ssp-icon { font-size: 1.5rem; }
    .ssp-subtitle {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      margin-top: 0.1rem;
    }

    /* ── Section titles ────────────────────────────── */
    .ssp-section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--pm-text-muted, #6c757d);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }
    .ssp-section-title--alerta { color: #dc3545; }

    /* ── Cards ─────────────────────────────────────── */
    .ssp-card {
      background: var(--pm-surface-2, #f8f9fa);
      border: 1px solid var(--pm-border, #dee2e6);
      border-radius: var(--pm-radius-sm, 8px);
      padding: 0.6rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .ssp-card--alerta {
      border-color: #dc3545 !important;
      background: #fff5f5 !important;
    }
    .dark .ssp-card--alerta,
    [data-theme="dark"] .ssp-card--alerta {
      background: #2a1215 !important;
    }

    /* ── Card internals ────────────────────────────── */
    .ssp-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .ssp-alumno {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--pm-text, #212529);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ssp-alerta-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #dc3545;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .ssp-contenido {
      font-size: 0.85rem;
      color: var(--pm-text, #212529);
    }
    .ssp-contenido--alerta {
      color: #dc3545;
      font-weight: 600;
    }
    .ssp-obs {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      font-style: italic;
    }
    .ssp-tarea {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
    }

    /* ── Estado button ─────────────────────────────── */
    .ssp-estado-btn {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      border: 1.5px solid;
      cursor: pointer;
      white-space: nowrap;
      background: transparent;
      transition: opacity 0.15s;
    }
    .ssp-estado-btn:hover { opacity: 0.75; }

    /* ── Empty & loading ───────────────────────────── */
    .ssp-empty {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1rem 0;
      line-height: 1.6;
    }
    .ssp-loading {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1.5rem 0;
    }

    /* ── Footer ────────────────────────────────────── */
    .ssp-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--pm-border, #dee2e6);
    }
    .ssp-btn-wa { flex: 1; }
    .ssp-btn-close { flex-shrink: 0; }
  `
  document.head.appendChild(style)
}
```

---

- [ ] **Step 8: Verificar que el archivo no tiene errores de sintaxis**

```bash
node --input-type=module --eval "import('./src/portal-maestros/components/SessionSummaryPanel.js').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"
```

Expected: `OK`

Si hay `SyntaxError`, leer el mensaje, corregir y volver a ejecutar antes de continuar.

---

- [ ] **Step 9: Commit del componente**

```bash
git add src/portal-maestros/components/SessionSummaryPanel.js
git commit -m "feat(summary): add SessionSummaryPanel component with estado cycling and WhatsApp share"
```

---

## Task 2: Integrar SessionSummaryPanel en asistenciaView.js

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

---

- [ ] **Step 1: Agregar el import de SessionSummaryPanel**

En `src/portal-maestros/views/asistenciaView.js`, después de la línea:
```js
import { createStudentProgressPanel } from '../components/studentProgressPanel.js'
```

Agregar:
```js
import { createSessionSummaryPanel } from '../components/SessionSummaryPanel.js'
```

---

- [ ] **Step 2: Agregar el botón "Resumen pedagógico" en el HTML del overlay**

Buscar el bloque HTML del overlay (línea ~1973). Está la lista de botones dentro de `<div class="pm-saved-actions">`. Agregar el nuevo botón **como primer botón** de la lista, antes de `#btn-editar-asistencia`:

```html
<button class="pm-btn pm-btn-primary" id="btn-resumen-pedagogico">
  <i class="bi bi-bar-chart-steps"></i> Resumen pedagógico
</button>
```

El bloque completo de `pm-saved-actions` debe quedar así:
```html
<div class="pm-saved-actions">
  <button class="pm-btn pm-btn-primary" id="btn-resumen-pedagogico">
    <i class="bi bi-bar-chart-steps"></i> Resumen pedagógico
  </button>
  <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
    <i class="bi bi-pencil"></i> Editar Asistencia
  </button>
  <button class="pm-btn pm-btn-primary" id="btn-reporte-dia-overlay">
    <i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)
  </button>
  <button class="pm-btn pm-btn-secondary" id="btn-resumen-mes-overlay">
    <i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)
  </button>
  <button class="pm-btn pm-btn-secondary" id="btn-informe-ped-overlay">
    <i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)
  </button>
  <button class="pm-btn pm-btn-outline" id="btn-compartir-correo">
    <i class="bi bi-envelope"></i> Compartir por Correo
  </button>
  <button class="pm-btn pm-btn-success" id="btn-compartir-whatsapp">
    <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
  </button>
</div>
```

---

- [ ] **Step 3: Instanciar el panel y wiring del botón**

Buscar la línea `// Attach event listeners` (línea ~2005) en el bloque del overlay. Después de esa línea, agregar:

```js
// Wire Resumen Pedagógico
const summaryPanel = createSessionSummaryPanel()
const resumenPedBtn = overlay.querySelector('#btn-resumen-pedagogico')
if (resumenPedBtn) {
  resumenPedBtn.onclick = () => {
    summaryPanel.open({
      sesionId,
      claseNombre: clase?.nombre || 'Clase',
      fecha: fechaHoy,
      supabase,
    })
  }
}
```

**IMPORTANTE:** `sesionId`, `clase`, `fechaHoy` y `supabase` ya están en scope en ese punto del código (son variables del closure de la función `_renderVista`). No redeclararlos.

---

- [ ] **Step 4: Verificar que no hay errores de sintaxis en asistenciaView.js**

```bash
node --input-type=module --eval "import('./src/portal-maestros/views/asistenciaView.js').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"
```

Expected: `OK` o errores solo de imports externos (Supabase, etc.) — no `SyntaxError` propios del archivo.

---

- [ ] **Step 5: Ejecutar la suite de tests completa**

```bash
npx vitest run
```

Expected: todos los tests pasan. Si hay failures, investigar antes de commitear.

---

- [ ] **Step 6: Commit de la integración**

```bash
git add src/portal-maestros/views/asistenciaView.js
git commit -m "feat(summary): wire SessionSummaryPanel into post-save overlay"
```

---

- [ ] **Step 7: Push a GitHub**

```bash
git push origin master
```

---

## Criterios de éxito

| Criterio | Cómo verificar |
|----------|---------------|
| Botón visible en overlay | Guardar sesión → overlay → botón "📊 Resumen pedagógico" visible como primer botón |
| Panel abre con datos | Click botón → panel muestra registros de esa sesión (o mensaje vacío si no hay) |
| Alertas arriba separadas | Sesión con alertas → sección "⚠️ Alertas" aparece antes que "✅ Progresos" |
| Editar estado persiste | Cambiar estado → abrir perfil del alumno → estado nuevo reflejado en historial |
| WhatsApp abre con texto | Click "Compartir WhatsApp" → nueva pestaña `wa.me` con texto formateado correcto |
| Cerrar no rompe overlay | Cerrar panel → overlay sigue visible con sus botones funcionando |
| Sin registros → mensaje claro | Sesión sin `progresos` en DB → mensaje explicativo, no pantalla vacía ni error |

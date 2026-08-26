/**
 * eventoTrackingView.js — Vista de Seguimiento de Evento (Hermes).
 * Muestra un dashboard T-Minus de las tareas institucionales agrupadas
 * por fecha de vencimiento para un evento seleccionado.
 *
 * Esquema relevante:
 *   tareas_institucionales: event_id, titulo, departamento, estado, prioridad, fecha_vencimiento
 *   calendario_institucional: id, titulo, categoria, fecha_inicio, fecha_fin,
 *                             departamento_responsable, estado, metadata
 *
 * Patrón: retorna { teardown() } para limpieza de listeners (AbortController).
 *
 * @param {HTMLElement} container
 * @param {object} [opciones]
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { getTareasByEvento } from '../api/tareasApi.js'

// ── Constantes ────────────────────────────────────────────────────────────────

const DEPARTAMENTOS = {
  DIR: 'Dirección',
  ACM: 'Académica',
  ADM: 'Administración',
  FIN: 'Financiero',
  LOG: 'Logística',
  COM: 'Comunicaciones',
  TECNICO: 'Técnico',
  LUT: 'Lutería',
}

const ESTADO_ICONS = {
  completada: '✅',
  cancelada: '🚫',
  bloqueada: '🔴',
  en_progreso: '🔵',
  observada: '🟡',
  pendiente: '⏳',
}

const ESTADO_BADGES = {
  completada: 'success',
  cancelada: 'secondary',
  bloqueada: 'danger',
  en_progreso: 'info',
  observada: 'warning',
  pendiente: 'secondary',
}

const PRIORIDAD_BADGES = {
  critica: 'danger',
  alta: 'warning',
  media: 'info',
  baja: 'secondary',
}

const CATEGORIA_ICONS = {
  aniversario: '🎻',
  audicion_trimestral: '🎼',
  ensayo_intensivo: '🔥',
  concierto: '🎵',
}

// ── Estado del módulo ─────────────────────────────────────────────────────────

let _abortController = null
let _realtimeChannel = null

// ── Helpers ───────────────────────────────────────────────────────────────────

function categoriaIcon(categoria) {
  return CATEGORIA_ICONS[categoria] || '📅'
}

function estadoIcon(estado) {
  return ESTADO_ICONS[estado] || '⏳'
}

/**
 * Normalize a date-like value to a YYYY-MM-DD string using UTC.
 * Accepts:
 *   - 'YYYY-MM-DD' (returned unchanged)
 *   - full ISO 'YYYY-MM-DDTHH:mm:ss[±HH:MM|Z]' (takes UTC date portion)
 * Returns null for invalid/empty input.
 */
function toDateOnly(value) {
  if (!value) return null
  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  // Use UTC date components so tz offsets don't shift the day.
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDateES(dateStr) {
  const dateOnly = toDateOnly(dateStr)
  if (!dateOnly) return '—'
  // Force local midnight parse for a stable display in the browser locale.
  const d = new Date(dateOnly + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function calcTMinus(eventoFechaInicio, grupoFecha) {
  const eventoDate = toDateOnly(eventoFechaInicio)
  const grupoDate = toDateOnly(grupoFecha)
  if (!eventoDate || !grupoDate) return 0
  const msPerDay = 86400000
  const eventoMs = new Date(eventoDate + 'T00:00:00Z').getTime()
  const grupoMs = new Date(grupoDate + 'T00:00:00Z').getTime()
  return Math.round((eventoMs - grupoMs) / msPerDay)
}

function tMinusLabel(tMinus) {
  if (tMinus > 0) return `T-${tMinus}`
  if (tMinus === 0) return 'T-0 · Día del Evento'
  return `T+${Math.abs(tMinus)} · Post-evento`
}

function isFinished(estado) {
  return estado === 'completada' || estado === 'cancelada'
}

function stripEventoSuffix(titulo) {
  return titulo.split(' — ')[0]
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Render helpers ────────────────────────────────────────────────────────────

function renderEmptyState() {
  return `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-calendar3-event fs-1 d-block mb-3 opacity-50"></i>
      <h5>Selecciona un evento para ver su progreso</h5>
      <p class="small">El tablero T-Minus se generará automáticamente con las tareas del evento.</p>
    </div>
  `
}

function renderLoading() {
  return `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted small">Cargando tareas del evento...</p>
      </div>
    </div>
  `
}

function renderEventoHeader(evento, tareas) {
  const total = tareas.length
  const finalizadas = tareas.filter((t) => isFinished(t.estado)).length
  const pct = total > 0 ? Math.round((finalizadas / total) * 100) : 0
  const pctBarColor = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-primary' : 'bg-warning'

  const estadoBadgeColor =
    evento.estado === 'completado' || evento.estado === 'realizado'
      ? 'success'
      : evento.estado === 'cancelado'
        ? 'secondary'
        : evento.estado === 'en_progreso'
          ? 'info'
          : 'primary'

  const deptLabel = DEPARTAMENTOS[evento.departamento_responsable] || evento.departamento_responsable || '—'
  const iconCat = categoriaIcon(evento.categoria)

  return `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex align-items-start gap-3 flex-wrap">
          <div class="fs-2 flex-shrink-0" title="${escapeHtml(evento.categoria || '')}">
            ${iconCat}
          </div>
          <div class="flex-grow-1">
            <h4 class="mb-1 fw-bold">${escapeHtml(evento.titulo)}</h4>
            <div class="d-flex flex-wrap gap-2 align-items-center mb-2 small">
              <span class="text-muted">
                <i class="bi bi-calendar-range me-1"></i>
                ${formatDateES(evento.fecha_inicio)}
                ${evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio ? ' → ' + formatDateES(evento.fecha_fin) : ''}
              </span>
              <span class="badge bg-dark bg-opacity-75">${escapeHtml(deptLabel)}</span>
              <span class="badge bg-${estadoBadgeColor}">
                ${escapeHtml(evento.estado || 'programado')}
              </span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div class="progress flex-grow-1" style="height: 8px;" title="${pct}% completado">
                <div class="progress-bar ${pctBarColor}" style="width: ${pct}%;"></div>
              </div>
              <small class="text-muted text-nowrap">${finalizadas}/${total} tareas</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderCierreBanner() {
  return `
    <div class="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-check-circle-fill fs-5 flex-shrink-0"></i>
      <span>
        <strong>✅ Todas las tareas completadas</strong> — el Acta de Cierre está lista para descargar.
      </span>
    </div>
  `
}

function renderTareaItem(tarea) {
  const icon = estadoIcon(tarea.estado)
  const estadoColor = ESTADO_BADGES[tarea.estado] || 'secondary'
  const prioColor = PRIORIDAD_BADGES[tarea.prioridad] || 'secondary'
  const prioLabel = (tarea.prioridad || 'media').charAt(0).toUpperCase() + (tarea.prioridad || 'media').slice(1)
  const deptLabel = DEPARTAMENTOS[tarea.departamento] || tarea.departamento || '—'
  const titulo = stripEventoSuffix(tarea.titulo || '')

  return `
    <li class="list-group-item px-3 py-2">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="fs-6 flex-shrink-0" title="${escapeHtml(tarea.estado)}">${icon}</span>
        <span class="badge bg-dark bg-opacity-75 text-nowrap">${escapeHtml(deptLabel)}</span>
        <span class="badge bg-${prioColor} text-nowrap">${escapeHtml(prioLabel)}</span>
        <span class="flex-grow-1 small">${escapeHtml(titulo)}</span>
        <span class="badge bg-${estadoColor} text-nowrap">${escapeHtml(tarea.estado || 'pendiente')}</span>
      </div>
    </li>
  `
}

function renderGrupoFecha(grupo, eventoFechaInicio) {
  const { fecha, tareas } = grupo
  const totalGrupo = tareas.length
  const finalizadasGrupo = tareas.filter((t) => isFinished(t.estado)).length
  const pctGrupo = totalGrupo > 0 ? Math.round((finalizadasGrupo / totalGrupo) * 100) : 0
  const tMinus = calcTMinus(eventoFechaInicio, fecha)
  const tLabel = tMinusLabel(tMinus)
  const isComplete = pctGrupo === 100

  const borderClass = isComplete ? 'border-success border-2' : 'border-0'
  const headerBgClass = isComplete ? 'bg-success bg-opacity-10' : 'bg-light'

  return `
    <div class="card ${borderClass} shadow-sm mb-3">
      <div class="card-header ${headerBgClass} d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary text-nowrap fw-semibold">${escapeHtml(tLabel)}</span>
          <span class="text-muted small">${formatDateES(fecha)}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-${isComplete ? 'success' : 'secondary'} bg-opacity-75 small">
            ${finalizadasGrupo}/${totalGrupo} completadas
          </span>
          <div class="progress" style="width: 80px; height: 6px;" title="${pctGrupo}%">
            <div class="progress-bar ${isComplete ? 'bg-success' : 'bg-primary'}" style="width: ${pctGrupo}%;"></div>
          </div>
        </div>
      </div>
      <ul class="list-group list-group-flush">
        ${tareas.map(renderTareaItem).join('')}
      </ul>
    </div>
  `
}

function renderTimeline(tareas, evento) {
  if (tareas.length === 0) {
    return `<div class="alert alert-info text-center"><i class="bi bi-inbox me-2"></i>No hay tareas registradas para este evento.</div>`
  }

  // Group by fecha_vencimiento (YYYY-MM-DD)
  const gruposMap = {}
  for (const t of tareas) {
    const fecha = toDateOnly(t.fecha_vencimiento) || 'sin-fecha'
    if (!gruposMap[fecha]) gruposMap[fecha] = []
    gruposMap[fecha].push(t)
  }

  // Sort dates chronologically; 'sin-fecha' goes to end
  const fechasSorted = Object.keys(gruposMap).sort((a, b) => {
    if (a === 'sin-fecha') return 1
    if (b === 'sin-fecha') return -1
    return a.localeCompare(b)
  })

  const grupos = fechasSorted.map((fecha) => ({ fecha, tareas: gruposMap[fecha] }))

  // Closure banner
  const allDone = tareas.every((t) => isFinished(t.estado))
  const banner = allDone ? renderCierreBanner() : ''

  const timelineHtml = grupos
    .map((g) => (g.fecha === 'sin-fecha' ? renderGrupoSinFecha(g) : renderGrupoFecha(g, evento.fecha_inicio)))
    .join('')

  return banner + timelineHtml
}

function renderGrupoSinFecha(grupo) {
  const totalGrupo = grupo.tareas.length
  const finalizadasGrupo = grupo.tareas.filter((t) => isFinished(t.estado)).length

  return `
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-light d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-secondary text-nowrap fw-semibold">Sin fecha</span>
        </div>
        <span class="badge bg-secondary bg-opacity-75 small">${finalizadasGrupo}/${totalGrupo} completadas</span>
      </div>
      <ul class="list-group list-group-flush">
        ${grupo.tareas.map(renderTareaItem).join('')}
      </ul>
    </div>
  `
}

// ── Carga de datos ────────────────────────────────────────────────────────────

async function cargarEventosConTareas() {
  // Get distinct event_ids from tareas_institucionales (non-null)
  const { data: tareasConEvento, error: errTareas } = await supabase
    .from('tareas_institucionales')
    .select('event_id')
    .not('event_id', 'is', null)

  if (errTareas) throw errTareas

  const eventIds = [...new Set((tareasConEvento || []).map((t) => t.event_id))].filter(Boolean)

  if (eventIds.length === 0) return []

  const { data: eventos, error: errEvento } = await supabase
    .from('calendario_institucional')
    .select('id, titulo, categoria, fecha_inicio, fecha_fin, departamento_responsable, estado')
    .in('id', eventIds)
    .order('fecha_inicio', { ascending: true })

  if (errEvento) throw errEvento

  return eventos || []
}

// ── Render principal ──────────────────────────────────────────────────────────

function buildSelectorOptions(eventos) {
  return eventos
    .map(
      (ev) =>
        `<option value="${escapeHtml(ev.id)}">${categoriaIcon(ev.categoria)} ${escapeHtml(ev.titulo)} (${formatDateES(ev.fecha_inicio)})</option>`,
    )
    .join('')
}

function buildShell(eventos) {
  return `
    <div class="container-fluid py-3 px-3 px-md-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
             style="width: 42px; height: 42px;">
          <i class="bi bi-calendar3-event fs-4"></i>
        </div>
        <div>
          <h1 class="h4 mb-0 fw-bold">Seguimiento de Evento</h1>
          <p class="text-muted small mb-0">Sistema Hermes · línea de tiempo T-Minus</p>
        </div>
      </div>

      <div class="mb-4">
        <label for="selectEvento" class="form-label fw-semibold small text-uppercase text-muted letter-spacing-1">
          Seleccionar Evento
        </label>
        <select id="selectEvento" class="form-select">
          <option value="">— Selecciona un evento —</option>
          ${buildSelectorOptions(eventos)}
        </select>
      </div>

      <div id="eventoContent">
        ${renderEmptyState()}
      </div>
    </div>
  `
}

async function renderEventoContent(container, eventoId, eventos) {
  const contentEl = container.querySelector('#eventoContent')
  if (!contentEl) return

  const evento = eventos.find((e) => e.id === eventoId)
  if (!evento) {
    contentEl.innerHTML = renderEmptyState()
    return
  }

  contentEl.innerHTML = renderLoading()

  let tareas = []
  try {
    tareas = await getTareasByEvento(eventoId)
  } catch (err) {
    contentEl.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escapeHtml(err.message)}</div>`
    return
  }

  contentEl.innerHTML = `
    ${renderEventoHeader(evento, tareas)}
    <div id="eventoTimeline">
      ${renderTimeline(tareas, evento)}
    </div>
  `
}

async function refreshEventoContent(container, eventoId, eventos) {
  if (!eventoId) return
  const timelineEl = container.querySelector('#eventoTimeline')
  if (!timelineEl) {
    // Full re-render if structure is gone
    await renderEventoContent(container, eventoId, eventos)
    return
  }

  const evento = eventos.find((e) => e.id === eventoId)
  if (!evento) return

  let tareas = []
  try {
    tareas = await getTareasByEvento(eventoId)
  } catch (_e) {
    return
  }

  // Refresh header progress bar and timeline
  const contentEl = container.querySelector('#eventoContent')
  if (contentEl) {
    contentEl.innerHTML = `
      ${renderEventoHeader(evento, tareas)}
      <div id="eventoTimeline">
        ${renderTimeline(tareas, evento)}
      </div>
    `
  }
}

function setupRealtime(container, getEventoId, eventos) {
  if (!supabase?.channel) return
  _realtimeChannel?.unsubscribe?.()
  _realtimeChannel = supabase
    .channel('hermes:evento-tracking')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tareas_institucionales' },
      async () => {
        if (_abortController?.signal.aborted) return
        const eventoId = getEventoId()
        if (!eventoId) return
        try {
          await refreshEventoContent(container, eventoId, eventos)
        } catch (err) {
          console.error('[EventoTrackingView] Realtime refresh error:', err.message)
        }
      },
    )
    .subscribe()
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function renderEventoTrackingView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()
  const { signal } = _abortController

  // Render loading skeleton
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted small">Cargando eventos institucionales...</p>
      </div>
    </div>
  `

  let eventos = []
  try {
    eventos = await cargarEventosConTareas()
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3"><i class="bi bi-exclamation-triangle me-2"></i>${escapeHtml(err.message)}</div>`
    return {
      teardown: () => {
        _abortController?.abort()
        _realtimeChannel?.unsubscribe?.()
        _realtimeChannel = null
      },
    }
  }

  container.innerHTML = buildShell(eventos)

  // Track currently selected evento id
  let currentEventoId = opciones.eventoId || ''

  // If an eventoId was passed via options (deep link), select it
  const selectEl = container.querySelector('#selectEvento')
  if (selectEl && currentEventoId) {
    selectEl.value = currentEventoId
    await renderEventoContent(container, currentEventoId, eventos)
  }

  // Selector change handler
  selectEl?.addEventListener(
    'change',
    async (e) => {
      currentEventoId = e.target.value
      if (!currentEventoId) {
        const contentEl = container.querySelector('#eventoContent')
        if (contentEl) contentEl.innerHTML = renderEmptyState()
        return
      }
      await renderEventoContent(container, currentEventoId, eventos)
    },
    { signal },
  )

  // Realtime subscription
  setupRealtime(container, () => currentEventoId, eventos)

  return {
    teardown: () => {
      _abortController?.abort()
      _realtimeChannel?.unsubscribe?.()
      _realtimeChannel = null
    },
  }
}

/**
 * kanbanBridgeView.js — Vista de solo lectura "Kanban de Hermes (espejo)".
 *
 * Muestra las tarjetas espejadas del tablero interno de Hermes desde la tabla
 * `public.hermes_kanban_cards`. NO escribe nada: es un mirror de consulta,
 * refrescado automáticamente por el bridge de Hermes y con botón manual de refresco.
 *
 * Patrón idéntico a tareasView.js / pulsoView.js: recibe un nodo DOM `mount`,
 * pinta el HTML y carga los datos async. Devuelve { teardown() }.
 *
 * @param {HTMLElement} mount
 */

import '../styles/kanban-bridge.css'
import { fetchKanbanCards } from '../api/kanbanBridgeSupabase.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'

// Columnas en el orden pedido. Cada una con su color e icono Bootstrap.
const COLUMNAS = [
  { key: 'review', label: 'En revisión', color: 'info', icon: 'bi-eye' },
  { key: 'blocked', label: 'Bloqueadas', color: 'danger', icon: 'bi-x-octagon' },
  { key: 'ready', label: 'Listas', color: 'primary', icon: 'bi-check2-circle' },
  { key: 'running', label: 'En curso', color: 'success', icon: 'bi-play-circle' },
]

const state = {
  cards: [],
  cargando: false,
  error: null,
}

let _abortController = null

function timeAgo(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) return 'hace unos segundos'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

function formatFecha(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function ultimaSincronizacion() {
  const fechas = state.cards
    .map((c) => c.synced_at)
    .filter(Boolean)
    .map((s) => new Date(s).getTime())
    .filter((n) => !Number.isNaN(n))
  if (fechas.length === 0) return null
  return new Date(Math.max(...fechas)).toISOString()
}

function priorityBadge(priority) {
  const p = Number.isFinite(priority) ? priority : null
  if (p === null) return ''
  const color = p >= 3 ? 'danger' : p === 2 ? 'warning' : p === 1 ? 'info' : 'secondary'
  return `<span class="badge bg-${color} bg-opacity-75" title="Prioridad">
    <i class="bi bi-flag me-1"></i>P${escapeHTML(String(p))}</span>`
}

function renderCard(card) {
  const assignee = card.assignee
    ? `<span class="badge rounded-pill text-bg-light border">
         <i class="bi bi-person me-1"></i>${escapeHTML(card.assignee)}</span>`
    : ''
  const summary = card.summary
    ? `<p class="kanban-bridge-summary small text-muted mb-2">${escapeHTML(card.summary)}</p>`
    : ''
  return `
    <div class="kanban-bridge-card card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h6 class="card-title mb-0">${escapeHTML(card.title || 'Sin título')}</h6>
          ${priorityBadge(card.priority)}
        </div>
        ${summary}
        <div class="d-flex flex-wrap align-items-center gap-2">
          ${assignee}
          <span class="small text-muted ms-auto">
            <i class="bi bi-clock-history me-1"></i>${escapeHTML(timeAgo(card.hermes_updated_at))}
          </span>
        </div>
      </div>
    </div>
  `
}

function renderColumn(col) {
  const cards = state.cards.filter((c) => c.status === col.key)
  const body = cards.length === 0
    ? `<div class="text-muted small fst-italic px-1 py-3">Sin tarjetas.</div>`
    : cards.map(renderCard).join('')
  return `
    <div class="kanban-bridge-col">
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="badge bg-${col.color} bg-opacity-10 text-${col.color}">
          <i class="bi ${col.icon} me-1"></i>${escapeHTML(col.label)}
        </span>
        <span class="badge rounded-pill text-bg-secondary">${cards.length}</span>
      </div>
      <div class="kanban-bridge-col-body">${body}</div>
    </div>
  `
}

function renderContent(mount) {
  const sync = ultimaSincronizacion()
  const conocidas = new Set(COLUMNAS.map((c) => c.key))
  const totalActivas = state.cards.filter((c) => conocidas.has(c.status)).length

  let cuerpo = ''
  if (state.cargando) {
    cuerpo = `
      <div class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>`
  } else if (state.error) {
    cuerpo = `
      <div class="alert alert-warning d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle"></i>
        <div>No se pudo cargar el Kanban de Hermes en este momento.</div>
      </div>`
  } else if (totalActivas === 0) {
    cuerpo = `
      <div class="alert alert-info text-center py-4" role="alert">
        <i class="bi bi-inbox me-1"></i>No hay tarjetas activas en el Kanban de Hermes.
      </div>`
  } else {
    cuerpo = `<div class="kanban-bridge-board">${COLUMNAS.map(renderColumn).join('')}</div>`
  }

  mount.innerHTML = `
    <div class="kanban-bridge page-container">
      <div class="d-flex align-items-start gap-3 mb-4 flex-wrap">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-kanban fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="h4 mb-0">Kanban de Hermes (espejo)</h1>
          <p class="text-muted small mb-0">
            Vista de solo lectura del tablero interno de Hermes, refrescada automáticamente.
          </p>
          <p class="text-muted small mb-0">
            <i class="bi bi-arrow-repeat me-1"></i>Última sincronización: ${escapeHTML(sync ? formatFecha(sync) : '—')}
          </p>
        </div>
        <button class="btn btn-sm btn-outline-primary" id="kanbanBridgeRefresh" ${state.cargando ? 'disabled' : ''}>
          <i class="bi bi-arrow-clockwise me-1"></i>Refrescar
        </button>
      </div>
      ${cuerpo}
    </div>
  `

  mount.querySelector('#kanbanBridgeRefresh')?.addEventListener(
    'click',
    () => { load(mount) },
    { signal: _abortController?.signal },
  )
}

async function load(mount) {
  state.cargando = true
  state.error = null
  renderContent(mount)
  try {
    const cards = await fetchKanbanCards()
    if (_abortController?.signal.aborted) return
    state.cards = Array.isArray(cards) ? cards : []
  } catch (err) {
    console.error('[KanbanBridgeView] Error:', err?.message || err)
    state.error = err?.message || 'error'
    state.cards = []
  } finally {
    state.cargando = false
    if (!_abortController?.signal.aborted) renderContent(mount)
  }
}

export async function renderKanbanBridgeView(mount) {
  _abortController?.abort()
  _abortController = new AbortController()
  state.cards = []
  state.error = null
  await load(mount)

  return {
    teardown: () => {
      _abortController?.abort()
      _abortController = null
    },
  }
}

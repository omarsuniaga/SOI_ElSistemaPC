/**
 * eventosAdmView.js — Vista de Eventos Institucionales para el portal ADM.
 *
 * Muestra el calendario_institucional con acciones de gestión:
 * aceptar, preprogramar (modal), concretar, cancelar.
 *
 * Flujo de estados:
 *   pendiente → aceptado → preprogramado → concretado
 *                                  ↘ cancelado
 *
 * Patrón: retorna { teardown() } (AbortController).
 */

import '../../comunicaciones/styles/comunicaciones.css'
import * as api from '../api/eventosApi.js'
import { CATEGORIAS_EVENTO } from '../../comunicaciones/domain/calendarioCom.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS_EVENTO = {
  pendiente: { label: 'Pendiente', color: 'warning', icon: 'bi-clock' },
  aceptado: { label: 'Aceptado', color: 'info', icon: 'bi-check-circle' },
  preprogramado: { label: 'Preprogramado', color: 'primary', icon: 'bi-calendar-check' },
  concretado: { label: 'Concretado', color: 'success', icon: 'bi-check2-all' },
  cancelado: { label: 'Cancelado', color: 'dark', icon: 'bi-x-circle' },
}

// Acciones disponibles por estado
const ACCIONES = {
  pendiente: ['aceptar', 'cancelar'],
  aceptado: ['preprogramar', 'cancelar'],
  preprogramado: ['concretar', 'cancelar'],
  concretado: [],
  cancelado: [],
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ─── Estado ───────────────────────────────────────────────────────────────────

const state = {
  eventos: [],
  cargando: false,
  filtroCategoria: 'todas',
  filtroEstado: 'todos',
}

let _abort = null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHTML(str) {
  if (!str) return ''
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-DO', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatFechaCorta(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

function diasHasta(evento) {
  if (!evento?.fecha_inicio) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const f = new Date(evento.fecha_inicio)
  f.setHours(0, 0, 0, 0)
  return Math.round((f - hoy) / 86400000)
}

function agruparPorMes(eventos) {
  const mapa = new Map()
  for (const e of eventos) {
    if (!e?.fecha_inicio) continue
    const d = new Date(e.fecha_inicio)
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!mapa.has(clave)) {
      mapa.set(clave, { clave, label: `${MESES[d.getMonth()]} ${d.getFullYear()}`, eventos: [] })
    }
    mapa.get(clave).eventos.push(e)
  }
  return [...mapa.values()].sort((a, b) => a.clave.localeCompare(b.clave))
}

function getCategoriaInfo(cat) {
  return CATEGORIAS_EVENTO[cat] || { label: cat, icon: 'bi-calendar-event', color: 'secondary' }
}

function getEstadoInfo(est) {
  return ESTADOS_EVENTO[est] || { label: est, color: 'secondary', icon: 'bi-question-circle' }
}

// ─── Render principal ─────────────────────────────────────────────────────────

export async function renderEventosAdmView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`

  try {
    state.eventos = await api.getEventos({ dias: 180 })
    renderContent(container)
  } catch (err) {
    console.error('[EventosADM] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar eventos institucionales</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  const filtrados = state.eventos.filter((e) => {
    if (state.filtroCategoria !== 'todas' && e.categoria !== state.filtroCategoria) return false
    if (state.filtroEstado !== 'todos' && e.estado !== state.filtroEstado) return false
    return true
  })

  const grupos = agruparPorMes(filtrados)
  const total = state.eventos.length
  const pendientes = state.eventos.filter((e) => e.estado === 'pendiente').length
  const aceptados = state.eventos.filter((e) => e.estado === 'aceptado').length
  const prox7 = state.eventos.filter((e) => {
    const d = diasHasta(e)
    return d !== null && d >= 0 && d <= 7
  }).length

  const categoriasPresentes = [...new Set(state.eventos.map((e) => e.categoria))].sort()

  container.innerHTML = `
    <div class="page-container comm-portal">
      <!-- Header -->
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(13,110,253,0.1);color:#0d6efd">
          <i class="bi bi-calendar-event fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Eventos Institucionales</h1>
          <p class="text-muted small mb-0">Calendario institucional · aceptar, preprogramar y gestionar eventos</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="tareas-kpis d-flex gap-2 flex-wrap mb-3">
        ${kpi('Total en agenda', total, 'primary')}
        ${kpi('Próximos 7 días', prox7, 'danger')}
        ${kpi('Pendientes', pendientes, 'warning')}
        ${kpi('Aceptados', aceptados, 'info')}
      </div>

      <!-- Filtros -->
      <div class="d-flex gap-2 flex-wrap mb-3">
        <select class="form-select form-select-sm" style="width:auto" id="ev-filtro-categoria">
          <option value="todas">Todas las categorías</option>
          ${categoriasPresentes.map((c) =>
            `<option value="${c}" ${state.filtroCategoria === c ? 'selected' : ''}>${getCategoriaInfo(c).label}</option>`
          ).join('')}
        </select>
        <select class="form-select form-select-sm" style="width:auto" id="ev-filtro-estado">
          <option value="todos">Todos los estados</option>
          ${Object.entries(ESTADOS_EVENTO).map(([k, v]) =>
            `<option value="${k}" ${state.filtroEstado === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
        <span class="text-muted small align-self-center ms-auto">
          ${filtrados.length} de ${total} eventos
        </span>
      </div>

      <!-- Timeline -->
      <div id="ev-timeline">
        ${grupos.length === 0
          ? '<div class="text-muted text-center py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay eventos con estos filtros</div>'
          : grupos.map((g) => renderGrupo(g)).join('')
        }
      </div>
    </div>
  `

  // Wire filters
  container.querySelector('#ev-filtro-categoria')?.addEventListener('change', (e) => {
    state.filtroCategoria = e.target.value
    renderContent(container)
  })
  container.querySelector('#ev-filtro-estado')?.addEventListener('change', (e) => {
    state.filtroEstado = e.target.value
    renderContent(container)
  })

  // Wire actions
  container.querySelectorAll('[data-ev-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.evId
      const accion = btn.dataset.evAction
      if (!id || !accion) return
      handleAction(accion, id, container)
    })
  })
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

function kpi(label, value, color) {
  const colors = {
    primary: ['rgba(13,110,253,0.1)', '#0d6efd'],
    danger: ['rgba(220,53,69,0.1)', '#dc3545'],
    warning: ['rgba(255,193,7,0.15)', '#ffc107'],
    info: ['rgba(13,202,240,0.1)', '#0dcaf0'],
    success: ['rgba(25,135,84,0.1)', '#198754'],
    dark: ['rgba(33,37,41,0.1)', '#212529'],
  }
  const [bg, fg] = colors[color] || colors.primary
  return `
    <div class="kpi-card p-2 rounded" style="background:${bg};min-width:80px">
      <small class="text-muted">${escapeHTML(label)}</small>
      <div class="fw-bold" style="color:${fg}">${value}</div>
    </div>
  `
}

// ─── Grupo de mes ─────────────────────────────────────────────────────────────

function renderGrupo(grupo) {
  return `
    <div class="mb-4">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="bg-secondary bg-opacity-10" style="width:3px;height:24px;border-radius:2px"></div>
        <h5 class="mb-0 text-muted small text-uppercase">${grupo.label}</h5>
      </div>
      <div class="d-flex flex-column gap-2">
        ${grupo.eventos.map((e) => renderEventoCard(e)).join('')}
      </div>
    </div>
  `
}

// ─── Card de evento ───────────────────────────────────────────────────────────

function renderEventoCard(evento) {
  const cat = getCategoriaInfo(evento.categoria)
  const est = getEstadoInfo(evento.estado)
  const dias = diasHasta(evento)
  const acciones = ACCIONES[evento.estado] || []

  return `
    <div class="border rounded-3 p-3" style="border-color:var(--bs-border-color, #dee2e6)!important">
      <div class="d-flex flex-wrap align-items-start gap-2 mb-1">
        <span class="badge bg-${cat.color}-subtle text-${cat.color} rounded-pill">
          <i class="${cat.icon} me-1"></i>${cat.label}
        </span>
        <span class="badge bg-${est.color}-subtle text-${est.color} rounded-pill">
          <i class="${est.icon} me-1"></i>${est.label}
        </span>
        ${dias !== null
          ? (dias < 0
              ? '<span class="badge bg-dark-subtle text-dark rounded-pill"><i class="bi bi-check2-all me-1"></i>Pasado</span>'
              : dias === 0
                ? '<span class="badge bg-danger-subtle text-danger rounded-pill"><i class="bi bi-exclamation-circle me-1"></i>Hoy</span>'
                : dias <= 7
                  ? `<span class="badge bg-warning-subtle text-warning rounded-pill"><i class="bi bi-clock me-1"></i>En ${dias} día${dias === 1 ? '' : 's'}</span>`
                  : ''
            )
          : ''
        }
      </div>
      <h6 class="mb-1 mt-1">${escapeHTML(evento.titulo)}</h6>
      ${evento.descripcion ? `<p class="small text-muted mb-2">${escapeHTML(evento.descripcion)}</p>` : ''}
      <div class="d-flex flex-wrap gap-3 small text-muted">
        <span><i class="bi bi-calendar3 me-1"></i>${formatFechaCorta(evento.fecha_inicio)}${evento.fecha_fin ? ` — ${formatFechaCorta(evento.fecha_fin)}` : ''}</span>
        ${evento.ubicacion && evento.ubicacion !== '—' ? `<span><i class="bi bi-geo-alt me-1"></i>${escapeHTML(evento.ubicacion)}</span>` : ''}
        <span><i class="bi bi-building me-1"></i>${escapeHTML(evento.departamento_responsable || '—')}</span>
      </div>
      ${evento.metadata?.planificacion ? `
        <div class="mt-2 small p-2 rounded" style="background:rgba(13,202,240,0.08)">
          <i class="bi bi-clipboard-data me-1"></i>
          <strong>Planificación:</strong>
          ${evento.metadata.planificacion.responsable ? `Resp: ${escapeHTML(evento.metadata.planificacion.responsable)}` : ''}
          ${evento.metadata.planificacion.fecha_tentativa ? ` · Tentativa: ${formatFechaCorta(evento.metadata.planificacion.fecha_tentativa)}` : ''}
        </div>
      ` : ''}
      ${acciones.length > 0 ? `
        <div class="d-flex gap-2 mt-2 pt-2 border-top" style="border-color:var(--bs-border-color, #dee2e6)!important">
          ${acciones.map((a) => botonAccion(a, evento.id)).join('')}
        </div>
      ` : ''}
    </div>
  `
}

function botonAccion(accion, id) {
  const mapa = {
    aceptar: { label: 'Aceptar', icon: 'bi-check-lg', color: 'success', variant: 'outline-success' },
    preprogramar: { label: 'Preprogramar', icon: 'bi-calendar-plus', color: 'primary', variant: 'outline-primary' },
    concretar: { label: 'Concretar', icon: 'bi-check2-all', color: 'success', variant: 'outline-success' },
    cancelar: { label: 'Cancelar', icon: 'bi-x-lg', color: 'danger', variant: 'outline-danger' },
  }
  const btn = mapa[accion]
  if (!btn) return ''
  return `<button class="btn btn-sm ${btn.variant}" data-ev-id="${id}" data-ev-action="${accion}">
    <i class="${btn.icon} me-1"></i>${btn.label}
  </button>`
}

// ─── Handlers de acciones ─────────────────────────────────────────────────────

async function handleAction(accion, id, container) {
  try {
    switch (accion) {
      case 'aceptar':
        await api.actualizarEstadoEvento(id, 'aceptado')
        AppToast.success('Evento aceptado correctamente')
        break
      case 'cancelar':
        await api.actualizarEstadoEvento(id, 'cancelado')
        AppToast.info('Evento cancelado')
        break
      case 'concretar':
        await api.actualizarEstadoEvento(id, 'concretado')
        AppToast.success('Evento marcado como concretado')
        break
      case 'preprogramar':
        abrirModalPreprogramar(id, container)
        return // don't reload yet; reload after modal saves
      default:
        return
    }
    // Reload after action
    state.eventos = await api.getEventos({ dias: 180 })
    renderContent(container)
  } catch (err) {
    console.error('[EventosADM] Error en acción:', err)
    AppToast.error(`Error: ${err.message}`)
  }
}

// ─── Modal Preprogramar ───────────────────────────────────────────────────────

function abrirModalPreprogramar(id, container) {
  const evento = state.eventos.find((e) => e.id === id)
  if (!evento) return

  const plan = evento.metadata?.planificacion || {}

  AppModal.open({
    title: `<i class="bi bi-calendar-plus me-2"></i>Preprogramar: ${escapeHTML(evento.titulo)}`,
    size: 'md',
    saveText: 'Guardar planificación',
    body: `
      <form id="ev-preprogramar-form">
        <div class="mb-3">
          <label class="form-label small fw-semibold">Responsable ADM</label>
          <input type="text" class="form-control form-control-sm" name="responsable"
            value="${escapeHTML(plan.responsable || '')}" placeholder="Nombre del responsable">
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold">Fecha tentativa</label>
          <input type="date" class="form-control form-control-sm" name="fecha_tentativa"
            value="${plan.fecha_tentativa ? plan.fecha_tentativa.slice(0, 10) : ''}">
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold">Recursos necesarios</label>
          <input type="text" class="form-control form-control-sm" name="recursos"
            value="${escapeHTML(plan.recursos || '')}" placeholder="Ej: Salón de ensayos, proyector, ...">
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold">Notas</label>
          <textarea class="form-control form-control-sm" name="notas" rows="3"
            placeholder="Observaciones para la planificación">${escapeHTML(plan.notas || '')}</textarea>
        </div>
      </form>
    `,
    onSave: async () => {
      const form = document.getElementById('ev-preprogramar-form')
      if (!form) return
      const fd = new FormData(form)
      const datos = {
        responsable: fd.get('responsable')?.toString().trim() || '',
        fecha_tentativa: fd.get('fecha_tentativa')?.toString() || '',
        recursos: fd.get('recursos')?.toString().trim() || '',
        notas: fd.get('notas')?.toString().trim() || '',
      }
      try {
        await api.preprogramarEvento(id, datos)
        AppModal.close()
        AppToast.success('Evento preprogramado correctamente')
        state.eventos = await api.getEventos({ dias: 180 })
        renderContent(container)
      } catch (err) {
        console.error('[EventosADM] Error al preprogramar:', err)
        AppToast.error(`Error: ${err.message}`)
      }
    },
  })
}

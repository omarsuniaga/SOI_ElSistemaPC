/**
 * calendarioComView.js — Calendario de comunicación (portal COM).
 * Lente READ sobre calendario_institucional: agenda de eventos próximos
 * (conciertos, ensayos, inscripciones, temporadas) agrupada por mes y filtrable
 * por categoría, para que COM esté al día y comunique a tiempo.
 *
 * Patrón: retorna { teardown() } (AbortController).
 */

import '../styles/comunicaciones.css'
import * as api from '../api/calendarioComApi.js'
import { CATEGORIAS_EVENTO, agruparPorMes, diasHasta, esProximo } from '../domain/calendarioCom.js'

const state = {
  eventos: [],
  filtroCategoria: 'todas',
}

let _abort = null

export async function renderCalendarioComView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`
  try {
    state.eventos = await api.getEventos({ dias: 120 })
    renderContent(container)
  } catch (err) {
    console.error('[CalendarioCom] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar el calendario</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }
  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  const filtrados =
    state.filtroCategoria === 'todas'
      ? state.eventos
      : state.eventos.filter((e) => e.categoria === state.filtroCategoria)
  const grupos = agruparPorMes(filtrados)
  const prox7 = state.eventos.filter((e) => esProximo(e, 7)).length
  const prox30 = state.eventos.filter((e) => esProximo(e, 30)).length
  const proxConcierto = state.eventos.find((e) => e.categoria === 'concierto' && diasHasta(e) >= 0)

  const categoriasPresentes = [...new Set(state.eventos.map((e) => e.categoria))]

  container.innerHTML = `
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
          <i class="bi bi-calendar-week fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Calendario de Comunicación</h1>
          <p class="text-muted small mb-0">Eventos, ciclos y temporadas · lente sobre el calendario institucional</p>
        </div>
      </div>

      <div class="tareas-kpis d-flex gap-2 flex-wrap mb-3">
        ${kpi('Próximos 7 días', prox7, 'danger')}
        ${kpi('Próximos 30 días', prox30, 'warning')}
        ${kpi('Total en agenda', state.eventos.length, 'primary')}
        ${
          proxConcierto
            ? `<div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
                 <small class="text-muted">Próximo concierto</small>
                 <div class="fw-bold text-info">${diasHasta(proxConcierto)} día${diasHasta(proxConcierto) === 1 ? '' : 's'}</div>
               </div>`
            : ''
        }
      </div>

      <div class="d-flex gap-2 flex-wrap mb-3">
        <button class="btn btn-sm ${state.filtroCategoria === 'todas' ? 'btn-primary' : 'btn-outline-secondary'} cal-cat" data-cat="todas">Todas</button>
        ${categoriasPresentes
          .map((c) => {
            const cat = CATEGORIAS_EVENTO[c] || CATEGORIAS_EVENTO.otro
            return `<button class="btn btn-sm ${state.filtroCategoria === c ? 'btn-primary' : 'btn-outline-secondary'} cal-cat" data-cat="${c}">
              <i class="bi ${cat.icon} me-1"></i>${cat.label}</button>`
          })
          .join('')}
      </div>

      <div id="calAgenda">
        ${
          grupos.length === 0
            ? `<div class="alert alert-info text-center py-4"><i class="bi bi-calendar-x"></i> No hay eventos próximos para este filtro</div>`
            : grupos.map(renderGrupoMes).join('')
        }
      </div>
    </div>
  `

  const signal = _abort.signal
  container.querySelectorAll('.cal-cat').forEach((b) =>
    b.addEventListener('click', () => { state.filtroCategoria = b.dataset.cat; renderContent(container) }, { signal }),
  )
}

function kpi(label, valor, color) {
  return `<div class="kpi-card bg-${color} bg-opacity-10 p-2 rounded">
    <small class="text-muted">${label}</small>
    <div class="fs-5 fw-bold text-${color}">${valor}</div>
  </div>`
}

function renderGrupoMes(grupo) {
  return `
    <div class="mb-4">
      <h6 class="fw-bold text-uppercase small text-muted mb-2 border-bottom pb-1">${escapeHTML(grupo.label)}</h6>
      ${grupo.eventos.map(renderEvento).join('')}
    </div>
  `
}

function renderEvento(e) {
  const cat = CATEGORIAS_EVENTO[e.categoria] || CATEGORIAS_EVENTO.otro
  const dias = diasHasta(e)
  const f = new Date(e.fecha_inicio)
  const fechaTxt = f.toLocaleDateString('es-DO', { weekday: 'short', day: '2-digit', month: 'short' })
  const horaTxt = f.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
  const diasTxt = dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : dias > 0 ? `En ${dias} días` : 'Pasado'

  return `
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="text-center flex-shrink-0" style="width:54px">
            <div class="badge bg-${cat.color} bg-opacity-10 text-${cat.color} border border-${cat.color}-subtle w-100 py-1">
              <i class="bi ${cat.icon}"></i>
            </div>
            <div class="extra-small text-muted mt-1">${diasTxt}</div>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${escapeHTML(e.titulo)}</div>
            <div class="small text-secondary">${escapeHTML(e.descripcion || '')}</div>
            <div class="d-flex flex-wrap gap-3 mt-1 small text-muted">
              <span><i class="bi bi-calendar3 me-1"></i>${fechaTxt} · ${horaTxt}</span>
              ${e.ubicacion && e.ubicacion !== '—' ? `<span><i class="bi bi-geo-alt me-1"></i>${escapeHTML(e.ubicacion)}</span>` : ''}
              <span><i class="bi bi-building me-1"></i>${escapeHTML(e.departamento_responsable || '')}</span>
              <span class="badge bg-${cat.color} bg-opacity-75">${cat.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * pulsoView.js — Pulso Institucional: Real-time Event Feed Dashboard
 *
 * Monitoreo en tiempo real de eventos procesados por HERMES.
 * - Suscripción a canal Realtime hermes-pulso en tabla soi_eventos (INSERT).
 * - Debounce 800ms para bulk inserts (10k+ eventos).
 * - Filtros por tipo, entidad_tipo, departamento.
 * - Paginación: carga últimos 100 eventos al iniciar, +100 en "Load More".
 * - RLS automático: DIR ve todos; ACM, ADM, LOG, etc. ven solo sus eventos.
 *
 * @param {HTMLElement} container
 * @param {object} [opciones]
 * @param {object} [opciones.supabase] — instancia de Supabase (si no, se importa)
 */

import '../styles/pulso.css'
import { supabase } from '../../../lib/supabaseClient.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const TIPO_COLORES = {
  'sesion.iniciada': '#3B82F6',      // azul
  'sesion.finalizada': '#3B82F6',
  'asistencia.registrada': '#10B981', // verde
  'asistencia.faltante': '#10B981',
  'tarea.creada': '#F59E0B',         // naranja
  'tarea.completada': '#F59E0B',
  'justificacion.creada': '#8B5CF6', // morado
  'justificacion.rechazada': '#8B5CF6',
  'periodo.cerrado': '#6B7280',      // gris
  'periodo.abierto': '#6B7280',
}

const ENTIDAD_ICONOS = {
  alumno: 'person',
  maestro: 'person-badge',
  representante: 'people',
  instrumento: 'music-note',
  evento: 'calendar-event',
  departamento: 'building',
  otro: 'file-text',
}

const state = {
  eventos: [],
  offset: 0,
  limit: 100,
  filtros: {
    tipo: '',
    entidad_tipo: '',
    departamento: '',
  },
  cargando: false,
  reconectando: false,
  tiposCounts: {},
}

let _abortController = null
let _realtimeChannel = null
let _debounceTimer = null

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function timeAgo(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date
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

function getTipoBadgeColor(tipo) {
  return TIPO_COLORES[tipo] || '#9CA3AF'
}

function renderEventoRow(evento) {
  const color = getTipoBadgeColor(evento.tipo)
  const payload = evento.payload || {}
  const payloadStr = JSON.stringify(payload).substring(0, 100)
  const icono = ENTIDAD_ICONOS[evento.entidad_tipo] || 'file-text'

  return `
    <div class="pulso-evento-row" data-evento-id="${escapeHtml(evento.id)}">
      <div class="pulso-evento-badge" style="background-color: ${color}"></div>
      <div class="pulso-evento-content">
        <div class="pulso-evento-header">
          <span class="pulso-evento-tipo">${escapeHtml(evento.tipo)}</span>
          <span class="pulso-evento-timestamp">${timeAgo(evento.created_at)}</span>
        </div>
        <div class="pulso-evento-meta">
          <i class="bi bi-${icono} me-1"></i>
          <span class="pulso-evento-entidad">${escapeHtml(evento.entidad_tipo || 'otro')}</span>
          ${evento.entidad_id ? `<span class="pulso-evento-id">(${evento.entidad_id.substring(0, 8)}...)</span>` : ''}
        </div>
        ${payloadStr ? `<div class="pulso-evento-payload"><small>${escapeHtml(payloadStr)}</small></div>` : ''}
      </div>
    </div>
  `
}

async function fetchEventos(offset = 0) {
  state.cargando = true
  try {
    const filters = state.filtros
    let query = supabase
      .from('soi_eventos')
      .select('id, tipo, entidad_tipo, entidad_id, payload, created_at', { count: 'exact' })
      .eq('procesado', true)

    if (filters.tipo) query = query.eq('tipo', filters.tipo)
    if (filters.entidad_tipo) query = query.eq('entidad_tipo', filters.entidad_tipo)
    if (filters.departamento) {
      // Filtro por departamento en payload (assumiendo estructura establecida)
      // Si la estructura varía, ajustar según RLS table
      query = query.eq('departamento', filters.departamento)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + state.limit - 1)

    if (error) throw error

    if (offset === 0) {
      state.eventos = data || []
    } else {
      state.eventos = [...state.eventos, ...(data || [])]
    }
    state.offset = offset + state.limit
  } catch (err) {
    console.error('[Pulso] Error fetching eventos:', err)
    AppToast.error(`Error cargando eventos: ${err.message}`)
  } finally {
    state.cargando = false
  }
}

function setupRealtime(container) {
  if (_realtimeChannel) {
    supabase.removeChannel(_realtimeChannel)
  }

  _realtimeChannel = supabase.channel('hermes-pulso')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'soi_eventos',
      },
      (payload) => {
        // Debounce 800ms para acumular múltiples inserts
        clearTimeout(_debounceTimer)
        _debounceTimer = setTimeout(() => {
          recargarEventos(container)
        }, 800)
      }
    )
    .on('subscribe', () => {
      state.reconectando = false
      _updateReconnectBanner(container)
    })
    .on('close', () => {
      state.reconectando = true
      _updateReconnectBanner(container)
    })
    .subscribe((status) => {
      console.log('[Pulso] Realtime status:', status)
    })
}

function _updateReconnectBanner(container) {
  const banner = container.querySelector('#pulso-reconnect-banner')
  if (!banner) return

  if (state.reconectando) {
    banner.classList.remove('d-none')
  } else {
    banner.classList.add('d-none')
  }
}

async function recargarEventos(container) {
  state.offset = 0
  await fetchEventos(0)
  renderEventosFeed(container)
}

function renderEventosFeed(container) {
  const feed = container.querySelector('#pulso-feed')
  if (!feed) return

  if (state.eventos.length === 0) {
    feed.innerHTML = `
      <div class="alert alert-info m-3">
        <i class="bi bi-info-circle me-2"></i>
        No hay eventos que mostrar.
      </div>
    `
    return
  }

  feed.innerHTML = state.eventos.map(renderEventoRow).join('')
}

function attachEvents(container) {
  // Load More button
  const btnLoadMore = container.querySelector('#pulso-btn-load-more')
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', async () => {
      if (state.cargando) return
      state.cargando = true
      btnLoadMore.disabled = true
      await fetchEventos(state.offset)
      renderEventosFeed(container)
      btnLoadMore.disabled = false
    })
  }

  // Filter changes
  const filterTipo = container.querySelector('#pulso-filter-tipo')
  const filterEntidad = container.querySelector('#pulso-filter-entidad')
  const filterDepto = container.querySelector('#pulso-filter-depto')

  const applyFilters = async () => {
    if (filterTipo) state.filtros.tipo = filterTipo.value
    if (filterEntidad) state.filtros.entidad_tipo = filterEntidad.value
    if (filterDepto) state.filtros.departamento = filterDepto.value
    await recargarEventos(container)
  }

  filterTipo?.addEventListener('change', applyFilters)
  filterEntidad?.addEventListener('change', applyFilters)
  filterDepto?.addEventListener('change', applyFilters)
}

function _renderUI(container) {
  const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  container.innerHTML = `
    <div class="pulso-container">
      <!-- Header -->
      <div class="pulso-header card mb-4">
        <div class="card-body">
          <h2 class="card-title mb-0">
            <i class="bi bi-lightning-charge-fill me-2" style="color: #F59E0B;"></i>
            Pulso Institucional
          </h2>
          <small class="text-muted">Última actualización: ${now}</small>
        </div>
      </div>

      <!-- Reconnect Banner -->
      <div id="pulso-reconnect-banner" class="alert alert-warning d-none mb-3">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Reconectando a tiempo real...
      </div>

      <!-- Filters -->
      <div class="pulso-filters card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Tipo de Evento</label>
              <select id="pulso-filter-tipo" class="form-select form-select-sm">
                <option value="">Todos</option>
                <option value="sesion.iniciada">Sesión Iniciada</option>
                <option value="sesion.finalizada">Sesión Finalizada</option>
                <option value="asistencia.registrada">Asistencia Registrada</option>
                <option value="asistencia.faltante">Falta</option>
                <option value="tarea.creada">Tarea Creada</option>
                <option value="tarea.completada">Tarea Completada</option>
                <option value="justificacion.creada">Justificación</option>
                <option value="justificacion.rechazada">Justificación Rechazada</option>
                <option value="periodo.cerrado">Período Cerrado</option>
                <option value="periodo.abierto">Período Abierto</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Entidad</label>
              <select id="pulso-filter-entidad" class="form-select form-select-sm">
                <option value="">Todos</option>
                <option value="alumno">Alumno</option>
                <option value="maestro">Maestro</option>
                <option value="representante">Representante</option>
                <option value="instrumento">Instrumento</option>
                <option value="evento">Evento</option>
                <option value="departamento">Departamento</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Departamento</label>
              <select id="pulso-filter-depto" class="form-select form-select-sm">
                <option value="">Todos</option>
                <option value="DIR">Dirección</option>
                <option value="ACM">Académico</option>
                <option value="ADM">Administración</option>
                <option value="FIN">Finanzas</option>
                <option value="LOG">Logística</option>
                <option value="COM">Comunicaciones</option>
                <option value="TECNICO">Técnico</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Feed -->
      <div id="pulso-feed" class="pulso-feed mb-4">
        <div class="text-center text-muted py-5">
          <i class="bi bi-hourglass-split me-2"></i>
          Cargando eventos...
        </div>
      </div>

      <!-- Load More Button -->
      <div class="text-center mb-4">
        <button id="pulso-btn-load-more" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-down me-2"></i>
          Cargar más eventos
        </button>
      </div>
    </div>
  `
}

export async function renderPulsoView(container) {
  _abortController = new AbortController()
  state.eventos = []
  state.offset = 0
  state.cargando = false
  state.filtros = { tipo: '', entidad_tipo: '', departamento: '' }

  _renderUI(container)
  attachEvents(container)

  // Initial load
  await fetchEventos(0)
  renderEventosFeed(container)

  // Setup Realtime subscription
  setupRealtime(container)

  return {
    teardown: () => {
      _abortController.abort()
      clearTimeout(_debounceTimer)
      if (_realtimeChannel) {
        supabase.removeChannel(_realtimeChannel)
        _realtimeChannel = null
      }
    },
  }
}

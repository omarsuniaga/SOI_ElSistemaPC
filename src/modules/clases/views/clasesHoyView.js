import '../styles/clasesHoy.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { router } from '../../../core/router/router.js'
import { obtenerClasesDelDia, DIAS_SEMANA, getDiaActualKey } from '../api/clasesHoyApi.js'

let _abortController = null
let _currentDiaFiltro = null
let _searchQuery = ''
let _filtroSalon = 'todos'
let _filtroMaestro = 'todos'
let _filtroEstado = 'todos'
let _dataCache = null

/**
 * Renderiza la vista ejecutiva/operativa de Clases de Hoy
 * @param {HTMLElement} container
 */
export async function renderClasesHoyView(container) {
  if (!container) return

  // Limpiar listeners previos
  _abortController?.abort()
  _abortController = new AbortController()
  const { signal } = _abortController

  _currentDiaFiltro = _currentDiaFiltro || getDiaActualKey()
  _searchQuery = ''
  _filtroSalon = 'todos'
  _filtroMaestro = 'todos'
  _filtroEstado = 'todos'

  container.innerHTML = `
    <div class="clases-hoy-container">
      <div class="d-flex align-items-center justify-content-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando clases del día...</span>
        </div>
      </div>
    </div>
  `

  try {
    await _loadAndRender(container, signal)
  } catch (error) {
    console.error('[clasesHoyView] Error renderizando vista:', error)
    container.innerHTML = `
      <div class="clases-hoy-container">
        <div class="alert alert-danger d-flex align-items-center m-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar las clases del día</h5>
            <p class="mb-0 small">${escapeHTML(error?.message || 'Error de conexión con la base de datos.')}</p>
          </div>
        </div>
      </div>
    `
  }
}

async function _loadAndRender(container, signal) {
  _dataCache = await obtenerClasesDelDia(_currentDiaFiltro)
  _renderViewDOM(container, signal)
}

function _renderViewDOM(container, signal) {
  const data = _dataCache
  const hoyRealKey = getDiaActualKey()
  const esHoy = _currentDiaFiltro === hoyRealKey

  const fechaHoyStr = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  // Obtener salones y maestros únicos para los selectores de filtro
  const salonesUnicos = [...new Set(data.sesiones.map(s => s.salon.nombre).filter(Boolean))].sort()
  const maestrosUnicos = [...new Set(data.sesiones.map(s => s.maestro_principal.nombre_completo).filter(Boolean))].sort()

  // Filtrar sesiones según los controles
  const sesionesFiltradas = data.sesiones.filter(s => {
    // Filtro por Estado
    if (_filtroEstado === 'en-curso' && s.estado_temporal !== 'en-curso') return false
    if (_filtroEstado === 'proxima' && s.estado_temporal !== 'proxima') return false
    if (_filtroEstado === 'pasada' && s.estado_temporal !== 'pasada') return false

    // Filtro por Salón
    if (_filtroSalon !== 'todos' && s.salon.nombre !== _filtroSalon) return false

    // Filtro por Maestro
    if (_filtroMaestro !== 'todos' && s.maestro_principal.nombre_completo !== _filtroMaestro) return false

    // Buscador
    if (_searchQuery.trim()) {
      const q = _searchQuery.toLowerCase()
      const matchClase = s.clase_nombre.toLowerCase().includes(q)
      const matchMaestro = s.maestro_principal.nombre_completo.toLowerCase().includes(q)
      const matchSalon = s.salon.nombre.toLowerCase().includes(q)
      const matchInstrumento = s.instrumento.toLowerCase().includes(q)
      const matchAlumno = s.alumnos.some(a => a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q))

      if (!matchClase && !matchMaestro && !matchSalon && !matchInstrumento && !matchAlumno) {
        return false
      }
    }

    return true
  })

  container.innerHTML = `
    <div class="clases-hoy-container">
      
      <!-- HEADER & SELECTOR DE DÍAS -->
      <div class="clases-hoy-header">
        <div class="clases-hoy-title-group">
          <h2><i class="bi bi-calendar-day text-primary me-2"></i>Clases del Día</h2>
          <div class="clases-hoy-date-badge">
            <i class="bi bi-clock-history"></i>
            <span>${esHoy ? 'Hoy: ' + fechaHoyStr : 'Consultando: ' + data.diaLabel + ' (' + data.fecha + ')'}</span>
          </div>
        </div>

        <div class="clases-hoy-day-selector" id="daySelectorGroup">
          ${DIAS_SEMANA.map(d => `
            <button class="day-pill-btn ${d.key === _currentDiaFiltro ? 'active' : ''}" data-day="${d.key}">
              ${d.label} ${d.key === hoyRealKey ? '<span class="badge bg-warning text-dark ms-1" style="font-size:0.6rem">HOY</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- KPIS OPERATIVOS -->
      <div class="clases-hoy-kpis">
        <div class="clases-kpi-card">
          <div class="clases-kpi-icon primary">
            <i class="bi bi-easel2"></i>
          </div>
          <div class="clases-kpi-info">
            <div class="kpi-num">${data.totalClases}</div>
            <div class="kpi-label">Clases Programadas</div>
          </div>
        </div>

        <div class="clases-kpi-card">
          <div class="clases-kpi-icon success">
            <i class="bi bi-play-circle-fill"></i>
          </div>
          <div class="clases-kpi-info">
            <div class="kpi-num">${data.enCursoCount}</div>
            <div class="kpi-label">En Curso Ahora</div>
          </div>
        </div>

        <div class="clases-kpi-card">
          <div class="clases-kpi-icon info">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="clases-kpi-info">
            <div class="kpi-num">${data.totalAlumnosConvocados}</div>
            <div class="kpi-label">Alumnos Matriculados</div>
          </div>
        </div>

        <div class="clases-kpi-card">
          <div class="clases-kpi-icon warning">
            <i class="bi bi-door-open-fill"></i>
          </div>
          <div class="clases-kpi-info">
            <div class="kpi-num">${data.salonesOcupadosCount}</div>
            <div class="kpi-label">Salones Ocupados</div>
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS Y BÚSQUEDA -->
      <div class="clases-hoy-controls">
        <div class="clases-hoy-search">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control form-control-sm" id="inputBuscarClasesHoy" placeholder="Buscar clase, maestro, alumno o instrumento..." value="${escapeHTML(_searchQuery)}">
        </div>

        <div class="d-flex gap-2 flex-wrap">
          <select class="form-select form-select-sm" id="selectFiltroEstado" style="width: auto;">
            <option value="todos" ${_filtroEstado === 'todos' ? 'selected' : ''}>Todos los Estados</option>
            <option value="en-curso" ${_filtroEstado === 'en-curso' ? 'selected' : ''}>🟢 En Curso</option>
            <option value="proxima" ${_filtroEstado === 'proxima' ? 'selected' : ''}>🟡 Próximas</option>
            <option value="pasada" ${_filtroEstado === 'pasada' ? 'selected' : ''}>⚪ Concluidas</option>
          </select>

          <select class="form-select form-select-sm" id="selectFiltroSalon" style="width: auto;">
            <option value="todos" ${_filtroSalon === 'todos' ? 'selected' : ''}>Todos los Salones</option>
            ${salonesUnicos.map(sal => `<option value="${escapeHTML(sal)}" ${_filtroSalon === sal ? 'selected' : ''}>${escapeHTML(sal)}</option>`).join('')}
          </select>

          <select class="form-select form-select-sm" id="selectFiltroMaestro" style="width: auto;">
            <option value="todos" ${_filtroMaestro === 'todos' ? 'selected' : ''}>Todos los Maestros</option>
            ${maestrosUnicos.map(m => `<option value="${escapeHTML(m)}" ${_filtroMaestro === m ? 'selected' : ''}>${escapeHTML(m)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- FEED GRID DE CLASES -->
      <div class="clases-hoy-grid">
        ${sesionesFiltradas.length > 0 ? sesionesFiltradas.map(s => _renderClaseCard(s)).join('') : _renderEmptyState()}
      </div>

    </div>
  `

  _attachEvents(container, signal)
}

function _renderClaseCard(s) {
  const statusLabels = {
    'en-curso': '<span class="pulsing-dot"></span> EN CURSO',
    'proxima': 'PRÓXIMA',
    'futura': 'PROGRAMADA',
    'pasada': 'FINALIZADA',
  }

  return `
    <div class="clase-hoy-card ${s.estado_temporal}">
      
      <!-- Top: Horario y Estado -->
      <div class="clase-card-top">
        <div class="clase-time-block">
          <i class="bi bi-clock"></i>
          <span>${s.hora_inicio_formato} - ${s.hora_fin_formato}</span>
        </div>
        <div class="clase-status-pill ${s.estado_temporal}">
          ${statusLabels[s.estado_temporal] || s.estado_temporal}
        </div>
      </div>

      <!-- Contenido Principal -->
      <div>
        <h4 class="clase-card-title">${escapeHTML(s.clase_nombre)}</h4>
        <div class="clase-card-badges">
          <span class="clase-meta-badge"><i class="bi bi-music-note me-1"></i>${escapeHTML(s.instrumento)}</span>
          <span class="clase-meta-badge"><i class="bi bi-layer-forward me-1"></i>${escapeHTML(s.nivel)}</span>
          <span class="clase-meta-badge"><i class="bi bi-book me-1"></i>${escapeHTML(s.programa_nombre)}</span>
          ${s.asistencia_registrada ? `
            <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2" style="font-size:0.7rem">
              <i class="bi bi-check2-circle me-1"></i>Asistencia (${s.total_presentes}P · ${s.total_ausentes}A · ${s.total_justificados}J)
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Salón y Maestro -->
      <div class="clase-meta-grid">
        <div class="clase-meta-item">
          <i class="bi bi-door-closed"></i>
          <div class="clase-meta-item-text">
            <span class="clase-meta-item-label">Salón</span>
            <strong>${escapeHTML(s.salon.nombre)}</strong>
          </div>
        </div>

        <div class="clase-meta-item">
          <i class="bi bi-person-badge"></i>
          <div class="clase-meta-item-text">
            <span class="clase-meta-item-label">Docente</span>
            <strong>${escapeHTML(s.maestro_principal.nombre_completo)}</strong>
          </div>
        </div>
      </div>

      <!-- Sección Desplegable de Nómina de Alumnos -->
      <div class="clase-roster-section">
        <button class="roster-toggle-btn" data-action="toggle-roster" data-clase-id="${s.clase_id}">
          <span>
            <i class="bi bi-people me-1"></i>
            Nómina de Alumnos (${s.total_alumnos}/${s.capacidad_maxima})
          </span>
          <i class="bi bi-chevron-down toggle-arrow"></i>
        </button>

        <div class="roster-list" id="roster-${s.clase_id}">
          ${s.alumnos.length > 0 ? s.alumnos.map((a, idx) => _renderStudentItem(a, idx, s)).join('') : `
            <div class="text-muted small p-2 text-center">No hay alumnos inscritos en esta clase.</div>
          `}
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="clase-card-actions">
        <button class="btn btn-outline-primary btn-sm clase-action-btn" data-action="nav-asistencia" data-clase-id="${s.clase_id}">
          <i class="bi bi-clipboard-check"></i> ${s.asistencia_registrada ? 'Editar Asistencia' : 'Tomar Asistencia'}
        </button>
        <button class="btn btn-outline-secondary btn-sm clase-action-btn" data-action="nav-clase" data-clase-id="${s.clase_id}">
          <i class="bi bi-arrow-right"></i> Ver Ficha
        </button>
      </div>

    </div>
  `
}

/**
 * Renderiza el ítem de cada alumno con el estado de asistencia correspondiente si ha sido registrada.
 */
function _renderStudentItem(a, idx, s) {
  if (!s.asistencia_registrada) {
    return `
      <div class="roster-student-item">
        <div class="roster-student-name">
          <span class="text-muted small me-1">${idx + 1}.</span>
          <span>${escapeHTML(a.nombre)}</span>
        </div>
        <span class="badge bg-secondary-subtle text-secondary-emphasis" style="font-size:0.7rem">${escapeHTML(a.instrumento || a.nivel || 'Alumno')}</span>
      </div>
    `
  }

  // Asistencia Registrada:
  if (a.estado_asistencia === 'presente') {
    return `
      <div class="roster-student-item asistencia-presente">
        <div class="roster-student-name">
          <span class="text-muted small me-1">${idx + 1}.</span>
          <span class="fw-semibold">${escapeHTML(a.nombre)}</span>
        </div>
        <span class="badge student-status-badge" style="font-size:0.7rem">
          <i class="bi bi-check-circle-fill me-1"></i>Presente
        </span>
      </div>
    `
  }

  if (a.estado_asistencia === 'justificado') {
    const just = a.justificacion || {}
    return `
      <div class="roster-student-item asistencia-justificado" 
           data-action="ver-justificacion" 
           data-student-name="${escapeHTML(a.nombre)}" 
           data-clase-name="${escapeHTML(s.clase_nombre)}" 
           data-docente-name="${escapeHTML(s.maestro_principal.nombre_completo)}"
           data-fecha="${escapeHTML(s.fecha || s.dia)}" 
           data-motivo="${escapeHTML(just.motivo || 'Justificación asentada ante la dirección académica.')}"
           data-evidencia="${escapeHTML(just.evidencia_url || '')}"
           title="Clic para ver detalle de la justificación">
        <div class="roster-student-name">
          <span class="text-muted small me-1">${idx + 1}.</span>
          <span class="fw-semibold text-purple-emphasis">${escapeHTML(a.nombre)}</span>
        </div>
        <span class="badge student-status-badge" style="font-size:0.7rem">
          <i class="bi bi-file-earmark-medical-fill me-1"></i>Justificado <i class="bi bi-info-circle ms-1"></i>
        </span>
      </div>
    `
  }

  // Ausente
  return `
    <div class="roster-student-item asistencia-ausente">
      <div class="roster-student-name">
        <span class="text-muted small me-1">${idx + 1}.</span>
        <span>${escapeHTML(a.nombre)}</span>
      </div>
      <span class="badge student-status-badge" style="font-size:0.7rem">
        <i class="bi bi-x-circle-fill me-1"></i>Ausente
      </span>
    </div>
  `
}

function _renderEmptyState() {
  return `
    <div class="clases-hoy-empty">
      <i class="bi bi-calendar-x"></i>
      <h4>No hay clases programadas</h4>
      <p class="text-muted">No se encontraron sesiones para los filtros seleccionados en este día.</p>
    </div>
  `
}

function _mostrarModalJustificacion({ studentName, claseName, docenteName, fecha, motivo, evidencia }) {
  // Eliminar modales previos si existieran
  document.getElementById('justifModalContainer')?.remove()

  const modalHtml = `
    <div class="justif-modal-backdrop" id="justifModalContainer">
      <div class="justif-modal-dialog">
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between" style="border-color: rgba(111,66,193,0.3) !important;">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 rounded-3" style="background: rgba(111,66,193,0.2); color: #cbb2fe;">
              <i class="bi bi-file-earmark-medical-fill fs-5"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold">Detalle de Inasistencia Justificada</h6>
              <div class="small text-muted">${escapeHTML(fecha)}</div>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white" id="btnCerrarJustifModal" aria-label="Cerrar"></button>
        </div>

        <div class="p-4">
          <div class="mb-3">
            <div class="text-muted small fw-semibold text-uppercase">Estudiante</div>
            <div class="fs-6 fw-bold">${escapeHTML(studentName)}</div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <div class="text-muted small fw-semibold text-uppercase">Clase</div>
              <div class="small fw-semibold">${escapeHTML(claseName)}</div>
            </div>
            <div class="col-6">
              <div class="text-muted small fw-semibold text-uppercase">Docente</div>
              <div class="small">${escapeHTML(docenteName)}</div>
            </div>
          </div>

          <div class="p-3 rounded-3 mb-3" style="background: rgba(111, 66, 193, 0.12); border: 1px dashed rgba(111, 66, 193, 0.4);">
            <div class="d-flex align-items-center gap-2 mb-1" style="color: #d6bbfb;">
              <i class="bi bi-chat-left-quote-fill"></i>
              <span class="small fw-bold text-uppercase">Motivo / Causa Asentada</span>
            </div>
            <p class="mb-0 small text-body" style="line-height: 1.5;">${escapeHTML(motivo)}</p>
          </div>

          ${evidencia ? `
            <div class="mb-3">
              <a href="${escapeHTML(evidencia)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-info w-100 d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-paperclip"></i> Ver Documento / Evidencia Adjunta
              </a>
            </div>
          ` : ''}

          <div class="text-end mt-4">
            <button type="button" class="btn btn-secondary btn-sm px-4 rounded-3" id="btnAceptarJustifModal">Entendido</button>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML('beforeend', modalHtml)

  const backdrop = document.getElementById('justifModalContainer')
  const close = () => backdrop?.remove()

  document.getElementById('btnCerrarJustifModal')?.addEventListener('click', close)
  document.getElementById('btnAceptarJustifModal')?.addEventListener('click', close)
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })
}

function _attachEvents(container, signal) {
  // 1. Selector de Día
  container.querySelectorAll('.day-pill-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      _currentDiaFiltro = btn.dataset.day
      await _loadAndRender(container, signal)
    }, { signal })
  })

  // 2. Buscador
  const searchInput = container.querySelector('#inputBuscarClasesHoy')
  searchInput?.addEventListener('input', (e) => {
    _searchQuery = e.target.value
    _renderViewDOM(container, signal)
  }, { signal })

  // 3. Filtros Dropdowns
  container.querySelector('#selectFiltroEstado')?.addEventListener('change', (e) => {
    _filtroEstado = e.target.value
    _renderViewDOM(container, signal)
  }, { signal })

  container.querySelector('#selectFiltroSalon')?.addEventListener('change', (e) => {
    _filtroSalon = e.target.value
    _renderViewDOM(container, signal)
  }, { signal })

  container.querySelector('#selectFiltroMaestro')?.addEventListener('change', (e) => {
    _filtroMaestro = e.target.value
    _renderViewDOM(container, signal)
  }, { signal })

  // 4. Delegación de eventos para acordeón, modal de justificación y navegación
  container.addEventListener('click', (e) => {
    // Modal de Justificación
    const justifItem = e.target.closest('[data-action="ver-justificacion"]')
    if (justifItem) {
      _mostrarModalJustificacion({
        studentName: justifItem.dataset.studentName,
        claseName: justifItem.dataset.claseName,
        docenteName: justifItem.dataset.docenteName,
        fecha: justifItem.dataset.fecha,
        motivo: justifItem.dataset.motivo,
        evidencia: justifItem.dataset.evidencia,
      })
      return
    }

    // Acordeón de Nómina
    const rosterBtn = e.target.closest('[data-action="toggle-roster"]')
    if (rosterBtn) {
      const rosterSection = rosterBtn.closest('.clase-roster-section')
      const listEl = rosterSection?.querySelector('.roster-list')
      const arrow = rosterBtn.querySelector('.toggle-arrow')
      if (listEl) {
        const isOpen = listEl.classList.contains('open')
        listEl.classList.toggle('open', !isOpen)
        if (arrow) {
          arrow.className = isOpen ? 'bi bi-chevron-down toggle-arrow' : 'bi bi-chevron-up toggle-arrow'
        }
      }
      return
    }

    // Navegación a Asistencia
    const asistBtn = e.target.closest('[data-action="nav-asistencia"]')
    if (asistBtn) {
      const claseId = asistBtn.dataset.claseId
      router.navigate(`asistencias?clase=${claseId}`)
      return
    }

    // Navegación a Clases
    const claseBtn = e.target.closest('[data-action="nav-clase"]')
    if (claseBtn) {
      router.navigate('clases')
      return
    }
  }, { signal })
}

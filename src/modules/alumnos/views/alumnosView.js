import '../styles/alumnos.css'
import { renderPageHeader, renderFilterPanel } from '../../../shared/components/pageShell.js'
import { calcularCompletitud, NIVEL_COLOR, NIVEL_LABEL } from '../domain/completitudAlumno.js'

import { formatPhone, normalizePhone, whatsappLink } from '../../../shared/utils/phoneUtils.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AlumnoForm } from '../components/AlumnoForm.js'
import { AlumnoDeleteModal } from '../components/AlumnoDeleteModal.js'
import { PostuladosBackfillModal } from '../components/PostuladosBackfillModal.js'
import { DuplicadosModal } from '../components/DuplicadosModal.js'
import {
  obtenerAlumnos,
  crearAlumno,
  actualizarAlumno,
  PARENTESCOS,
  getParentescoLabel,
  obtenerAlumnosFiltradosYOrdenados,
} from '../api/alumnosApi.js'
import { descargarPdfListadoAlumnos } from '../domain/generarPdfInscripcion.js'
import { calcularEdad } from '../domain/calcularEdad.js'
import { detectarCandidatosDe } from '../domain/duplicadosAlumnos.js'
import {
  formatDate,
  escapeHTML,
  isValidEmail,
  formatGenero,
  getGeneroIcon,
  getEstadoClass,
  getEstadoLabel,
  getInitials,
} from '../utils/alumnosUtils.js'
import { getInstrumentoIcon } from '../../clases/utils/clasesUtils.js'

// D03: AbortController for SPA event-listener cleanup
let _abortController = null

const VALIDATION = {
  nombreMax: 100,
  emailMax: 100,
  cedulaMax: 20,
  telefonoMax: 20,
  acudienteMax: 100,
  direccionMax: 255,
  sectionMax: 100,
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando alumnos...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  document.getElementById('retryBtn')?.addEventListener('click', () => renderAlumnosView(container))
}

function renderEmpty() {
  return `
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `
}

export async function renderAlumnosView(container) {
  const state = {
    alumnos: [],
    alumnosOriginales: [],
    totalAlumnos: 0,
    cargando: false,
    editando: null,
    viewingId: null,
    deletingId: null,
    filtroGenero: '',
    filtroEstado: 'todos',
    sortBy: 'nombre',
    sortDir: 'asc',
  }
  let currentContainer = container

  // D03: Abort previous listeners and create fresh AbortController
  _abortController?.abort()
  _abortController = new AbortController()

  try {
    state.cargando = true
    renderLoading(container)

    // D01: obtenerAlumnos now returns { alumnos, total }
    const { alumnos, total } = await obtenerAlumnos()
    state.totalAlumnos = total
    // D02: memoize calcularCompletitud once per alumno at load time
    state.alumnosOriginales = alumnos.map(a => ({
      ...a,
      _completitud: calcularCompletitud(a),
    }))
    state.alumnos = [...state.alumnosOriginales]
    state.cargando = false

    // Render and wire events first, then apply filters (which includes sort)
    renderContent(container)
    attachGlobalEvents(container)
    // C07: Apply initial sort after rendering
    applyFilters()
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }

  // D03: Return teardown function to abort all event listeners
  return {
    teardown: () => _abortController?.abort(),
  }

  // ─── Nested View Functions ──────────────────────────────────────────

  function renderContent(container) {
    const totalAlumnos = state.alumnosOriginales.length
    const totalActivos = state.alumnosOriginales.filter(a => a.is_active ?? true).length
    const totalConInstrumento = state.alumnosOriginales.filter(a => !!a.instrumento && a.instrumento.trim() !== '' && a.instrumento.toLowerCase() !== 'sin instrumento especificado').length
    const totalConWhatsapp = state.alumnosOriginales.filter(a => !!a.telefono && a.telefono.trim() !== '').length

    container.innerHTML = `
      <div class="page-container">
        
        <!-- Header & Toolbar Unificada V2 -->
        <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
          
          <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                <i class="bi bi-people-fill fs-5"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Padrón de Alumnos</h5>
                <small class="text-muted d-block" style="font-size:0.75rem;">Directorio integral de estudiantes matriculados</small>
              </div>
              
              <!-- Badges de Resumen en Tiempo Real -->
              <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Alumnos activos sobre total registrados">
                  <i class="bi bi-person-check-fill me-1"></i>${totalActivos}/${totalAlumnos} Activos
                </span>
                <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Alumnos con instrumento asignado">
                  <i class="bi bi-music-note-beamed me-1"></i>${totalConInstrumento} con Cátedra
                </span>
                <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Alumnos con número de WhatsApp registrado">
                  <i class="bi bi-whatsapp me-1"></i>${totalConWhatsapp} con WhatsApp
                </span>
              </div>
            </div>

            <!-- Toolbar de Botones de Acción con 0.85rem de separación -->
            <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
              <button class="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnConciliarPostulados" title="Completar datos faltantes desde Postulados" style="font-size:0.78rem;">
                <i class="bi bi-arrow-repeat"></i>
                <span class="d-none d-sm-inline">Conciliar</span>
              </button>
              <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnDetectarDuplicados" title="Buscar y fusionar alumnos duplicados" style="font-size:0.78rem;">
                <i class="bi bi-copy"></i>
                <span class="d-none d-sm-inline">Duplicados</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnExportarCSV" title="Exportar CSV" style="font-size:0.78rem;">
                <i class="bi bi-file-earmark-spreadsheet"></i>
                <span class="d-none d-sm-inline">CSV</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnDescargarPdfListado" title="Descargar PDF del listado de alumnos" style="font-size:0.78rem;">
                <i class="bi bi-file-earmark-pdf"></i>
                <span class="d-none d-sm-inline">PDF</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnReporteMes" title="Inscritos por mes" style="font-size:0.78rem;">
                <i class="bi bi-bar-chart"></i>
                <span class="d-none d-sm-inline">Reporte</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnPdfDemo" title="Vista previa PDFs" style="font-size:0.78rem;">
                <i class="bi bi-file-earmark-pdf"></i>
                <span class="d-none d-sm-inline">Demo</span>
              </button>
              <button class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnInscribir" title="Inscribir Alumno" style="font-size:0.78rem;">
                <i class="bi bi-person-plus-fill"></i>
                <span>Inscribir</span>
              </button>
              <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnAgregarAlumno" style="font-size:0.78rem;">
                <i class="bi bi-plus-circle-fill"></i>
                <span>Nuevo Alumno</span>
              </button>
            </div>
          </div>

          <!-- Fila 2: Búsqueda y Botón Desplegable de Filtros & Orden -->
          <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
            <div class="flex-grow-1" style="min-width: 260px;">
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="buscar" placeholder="Buscar alumno por nombre, cédula, teléfono o email..." autocomplete="off" style="font-size:0.8rem;">
              </div>
            </div>

            <div class="d-flex align-items-center" style="gap: 0.85rem;">
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltros" type="button" aria-expanded="false" style="font-size:0.78rem;">
                <i class="bi bi-funnel"></i>
                <span>Filtros & Orden</span>
                <span class="badge bg-primary text-white rounded-pill px-1.5 ms-1 d-none" id="filtrosBadgeCount" style="font-size:0.68rem;">0</span>
              </button>

              <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltros" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
                <i class="bi bi-arrow-counterclockwise"></i>
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <!-- Fila 3: Panel Desplegable de Filtros y Ordenamiento -->
          <div class="collapse pt-2.5" id="panelFiltrosAlumnos">
            <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
              <div class="row g-2 align-items-center">
                
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Cátedra / Instrumento</label>
                  <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroInstrumento" style="font-size:0.8rem;">
                    <option value="todos">Todos los Instrumentos</option>
                    <option value="con_instrumento">Con Instrumento</option>
                    <option value="sin_instrumento">Sin Instrumento</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Completitud del Perfil</label>
                  <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroCompletitud" style="font-size:0.8rem;">
                    <option value="todos">Toda Completitud</option>
                    <option value="critico">Crítico (&lt; 40%)</option>
                    <option value="parcial">Parcial (40-69%)</option>
                    <option value="bueno">Bueno (70-89%)</option>
                    <option value="completo">Completo (90-100%)</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado de Contacto</label>
                  <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroWhatsapp" style="font-size:0.8rem;">
                    <option value="todos">Todos los Contactos</option>
                    <option value="con_whatsapp">Con WhatsApp</option>
                    <option value="sin_whatsapp">Sin WhatsApp</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                  <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                    <span class="input-group-text bg-body border-end-0 py-1.5 text-muted" style="font-size:0.75rem;"><i class="bi bi-sort-down"></i></span>
                    <select class="form-select form-select-sm border-start-0 py-1.5 fw-semibold text-primary" id="selectOrdenarAlumnos" style="font-size:0.8rem;">
                      <option value="nombre_asc" ${state.sortBy === 'nombre' && state.sortDir === 'asc' ? 'selected' : ''}>Nombre (A-Z)</option>
                      <option value="nombre_desc" ${state.sortBy === 'nombre' && state.sortDir === 'desc' ? 'selected' : ''}>Nombre (Z-A)</option>
                      <option value="instrumento_asc" ${state.sortBy === 'instrumento' ? 'selected' : ''}>Instrumento (A-Z)</option>
                      <option value="completitud_desc" ${state.sortBy === '_completitud' && state.sortDir === 'desc' ? 'selected' : ''}>Mayor Completitud</option>
                      <option value="completitud_asc" ${state.sortBy === '_completitud' && state.sortDir === 'asc' ? 'selected' : ''}>Menor Completitud</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Sort controls accesibles -->
          <div class="d-none" id="hiddenSortControls">
            <button class="btn btn-link btn-sm" data-sort="nombre">Nombre</button>
            <button class="btn btn-link btn-sm" data-sort="instrumento">Instrumento</button>
            <button class="btn btn-link btn-sm" data-sort="_completitud">Completitud</button>
            <span id="filtrosActivosCount">Filtros activos: 0</span>
          </div>

        </div>

        <!-- Contenedor de Cuadrícula de Alumnos (Hasta 5 por fila responsive) -->
        <div class="w-100">
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2.5 w-100 m-0" id="alumnosTBody">
            ${renderTableRows(state.alumnos)}
          </div>
          <div id="emptyContainer">
            ${state.alumnos.length === 0 ? renderEmpty() : ''}
          </div>
        </div>

      </div>
    `
  }


  function renderTableRows(alumnos) {
    if (!alumnos.length) return ''

    return alumnos.map(a => {
      const nombre = a.nombre || '-'
      const { porcentaje = 0 } = a._completitud || {}
      
      let progresoColor = 'danger'
      if (porcentaje >= 100) progresoColor = 'success'
      else if (porcentaje >= 75) progresoColor = 'primary'
      else if (porcentaje >= 50) progresoColor = 'info'
      else if (porcentaje >= 25) progresoColor = 'warning'

      return `
        <div class="col p-1">
          <div class="list-group-item card h-100 rounded-4 border bg-body shadow-xs hover-shadow transition-all d-flex flex-column justify-content-between position-relative overflow-hidden" data-id="${a.id}" style="cursor: pointer; padding: 0.85rem 0.85rem 1.05rem 0.85rem !important;">
            
            <!-- Parte Superior: Nombre, Instrumento y Contacto -->
            <div class="mb-2">
              
              <!-- Nombre del Alumno -->
              <strong class="text-body text-truncate d-block mb-1" style="font-size: 0.92rem;" title="${escapeHTML(nombre)}">
                ${escapeHTML(nombre)}
              </strong>

              <!-- Instrumento / Cátedra -->
              <div class="mb-2">
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1 px-2 text-truncate w-100 text-start d-block rounded-3" style="font-size: 0.72rem;">
                  <i class="bi ${getInstrumentoIcon(a.instrumento)} me-1 text-primary"></i>${escapeHTML(a.instrumento || 'Sin cátedra')}
                </span>
              </div>

              <!-- Teléfono y Representante -->
              <div class="d-flex flex-column gap-1 text-muted small" style="font-size: 0.76rem;">
                ${a.telefono ? `
                  <div class="text-truncate" title="Teléfono">
                    <i class="bi bi-whatsapp me-1 text-success"></i>${escapeHTML(a.telefono)}
                  </div>
                ` : '<div class="text-truncate text-muted fst-italic" style="font-size:0.72rem;"><i class="bi bi-telephone me-1"></i>Sin teléfono</div>'}

                ${a.familiar_nombre ? `
                  <div class="text-truncate" title="Representante">
                    <i class="bi bi-person me-1 text-secondary"></i>Rep: ${escapeHTML(a.familiar_nombre)}
                  </div>
                ` : '<div class="text-truncate text-muted fst-italic" style="font-size:0.72rem;"><i class="bi bi-person me-1"></i>Sin representante</div>'}
              </div>
            </div>

            <!-- Barra Inferior de Acciones Contextuales -->
            <div class="pt-2 border-top d-flex align-items-center justify-content-between gap-1.5 mt-auto">
              <button class="btn btn-xs btn-outline-primary rounded-3 shadow-xs d-flex align-items-center justify-content-center flex-grow-1 py-1 px-2 fw-semibold" data-action="edit" data-id="${a.id}" title="Editar perfil de alumno" style="font-size:0.75rem;">
                <i class="bi bi-pencil-square me-1"></i>
                <span>Editar</span>
              </button>

              ${a.telefono ? `
                <button class="btn btn-xs btn-outline-success rounded-3 shadow-xs d-flex align-items-center justify-content-center py-1 px-2" data-action="whatsapp" data-id="${a.id}" title="Enviar WhatsApp" style="font-size:0.75rem;">
                  <i class="bi bi-whatsapp"></i>
                </button>
              ` : ''}

              <button class="btn btn-xs btn-outline-danger rounded-3 shadow-xs d-flex align-items-center justify-content-center py-1 px-2" data-action="delete" data-id="${a.id}" title="Eliminar alumno" style="font-size:0.75rem;">
                <i class="bi bi-trash"></i>
              </button>
            </div>

            <!-- Borde Inferior Sutil como Barra de Progreso de Completitud -->
            <div class="position-absolute bottom-0 start-0 end-0 bg-body-tertiary" style="height: 3.5px;" title="Perfil ${porcentaje}% completo">
              <div class="h-100 bg-${progresoColor}" style="width: ${porcentaje}%; transition: width 0.3s ease;"></div>
            </div>

          </div>
        </div>
      `
    }).join('')
  }

  function attachGlobalEvents(container) {
    const signal = _abortController?.signal

    container.querySelector('#btnAgregarAlumno')?.addEventListener('click', () => openCreateModal(), { signal })
    container.querySelector('#btnInscribir')?.addEventListener('click', () => window.router?.navigate('alumnos-inscribir'), { signal })
    container.querySelector('#btnReporteMes')?.addEventListener('click', () => window.router?.navigate('alumnos-reporte-mes'), { signal })
    container.querySelector('#btnPdfDemo')?.addEventListener('click', () => window.router?.navigate('alumnos-pdf-demo'), { signal })
    container.querySelector('#btnIrInactivos')?.addEventListener('click', () => window.router?.navigate('alumnos-inactivos'), { signal })
    container.querySelector('#btnAlumnosInactivos')?.addEventListener('click', () => window.router?.navigate('alumnos-inactivos'), { signal })


    container.querySelector('#btnDescargarPdfListado')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget
      const originalText = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando PDF...'
      try {
        const alumnos = await obtenerAlumnosFiltradosYOrdenados({
          ordenInstrumentoAsc: true,
          ordenEdadAsc: true
        })
        descargarPdfListadoAlumnos(alumnos)
        AppToast.success('PDF generado y descargado correctamente')
      } catch (error) {
        console.error('Error al generar PDF de listado de alumnos:', error)
        AppToast.error('No se pudo generar el PDF del listado: ' + error.message)
      } finally {
        btn.disabled = false
        btn.innerHTML = originalText
      }
    }, { signal })

    container.querySelector('#btnExportarCSV')?.addEventListener('click', () => exportarAlumnosCSV(), { signal })

    container.querySelector('#btnDetectarDuplicados')?.addEventListener('click', () => {
      DuplicadosModal.abrir({
        alumnos: state.alumnosOriginales,
        onSuccess: async () => {
          try {
            const { alumnos: nuevos, total } = await obtenerAlumnos()
            state.totalAlumnos = total
            state.alumnosOriginales = nuevos.map(a => ({
              ...a,
              _completitud: calcularCompletitud(a),
            }))
            applyFilters()
            AppToast.success('Lista actualizada tras la fusión')
          } catch (err) {
            console.error('[alumnosView] Error recargando alumnos tras fusión:', err)
          }
        },
      })
    }, { signal })

    container.querySelector('#btnConciliarPostulados')?.addEventListener('click', () => {
      PostuladosBackfillModal.open({
        onSuccess: async () => {
          try {
            const { alumnos, total } = await obtenerAlumnos()
            state.totalAlumnos = total
            state.alumnosOriginales = alumnos.map(a => ({
              ...a,
              _completitud: calcularCompletitud(a),
            }))
            applyFilters()
          } catch (err) {
            console.error('[alumnosView] Error reloading alumnos after backfill:', err)
          }
        }
      })
    }, { signal })

    container.querySelectorAll('[data-sort]').forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.dataset.sort
        if (state.sortBy === col) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'
        } else {
          state.sortBy = col
          state.sortDir = 'asc'
        }
        applyFilters()
      }, { signal })
    })

    const btnToggleFiltros = container.querySelector('#btnToggleFiltros')
    const panelFiltros = container.querySelector('#panelFiltrosAlumnos')
    btnToggleFiltros?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (panelFiltros) {
        panelFiltros.classList.toggle('show')
        const isOpen = panelFiltros.classList.contains('show')
        btnToggleFiltros.setAttribute('aria-expanded', String(isOpen))
        btnToggleFiltros.classList.toggle('btn-primary', isOpen)
        btnToggleFiltros.classList.toggle('text-white', isOpen)
        btnToggleFiltros.classList.toggle('btn-outline-secondary', !isOpen)
      }
    }, { signal })

    const searchInput = container.querySelector('#buscar')
    searchInput?.addEventListener('input', applyFilters, { signal })

    container.querySelector('#filtroWhatsapp')?.addEventListener('change', applyFilters, { signal })
    container.querySelector('#filtroCompletitud')?.addEventListener('change', applyFilters, { signal })
    container.querySelector('#filtroInstrumento')?.addEventListener('change', applyFilters, { signal })

    container.querySelector('#selectOrdenarAlumnos')?.addEventListener('change', (e) => {
      const val = e.target.value
      if (val === 'nombre_asc') {
        state.sortBy = 'nombre'
        state.sortDir = 'asc'
      } else if (val === 'nombre_desc') {
        state.sortBy = 'nombre'
        state.sortDir = 'desc'
      } else if (val === 'instrumento_asc') {
        state.sortBy = 'instrumento'
        state.sortDir = 'asc'
      } else if (val === 'completitud_desc') {
        state.sortBy = '_completitud'
        state.sortDir = 'desc'
      } else if (val === 'completitud_asc') {
        state.sortBy = '_completitud'
        state.sortDir = 'asc'
      }
      applyFilters()
    }, { signal })

    container.querySelector('#btnLimpiarFiltros')?.addEventListener('click', (e) => {
      e.stopPropagation()
      const bInput = container.querySelector('#buscar')
      const wSelect = container.querySelector('#filtroWhatsapp')
      const cSelect = container.querySelector('#filtroCompletitud')
      const iSelect = container.querySelector('#filtroInstrumento')
      const oSelect = container.querySelector('#selectOrdenarAlumnos')
      if (bInput) bInput.value = ''
      if (wSelect) wSelect.value = 'todos'
      if (cSelect) cSelect.value = 'todos'
      if (iSelect) iSelect.value = 'todos'
      if (oSelect) oSelect.value = 'nombre_asc'
      state.sortBy = 'nombre'
      state.sortDir = 'asc'
      applyFilters()
    }, { signal })


    const tbody = container.querySelector('#alumnosTBody')
    tbody?.addEventListener('click', async (e) => {
      const row = e.target.closest('.list-group-item[data-id]')
      if (row && !e.target.closest('[data-action]')) {
        window.router?.navigate('alumno', { id: row.dataset.id })
        return
      }

      const btn = e.target.closest('[data-action]')
      if (!btn) return
      const id = btn.dataset.id
      if (btn.dataset.action === 'edit') {
        window.router?.navigate('alumno', { id })
      } else if (btn.dataset.action === 'delete') {
        openDeleteModal(id)
      } else if (btn.dataset.action === 'whatsapp') {
        openWhatsAppModal(id)
      }
    }, { signal })
  }

  function openWhatsAppModal(id) {
    const alumno = state.alumnosOriginales.find(a => a.id === id)
    if (!alumno || !alumno.telefono) return

    AppModal.open({
      title: 'Enviar WhatsApp a ' + escapeHTML(alumno.nombre),
      size: 'md',
      saveText: 'Enviar WhatsApp',
      body: `
        <div class="mb-3">
          <label class="form-label-compact">Número de destino</label>
          <p class="form-control-plaintext fw-bold mb-0">
            <i class="bi bi-whatsapp text-success me-1"></i> ${formatPhone(alumno.telefono)}
          </p>
        </div>
        <div class="mb-3">
          <label class="form-label-compact">Mensaje</label>
          <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
        </div>
        <p class="text-muted small mb-0">
          Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
        </p>
      `,
      onSave: async (modalBody) => {
        const msg = modalBody.querySelector('#modal-whatsapp-msg').value.trim()
        const url = whatsappLink(alumno.telefono, msg)
        if (url) window.open(url, '_blank')
      }
    })
  }

  function applyFilters() {
    const searchTerm = currentContainer.querySelector('#buscar')?.value.trim().toLowerCase() || ''
    const filtroWhatsapp = currentContainer.querySelector('#filtroWhatsapp')?.value || 'todos'
    const filtroCompletitud = currentContainer.querySelector('#filtroCompletitud')?.value || 'todos'
    const filtroInstrumento = currentContainer.querySelector('#filtroInstrumento')?.value || 'todos'

    state.alumnos = state.alumnosOriginales.filter(a => {
      const matchSearch = !searchTerm ||
        (a.nombre || '').toLowerCase().includes(searchTerm) ||
        (a.instrumento || '').toLowerCase().includes(searchTerm) ||
        (a.telefono || '').toLowerCase().includes(searchTerm) ||
        (a.familiar_nombre || '').toLowerCase().includes(searchTerm) ||
        (a.email || '').toLowerCase().includes(searchTerm) ||
        (a.cedula || '').toLowerCase().includes(searchTerm)

      const tieneWhatsapp = !!a.telefono && a.telefono.trim() !== ''
      const matchWhatsapp = filtroWhatsapp === 'todos' ||
        (filtroWhatsapp === 'con_whatsapp' && tieneWhatsapp) ||
        (filtroWhatsapp === 'sin_whatsapp' && !tieneWhatsapp)

      const { nivel } = a._completitud
      const matchCompletitud = filtroCompletitud === 'todos' ||
        (filtroCompletitud === nivel)

      const tieneInstrumento = !!a.instrumento && a.instrumento.trim() !== '' && a.instrumento.toLowerCase() !== 'sin instrumento especificado'
      const matchInstrumento = filtroInstrumento === 'todos' ||
        (filtroInstrumento === 'con_instrumento' && tieneInstrumento) ||
        (filtroInstrumento === 'sin_instrumento' && !tieneInstrumento)

      return matchSearch && matchWhatsapp && matchCompletitud && matchInstrumento
    })

    let activos = 0
    if (filtroWhatsapp !== 'todos') activos++
    if (filtroCompletitud !== 'todos') activos++
    if (filtroInstrumento !== 'todos') activos++

    const badgeEl = currentContainer.querySelector('#filtrosBadgeCount')
    if (badgeEl) {
      badgeEl.textContent = activos
      if (activos > 0) {
        badgeEl.classList.remove('d-none')
      } else {
        badgeEl.classList.add('d-none')
      }
    }

    const labelEl = currentContainer.querySelector('#filtrosActivosCount')
    if (labelEl) {
      labelEl.textContent = `Filtros activos: ${activos}`
    }

    const { sortBy, sortDir } = state
    state.alumnos.sort((a, b) => {
      let valA, valB
      if (sortBy === '_completitud') {
        valA = a._completitud.porcentaje ?? 0
        valB = b._completitud.porcentaje ?? 0
      } else {
        valA = (a[sortBy] || '').toString().toLowerCase()
        valB = (b[sortBy] || '').toString().toLowerCase()
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    refreshTable()
  }

  function openCreateModal() {
    state.editando = null
    const formInstance = new AlumnoForm()
    AppModal.open({
      title: 'Crear Nuevo Alumno',
      size: 'lg',
      body: formInstance.render(),
      saveText: 'Guardar',
      onSave: async (modalBody) => {
        const validation = formInstance.validate(modalBody)
        if (!validation.valid) {
          const firstErr = Object.values(validation.errors)[0]
          AppToast.error(firstErr)
          return false
        }

        // Prevención de duplicados: antes de crear, avisar si el nuevo alumno
        // coincide fuertemente con uno existente.
        const candidatos = detectarCandidatosDe(validation.data, state.alumnosOriginales)
        if (candidatos.length) {
          return confirmarAlumnoPosibleDuplicado(validation.data, candidatos)
        }

        try {
          const nuevo = await crearAlumno(validation.data)
          nuevo._completitud = calcularCompletitud(nuevo)
          state.alumnosOriginales.push(nuevo)
          applyFilters()
          AppToast.success('Alumno creado exitosamente')
          return true
        } catch (err) {
          console.error(err)
          AppToast.error(err.message || 'Error al crear el alumno')
          return false
        }
      }
    })
  }

  function confirmarAlumnoPosibleDuplicado(data, candidatos) {
    const top = candidatos[0]
    const existente = state.alumnosOriginales.find(a => a.id === top.a.id)
    const nombreExistente = existente?.nombre || existente?.nombre_completo || 'alumno existente'
    const pct = Math.round(top.puntaje * 100)

    return new Promise(resolve => {
      AppModal.open({
        title: 'Posible alumno duplicado',
        size: 'md',
        saveText: 'Crear de todas formas',
        cancelText: 'Revisar duplicados',
        body: `
          <div class="alert alert-warning py-2 small d-flex gap-2 align-items-start mb-3">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>
              El alumno ingresado coincide en un <strong>${pct}%</strong> con
              <strong>${escapeHTML(nombreExistente)}</strong>. ¿Es realmente un alumno nuevo?
            </div>
          </div>
          <p class="text-muted small mb-0">
            Si prefieres no crearlo, pulsa "Revisar duplicados" y usa la herramienta de
            duplicados para revisar o fusionar el registro existente.
          </p>
        `,
        onCancel: () => resolve(false),
        onSave: async () => {
          try {
            const nuevo = await crearAlumno(data)
            nuevo._completitud = calcularCompletitud(nuevo)
            state.alumnosOriginales.push(nuevo)
            applyFilters()
            AppToast.success('Alumno creado exitosamente')
            resolve(true)
            return true
          } catch (err) {
            console.error(err)
            AppToast.error(err.message || 'Error al crear el alumno')
            resolve(false)
            return false
          }
        },
      })
    })
  }

  function openEditModal(id) {
    const capturedId = id
    const alumno = state.alumnosOriginales.find(a => a.id === capturedId)
    if (!alumno) {
      AppToast.error('Alumno no encontrado')
      return
    }

    state.editando = capturedId
    const formInstance = new AlumnoForm({ alumno })

    AppModal.open({
      title: 'Editar Alumno',
      size: 'lg',
      body: formInstance.render(),
      saveText: 'Guardar cambios',
      onSave: async (modalBody) => {
        const validation = formInstance.validate(modalBody)
        if (!validation.valid) {
          const firstErr = Object.values(validation.errors)[0]
          AppToast.error(firstErr)
          return false
        }

        try {
          await actualizarAlumno(capturedId, validation.data)
          const idx = state.alumnosOriginales.findIndex(a => a.id === capturedId)
          if (idx !== -1) {
            const updatedAlumno = { ...state.alumnosOriginales[idx], ...validation.data }
            updatedAlumno._completitud = calcularCompletitud(updatedAlumno)
            state.alumnosOriginales[idx] = updatedAlumno
          }
          applyFilters()
          AppToast.success('Alumno actualizado correctamente')
          return true
        } catch (err) {
          console.error('[alumnosView] Error al actualizar alumno:', err)
          AppToast.error(err.message || 'Error al guardar los cambios')
          return false
        }
      },
      onCancel: (modalBody) => {
        const hasChanges = formHasChanges(modalBody, alumno)
        if (!hasChanges) {
          AppModal.close()
          return
        }
        AppModal.open({
          title: 'Cambios sin guardar',
          body: '<p>Tenés cambios sin guardar. ¿Querés salir de todas formas?</p>',
          saveText: 'Salir sin guardar',
          onSave: () => AppModal.close(),
          onCancel: () => {}, // stay in the edit modal
        })
      },
    })
  }

  function formHasChanges(modalBody, alumnoOriginal) {
    if (!modalBody || !alumnoOriginal) return false
    const nombre = modalBody.querySelector('#modal-nombre')?.value || ''
    const email = modalBody.querySelector('#modal-email')?.value || ''
    const instrumento = modalBody.querySelector('#modal-instrumento')?.value || ''
    
    return nombre.trim() !== (alumnoOriginal.nombre || '') ||
           email.trim().toLowerCase() !== (alumnoOriginal.email || '').toLowerCase() ||
           instrumento.trim() !== (alumnoOriginal.instrumento || '')
  }

  function openViewModal(id) {
    const alumno = state.alumnosOriginales.find(a => a.id === id)
    if (!alumno) {
      AppToast.error('Alumno no encontrado')
      return
    }

    state.viewingId = id
    AppModal.open({
      title: escapeHTML(alumno.nombre),
      hideSave: true,
      cancelText: 'Cerrar',
      size: 'lg',
      body: `
        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Nombre</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.nombre)}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Teléfono (WhatsApp)</label>
              <p class="form-control-plaintext">${alumno.telefono ? `<a href="tel:${alumno.telefono}">${formatPhone(alumno.telefono)}</a>` : '-'}</p>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Email</label>
              <p class="form-control-plaintext">${alumno.email ? `<a href="mailto:${alumno.email}">${escapeHTML(alumno.email)}</a>` : '-'}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Cédula</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.cedula || '-')}</p>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Fecha de Nacimiento</label>
              <p class="form-control-plaintext">${alumno.fecha_nacimiento ? formatDate(alumno.fecha_nacimiento) : '-'}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Género</label>
              <p class="form-control-plaintext">${escapeHTML(formatGenero(alumno.genero))}</p>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Instrumento</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.instrumento || 'Sin instrumento especificado')}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Dirección</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.direccion || '-')}</p>
            </div>
          </div>
        </div>

        ${(alumno.contacto_emergencia_nombre || alumno.contacto_emergencia_telefono) ? `
        <div class="row">
          <div class="col-12">
            <h6 class="text-danger"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Nombre</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.contacto_emergencia_nombre || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Teléfono</label>
              <p class="form-control-plaintext">${alumno.contacto_emergencia_telefono ? `<a href="tel:${alumno.contacto_emergencia_telefono}">${formatPhone(alumno.contacto_emergencia_telefono)}</a>` : '-'}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Parentesco</label>
              <p class="form-control-plaintext">${getParentescoLabel(alumno.contacto_emergencia_parentesco)}</p>
            </div>
          </div>
        </div>
        ` : ''}

        ${(alumno.familiar_nombre || alumno.familiar_telefono) ? `
        <div class="row">
          <div class="col-12">
            <h6 class="text-primary"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Nombre</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.familiar_nombre || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Teléfono</label>
              <p class="form-control-plaintext">${alumno.familiar_telefono ? `<a href="tel:${alumno.familiar_telefono}">${formatPhone(alumno.familiar_telefono)}</a>` : '-'}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Parentesco</label>
              <p class="form-control-plaintext">${getParentescoLabel(alumno.familiar_parentesco)}</p>
            </div>
          </div>
        </div>
        ` : ''}

        ${(alumno.condiciones_medicas || alumno.alergias || alumno.medicamentos) ? `
        <div class="row">
          <div class="col-12">
            <h6 class="text-warning"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Condiciones</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.condiciones_medicas || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Alergias</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.alergias || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Medicamentos</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.medicamentos || '-')}</p>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="row mt-2 pt-2 border-top">
          <div class="col-6">
            <label class="form-label fw-bold">Creado</label>
            <p class="form-control-plaintext small">${formatDate(alumno.created_at)}</p>
          </div>
          <div class="col-6">
            <label class="form-label fw-bold">Última actualización</label>
            <p class="form-control-plaintext small">${formatDate(alumno.updated_at)}</p>
          </div>
        </div>
        
        <!-- Wizard fields: Perfil Musical -->
        ${(alumno.tiene_conocimientos_musicales !== undefined || alumno.interes_musical) ? `
        <div class="row mt-3 pt-2 border-top">
          <div class="col-12">
            <h6 class="text-info"><i class="bi bi-music-note-beamed me-1"></i>Perfil Musical</h6>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Conocimientos previos</label>
              <p class="form-control-plaintext">${alumno.tiene_conocimientos_musicales ? 'Sí' : 'No'}</p>
            </div>
          </div>
          ${alumno.tiene_conocimientos_musicales ? `
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Instrumento previo</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.instrumento_previo || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Nivel lectura musical</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.nivel_lectura_musical || '-')}</p>
            </div>
          </div>
          ` : ''}
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Interés musical</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.interes_musical || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Instrumento de interés</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.instrumento_interes || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Requiere iniciación musical</label>
              <p class="form-control-plaintext">${alumno.iniciacion_musical_requerida ? 'Sí' : 'No'}</p>
            </div>
          </div>
          ${alumno.iniciacion_musical_requerida ? `
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Apto para audición desde</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.fecha_elegible_audicion || '-')}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Fin período iniciación</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.fecha_fin_iniciacion || '-')}</p>
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Wizard fields: Salud -->
        ${(alumno.problemas_conducta !== undefined || alumno.alergias_descripcion || alumno.tiene_condicion_transmisible) ? `
        <div class="row mt-3 pt-2 border-top">
          <div class="col-12">
            <h6 class="text-warning"><i class="bi bi-bandaid me-1"></i>Salud y Conducta (Wizard)</h6>
          </div>
          ${alumno.alergias_descripcion ? `
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Descripción alergias</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.alergias_descripcion)}</p>
            </div>
          </div>
          ` : ''}
          ${alumno.tiene_condicion_transmisible && alumno.condicion_transmisible_descripcion ? `
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Condición transmisible</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.condicion_transmisible_descripcion)}</p>
            </div>
          </div>
          ` : ''}
          ${alumno.alergia_medicamento && alumno.alergia_medicamento_descripcion ? `
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Alergia medicamento</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.alergia_medicamento_descripcion)}</p>
            </div>
          </div>
          ` : ''}
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Impedimento social</label>
              <p class="form-control-plaintext">${alumno.impedimento_social ? 'Sí' : 'No'}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-2">
              <label class="form-label fw-bold">Problemas de conducta</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.problemas_conducta || 'no')}</p>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Wizard fields: Datos Escolares -->
        ${(alumno.centro_estudios || alumno.grado_nivel || alumno.padres_en_vida) ? `
        <div class="row mt-3 pt-2 border-top">
          <div class="col-12">
            <h6 class="text-secondary"><i class="bi bi-mortarboard me-1"></i>Datos Escolares</h6>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Centro de estudios</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.centro_estudios || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Grado / Nivel</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.grado_nivel || '-')}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Padres en vida</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.padres_en_vida || '-')}</p>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Wizard fields: Compromisos -->
        ${(alumno.acepta_beca_4500 !== undefined || alumno.acepta_pago_600 !== undefined) ? `
        <div class="row mt-3 pt-2 border-top">
          <div class="col-12">
            <h6 class="text-success"><i class="bi bi-check-circle me-1"></i>Compromisos</h6>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Acepta beca RD$4,500</label>
              <p class="form-control-plaintext">${alumno.acepta_beca_4500 ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Acepta aporte RD$600</label>
              <p class="form-control-plaintext">${alumno.acepta_pago_600 ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</p>
            </div>
          </div>
          ${alumno.fecha_aceptacion_compromisos ? `
          <div class="col-md-4">
            <div class="mb-2">
              <label class="form-label fw-bold">Fecha aceptación</label>
              <p class="form-control-plaintext small">${formatDate(alumno.fecha_aceptacion_compromisos)}</p>
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
          <button class="btn btn-outline-danger" id="modal-view-btn-delete">
            <i class="bi bi-trash me-1"></i> Eliminar
          </button>
          <button class="btn btn-primary" id="modal-view-btn-edit">
            <i class="bi bi-pencil me-1"></i> Editar Perfil
          </button>
        </div>
      `,
      onShow: (modalBody) => {
        modalBody.querySelector('#modal-view-btn-edit')?.addEventListener('click', () => {
          AppModal.close()
          setTimeout(() => openEditModal(alumno.id), 300)
        })
        modalBody.querySelector('#modal-view-btn-delete')?.addEventListener('click', () => {
          AppModal.close()
          setTimeout(() => openDeleteModal(alumno.id), 300)
        })
      }
    })
  }

  function openDeleteModal(id) {
    const capturedId = id
    const alumno = state.alumnosOriginales.find(a => a.id === capturedId)
    if (!alumno) {
      AppToast.error('Alumno no encontrado')
      return
    }

    AlumnoDeleteModal.open({
      alumnoId: capturedId,
      alumnoNombre: alumno.nombre || alumno.nombre_completo || 'Alumno',
      onDeleted: () => {
        state.alumnosOriginales = state.alumnosOriginales.filter(a => a.id !== capturedId)
        applyFilters()
      }
    })
  }

  function refreshTable() {
    const tbody = currentContainer.querySelector('#alumnosTBody')
    if (!tbody) return

    if (state.alumnos.length === 0) {
      tbody.innerHTML = ''
    } else {
      tbody.innerHTML = renderTableRows(state.alumnos)
    }

    const emptyContainer = currentContainer.querySelector('#emptyContainer')
    if (emptyContainer) {
      emptyContainer.innerHTML = state.alumnos.length === 0 ? renderEmpty() : ''
    }

    const countEl = currentContainer.querySelector('.alumnos-header-premium p.text-muted')
    if (countEl) {
      countEl.textContent = `${state.alumnos.length} alumnos en total`
    }
  }

  function exportarAlumnosCSV() {
    if (state.alumnosOriginales.length === 0) {
      AppToast.error('No hay alumnos para exportar')
      return
    }

    const headers = ['Nombre', 'Email', 'Teléfono', 'Estado', 'Fecha Nac.', 'Instrumento', 'Cédula', 'Familiar', 'Municipio']
    const rows = state.alumnosOriginales.map(a => [
      a.nombre || '',
      a.email || '',
      a.telefono_principal || a.telefono || '',
      a.is_active ? 'Activo' : 'Inactivo',
      a.fecha_nacimiento || '',
      a.instrumento_principal || '',
      a.cedula || '',
      a.familiar_nombre || '',
      a.municipio_residencia || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `alumnos-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 100)

    AppToast.success('CSV exportado exitosamente')
  }
}

import '../styles/maestros.css'
import { renderPageHeader, renderFilterPanel } from '../../../shared/components/pageShell.js'
import { AppModal } from '../../../shared/components/AppModal.js'

import {
  obtenerMaestros,
  crearMaestroConAuth,
  actualizarMaestro,
  previsualizarRetiroMaestro,
  retirarMaestroSeguro,
  reactivarMaestroSeguro,
  eliminarMaestro,
  validarEmail,
} from '../api/maestrosApi.js'
import {
  obtenerEstadoCredencialesMaestro,
  revelarCredencialesMaestro,
  generarCredencialesMaestro,
} from '../api/maestroCredencialesApi.js'
import { escapeHTML, getStatusColor, getStatusLabel, getInitials } from '../utils/maestrosUtils.js'
import {
  obtenerClasesPorMaestro,
  actualizarClase,
  obtenerAlumnosInscritosPorClases,
} from '../../clases/api/clasesApi.js'
import { openClaseModal } from '../../clases/components/claseModal.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { descargarPdfReporteMaestro } from '../domain/generarPdfReporteMaestro.js'
import { openHistoricoMaestroModal } from '../components/maestroHistoricoModal.js'

const state = {
  maestros: [],
  maestrosOriginales: [],
  editando: null,
  deletingId: null,
}

const VALIDATION = {
  nombreMax: 100,
}

let currentContainer = null

// ─── Entry point ────────────────────────────────────────────────────────────

const ESPECTACULOS_PREDEFINIDOS = [
  'Piano',
  'Guitarra',
  'Violín',
  'Viola',
  'Cello',
  'Contrabajo',
  'Flauta',
  'Clarinete',
  'Oboe',
  'Fagot',
  'Saxofón',
  'Trompeta',
  'Trombón',
  'Corno',
  'Tuba',
  'Percusión',
  'Batería',
  'Canto',
  'Teoría',
  'Solfeo',
  'Dirección',
  'Composición',
  'Arreglos',
]

export async function renderMaestrosView(container) {
  try {
    renderLoading(container)
    const maestros = await obtenerMaestros()
    state.maestros = maestros
    state.maestrosOriginales = [...maestros]
    renderContent(container)
    attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

// ─── Render helpers ─────────────────────────────────────────────────────────

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
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
  container
    .querySelector('#retryBtn')
    ?.addEventListener('click', () => renderMaestrosView(container))
}

function renderEspecialidadesChips(especialidades = [], inputId = 'modal-especialidades-input') {
  const containerId = 'modal-especialidades-container'
  return `
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="${containerId}">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${especialidades
            .map(
              (e) => `
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${escapeHTML(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${escapeHTML(e)}" style="cursor:pointer;margin-left:4px;"></i>
            </span>
          `,
            )
            .join('')}
        </div>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="${inputId}" placeholder="Escribir y presionar Enter...">
          <button type="button" class="btn btn-outline-secondary btn-sm-compact" id="btnAddEspecialidad">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        <div class="mt-2">
          <small class="text-muted">Sugerencias:</small>
          <div class="d-flex flex-wrap gap-1 mt-1">
            ${ESPECTACULOS_PREDEFINIDOS.slice(0, 8)
              .map(
                (e) => `
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${escapeHTML(e)}">${escapeHTML(e)}</button>
            `,
              )
              .join(', ')}
          </div>
        </div>
      </div>
    </div>
  `
}

function getEspecialidadesFromModal(modalBody) {
  const container = modalBody.querySelector('.especialidades-chips-container')
  if (!container) return []
  const chips = container.querySelectorAll('.chip-item')
  return Array.from(chips).map((chip) => chip.textContent.replace(/×$/, '').trim())
}

function attachEspecialidadesEvents(modalBody, onChange) {
  const input = modalBody.querySelector('#modal-especialidades-input')
  const addBtn = modalBody.querySelector('#btnAddEspecialidad')
  const container = modalBody.querySelector('.especialidades-chips-container')

  const addEspecialidad = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = getEspecialidadesFromModal(modalBody)
    if (!current.includes(trimmed)) {
      const wrapper = container.querySelector('.chips-wrapper')
      const chip = document.createElement('span')
      chip.className = 'badge bg-primary-subtle text-primary rounded-pill chip-item'
      chip.innerHTML = `${escapeHTML(trimmed)}<i class="bi bi-x-lg chip-remove" data-especialidad="${escapeHTML(trimmed)}" style="cursor:pointer;margin-left:4px;"></i>`
      wrapper.appendChild(chip)
      if (onChange) onChange()
    }
    input.value = ''
  }

  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEspecialidad(input.value)
    }
  })

  addBtn?.addEventListener('click', () => addEspecialidad(input.value))

  container?.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip-remove')) {
      e.target.closest('.chip-item').remove()
      if (onChange) onChange()
    }
    if (e.target.classList.contains('suggest-chip')) {
      e.preventDefault()
      addEspecialidad(e.target.dataset.especialidad)
    }
  })
}

function renderContent(container) {
  const totalMaestros = state.maestrosOriginales.length
  const totalActivos = state.maestrosOriginales.filter(a => a.is_active ?? true).length
  const totalConInstrumento = state.maestrosOriginales.filter(a => !!a.instrumento && a.instrumento.trim() !== '' && a.instrumento.toLowerCase() !== 'sin instrumento especificado').length
  const totalConWhatsapp = state.maestrosOriginales.filter(a => !!a.telefono && a.telefono.trim() !== '').length

  // Obtener lista única de instrumentos para el filtro
  const instrumentosList = Array.from(new Set(
    state.maestrosOriginales
      .map(m => m.instrumento?.trim())
      .filter(Boolean)
  )).sort()

  container.innerHTML = `
    <div class="page-container">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-person-badge-fill fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Plantel de Maestros</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Directorio docente y gestión de cátedras institucionales</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Maestros en servicio">
                <i class="bi bi-person-check-fill me-1"></i><span id="badgeActivosMaestros">${totalActivos}/${totalMaestros}</span> Activos
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Docentes con cátedra asignada">
                <i class="bi bi-music-note-beamed me-1"></i><span id="badgeCatedraMaestros">${totalConInstrumento}</span> con Cátedra
              </span>
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Docentes con contacto WhatsApp">
                <i class="bi bi-whatsapp me-1"></i><span id="badgeWhatsappMaestros">${totalConWhatsapp}</span> con WhatsApp
              </span>
            </div>
          </div>

          <!-- Toolbar de Botones con 0.85rem de separación -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnExportarCSV" title="Exportar listado a CSV" style="font-size:0.78rem;">
              <i class="bi bi-file-earmark-spreadsheet"></i>
              <span class="d-none d-sm-inline">CSV</span>
            </button>
            <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnAgregarMaestro" style="font-size:0.78rem;">
              <i class="bi bi-person-plus-fill"></i>
              <span>Nuevo Maestro</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda y Botón Desplegable de Filtros & Orden -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
              <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="buscar" placeholder="Buscar por nombre, email, cédula o cátedra..." autocomplete="off" style="font-size:0.8rem;">
            </div>
          </div>

          <div class="d-flex align-items-center" style="gap: 0.85rem;">
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosMaestros" type="button" aria-expanded="false" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros & Orden</span>
              <span class="badge bg-primary text-white rounded-pill px-1.5 ms-1 d-none" id="filtrosBadgeCountMaestros" style="font-size:0.68rem;">0</span>
            </button>

            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosMaestros" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Desplegable de Filtros y Ordenamiento -->
        <div class="collapse pt-2.5" id="panelFiltrosMaestros">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Cátedra / Instrumento</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroInstrumentoMaestro" style="font-size:0.8rem;">
                  <option value="todos">Todos los instrumentos</option>
                  ${instrumentosList.map(inst => `<option value="${escapeHTML(inst)}">${escapeHTML(inst)}</option>`).join('')}
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado Operativo</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroEstado" style="font-size:0.8rem;">
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Solo Activos</option>
                  <option value="inactivo">Solo Inactivos</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Contacto WhatsApp</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroWhatsappMaestro" style="font-size:0.8rem;">
                  <option value="todos">Todos</option>
                  <option value="con_whatsapp">Con WhatsApp</option>
                  <option value="sin_whatsapp">Sin WhatsApp</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                  <span class="input-group-text bg-body border-end-0 py-1.5 text-muted" style="font-size:0.75rem;"><i class="bi bi-sort-down"></i></span>
                  <select class="form-select form-select-sm border-start-0 py-1.5 fw-semibold text-primary" id="selectOrdenarMaestros" style="font-size:0.8rem;">
                    <option value="nombre_asc">Nombre (A-Z)</option>
                    <option value="nombre_desc">Nombre (Z-A)</option>
                    <option value="instrumento_asc">Instrumento (A-Z)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Contenedor de Cuadrícula de Maestros (Al menos 2 por fila en móviles) -->
      <div class="w-100">
        <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3 w-100 m-0" id="maestrosTBody">
          ${renderTableRows(state.maestros)}
        </div>
      </div>

    </div>
  `
}


function renderTableRows(maestros) {
  if (!maestros.length) {
    return `
      <div class="col-12 text-center py-5 w-100 text-muted">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No se encontraron maestros con los criterios seleccionados.
      </div>`
  }
  return maestros
    .map((a) => {
      const nombre = a.nombre || a.name || '-'
      const isActive = a.is_active ?? true
      const rawPhone = a.telefono ? a.telefono.replace(/\D/g, '') : null

      return `
        <div class="col p-1 p-md-2">
          <div class="card maestro-card-modern h-100 p-2.5 p-md-3 d-flex flex-column justify-content-between position-relative overflow-hidden" data-id="${a.id}" style="cursor: pointer;">
            
            <!-- Encabezado de la Tarjeta: Estado, WhatsApp y Nombre -->
            <div class="mb-2.5">
              <div class="d-flex align-items-center justify-content-between gap-1 mb-1.5">
                <span class="badge ${isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'} rounded-pill py-0.5 px-2 d-inline-flex align-items-center gap-1" style="font-size: 0.68rem;">
                  ${isActive ? '<span class="status-dot-pulse bg-success"></span> Activo' : 'Inactivo'}
                </span>
                ${rawPhone ? `
                  <a href="https://wa.me/${rawPhone}" target="_blank" rel="noopener" class="text-success small p-0 lh-1" title="Chatear por WhatsApp" onclick="event.stopPropagation();">
                    <i class="bi bi-whatsapp fs-6"></i>
                  </a>
                ` : ''}
              </div>
              <h6 class="maestro-card-name text-truncate mb-0" title="${escapeHTML(nombre)}">
                ${escapeHTML(nombre)}
              </h6>
            </div>

            <!-- Sección Media: Cátedra Principal y Datos de Contacto -->
            <div class="mb-3">
              <div class="mb-2">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 text-truncate w-100 text-start d-flex align-items-center gap-1.5 rounded-3" style="font-size: 0.76rem;" title="Cátedra: ${escapeHTML(a.instrumento || 'Sin cátedra asignada')}">
                  <i class="bi bi-music-note-beamed text-primary flex-shrink-0"></i>
                  <span class="text-truncate fw-semibold">${escapeHTML(a.instrumento || 'Sin cátedra asignada')}</span>
                </span>
              </div>

              <div class="d-flex flex-column gap-1 text-muted small" style="font-size: 0.76rem;">
                ${a.telefono ? `
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted"><i class="bi bi-telephone me-1.5 text-secondary"></i>Teléfono:</span>
                    <span class="fw-medium text-body text-truncate" style="max-width: 120px;">${escapeHTML(a.telefono)}</span>
                  </div>
                ` : `
                  <div class="d-flex align-items-center justify-content-between text-muted opacity-75">
                    <span><i class="bi bi-telephone me-1.5"></i>Teléfono:</span>
                    <span class="fst-italic">No registrado</span>
                  </div>
                `}

                ${a.email ? `
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted"><i class="bi bi-envelope me-1.5 text-secondary"></i>Email:</span>
                    <span class="text-body text-truncate" style="max-width: 120px;" title="${escapeHTML(a.email)}">${escapeHTML(a.email)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Barra Inferior de Acciones Operativas -->
            <div class="pt-2 border-top border-body-tertiary d-flex align-items-center justify-content-end gap-1.5 mt-auto">
              <button class="btn btn-sm btn-outline-info maestro-action-btn" data-action="historico" data-id="${a.id}" title="Histórico de Clases y Asistencias">
                <i class="bi bi-clock-history"></i>
              </button>

              <button class="btn btn-sm btn-outline-secondary maestro-action-btn" data-action="pdf" data-id="${a.id}" title="Descargar Ficha PDF">
                <i class="bi bi-file-earmark-pdf"></i>
              </button>

              ${rawPhone ? `
                <button class="btn btn-sm btn-outline-success maestro-action-btn" data-action="whatsapp" data-id="${a.id}" title="Enviar mensaje WhatsApp" ${!isActive ? 'disabled' : ''}>
                  <i class="bi bi-whatsapp"></i>
                </button>
              ` : ''}

              <button class="btn btn-sm btn-outline-danger maestro-action-btn" data-action="delete" data-id="${a.id}" title="${isActive ? 'Inactivar maestro' : 'Eliminar permanentemente'}">
                <i class="bi bi-trash3"></i>
              </button>
            </div>

          </div>
        </div>
      `
    })
    .join('')
}

// ─── Events ─────────────────────────────────────────────────────────────────

function attachEvents(container) {
  currentContainer = container

  container.querySelector('#btnAgregarMaestro')?.addEventListener('click', () => openCreateModal())
  container.querySelector('#btnExportarCSV')?.addEventListener('click', () => exportarMaestrosCSV())

  // Toggle Filtros Panel
  const toggleBtn = container.querySelector('#btnToggleFiltrosMaestros')
  const filterPanel = container.querySelector('#panelFiltrosMaestros')
  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    if (filterPanel) {
      filterPanel.classList.toggle('show')
      const isOpen = filterPanel.classList.contains('show')
      toggleBtn.setAttribute('aria-expanded', String(isOpen))
      toggleBtn.classList.toggle('btn-primary', isOpen)
      toggleBtn.classList.toggle('text-white', isOpen)
      toggleBtn.classList.toggle('btn-outline-secondary', !isOpen)
    }
  })

  const searchInput = container.querySelector('#buscar')
  searchInput?.addEventListener('input', () => applyFilters())
  container.querySelector('#filtroEstado')?.addEventListener('change', () => applyFilters())
  container.querySelector('#filtroInstrumentoMaestro')?.addEventListener('change', () => applyFilters())
  container.querySelector('#filtroWhatsappMaestro')?.addEventListener('change', () => applyFilters())
  container.querySelector('#selectOrdenarMaestros')?.addEventListener('change', () => applyFilters())

  container.querySelector('#btnLimpiarFiltrosMaestros')?.addEventListener('click', (e) => {
    e.stopPropagation()
    if (searchInput) searchInput.value = ''
    const estadoSelect = container.querySelector('#filtroEstado')
    const instSelect = container.querySelector('#filtroInstrumentoMaestro')
    const wsSelect = container.querySelector('#filtroWhatsappMaestro')
    const ordenSelect = container.querySelector('#selectOrdenarMaestros')
    if (estadoSelect) estadoSelect.value = 'todos'
    if (instSelect) instSelect.value = 'todos'
    if (wsSelect) wsSelect.value = 'todos'
    if (ordenSelect) ordenSelect.value = 'nombre_asc'
    applyFilters()
  })

  container.querySelector('#maestrosTBody')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit"]')
    if (editBtn) {
      e.stopPropagation()
      openEditModal(editBtn.dataset.id)
      return
    }

    const historicoBtn = e.target.closest('[data-action="historico"]')
    if (historicoBtn) {
      e.stopPropagation()
      const maestro = state.maestrosOriginales.find((m) => m.id === historicoBtn.dataset.id)
      if (maestro) openHistoricoMaestroModal(maestro)
      return
    }

    const deleteBtn = e.target.closest('[data-action="delete"]')
    if (deleteBtn) {
      e.stopPropagation()
      openDeleteModal(deleteBtn.dataset.id)
      return
    }

    const wsBtn = e.target.closest('[data-action="whatsapp"]')
    if (wsBtn) {
      e.stopPropagation()
      openWhatsAppModal(wsBtn.dataset.id)
      return
    }

    const pdfBtn = e.target.closest('[data-action="pdf"]')
    if (pdfBtn) {
      e.stopPropagation()
      const maestro = state.maestrosOriginales.find((m) => m.id === pdfBtn.dataset.id)
      if (maestro) descargarReporteMaestroPdf(maestro, pdfBtn)
      return
    }

    const card = e.target.closest('.maestro-card-modern[data-id], .list-group-item[data-id]')
    if (card) {
      openViewModal(card.dataset.id)
    }
  })
}

async function descargarReporteMaestroPdf(maestro, btn) {
  if (btn) {
    btn.disabled = true
    btn.style.opacity = '0.5'
  }
  try {
    const clases = await obtenerClasesPorMaestro(maestro.id)
    const claseIds = clases.map((c) => c.id)
    let inscripcionesMap = {}
    if (claseIds.length > 0) {
      inscripcionesMap = await obtenerAlumnosInscritosPorClases(claseIds)
    }
    const { data: salones } = await supabase.from('salones').select('*')
    descargarPdfReporteMaestro(maestro, clases, inscripcionesMap, { salones })
    showToast('Reporte PDF descargado exitosamente', 'success')
  } catch (err) {
    console.error('Error al generar PDF:', err)
    showToast('Error al generar PDF: ' + err.message, 'error')
  } finally {
    if (btn) {
      btn.disabled = false
      btn.style.opacity = '1'
    }
  }
}

function openWhatsAppModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro || !maestro.telefono) return

  const telefonoLimpio = maestro.telefono.replace(/\D/g, '')

  AppModal.open({
    title: 'Enviar WhatsApp a ' + escapeHTML(maestro.nombre || maestro.name || ''),
    size: 'md',
    saveText: 'Enviar WhatsApp',
    body: `
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> +${telefonoLimpio}
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
      const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank')
    },
  })
}

function getContainer() {
  if (currentContainer && document.body.contains(currentContainer)) {
    return currentContainer
  }
  return document.querySelector('#maestrosTBody')?.closest('.page-container') || document.querySelector('#app-main') || document
}

// ─── Filters ─────────────────────────────────────────────────────────────────

function applyFilters() {
  const container = getContainer()
  const searchTerm = container?.querySelector('#buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = container?.querySelector('#filtroEstado')?.value || 'todos'
  const filtroInstrumento = container?.querySelector('#filtroInstrumentoMaestro')?.value || 'todos'
  const filtroWhatsapp = container?.querySelector('#filtroWhatsappMaestro')?.value || 'todos'
  const orden = container?.querySelector('#selectOrdenarMaestros')?.value || 'nombre_asc'

  state.maestros = state.maestrosOriginales.filter((a) => {
    const nombre = (a.nombre || a.name || '').toLowerCase()
    const matchSearch =
      !searchTerm ||
      nombre.includes(searchTerm) ||
      (a.email || '').toLowerCase().includes(searchTerm) ||
      (a.instrumento || '').toLowerCase().includes(searchTerm) ||
      (a.especialidad || '').toLowerCase().includes(searchTerm) ||
      (a.especialidades || []).some((e) => e.toLowerCase().includes(searchTerm))

    const isActive = a.is_active ?? true
    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && isActive) ||
      (filtroEstado === 'inactivo' && !isActive)

    const matchInstrumento =
      filtroInstrumento === 'todos' ||
      (a.instrumento || '').trim().toLowerCase() === filtroInstrumento.toLowerCase()

    const matchWhatsapp =
      filtroWhatsapp === 'todos' ||
      (filtroWhatsapp === 'con_whatsapp' && !!a.telefono && a.telefono.trim() !== '') ||
      (filtroWhatsapp === 'sin_whatsapp' && (!a.telefono || a.telefono.trim() === ''))

    return matchSearch && matchEstado && matchInstrumento && matchWhatsapp
  })

  // Ordenamiento
  state.maestros.sort((a, b) => {
    const nomA = (a.nombre || a.name || '').toLowerCase()
    const nomB = (b.nombre || b.name || '').toLowerCase()
    if (orden === 'nombre_asc') return nomA.localeCompare(nomB)
    if (orden === 'nombre_desc') return nomB.localeCompare(nomA)
    if (orden === 'instrumento_asc') return (a.instrumento || '').localeCompare(b.instrumento || '')
    return 0
  })

  let activos = 0
  if (filtroEstado !== 'todos') activos++
  if (filtroInstrumento !== 'todos') activos++
  if (filtroWhatsapp !== 'todos') activos++

  const badgeEl = container?.querySelector('#filtrosBadgeCountMaestros')
  if (badgeEl) {
    badgeEl.textContent = activos
    if (activos > 0) {
      badgeEl.classList.remove('d-none')
    } else {
      badgeEl.classList.add('d-none')
    }
  }

  refreshTable()
}


// ─── Modal openers ───────────────────────────────────────────────────────────

function openCreateModal() {
  state.editando = null
  AppModal.open({
    title: 'Crear Nuevo Maestro',
    body: `<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${VALIDATION.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required placeholder="email@ejemplo.com">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Contraseña *</label>
        <input type="password" class="form-control input-dense" id="modal-password" required placeholder="Contraseña para iniciar sesión" minlength="6">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" placeholder="+58 412 1234567">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required placeholder="Violín">
      </div>
      ${renderEspecialidadesChips([], 'modal-especialidades-input')}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripción..."></textarea>
      </div>
    </form>`,
    onShow: (modalBody) => attachEspecialidadesEvents(modalBody),
    saveText: 'Crear Maestro',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
      const password = modalBody.querySelector('#modal-password')?.value
      const telefono = modalBody.querySelector('#modal-telefono').value.trim()
      const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
      const bio = modalBody.querySelector('#modal-bio').value.trim()

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error')
        return false
      }
      if (!email) {
        showToast('El email es obligatorio', 'error')
        return false
      }
      if (!isValidEmail(email)) {
        showToast('El formato del email no es válido', 'error')
        return false
      }
      if (!password || password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error')
        return false
      }
      if (!instrumento) {
        showToast('El instrumento es obligatorio', 'error')
        return false
      }

      const emailExiste = await validarEmail(email)
      if (emailExiste) {
        showToast('El email ya está registrado', 'error')
        return false
      }

      const especialidades = getEspecialidadesFromModal(modalBody)

      await crearMaestroConAuth({
        nombre,
        email,
        password,
        telefono,
        instrumento,
        especialidades,
        bio,
      })

      const maestros = await obtenerMaestros()
      state.maestros = maestros
      state.maestrosOriginales = [...maestros]
      applyFilters()
      showToast('Maestro creado exitosamente. Ya puede iniciar sesión.', 'success')
    },
  })
}

function openEditModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro) {
    showToast('Maestro no encontrado', 'error')
    return
  }

  state.editando = id
  AppModal.open({
    title: 'Editar Maestro',
    body: `<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" value="${escapeHTML(maestro.nombre || maestro.name || '')}">
        <small class="text-muted" id="modal-nombreCount">${(maestro.nombre || maestro.name || '').length}/${VALIDATION.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${escapeHTML(maestro.email || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${escapeHTML(maestro.telefono || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${escapeHTML(maestro.instrumento || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${escapeHTML(maestro.especialidad || '')}">
      </div>
      ${renderEspecialidadesChips(maestro.especialidades || [], 'modal-especialidades-input')}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${escapeHTML(maestro.bio || '')}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${maestro.is_active !== false ? 'checked' : ''}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,
    onShow: (modalBody) => attachEspecialidadesEvents(modalBody),
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
      const telefono = modalBody.querySelector('#modal-telefono').value.trim()
      const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
      const especialidad = modalBody.querySelector('#modal-especialidad').value.trim()
      const bio = modalBody.querySelector('#modal-bio').value.trim()
      const esActivo = modalBody.querySelector('#modal-esActivo').checked

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error')
        return false
      }
      if (!email) {
        showToast('El email es obligatorio', 'error')
        return false
      }
      if (!isValidEmail(email)) {
        showToast('El formato del email no es válido', 'error')
        return false
      }

      if (email && maestro.email !== email) {
        const emailExiste = await validarEmail(email)
        if (emailExiste) {
          showToast('El email ya está registrado', 'error')
          return false
        }
      }

      const especialidades = getEspecialidadesFromModal(modalBody)
      const datosMaestro = {
        nombre,
        email: email || null,
        telefono: telefono || null,
        instrumento: instrumento || null,
        especialidad: especialidad || null,
        bio: bio || null,
        is_active: esActivo,
        especialidades,
      }
      await actualizarMaestro(state.editando, datosMaestro)
      const idx = state.maestrosOriginales.findIndex((a) => a.id === state.editando)
      if (idx !== -1)
        state.maestrosOriginales[idx] = { ...state.maestrosOriginales[idx], ...datosMaestro }
      applyFilters()
      showToast('Maestro actualizado correctamente', 'success')
    },
  })
}

function openViewModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro) {
    showToast('Maestro no encontrado', 'error')
    return
  }

  const nombre = maestro.nombre || maestro.name || '-'
  const isActive = maestro.is_active ?? true
  const headerActionsHTML = `
    <div class="d-flex align-items-center gap-1">
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-historico" style="background: rgba(255,255,255,0.25); font-size: 0.8rem; border-radius: 6px; font-weight: 600;" type="button" title="Ver Histórico de Clases y Asistencias">
        <i class="bi bi-clock-history me-1"></i>Histórico
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-pdf" style="background: rgba(255,255,255,0.18); font-size: 0.8rem; border-radius: 6px;" type="button" title="Descargar Reporte PDF">
        <i class="bi bi-file-earmark-pdf me-1"></i>PDF
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-edit" style="background: rgba(255,255,255,0.18); font-size: 0.8rem; border-radius: 6px;" type="button" title="Editar Perfil">
        <i class="bi bi-pencil me-1"></i>Editar
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-delete" style="background: rgba(220, 53, 69, 0.45); font-size: 0.8rem; border-radius: 6px;" type="button" title="Retirar maestro de forma segura">
        <i class="bi bi-person-dash me-1"></i>Retirar
      </button>
    </div>
  `

  AppModal.open({
    title: nombre,
    headerActions: headerActionsHTML,
    autoFocus: false,
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <!-- Banner Acceso Directo a Histórico de Clases -->
      <div class="card bg-light border p-3 mb-3 d-flex flex-row align-items-center justify-content-between rounded-3">
        <div>
          <div class="fw-bold text-primary mb-1"><i class="bi bi-clock-history me-1"></i> Histórico de Clases del Maestro</div>
          <div class="text-muted small">Consulta sesiones dadas, temas impartidos, horarios, asistencias y justificaciones.</div>
        </div>
        <button class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="modal-view-body-btn-historico" type="button">
          <i class="bi bi-journal-check"></i> Ver Histórico
        </button>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(nombre)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${maestro.email ? `<a href="mailto:${escapeHTML(maestro.email)}">${escapeHTML(maestro.email)}</a>` : '-'}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.telefono || '-')}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.instrumento || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.especialidad || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${
                (maestro.especialidades || []).length
                  ? maestro.especialidades
                      .map(
                        (e) =>
                          `<span class="badge bg-primary-subtle text-primary me-1">${escapeHTML(e)}</span>`,
                      )
                      .join('')
                  : 'Sin especialidades'
              }
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getStatusColor(isActive)}">${getStatusLabel(isActive)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">Biografía</label>
        <p class="form-control-plaintext">${escapeHTML(maestro.bio || 'Sin biografía')}</p>
      </div>
      <hr>
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <label class="form-label fw-bold mb-0">Credenciales de acceso</label>
            <div class="text-muted small">Se almacenan cifradas y se pueden recuperar en cualquier momento desde ADM.</div>
          </div>
          <span class="badge bg-secondary-subtle text-secondary" id="maestro-cred-status">Cargando...</span>
        </div>
        <div id="maestro-cred-container">
          <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
            <small>Cargando credenciales...</small>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="fw-bold" style="font-size:0.95rem;"><i class="bi bi-journal-text me-1 text-primary"></i> Clases Asignadas</span>
          <span id="maestro-clases-badge" class="badge bg-primary-subtle text-primary rounded-pill" style="font-size:0.75rem;">Cargando...</span>
        </div>
        <div id="maestro-clases-container">
          <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
            <small>Cargando clases...</small>
          </div>
        </div>
      </div>
    `,
    onShow: async (modalBody) => {
      const dialog = modalBody.closest('.app-modal-dialog')
      dialog?.querySelector('#modal-view-btn-historico')?.addEventListener('click', () => {
        openHistoricoMaestroModal(maestro)
      })
      modalBody.querySelector('#modal-view-body-btn-historico')?.addEventListener('click', () => {
        openHistoricoMaestroModal(maestro)
      })
      dialog?.querySelector('#modal-view-btn-pdf')?.addEventListener('click', (e) => {
        descargarReporteMaestroPdf(maestro, e.currentTarget)
      })
      dialog?.querySelector('#modal-view-btn-edit')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(id), 300)
      })
      dialog?.querySelector('#modal-view-btn-delete')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(id), 300)
      })

      const credContainer = modalBody.querySelector('#maestro-cred-container')
      const credStatus = modalBody.querySelector('#maestro-cred-status')
      const fechaFormatter = new Intl.DateTimeFormat('es-DO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
      const maskPassword = '••••••••••••••'

      let currentPlainPassword = null
      let currentCredentialData = null

      const formatCredentialDate = (value) => {
        if (!value) return 'Sin registro'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return 'Sin registro'
        return fechaFormatter.format(date)
      }

      const setCredentialBadge = (label, tone = 'secondary') => {
        if (!credStatus) return
        credStatus.className = `badge bg-${tone}-subtle text-${tone}`
        credStatus.textContent = label
      }

      const renderCredentialActions = (hasCredentials) => `
        <div class="d-flex flex-wrap gap-2">
          ${
            hasCredentials
              ? `
            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-maestro-cred-reveal">
              <i class="bi bi-eye me-1"></i>Ver contraseña
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-maestro-cred-copy" ${
              currentPlainPassword ? '' : 'disabled'
            }>
              <i class="bi bi-copy me-1"></i>Copiar
            </button>
            <button type="button" class="btn btn-warning btn-sm" id="btn-maestro-cred-regenerate">
              <i class="bi bi-arrow-repeat me-1"></i>Regenerar contraseña
            </button>
          `
              : `
            <button type="button" class="btn btn-primary btn-sm" id="btn-maestro-cred-generate">
              <i class="bi bi-key me-1"></i>Generar contraseña
            </button>
          `
          }
          <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-maestro-cred-refresh">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar estado
          </button>
        </div>
      `

      const renderCredentialCard = (credentialData, plainPassword = null) => {
        currentCredentialData = credentialData
        currentPlainPassword = plainPassword

        const hasCredentials = !!credentialData?.hasCredentials
        const credentialEmail = credentialData?.email || maestro.email || maestro.correo || '-'
        const passwordVersion = credentialData?.passwordVersion || 0
        const passwordValue =
          plainPassword || (hasCredentials ? maskPassword : 'Sin contraseña generada')

        credContainer.innerHTML = `
          <div class="card border-0 bg-body-tertiary">
            <div class="card-body p-3">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="small text-muted">Correo de acceso</div>
                  <div class="fw-semibold text-break">${escapeHTML(credentialEmail)}</div>
                </div>
                <div class="col-md-3">
                  <div class="small text-muted">Versión</div>
                  <div class="fw-semibold">${hasCredentials ? `v${passwordVersion}` : '—'}</div>
                </div>
                <div class="col-md-3">
                  <div class="small text-muted">Vinculación</div>
                  <div class="fw-semibold">${credentialData?.userLinked ? 'Activa' : 'Pendiente'}</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold mb-1">Contraseña</label>
                <input
                  type="text"
                  class="form-control font-monospace"
                  id="maestro-cred-password-input"
                  readonly
                  value="${escapeHTML(passwordValue)}"
                >
                <div class="form-text">
                  ${hasCredentials ? 'La contraseña se almacena cifrada en la base de datos.' : 'Aún no existe una contraseña para este maestro.'}
                </div>
              </div>

              <div class="d-flex flex-column gap-2">
                ${renderCredentialActions(hasCredentials)}
                <div class="small text-muted">
                  <div><strong>Generada:</strong> ${formatCredentialDate(credentialData?.lastGeneratedAt)}</div>
                  <div><strong>Última visualización:</strong> ${formatCredentialDate(credentialData?.lastRevealedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        `

        const passwordInput = credContainer.querySelector('#maestro-cred-password-input')
        const revealBtn = credContainer.querySelector('#btn-maestro-cred-reveal')
        const copyBtn = credContainer.querySelector('#btn-maestro-cred-copy')
        const regenerateBtn = credContainer.querySelector('#btn-maestro-cred-regenerate')
        const generateBtn = credContainer.querySelector('#btn-maestro-cred-generate')
        const refreshBtn = credContainer.querySelector('#btn-maestro-cred-refresh')

        const setPasswordValue = (value) => {
          currentPlainPassword = value
          if (passwordInput) passwordInput.value = value
          if (copyBtn) copyBtn.disabled = !value
        }

        revealBtn?.addEventListener('click', async () => {
          try {
            revealBtn.disabled = true
            revealBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-1"></span>Verificando...'
            const result = await revelarCredencialesMaestro(id)
            setCredentialBadge('Visible', 'success')
            setPasswordValue(result.password)
            showToast('Contraseña revelada correctamente', 'success')
          } catch (error) {
            showToast(error.message || 'No se pudo revelar la contraseña', 'error')
          } finally {
            revealBtn.disabled = false
            revealBtn.innerHTML = '<i class="bi bi-eye me-1"></i>Ver contraseña'
          }
        })

        copyBtn?.addEventListener('click', async () => {
          if (!currentPlainPassword) {
            showToast('Primero debes ver la contraseña', 'warning')
            return
          }

          try {
            await navigator.clipboard.writeText(currentPlainPassword)
            showToast('Contraseña copiada al portapapeles', 'success')
          } catch {
            showToast('No se pudo copiar la contraseña', 'error')
          }
        })

        const generatePassword = async ({ confirmReplace = false } = {}) => {
          if (
            confirmReplace &&
            !confirm('Esto reemplazará la contraseña actual del maestro. ¿Deseas continuar?')
          ) {
            return
          }

          let button = null
          try {
            button = confirmReplace ? regenerateBtn : generateBtn
            if (button) {
              button.disabled = true
              button.innerHTML =
                '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
            }

            const result = await generarCredencialesMaestro(id)
            setCredentialBadge('Cifradas', 'success')
            renderCredentialCard(
              {
                ...(currentCredentialData || {}),
                hasCredentials: true,
                email: result.email || credentialEmail,
                passwordVersion: result.passwordVersion || passwordVersion + 1,
                lastGeneratedAt: result.generatedAt || new Date().toISOString(),
                lastRevealedAt: null,
                userLinked: true,
              },
              result.password,
            )
            showToast('Credenciales generadas correctamente', 'success')
          } catch (error) {
            showToast(error.message || 'No se pudieron generar las credenciales', 'error')
          } finally {
            if (button) {
              button.disabled = false
              button.innerHTML = confirmReplace
                ? '<i class="bi bi-arrow-repeat me-1"></i>Regenerar contraseña'
                : '<i class="bi bi-key me-1"></i>Generar contraseña'
            }
          }
        }

        regenerateBtn?.addEventListener('click', () => {
          void generatePassword({ confirmReplace: true })
        })

        generateBtn?.addEventListener('click', () => {
          void generatePassword()
        })

        refreshBtn?.addEventListener('click', () => {
          void loadCredentialState()
        })
      }

      const loadCredentialState = async () => {
        try {
          setCredentialBadge('Cargando...', 'secondary')
          credContainer.innerHTML = `
            <div class="d-flex align-items-center gap-2 text-muted py-2">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <small>Cargando credenciales...</small>
            </div>
          `

          const credentialState = await obtenerEstadoCredencialesMaestro(id)
          currentCredentialData = credentialState
          setCredentialBadge(
            credentialState.hasCredentials ? 'Cifradas' : 'Sin credenciales',
            credentialState.hasCredentials ? 'success' : 'warning',
          )
          renderCredentialCard(credentialState)
        } catch (error) {
          setCredentialBadge('Error', 'danger')
          credContainer.innerHTML = `
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i>
              ${escapeHTML(error.message || 'No se pudieron cargar las credenciales')}
            </div>
          `
        }
      }
      const clasesContainer = modalBody.querySelector('#maestro-clases-container')
      const badge = modalBody.querySelector('#maestro-clases-badge')

      const renderClasesSection = async () => {
        try {
          const [clases, maestrosRes, salonesRes, programasRes, alumnosRes] = await Promise.all([
            obtenerClasesPorMaestro(id),
            supabase.from('maestros').select('*').order('nombre_completo', { ascending: true }),
            supabase.from('salones').select('*').order('nombre', { ascending: true }),
            supabase.from('programas').select('*').order('nombre', { ascending: true }),
            supabase
              .from('alumnos')
              .select('*')
              .eq('activo', true)
              .order('nombre_completo', { ascending: true }),
          ])

          const catalogos = {
            maestros: maestrosRes.data || [],
            salones: salonesRes.data || [],
            programas: programasRes.data || [],
            alumnos: alumnosRes.data || [],
          }

          badge.textContent = `${clases.length} clase${clases.length !== 1 ? 's' : ''}`

          if (clases.length === 0) {
            clasesContainer.innerHTML = `
              <div class="text-center py-4 text-muted">
                <i class="bi bi-journal-x" style="font-size:2rem; opacity:0.4;"></i>
                <p class="mt-2 mb-0 small">Sin clases asignadas actualmente.</p>
              </div>`
            return
          }

          const DIAS = {
            lunes: 'Lun',
            martes: 'Mar',
            miercoles: 'Mié',
            jueves: 'Jue',
            viernes: 'Vie',
            sabado: 'Sáb',
            domingo: 'Dom',
          }
          const fmtHora = (t) => t?.slice(0, 5) || ''
          const fmtHorario = (h) =>
            `${DIAS[h.dia] || h.dia} ${fmtHora(h.hora_inicio)}–${fmtHora(h.hora_fin)}`

          clasesContainer.innerHTML = `
            <div class="d-flex flex-column gap-2">
              ${clases
                .map((c) => {
                  // BUG FIX: Clase model no mapea `activo`, usar `estado` (string de BD)
                  const esActiva = c.estado === 'activa' || c.estado == null
                  const ocupacion = c.capacidad_maxima
                    ? Math.round((c.total_alumnos / c.capacidad_maxima) * 100)
                    : null
                  const ocupColor =
                    ocupacion >= 90 ? '#ef4444' : ocupacion >= 70 ? '#f59e0b' : '#10b981'
                  const horarioPills = c.horarios
                    .map(
                      (h) =>
                        `<span style="background:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color);border-radius:20px;padding:1px 8px;font-size:0.7rem;white-space:nowrap;">${fmtHorario(h)}</span>`,
                    )
                    .join('')

                  return `
                  <div class="clase-card" data-clase-id="${c.id}" style="
                    border-radius: 10px;
                    border: 1px solid var(--bs-border-color);
                    overflow: hidden;
                    transition: box-shadow 0.15s;
                    ${!esActiva ? 'opacity:0.6;' : ''}
                  ">
                    <div class="d-flex align-items-stretch">

                      <!-- Indicador de rol -->
                      <div style="width:4px;flex-shrink:0;background:${c.es_suplente ? '#f59e0b' : '#6366f1'};"></div>

                      <!-- Info -->
                      <div class="flex-grow-1 px-3 py-2 overflow-hidden">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span class="fw-semibold text-truncate" style="font-size:0.87rem;" title="${escapeHTML(c.nombre)}">${escapeHTML(c.nombre)}</span>
                          ${!esActiva ? `<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">Inactiva</span>` : ''}
                          ${c.es_suplente ? `<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;">Suplente</span>` : ''}
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1" style="font-size:0.75rem;color:var(--bs-secondary-color);">
                          ${c.instrumento ? `<span>${escapeHTML(c.instrumento)}</span><span style="opacity:0.3;">·</span>` : ''}
                          ${c.horarios.length ? horarioPills : `<span class="fst-italic" style="opacity:0.5;">Sin horario</span>`}
                        </div>

                        <div class="d-flex align-items-center gap-1" style="font-size:0.72rem;">
                          <i class="bi bi-people" style="color:var(--bs-secondary-color);"></i>
                          <span style="color:var(--bs-secondary-color);">${c.total_alumnos}${c.capacidad_maxima ? `/${c.capacidad_maxima}` : ''}</span>
                          ${
                            ocupacion !== null
                              ? `
                            <div style="flex:1;max-width:60px;height:4px;background:var(--bs-tertiary-bg);border-radius:2px;overflow:hidden;margin-left:4px;">
                              <div style="width:${ocupacion}%;height:100%;background:${ocupColor};border-radius:2px;transition:width 0.3s;"></div>
                            </div>
                            <span style="color:${ocupColor};font-weight:600;">${ocupacion}%</span>`
                              : ''
                          }
                        </div>
                      </div>

                      <!-- Acciones -->
                      <div class="d-flex flex-column" style="border-left:1px solid var(--bs-border-color);flex-shrink:0;">
                        <button class="btn btn-link btn-editar-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${c.id}" title="Editar"
                          style="font-size:0.65rem;color:#6366f1;text-decoration:none;border-radius:0;border-bottom:1px solid var(--bs-border-color);">
                          <i class="bi bi-pencil" style="font-size:0.95rem;"></i>
                          Editar
                        </button>
                        <button class="btn btn-link btn-desvincular-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${c.id}"
                          data-clase-nombre="${escapeHTML(c.nombre)}"
                          data-es-suplente="${c.es_suplente}"
                          title="Quitar"
                          style="font-size:0.65rem;color:#ef4444;text-decoration:none;border-radius:0;">
                          <i class="bi bi-person-dash" style="font-size:0.95rem;"></i>
                          Quitar
                        </button>
                      </div>

                    </div>
                  </div>`
                })
                .join('')}
            </div>`

          // ── Editar clase ────────────────────────────────────────────────
          clasesContainer.querySelectorAll('.btn-editar-clase').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              const claseId = e.currentTarget.dataset.claseId
              const clase = clases.find((c) => c.id === claseId)
              if (!clase) return
              AppModal.close()
              setTimeout(() => {
                openClaseModal(clase, {
                  ...catalogos,
                  onSuccess: () => {
                    setTimeout(() => openViewModal(id), 300)
                  },
                })
              }, 300)
            })
          })

          // ── Desvincular maestro ─────────────────────────────────────────
          clasesContainer.querySelectorAll('.btn-desvincular-clase').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
              const claseId = e.currentTarget.dataset.claseId
              const claseNombre = e.currentTarget.dataset.claseNombre
              const esSuplente = e.currentTarget.dataset.esSuplente === 'true'
              const campo = esSuplente ? 'maestro_suplente_id' : 'maestro_principal_id'
              if (!confirm(`¿Quitar a este maestro de "${claseNombre}"?`)) return
              try {
                e.currentTarget.disabled = true
                e.currentTarget.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
                await actualizarClase(claseId, { [campo]: null }, true)
                showToast('Maestro desvinculado correctamente', 'success')
                AppModal.close()
                setTimeout(() => openViewModal(id), 300)
              } catch (err) {
                showToast('Error al desvincular: ' + err.message, 'error')
                e.currentTarget.disabled = false
                e.currentTarget.innerHTML =
                  '<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>'
              }
            })
          })
        } catch {
          badge.textContent = 'Error'
          clasesContainer.innerHTML = `
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`
        }
      }

      void loadCredentialState()
      void renderClasesSection()
    },
  })
}

function openDeleteModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro) {
    showToast('Maestro no encontrado', 'error')
    return
  }

  state.deletingId = id
  const nombre = maestro.nombre || maestro.name || maestro.nombre_completo || 'Maestro'
  const isActive = maestro.is_active !== false

  // 1. Si el maestro ya está inactivo, ofrecer reactivación o eliminación definitiva
  if (!isActive) {
    AppModal.open({
      title: '⚙️ Opciones de Maestro Inactivo',
      size: 'md',
      saveText: '▶️ Reactivar Maestro',
      body: `
        <p>El maestro <strong>${escapeHTML(nombre)}</strong> se encuentra actualmente <strong>inactivo</strong>.</p>
        <p class="text-muted small">¿Qué acción deseas realizar?</p>
        <div class="d-flex flex-column gap-2 mt-3">
          <button class="btn btn-outline-danger btn-sm text-start p-2.5 rounded-3" id="btnEliminarDefinitivoModal">
            <div class="fw-bold"><i class="bi bi-trash3-fill me-1"></i> Eliminar Definitivamente</div>
            <div class="small opacity-75">Elimina de forma permanente la ficha y credenciales si no tiene clases activas.</div>
          </button>
        </div>
      `,
      onSave: async () => {
        try {
          await reactivarMaestroSeguro(id)
          maestro.is_active = true
          applyFilters()
          showToast('Maestro reactivado correctamente', 'success')
        } catch (error) {
          showToast(error.message || 'No se pudo reactivar el maestro', 'error')
          return false
        }
      },
    })

    // Handler para botón de eliminación permanente desde el modal de inactivo
    setTimeout(() => {
      document.getElementById('btnEliminarDefinitivoModal')?.addEventListener('click', () => {
        AppModal.close()
        void evaluarYEliminarMaestro(maestro)
      })
    }, 100)
    return
  }

  // 2. Si está activo, evaluamos su carga académica
  void evaluarYEliminarMaestro(maestro)
}

async function evaluarYEliminarMaestro(maestro) {
  const nombre = maestro.nombre || maestro.name || maestro.nombre_completo || 'Maestro'
  let clases = []
  let preview = null

  try {
    const [clasesRes, previewRes] = await Promise.all([
      obtenerClasesPorMaestro(maestro.id).catch(() => []),
      previsualizarRetiroMaestro(maestro.id).catch(() => null),
    ])
    clases = clasesRes || []
    preview = previewRes
  } catch (err) {
    console.warn('Error evaluando carga académica:', err)
  }

  const principales = Array.isArray(preview?.clases_principales) && preview.clases_principales.length > 0 
    ? preview.clases_principales 
    : clases
  const suplencias = Array.isArray(preview?.clases_suplente) ? preview.clases_suplente : []
  const totalClases = principales.length + suplencias.length

  // CASO 1: NO TIENE CLASES ASIGNADAS (Carga Académica = 0) -> Eliminación limpia
  if (totalClases === 0) {
    AppModal.open({
      title: '🗑️ Eliminar Maestro',
      size: 'md',
      saveText: 'Sí, eliminar permanentemente',
      body: `
        <div class="p-1">
          <div class="alert alert-success d-flex align-items-center gap-2.5 mb-3 py-2 px-3 rounded-3">
            <i class="bi bi-check-circle-fill fs-5 flex-shrink-0"></i>
            <div>
              <div class="fw-bold">Carga Académica: 0 clases asignadas</div>
              <div class="small opacity-90">Este maestro no tiene alumnos ni clases a su cargo. Puede ser eliminado de forma segura.</div>
            </div>
          </div>

          <p class="mb-2">¿Estás seguro de que deseas eliminar permanentemente a <strong>${escapeHTML(nombre)}</strong>?</p>
          
          <div class="card bg-body-tertiary border-0 p-2.5 mb-3 rounded-3 small">
            <div><i class="bi bi-person me-1.5 text-muted"></i><strong>Nombre:</strong> ${escapeHTML(nombre)}</div>
            ${maestro.email ? `<div><i class="bi bi-envelope me-1.5 text-muted"></i><strong>Email:</strong> ${escapeHTML(maestro.email)}</div>` : ''}
            ${maestro.instrumento ? `<div><i class="bi bi-music-note me-1.5 text-muted"></i><strong>Cátedra:</strong> ${escapeHTML(maestro.instrumento)}</div>` : ''}
          </div>

          <div class="text-danger small">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Esta acción eliminará de forma irreversible el registro del maestro, sus permisos y credenciales asociadas.
          </div>
        </div>
      `,
      onSave: async () => {
        try {
          // 1. Quitar visualmente del DOM de forma instantánea
          const cardEl = document.querySelector(`.maestro-card-modern[data-id="${maestro.id}"], [data-id="${maestro.id}"]`)?.closest('.col')
          if (cardEl) {
            cardEl.remove()
          }

          // 2. Ejecutar eliminación en base de datos
          await eliminarMaestro(maestro.id)
          
          // 3. Actualización inmediata local
          state.maestros = state.maestros.filter((m) => m.id !== maestro.id)
          state.maestrosOriginales = state.maestrosOriginales.filter((m) => m.id !== maestro.id)
          applyFilters()
          showToast(`Maestro "${nombre}" eliminado permanentemente`, 'success')

          // 4. Sincronización fresca con la base de datos en segundo plano
          void obtenerMaestros().then((fresh) => {
            state.maestrosOriginales = fresh
            applyFilters()
          }).catch((e) => console.debug('Sync background:', e))
        } catch (error) {
          showToast(error.message || 'No se pudo eliminar el maestro', 'error')
          return false
        }
      },
    })
    return
  }

  // CASO 2: TIENE CLASES ASIGNADAS (Carga Académica > 0) -> Transferir y Retirar
  const replacementOptions = state.maestrosOriginales
    .filter((item) => item.id !== maestro.id && item.is_active !== false)
    .map(
      (item) =>
        `<option value="${item.id}">${escapeHTML(item.nombre || item.nombre_completo || 'Maestro')}</option>`,
    )
    .join('')

  AppModal.open({
    title: '⚠️ Carga Académica Activa — Transferencia Requerida',
    size: 'lg',
    saveText: 'Transferir Clases y Retirar',
    body: `
      <div class="alert alert-warning mb-3">
        <div class="d-flex align-items-center gap-2 mb-1">
          <i class="bi bi-exclamation-triangle-fill fs-5 text-warning flex-shrink-0"></i>
          <strong>No se puede eliminar directamente: Carga académica detectada</strong>
        </div>
        <div class="small">
          El maestro <strong>${escapeHTML(nombre)}</strong> tiene <strong>${totalClases} clase(s) asignada(s)</strong>.
          Para no dejar a los alumnos sin docente ni romper la historia académica, debes reasignar las clases a un maestro de reemplazo o desvincularlas en el módulo de Clases.
        </div>
      </div>

      <h6 class="fw-bold mb-2 small text-uppercase text-muted">Clases Principales a Reasignar (${principales.length})</h6>
      <ul class="list-group list-group-flush border rounded-3 mb-3 small">
        ${principales.map((clase) => `
          <li class="list-group-item d-flex align-items-center justify-content-between py-2">
            <span><i class="bi bi-journal-bookmark me-2 text-primary"></i>${escapeHTML(clase.nombre || clase.materia || 'Clase')}</span>
            <span class="badge bg-primary-subtle text-primary">Titular</span>
          </li>
        `).join('')}
      </ul>

      ${suplencias.length ? `
        <p class="small text-muted mb-3"><i class="bi bi-info-circle me-1"></i>${suplencias.length} clase(s) en suplencia serán desvinculadas automáticamente sin alterar la clase principal.</p>
      ` : ''}

      <div class="mb-3">
        <label class="form-label fw-semibold" for="retirement-replacement">Maestro de reemplazo para las clases <span class="text-danger">*</span></label>
        <select class="form-select" id="retirement-replacement">
          <option value="">Selecciona un maestro de reemplazo…</option>
          ${replacementOptions}
        </select>
      </div>

      <div class="mb-2">
        <label class="form-label small text-muted" for="retirement-reason">Motivo del retiro / transferencia <span class="text-muted">(opcional)</span></label>
        <textarea class="form-control" id="retirement-reason" rows="2" maxlength="500" placeholder="Ej.: cambio de institución, fin de contrato, reasignación…"></textarea>
      </div>
    `,
    onSave: async () => {
      const replacementId = document.getElementById('retirement-replacement')?.value || null
      const reason = document.getElementById('retirement-reason')?.value || ''
      if (principales.length > 0 && !replacementId) {
        showToast('Debes seleccionar un maestro de reemplazo para transferir las clases.', 'error')
        return false
      }

      try {
        await retirarMaestroSeguro(maestro.id, replacementId, reason)
        
        // Actualización inmediata y sincronización
        maestro.is_active = false
        applyFilters()
        showToast('Clases transferidas y maestro retirado correctamente', 'success')

        void obtenerMaestros().then((fresh) => {
          state.maestrosOriginales = fresh
          applyFilters()
        }).catch((e) => console.debug('Sync background:', e))
      } catch (error) {
        showToast(error.message || 'No se pudo retirar el maestro', 'error')
        return false
      }
    },
  })
}

function refreshTable() {
  const container = getContainer()
  const tbody = container?.querySelector('#maestrosTBody') || document.querySelector('#maestrosTBody')
  if (tbody) {
    tbody.innerHTML = renderTableRows(state.maestros)
  }

  const totalMaestros = state.maestrosOriginales.length
  const totalActivos = state.maestrosOriginales.filter(a => a.is_active ?? true).length
  const totalConInstrumento = state.maestrosOriginales.filter(a => !!a.instrumento && a.instrumento.trim() !== '' && a.instrumento.toLowerCase() !== 'sin instrumento especificado').length
  const totalConWhatsapp = state.maestrosOriginales.filter(a => !!a.telefono && a.telefono.trim() !== '').length

  const badgeActivos = container?.querySelector('#badgeActivosMaestros') || document.querySelector('#badgeActivosMaestros')
  const badgeCatedra = container?.querySelector('#badgeCatedraMaestros') || document.querySelector('#badgeCatedraMaestros')
  const badgeWhatsapp = container?.querySelector('#badgeWhatsappMaestros') || document.querySelector('#badgeWhatsappMaestros')
  if (badgeActivos) badgeActivos.textContent = `${totalActivos}/${totalMaestros}`
  if (badgeCatedra) badgeCatedra.textContent = `${totalConInstrumento}`
  if (badgeWhatsapp) badgeWhatsapp.textContent = `${totalConWhatsapp}`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function exportarMaestrosCSV() {
  if (state.maestrosOriginales.length === 0) {
    showToast('No hay maestros para exportar', 'error')
    return
  }

  const headers = ['Nombre', 'Email', 'Teléfono', 'Instrumento', 'Especialidad', 'Estado']
  const rows = state.maestrosOriginales.map((m) => [
    m.nombre || '',
    m.email || '',
    m.telefono || '',
    m.instrumento || '',
    m.especialidad || '',
    m.is_active !== false ? 'Activo' : 'Inactivo',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `maestros-${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  showToast('CSV exportado exitosamente', 'success')
}

function showToast(message, type = 'info') {
  const bgColor = type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0dcaf0'
  const icon =
    type === 'success'
      ? 'bi-check-circle'
      : type === 'error'
        ? 'bi-exclamation-circle'
        : 'bi-info-circle'
  const label = type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'

  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed;top:1rem;right:1rem;z-index:12000;
    min-width:280px;max-width:420px;
    background:#fff;border-radius:8px;
    box-shadow:0 8px 30px rgba(0,0,0,0.18);
    overflow:hidden;
    font-family:system-ui,-apple-system,sans-serif;
    will-change:transform;isolation:isolate;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;padding:0.75rem 1rem;background:${bgColor};color:#fff;">
      <i class="bi ${icon} me-2" style="font-size:1.1rem;"></i>
      <strong style="flex:1;font-size:0.9rem;">${label}</strong>
      <button type="button" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem;line-height:1;padding:0;">&times;</button>
    </div>
    <div style="padding:0.75rem 1rem;font-size:0.875rem;color:#212529;">
      ${escapeHTML(message)}
    </div>
  `
  document.body.appendChild(el)

  el.querySelector('button').addEventListener('click', () => {
    el.remove()
  })
  setTimeout(() => {
    el.style.transition = 'opacity .3s'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, 3000)
}

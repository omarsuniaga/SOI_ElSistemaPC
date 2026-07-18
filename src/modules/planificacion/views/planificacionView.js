import '../styles/planificacion.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { Planificacion } from '../models/planificacion.model.js'
import {
  actualizarPlanificacion,
  crearPlanificacion,
  eliminarPlanificacion,
  marcarRevisadasMasivo,
  obtenerClases,
  obtenerCoberturaCurricular,
  obtenerMaestros,
  obtenerPlantillasPlanificacion,
  obtenerCoberturaEvaluacion,
} from '../api/planificacionAdapter.js'
import {
  obtenerFuentesCurriculares,
  obtenerVersionesCurriculares,
  obtenerRutasActivas,
  publicarVersionCurricular,
  crearRutaActiva,
} from '../api/weeklyPlanAdapter.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { usePlanificacion } from '../hooks/usePlanificacion.js'
import { getAlumnos } from '../../alumnos/api/alumnosApi.js'

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  planes: [], // filtered/displayed list
  cargando: false,
  viewMode: 'maestro', // 'maestro' | 'admin' | 'plantillas'
  activeTab: 'planes',
  asistenteRendered: false,
  rutasRendered: false,
  historialRendered: false,
  acmAuthority: { sources: [], versions: [], routes: [] },
  seleccionados: new Set(),
  container: null,
  maestrosCatalogo: [],
  clasesCatalogo: []
}

const hook = usePlanificacion()

// ── Entry Point ───────────────────────────────────────────────────────────────
export async function renderPlanificacionView(container, { viewMode = 'maestro', skipFetch = false } = {}) {
  if (!container) return
  state.container = container
  state.viewMode = viewMode
  state.seleccionados = new Set()
  state.asistenteRendered = false
  state.rutasRendered = false
  state.historialRendered = false
  state.acmAuthority = { sources: [], versions: [], routes: [] }

  if (viewMode === 'plantillas') {
    renderTemplatesContent(container)
    return
  }

  try {
    state.cargando = true
    renderLoading(container)

    const [maestros, clases] = await Promise.all([
      obtenerMaestros().catch(() => []),
      obtenerClases().catch(() => [])
    ])
    state.maestrosCatalogo = maestros
    state.clasesCatalogo = clases

    if (!skipFetch) {
      hook.currentPage = 1
      hook.searchTerm = ''
      hook.filterClaseId = ''
      hook.filterEstado = ''
      await hook.fetchPlanificacionesConDetalles()
    }
    
    state.planes = [...hook.planificaciones]
    
    if (viewMode === 'acm') {
      const [sources, versions, routes] = await Promise.all([
        obtenerFuentesCurriculares().catch(() => []),
        obtenerVersionesCurriculares().catch(() => []),
        obtenerRutasActivas().catch(() => []),
      ])
      state.acmAuthority = { sources, versions, routes }
    }
    state.cargando = false

    renderContent(container)
    _attachEvents(container)
    _actualizarPaginadorUi()
  } catch (error) {
    console.error('[planificacionView]', error)
    renderError(container, error.message)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${escapeHTML(msg)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>planificaciones</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`
}

// ── View Modes ────────────────────────────────────────────────────────────────

// Mode: maestro / admin ──────────────────────────────────────────────────────
function renderContent(container) {
  const isAdmin = state.viewMode === 'admin'

  const headerTitle = state.viewMode === 'acm'
    ? 'Rutas y Versiones Curriculares'
    : isAdmin
      ? 'Todas las Planificaciones'
      : 'Mis Planes de Clase'
  const headerIcon = state.viewMode === 'acm' ? 'bi-diagram-3' : isAdmin ? 'bi-shield-check' : 'bi-journal-check'
  const headerDesc = state.viewMode === 'acm'
    ? 'Diseño, control y asignación del currículo oficial y rutas de clase del núcleo.'
    : isAdmin
      ? `${hook.totalCount} planes en el sistema`
      : 'Vista de consulta. La guía se hereda desde ACM para esta clase.'

  // Stats for admin mode
  const statsHtml = state.viewMode === 'acm' ? _renderAcmAuthorityPanel() : isAdmin ? _renderAdminStats() : ''

  // Segmented control tabs (iOS Style)
  const tabsHtml = `
    <div class="planificacion-segmented-control mb-4" id="planificacion-tabs">
      <button class="planificacion-segment-btn ${state.activeTab === 'planes' ? 'active' : ''}" data-tab="planes">
        <i class="bi bi-journal-text me-1"></i> Planes
      </button>
      ${(isAdmin || state.viewMode === 'acm') ? `
      <button class="planificacion-segment-btn ${state.activeTab === 'clases' ? 'active' : ''}" data-tab="clases">
        <i class="bi bi-shield-check me-1"></i> Cobertura Clases
      </button>
      ` : ''}
      <button class="planificacion-segment-btn ${state.activeTab === 'plantillas' ? 'active' : ''}" data-tab="plantillas">
        <i class="bi bi-file-earmark-template me-1"></i> Plantillas
      </button>
      <button class="planificacion-segment-btn ${state.activeTab === 'historial' ? 'active' : ''}" data-tab="historial">
        <i class="bi bi-clock-history me-1"></i> Historial
      </button>
      <button class="planificacion-segment-btn ${state.activeTab === 'rutas' ? 'active' : ''}" data-tab="rutas">
        <i class="bi bi-diagram-3 me-1"></i> Rutas
      </button>
      <button class="planificacion-segment-btn ${state.activeTab === 'asistente' ? 'active' : ''}" data-tab="asistente">
        <i class="bi bi-cpu me-1"></i> Asistente IA
      </button>
    </div>
  `

  container.innerHTML = `
    <div class="page-container">
      <!-- Header -->
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi ${headerIcon} fs-4"></i>
          </div>
          <div>
            <h1 class="planificacion-title-premium page-title mb-0">${headerTitle}</h1>
            <p class="text-muted small mb-0">${headerDesc}</p>
          </div>
        </div>
        <div class="planificacion-header-actions">
          <button class="btn-help-trigger" id="btn-help-planificacion" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <button class="btn-planificacion-nuevo" id="btn-nuevo-plan">
            <i class="bi bi-plus-lg me-1"></i>Nuevo Plan
          </button>
          ${
            (isAdmin || state.viewMode === 'acm')
              ? `
            <button class="btn btn-outline-secondary btn-sm" id="btn-curriculo-admin">
              <i class="bi bi-journal-bookmark me-1"></i>Currículo
            </button>
            ${state.viewMode === 'acm' ? `
            <button class="btn btn-outline-primary btn-sm" id="btn-publicar-version">
              <i class="bi bi-broadcast me-1"></i>Publicar Versión
            </button>
            <button class="btn btn-outline-info btn-sm" id="btn-asignar-ruta-acm">
              <i class="bi bi-diagram-3 me-1"></i>Asignar Ruta
            </button>
            ` : ''}
            <button class="btn btn-outline-success btn-sm" id="btn-aprobar-bulk" style="display:none">
              <i class="bi bi-check-all me-1"></i>Aprobar Seleccionados
            </button>
          `
              : `
            <button class="btn btn-outline-info btn-sm" id="btn-ver-guia-acm">
              <i class="bi bi-diagram-3 me-1"></i>Ver guía ACM
            </button>
          `
          }
        </div>
      </div>

      ${statsHtml}
      ${tabsHtml}

      <!-- Tab Content Planes -->
      <div id="tab-content-planes" style="${state.activeTab === 'planes' ? 'block' : 'none'}">
        <!-- Toolbar -->
        <div class="planificacion-filter-toolbar mb-4">
          <div class="premium-search-container flex-grow-1" style="min-width: 200px;">
            <i class="bi bi-search search-icon-muted"></i>
            <input type="text" class="form-control premium-search-input" placeholder="Buscar por tema..." id="buscar-plan" value="${escapeHTML(hook.searchTerm || '')}">
          </div>
          ${
            (isAdmin || state.viewMode === 'acm')
              ? `
          <div class="premium-select-container">
            <i class="bi bi-person select-icon-muted"></i>
            <select class="form-select premium-filter-select" id="select-maestro">
              <option value="">Todos los maestros</option>
              ${(state.maestrosCatalogo || [])
                .map((m) => `<option value="${m.id}" ${hook.maestroActualId === m.id ? 'selected' : ''}>${escapeHTML(m.nombre_completo)}</option>`)
                .join('')}
            </select>
          </div>
          `
              : ''
          }
          <div class="premium-select-container">
            <i class="bi bi-book select-icon-muted"></i>
            <select class="form-select premium-filter-select" id="select-clase">
              <option value="">Todas las clases</option>
              ${(state.clasesCatalogo || [])
                .map((c) => `<option value="${c.id}" ${hook.filterClaseId === c.id ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`)
                .join('')}
            </select>
          </div>
          <div class="premium-select-container">
            <i class="bi bi-funnel select-icon-muted"></i>
            <select class="form-select premium-filter-select" id="select-estado">
              <option value="">Todos los estados</option>
              ${Planificacion.getEstados()
                .map((e) => `<option value="${e.value}" ${hook.filterEstado === e.value ? 'selected' : ''}>${e.label}</option>`)
                .join('')}
            </select>
          </div>
        </div>

        ${state.viewMode === 'maestro' ? `
        <div class="alert alert-primary border-0 mb-3">
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-diagram-3 fs-4"></i>
            <div>
              <div class="fw-bold">Cómo usar esta planificación</div>
              <div class="small">1) Elige tu clase. 2) Revisa el perfil de temas e indicadores. 3) Ajusta la ejecución semanal sin romper la guía publicada. 4) Marca vistos, avances y observaciones desde la clase seleccionada.</div>
            </div>
          </div>
        </div>` : ''}

        <!-- Table -->
        <div class="page-glass rounded position-relative">
          <div id="tabla-loading-spinner" style="display:none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
          <div class="table-responsive">
            <table class="table table-compact table-hover mb-0">
              <thead class="table-light">
                <tr>
                  ${(isAdmin || state.viewMode === 'acm') ? '<th style="width:36px"><input type="checkbox" id="check-all" title="Seleccionar todos"></th>' : ''}
                  <th>Clase / Tema</th>
                  ${(isAdmin || state.viewMode === 'acm') ? '<th class="d-none d-md-table-cell">Maestro</th>' : ''}
                  <th class="d-none d-md-table-cell">Estado</th>
                  <th class="d-none d-lg-table-cell">Fecha</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody id="planes-tbody">
                ${_renderTableRows(state.planes)}
              </tbody>
            </table>
          </div>
          <div id="empty-container">${state.planes.length === 0 ? _renderEmpty() : ''}</div>
          
          <!-- Paginator Footer -->
          <div class="d-flex justify-content-between align-items-center mt-4 px-3 py-2 page-glass rounded-3 border" style="background: rgba(255,255,255,0.01);">
            <small class="text-muted" id="pagination-info">Cargando paginación...</small>
            <div class="d-flex align-items-center gap-2">
              <button class="btn-pagination-nav" id="btn-page-prev" title="Página anterior" disabled>
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="small fw-bold px-2 py-1 bg-primary bg-opacity-10 text-primary rounded" id="current-page-badge">1</span>
              <button class="btn-pagination-nav" id="btn-page-next" title="Página siguiente" disabled>
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content Clases -->
      ${(isAdmin || state.viewMode === 'acm') ? `
      <div id="tab-content-clases" style="${state.activeTab === 'clases' ? 'block' : 'none'}">
        ${_renderClasesTab()}
      </div>
      ` : ''}

      <!-- Other Tabs -->
      <div id="tab-content-plantillas" style="${state.activeTab === 'plantillas' ? 'block' : 'none'}"></div>
      <div id="tab-content-historial" style="${state.activeTab === 'historial' ? 'block' : 'none'}"></div>
      <div id="tab-content-rutas" style="${state.activeTab === 'rutas' ? 'block' : 'none'}"></div>
      <div id="tab-content-asistente" style="${state.activeTab === 'asistente' ? 'block' : 'none'}"></div>
    </div>
  `
}

function _renderClasesTab() {
  const clases = state.clasesCatalogo || []
  if (clases.length === 0) {
    return `<div class="p-4 text-center text-muted">No hay clases registradas en este núcleo.</div>`
  }
  
  return `
    <div class="page-glass rounded">
      <div class="table-responsive">
        <table class="table table-compact table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Instrumento / Clase</th>
              <th>Maestro Principal</th>
              <th class="text-center" style="width: 250px;">Progreso de Alumnos (Cobertura)</th>
            </tr>
          </thead>
          <tbody>
            ${clases.map(c => `
              <tr class="border-start-accent border-accent-secondary align-middle">
                <td class="fw-semibold">${escapeHTML(c.nombre)}</td>
                <td class="small text-muted">${escapeHTML(c.maestro_nombre || 'Sin asignar')}</td>
                <td class="text-center">
                  <div class="cobertura-interactive-wrapper" id="cobertura-wrapper-${c.id}">
                    <button class="btn-load-cobertura-premium" data-clase-id="${c.id}">
                      <i class="bi bi-shield-check me-1"></i> Calcular Cobertura
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function _renderAdminStats() {
  const planes = hook.planificaciones
  const pendientes = planes.filter((p) => p.estado === 'ejecutado').length
  const revisados = planes.filter((p) => p.estado === 'revisado').length
  const total = planes.length

  return `
    <div class="stats-panel mb-4">
      <div class="stats-grid">
        <div class="stat-card border-start border-4 border-primary">
          <div class="stat-label">Total</div>
          <div class="stat-value">${total}</div>
        </div>
        <div class="stat-card border-start border-4 border-warning">
          <div class="stat-label">Pendientes revisión</div>
          <div class="stat-value">${pendientes}</div>
        </div>
        <div class="stat-card border-start border-4 border-success">
          <div class="stat-label">Revisados</div>
          <div class="stat-value">${revisados}</div>
        </div>
        <div class="stat-card border-start border-4 border-info">
          <div class="stat-label">Tasa aprobación</div>
          <div class="stat-value">${total > 0 ? Math.round((revisados / total) * 100) : 0}%</div>
        </div>
      </div>
    </div>
  `
}

function _renderAcmAuthorityPanel() {
  const sources = state.acmAuthority.sources || []
  const versions = state.acmAuthority.versions || []
  const routes = state.acmAuthority.routes || []
  return `
    <div class="stats-panel mb-4">
      <div class="stats-grid">
        <div class="stat-card border-start border-4 border-primary">
          <div class="stat-label">Fuentes</div>
          <div class="stat-value">${sources.length}</div>
        </div>
        <div class="stat-card border-start border-4 border-success">
          <div class="stat-label">Versiones</div>
          <div class="stat-value">${versions.length}</div>
        </div>
        <div class="stat-card border-start border-4 border-info">
          <div class="stat-label">Rutas activas</div>
          <div class="stat-value">${routes.length}</div>
        </div>
        <div class="stat-card border-start border-4 border-warning">
          <div class="stat-label">Publicadas</div>
          <div class="stat-value">${versions.filter((v) => v.status === 'active').length}</div>
        </div>
      </div>

      <div class="page-glass mt-3 p-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <div class="fw-bold">Rutas y Versiones Oficiales</div>
            <small class="text-muted">Definición y control del currículo oficial del núcleo. Las clases heredan la ruta activa definida aquí.</small>
          </div>
          <span class="badge text-bg-primary">Source of truth</span>
        </div>
        <div class="row g-3">
          <div class="col-12 col-lg-4">
            <div class="rounded border p-3 h-100">
              <div class="fw-semibold mb-2">Fuentes curriculares</div>
              <div class="d-flex flex-column gap-2">
                ${sources
                  .map(
                    (s) => `
                      <div class="d-flex justify-content-between align-items-center rounded border p-2">
                        <div>
                          <div class="fw-semibold">${escapeHTML(s.title || s.file_name || 'Fuente')}</div>
                          <small class="text-muted">${escapeHTML(s.source_type || 'documento')}</small>
                        </div>
                        <span class="badge ${s.status === 'active' ? 'text-bg-success' : s.status === 'approved' ? 'text-bg-primary' : 'text-bg-secondary'}">${escapeHTML(s.status || 'draft')}</span>
                      </div>
                    `,
                  )
                  .join('') || '<div class="text-muted small">Sin fuentes cargadas.</div>'}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="rounded border p-3 h-100">
              <div class="fw-semibold mb-2">Versiones publicables</div>
              <div class="d-flex flex-column gap-2">
                ${versions
                  .map(
                    (v) => `
                      <div class="rounded border p-2">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <div class="fw-semibold">${escapeHTML(v.name || 'Versión')}</div>
                            <small class="text-muted">${escapeHTML(v.source?.title || v.description || 'Sin descripción')}</small>
                          </div>
                          <span class="badge ${v.status === 'active' ? 'text-bg-success' : v.status === 'approved' ? 'text-bg-primary' : 'text-bg-secondary'}">${escapeHTML(v.status || 'draft')}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                          <small class="text-muted">${v.is_active ? 'Activa' : 'Inactiva'}</small>
                          <button class="btn btn-sm btn-outline-primary" data-acm-action="publish-version" data-version-id="${v.id}" ${v.status === 'active' ? 'disabled' : ''}>Publicar</button>
                        </div>
                      </div>
                    `,
                  )
                  .join('') || '<div class="text-muted small">Sin versiones curriculares.</div>'}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="rounded border p-3 h-100">
              <div class="fw-semibold mb-2">Rutas activas</div>
              <div class="d-flex flex-column gap-2">
                ${routes
                  .map(
                    (r) => `
                      <div class="d-flex justify-content-between align-items-center rounded border p-2">
                        <div>
                          <div class="fw-semibold">Grupo ${escapeHTML(r.group_id || '?')}</div>
                          <small class="text-muted">Semana ${r.current_week || 1} | ${escapeHTML(r.status || 'active')}</small>
                        </div>
                        <span class="badge text-bg-success">Activa</span>
                      </div>
                    `,
                  )
                  .join('') || '<div class="text-muted small">Sin rutas activas.</div>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function _renderTableRows(planes) {
  if (!planes || planes.length === 0) return ''
  const isAdmin = state.viewMode === 'admin'

  return planes
    .map((p) => {
      const config = Planificacion.getEstadoConfig(p.estado)
      const accentClass =
        p.estado === 'revisado'
          ? 'border-accent-success'
          : p.estado === 'ejecutado'
            ? 'border-accent-warning'
            : 'border-accent-secondary'

      return `
      <tr data-id="${p.id}" class="border-start-accent ${accentClass}">
        ${isAdmin ? `<td><input type="checkbox" class="plan-check" value="${p.id}" ${state.seleccionados.has(p.id) ? 'checked' : ''}></td>` : ''}
        <td>
          <div class="fw-bold">${escapeHTML(p.clase_nombre || 'Sin clase')}</div>
          <div class="small text-muted text-truncate" style="max-width: 260px">${escapeHTML(p.tema)}</div>
        </td>
        ${isAdmin ? `<td class="d-none d-md-table-cell align-middle small text-muted">${escapeHTML(p.maestro_nombre || 'N/A')}</td>` : ''}
        <td class="d-none d-md-table-cell align-middle">
          <span class="badge badge-compact ${config.color}">${config.label}</span>
        </td>
        <td class="d-none d-lg-table-cell text-muted small align-middle">${p.fecha_inicio || '-'}</td>
        <td class="text-end align-middle">
          <div class="quick-actions justify-content-end">
            ${
              isAdmin && p.canApprove()
                ? `
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="approve" data-id="${p.id}" title="Aprobar">
                <i class="bi bi-check-circle"></i>
              </button>
            `
                : ''
            }
            ${
              state.viewMode === 'admin' && p.estado === 'planificado'
                ? `
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="ejecutar" data-id="${p.id}" title="Marcar como ejecutado">
                <i class="bi bi-play-fill"></i>
              </button>
            `
                : ''
            }
            <button class="btn btn-sm btn-outline-secondary btn-icon-compact" data-action="view" data-id="${p.id}" title="Ver detalle">
              <i class="bi bi-eye"></i>
            </button>
            ${
              (isAdmin || state.viewMode === 'acm') && !p.isLocked()
                ? `
              <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            `
                : ''
            }
          </div>
        </td>
      </tr>
    `
    })
    .join('')
}

function _renderEmpty() {
  const isAdmin = state.viewMode === 'admin'
  return `
    <div class="text-center py-5 px-3">
      <i class="bi bi-journal-x text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">
        ${isAdmin ? 'No hay planificaciones registradas aún' : 'Todavía no tienes planes de clase'}
      </h5>
      <p class="text-muted small mb-0">
        ${
          isAdmin
            ? 'Una vez que los maestros creen sus planes, aparecerán aquí para revisión.'
            : 'Crea tu primer plan de clase usando el botón de arriba o usa una plantilla.'
        }
      </p>
    </div>
  `
}

// Mode: plantillas ───────────────────────────────────────────────────────────
async function renderTemplatesContent(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando plantillas...</span>
      </div>
    </div>`

  try {
    const plantillas = await obtenerPlantillasPlanificacion()

    if (!plantillas || plantillas.length === 0) {
      container.innerHTML = `
        <div class="page-container">
          <div class="planificacion-header-premium mb-4">
            <div class="d-flex align-items-center gap-3">
              <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                <i class="bi bi-file-earmark-text fs-4"></i>
              </div>
              <div>
                <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
                <p class="text-muted small mb-0">No hay plantillas disponibles aún.</p>
              </div>
            </div>
          </div>
        </div>`
      return
    }

    container.innerHTML = `
      <div class="page-container">
        <div class="planificacion-header-premium mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-file-earmark-text fs-4"></i>
            </div>
            <div>
              <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
              <p class="text-muted small mb-0">${plantillas.length} plantilla${plantillas.length !== 1 ? 's' : ''} disponible${plantillas.length !== 1 ? 's' : ''} — selecciona una y personalízala</p>
            </div>
          </div>
        </div>

        <div class="row g-3">
          ${plantillas
            .map(
              (t) => `
            <div class="col-md-6">
              <div class="page-glass rounded p-4 h-100 d-flex flex-column">
                <div class="d-flex align-items-start gap-3 mb-3">
                  <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px;height:40px">
                    <i class="bi bi-journal-text fs-5"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-0">${escapeHTML(t.nombre)}</h5>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary border small">${escapeHTML(t.instrumento)}</span>
                  </div>
                </div>
                <p class="text-muted small flex-grow-1">${escapeHTML(t.descripcion)}</p>
                <details class="mb-3">
                  <summary class="small text-primary" style="cursor:pointer">Ver contenido DSL</summary>
                  <pre class="mt-2 p-2 bg-body-tertiary rounded small border" style="font-size:.75rem;white-space:pre-wrap">${escapeHTML(t.contenido)}</pre>
                </details>
                <button class="btn btn-outline-primary btn-sm" data-template-id="${t.id}">
                  <i class="bi bi-plus-circle me-1"></i>Usar esta plantilla
                </button>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `

    // Attach template actions
    container.querySelectorAll('button[data-template-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tpl = plantillas.find((t) => t.id === btn.dataset.templateId)
        if (tpl) _openTemplateModal(tpl)
      })
    })
  } catch (error) {
    console.error('[plantillas]', error)
    container.innerHTML = `
      <div class="page-container">
        <div class="planificacion-header-premium mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-file-earmark-text fs-4"></i>
            </div>
            <div>
              <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
              <p class="text-muted small mb-0">Error al cargar plantillas</p>
            </div>
          </div>
        </div>
        <div class="alert alert-warning d-flex align-items-start gap-3" role="alert">
          <i class="bi bi-exclamation-triangle fs-4 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar plantillas</h5>
            <p class="mb-0 small">${escapeHTML(error.message)}</p>
          </div>
        </div>
      </div>`
  }
}

function _openTemplateModal(tpl) {
  AppModal.open({
    title: `Usar plantilla: ${tpl.nombre}`,
    saveText: 'Crear Plan',
    size: 'lg',
    body: `
      <form id="form-tpl" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="tpl-tema" value="${escapeHTML(tpl.nombre)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="tpl-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="tpl-objetivos" rows="2">${escapeHTML(tpl.descripcion)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido DSL</label>
          <textarea class="form-control input-dense font-monospace" id="tpl-contenido" rows="7">${escapeHTML(tpl.contenido)}</textarea>
        </div>
      </form>
    `,
    onOpen: async (modalBody) => {
      const clases = await obtenerClases()
      const sel = modalBody.querySelector('#tpl-clase_id')
      sel.innerHTML =
        '<option value="">Seleccionar clase...</option>' +
        clases.map((c) => `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`).join('')
    },
    onSave: async (modalBody) => {
      const planData = {
        tema: modalBody.querySelector('#tpl-tema').value.trim(),
        clase_id: modalBody.querySelector('#tpl-clase_id').value,
        objetivos: modalBody.querySelector('#tpl-objetivos').value.trim(),
        contenido: modalBody.querySelector('#tpl-contenido').value.trim(),
      }
      try {
        await crearPlanificacion(planData)
        AppToast.success('Plan creado desde plantilla')
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    },
  })
}

// ── Event Handlers ────────────────────────────────────────────────────────────
function _attachEvents(container) {
  const isAdmin = state.viewMode === 'admin'

  // Debounced Search input to avoid concurrency race conditions
  let searchTimeout = null
  container.querySelector('#buscar-plan')?.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      _applyFilters()
    }, 300)
  })

  container.querySelector('#select-estado')?.addEventListener('change', _applyFilters)
  container.querySelector('#select-clase')?.addEventListener('change', _applyFilters)
  if (isAdmin || state.viewMode === 'acm') {
    container.querySelector('#select-maestro')?.addEventListener('change', _applyFilters)
  }

  // Paginator events
  container.querySelector('#btn-page-prev')?.addEventListener('click', async () => {
    if (hook.currentPage > 1) {
      state.seleccionados.clear()
      _toggleBulkBtn()
      _setLoadingUi(true)
      try {
        await hook.setPage(hook.currentPage - 1)
        state.planes = [...hook.planificaciones]
        const tbody = container.querySelector('#planes-tbody')
        if (tbody) tbody.innerHTML = _renderTableRows(state.planes)
        _actualizarPaginadorUi()
      } catch (err) {
        AppToast.error(err.message)
      } finally {
        _setLoadingUi(false)
      }
    }
  })

  container.querySelector('#btn-page-next')?.addEventListener('click', async () => {
    if (hook.currentPage * hook.pageSize < hook.totalCount) {
      state.seleccionados.clear()
      _toggleBulkBtn()
      _setLoadingUi(true)
      try {
        await hook.setPage(hook.currentPage + 1)
        state.planes = [...hook.planificaciones]
        const tbody = container.querySelector('#planes-tbody')
        if (tbody) tbody.innerHTML = _renderTableRows(state.planes)
        _actualizarPaginadorUi()
      } catch (err) {
        AppToast.error(err.message)
      } finally {
        _setLoadingUi(false)
      }
    }
  })

  // Lazy Load Coverage trigger for classes rows
  container.querySelectorAll('.btn-load-cobertura-premium').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const claseId = btn.getAttribute('data-clase-id')
      const wrapper = container.querySelector(`#cobertura-wrapper-${claseId}`)
      if (!wrapper) return

      wrapper.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-2 cobertura-fade-in text-primary small">
          <div class="spinner-border spinner-border-sm" role="status" style="width: 1rem; height: 1rem;"></div>
          <span class="fw-semibold">Cargando...</span>
        </div>
      `

      try {
        const result = await obtenerCoberturaEvaluacion(claseId)
        const pct = result.coverage_pct || 0
        const color = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-danger'

        wrapper.innerHTML = `
          <div class="d-flex align-items-center justify-content-center gap-3 cobertura-fade-in">
            <div class="progress" style="width: 80px; height: 6px; background: rgba(0,0,0,0.06);" title="${pct}% de cobertura (${result.evaluated_indicators}/${result.total_indicators} indicadores evaluados)">
              <div class="progress-bar ${color}" role="progressbar" style="width: ${pct}%"></div>
            </div>
            <span class="small fw-bold text-muted">${pct}%</span>
          </div>
        `
      } catch (err) {
        AppToast.error('Error calculando cobertura: ' + err.message)
        wrapper.innerHTML = `
          <button class="btn-load-cobertura-premium text-danger border-danger" data-clase-id="${claseId}">
            <i class="bi bi-exclamation-triangle me-1"></i> Reintentar
          </button>
        `
        _attachEvents(container)
      }
    })
  })

  container.querySelector('#btn-help-planificacion')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Planificación',
      intro:
        'Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase, en qué fecha, y si fue ejecutado o no.',
      sections: [
        {
          icon: 'bi-journal-text',
          title: 'Tab Planes',
          description:
            'Lista tus planes personales. Filtra por estado (planificado, ejecutado, cancelado) y crea nuevos desde "Nuevo plan".',
          color: '#3b82f6',
        },
        {
          icon: 'bi-file-earmark-template',
          title: 'Tab Plantillas',
          description:
            'Plantillas reutilizables en formato DSL. Sirven como base para crear nuevos planes rápidamente.',
          color: '#6366f1',
        },
        {
          icon: 'bi-journal-check',
          title: 'Todos los planes (admin)',
          description:
            'Solo visible para administradores. Muestra los planes de todos los maestros para supervisión.',
          color: '#10b981',
        },
        {
          icon: 'bi-circle-fill',
          title: 'Estados del plan',
          description:
            '"Planificado" = no dictado aún. "Ejecutado" = clase dada. "Revisado" = plan auditado. Mantenerlos actualizados mejora los reportes.',
          color: '#f59e0b',
        },
      ],
    })
  })

  if (!isAdmin) {
    container.querySelector('#btn-ver-guia-acm')?.addEventListener('click', () => {
      AppModal.open({
        title: 'Guía heredada desde ACM',
        saveText: 'Entendido',
        size: 'md',
        body: `
          <div class="alert alert-info border-0 mb-0">
            <div class="fw-bold mb-2">La planificación oficial vive en ACM</div>
            <p class="mb-0 small">Desde aquí solo consultas la guía que ACM publicó para tu clase. Si necesitas correcciones, se solicitan en ACM.</p>
          </div>
        `,
        onSave: async () => true,
      })
    })
  }

  // Check-all for admin/acm
  if (isAdmin || state.viewMode === 'acm') {
    container.querySelector('#check-all')?.addEventListener('change', (e) => {
      const checked = e.target.checked
      state.seleccionados = checked ? new Set(state.planes.map((p) => p.id)) : new Set()
      container.querySelectorAll('.plan-check').forEach((cb) => {
        cb.checked = checked
      })
      _toggleBulkBtn()
    })

    container.querySelector('#btn-aprobar-bulk')?.addEventListener('click', async () => {
      const ids = [...state.seleccionados]
      if (!ids.length) return
      try {
        await marcarRevisadasMasivo(ids)
        AppToast.success(`${ids.length} plan(es) aprobados`)
        renderPlanificacionView(container, { viewMode: state.viewMode })
      } catch (err) {
        AppToast.error(err.message)
      }
    })
  }

  // Segmented Control Tab switching (iOS Style)
  container.querySelectorAll('#planificacion-tabs .planificacion-segment-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.activeTab = btn.dataset.tab

      const allContent = ['planes', 'clases', 'plantillas', 'historial', 'rutas', 'asistente']
      allContent.forEach((tab) => {
        const div = container.querySelector(`#tab-content-${tab}`)
        if (div) div.style.display = state.activeTab === tab ? 'block' : 'none'
      })

      container
        .querySelectorAll('#planificacion-tabs .planificacion-segment-btn')
        .forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')

      if (state.activeTab === 'plantillas' && !state.plantillasRendered) {
        const plantillasDiv = container.querySelector('#tab-content-plantillas')
        if (plantillasDiv) {
          await renderTemplatesContent(plantillasDiv)
          state.plantillasRendered = true
        }
      }

      if (state.activeTab === 'historial' && !state.historialRendered) {
        const historialDiv = container.querySelector('#tab-content-historial')
        if (historialDiv) {
          const { renderHistorialContenidosPanel } = await import('../components/historialContenidosPanel.js')
          renderHistorialContenidosPanel(historialDiv, {
            maestroId: hook.maestroActualId,
            planificaciones: hook.planificaciones,
            onCrearPlan: (prefill) => openEditModal(null, prefill),
          })
          state.historialRendered = true
        }
      }

      if (state.activeTab === 'rutas' && !state.rutasRendered) {
        const rutasDiv = container.querySelector('#tab-content-rutas')
        if (rutasDiv) {
          const { renderRutasManagementPanel } = await import('../components/rutasManagementPanel.js')
          renderRutasManagementPanel(rutasDiv, state.viewMode)
          state.rutasRendered = true
        }
      }

      if (state.activeTab === 'asistente' && !state.asistenteRendered) {
        const asistenteDiv = container.querySelector('#tab-content-asistente')
        if (asistenteDiv) {
          const { renderAsistentePedagogicoPanel } = await import('../components/asistentePedagogicoPanel.js')
          renderAsistentePedagogicoPanel(asistenteDiv)
          state.asistenteRendered = true
        }
      }
    })
  })

  document.addEventListener('planificacion:focusPlan', (e) => {
    const { planId } = e.detail || {}
    if (!planId) return

    // Switch to "planes" tab
    const tabBtn = container.querySelector('#planificacion-tabs .planificacion-segment-btn[data-tab="planes"]')
    if (tabBtn) tabBtn.click()

    // Highlight the row
    const row = container.querySelector(`#planes-tbody tr[data-id="${planId}"]`)
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      row.style.transition = 'background-color 0.6s ease'
      row.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.12)'
      setTimeout(() => {
        row.style.backgroundColor = ''
      }, 2500)
    }
  })

  container.querySelector('#btn-nuevo-plan')?.addEventListener('click', () => openEditModal(null))

  if (isAdmin) {
    container.querySelector('#btn-curriculo-admin')?.addEventListener('click', async () => {
      const { openCurriculoListModal } = await import('../components/curriculoModal.js')
      openCurriculoListModal()
    })
  }

  if (state.viewMode === 'acm') {
    container.querySelector('#btn-publicar-version')?.addEventListener('click', () => _openAcmPublishModal())
    container.querySelector('#btn-asignar-ruta-acm')?.addEventListener('click', () => _openAcmRouteModal())
    container.querySelector('#btn-curriculo-admin')?.addEventListener('click', async () => {
      const { openCurriculoListModal } = await import('../components/curriculoModal.js')
      openCurriculoListModal()
    })
    container.querySelector('#planes-tbody')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-acm-action="publish-version"]')
      if (!btn) return
      await _publicarVersionDesdePanel(btn.dataset.versionId)
    })
  }

  // Row-level delegates
  container.querySelector('#planes-tbody')?.addEventListener('change', (e) => {
    if (!e.target.classList.contains('plan-check')) return
    const id = e.target.value
    if (e.target.checked) state.seleccionados.add(id)
    else state.seleccionados.delete(id)
    _toggleBulkBtn()
  })

  container.querySelector('#planes-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) return
    const { action, id } = btn.dataset
    if (state.viewMode === 'maestro' && action !== 'view') return
    if (action === 'delete') openDeleteModal(id)
    if (action === 'approve') _approveOne(id)
    if (action === 'view') _viewDetail(id)
    if (action === 'ejecutar') _ejecutarPlan(id)
  })
}

async function _applyFilters() {
  const currentSequence = (state.querySequence || 0) + 1
  state.querySequence = currentSequence

  const term = state.container.querySelector('#buscar-plan')?.value || ''
  const estado = state.container.querySelector('#select-estado')?.value || ''
  const claseId = state.container.querySelector('#select-clase')?.value || ''
  const maestroId = state.container.querySelector('#select-maestro')?.value || ''

  state.seleccionados.clear()
  _toggleBulkBtn()
  _setLoadingUi(true)

  try {
    // Configurar maestro actual en el hook si cambia el selector
    if (maestroId !== hook.maestroActualId) {
      hook.setMaestroActual(maestroId || null)
    }

    await hook.setFilters({
      searchTerm: term,
      filterClaseId: claseId,
      filterEstado: estado
    })
    
    // Ignorar si se inició otra búsqueda después (Race Condition Guard)
    if (state.querySequence !== currentSequence) return

    state.planes = [...hook.planificaciones]
    const tbody = state.container.querySelector('#planes-tbody')
    const empty = state.container.querySelector('#empty-container')
    
    if (tbody) tbody.innerHTML = _renderTableRows(state.planes)
    if (empty) empty.innerHTML = state.planes.length === 0 ? _renderEmpty() : ''
    
    _actualizarPaginadorUi()
  } catch (err) {
    if (state.querySequence === currentSequence) {
      AppToast.error(err.message)
    }
  } finally {
    if (state.querySequence === currentSequence) {
      _setLoadingUi(false)
    }
  }
}

function _setLoadingUi(cargando) {
  state.cargando = cargando
  const spinner = state.container.querySelector('#tabla-loading-spinner')
  const tbody = state.container.querySelector('#planes-tbody')
  
  if (spinner) spinner.style.display = cargando ? 'block' : 'none'
  if (tbody) tbody.style.opacity = cargando ? '0.4' : '1'
  
  // Deshabilitar controles interactivos durante la recarga para prevenir Race Conditions,
  // pero NUNCA deshabilitar el input de búsqueda para no interrumpir la escritura (Focus Hijacking).
  const controls = state.container.querySelectorAll(
    '.premium-filter-select, .btn-pagination-nav'
  )
  controls.forEach(c => c.disabled = cargando)
}

function _actualizarPaginadorUi() {
  const info = state.container.querySelector('#pagination-info')
  const badge = state.container.querySelector('#current-page-badge')
  const prevBtn = state.container.querySelector('#btn-page-prev')
  const nextBtn = state.container.querySelector('#btn-page-next')
  
  if (info) {
    const from = (hook.currentPage - 1) * hook.pageSize + 1
    const to = Math.min(hook.currentPage * hook.pageSize, hook.totalCount)
    info.textContent = hook.totalCount > 0 
      ? `Mostrando ${from}-${to} de ${hook.totalCount} planificaciones` 
      : 'No hay planificaciones'
  }
  
  if (badge) badge.textContent = hook.currentPage
  
  if (prevBtn) prevBtn.disabled = hook.currentPage === 1 || state.cargando
  if (nextBtn) {
    const hasNext = hook.currentPage * hook.pageSize < hook.totalCount
    nextBtn.disabled = !hasNext || state.cargando
  }
}

function _toggleBulkBtn() {
  const btn = state.container?.querySelector('#btn-aprobar-bulk')
  if (!btn) return
  btn.style.display = state.seleccionados.size > 0 ? '' : 'none'
}

// ── Modals ────────────────────────────────────────────────────────────────────

async function _publicarVersionDesdePanel(versionId) {
  try {
    await publicarVersionCurricular(versionId)
    AppToast.success('Versión curricular publicada')
    renderPlanificacionView(state.container, { viewMode: 'acm' })
  } catch (error) {
    AppToast.error(error.message)
  }
}

function _openAcmPublishModal() {
  const versions = state.acmAuthority.versions || []
  if (versions.length === 0) {
    AppToast.info('No hay versiones curriculares para publicar')
    return
  }

  const options = versions
    .map((v) => `<option value="${v.id}" ${v.status === 'active' ? 'selected' : ''}>${escapeHTML(v.name || v.id)}</option>`)
    .join('')

  AppModal.open({
    title: 'Publicar versión curricular',
    saveText: 'Publicar',
    size: 'md',
    body: `
      <div class="d-grid gap-2">
        <label class="form-label-compact">Selecciona la versión a publicar</label>
        <select class="form-select input-dense" id="acm-version-select">${options}</select>
        <div class="alert alert-info small mb-0">
          La versión activa define la ruta oficial que el portal de maestros hereda por clase.
        </div>
      </div>
    `,
    onSave: async (modalBody) => {
      const versionId = modalBody.querySelector('#acm-version-select')?.value
      if (!versionId) {
        AppToast.error('Selecciona una versión')
        return false
      }
      await _publicarVersionDesdePanel(versionId)
      return true
    },
  })
}

async function _openAcmRouteModal() {
  const [clases, maestros, versiones] = await Promise.all([
    obtenerClases().catch(() => []),
    obtenerMaestros().catch(() => []),
    obtenerVersionesCurriculares().catch(() => []),
  ])

  const claseOptions = clases.map((c) => `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`).join('')
  const maestroOptions = maestros
    .map((m) => `<option value="${m.id}">${escapeHTML(m.nombre_completo || m.nombre || m.email || m.id)}</option>`)
    .join('')
  const versionOptions = versiones.map((v) => `<option value="${v.id}">${escapeHTML(v.name || v.id)}</option>`).join('')

  AppModal.open({
    title: 'Asignar ruta activa',
    saveText: 'Asignar',
    size: 'lg',
    body: `
      <form class="row g-3" id="acm-route-form">
        <div class="col-md-6">
          <label class="form-label-compact">Clase / Grupo</label>
          <select class="form-select input-dense" id="acm-route-clase" required>
            <option value="">Seleccionar clase...</option>
            ${claseOptions}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Maestro</label>
          <select class="form-select input-dense" id="acm-route-maestro" required>
            <option value="">Seleccionar maestro...</option>
            ${maestroOptions}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Versión curricular</label>
          <select class="form-select input-dense" id="acm-route-version" required>
            <option value="">Seleccionar versión...</option>
            ${versionOptions}
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label-compact">Semana inicial</label>
          <input type="number" min="1" class="form-control input-dense" id="acm-route-week" value="1">
        </div>
        <div class="col-md-3">
          <label class="form-label-compact">Nivel</label>
          <input type="text" class="form-control input-dense" id="acm-route-level" placeholder="pnivel_001">
        </div>
      </form>
    `,
    onSave: async (modalBody) => {
      const groupId = modalBody.querySelector('#acm-route-clase')?.value
      const teacherId = modalBody.querySelector('#acm-route-maestro')?.value
      const versionId = modalBody.querySelector('#acm-route-version')?.value
      const currentWeek = Number(modalBody.querySelector('#acm-route-week')?.value || 1)
      const levelId = modalBody.querySelector('#acm-route-level')?.value?.trim() || null

      if (!groupId || !teacherId || !versionId) {
        AppToast.error('Completa clase, maestro y versión')
        return false
      }

      const selectedVersion = versiones.find((v) => v.id === versionId)

      await crearRutaActiva({
        group_id: groupId,
        teacher_id: teacherId,
        weekly_plan_version_id: versionId,
        weekly_plan_id: selectedVersion?.weekly_plan_id || selectedVersion?.id || versionId,
        current_week: currentWeek,
        level_id: levelId || undefined,
      })
      AppToast.success('Ruta activa asignada')
      renderPlanificacionView(state.container, { viewMode: 'acm' })
      return true
    },
  })
}

async function openEditModal(id, prefill = {}) {
  const plan = id ? hook.getById(id) || new Planificacion(prefill) : new Planificacion(prefill)

  AppModal.open({
    title: id ? 'Editar Plan de Clase' : 'Nuevo Plan de Clase',
    saveText: 'Guardar Plan',
    size: 'lg',
    body: `
      <form id="form-plan" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="plan-tema" value="${escapeHTML(plan.tema)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="plan-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="plan-objetivos" rows="2">${escapeHTML(plan.objetivos)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact fw-bold d-flex justify-content-between">
            Indicadores de Logro
            <button type="button" class="btn btn-sm btn-link p-0" id="add-indicador-btn">
              <i class="bi bi-plus-circle me-1"></i>Agregar
            </button>
          </label>
          <div id="indicadores-list" class="d-flex flex-column gap-2 mt-2"></div>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Fecha de inicio</label>
          <input type="date" class="form-control input-dense" id="plan-fecha" value="${plan.fecha_inicio || ''}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Instrumento / Área</label>
          <input type="text" class="form-control input-dense" id="plan-instrumento" value="${escapeHTML(plan.instrumento || '')}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Método de evaluación</label>
          <input type="text" class="form-control input-dense" id="plan-eval" value="${escapeHTML(plan.evaluacion_metodo || '')}">
        </div>
      </form>
    `,
    onOpen: async (modalBody) => {
      const clases = await obtenerClases()
      const sel = modalBody.querySelector('#plan-clase_id')
      sel.innerHTML =
        '<option value="">Seleccionar clase...</option>' +
        clases
          .map(
            (c) =>
              `<option value="${c.id}" ${c.id === plan.clase_id ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`,
          )
          .join('')

      // Indicadores dinámicos
      const container = modalBody.querySelector('#indicadores-container')
      const addBtn = modalBody.querySelector('#add-indicador-btn')
      
      const renderIndicador = (val = '', pond = 3) => {
        const div = document.createElement('div')
        div.className = 'indicador-row d-flex gap-2 mb-2 align-items-center'
        div.innerHTML = `
          <input type="text" class="form-control input-dense ind-text" placeholder="Indicador..." value="${escapeHTML(val)}">
          <select class="form-select input-dense ind-pond" style="width: 80px;">
            ${[1,2,3,4,5].map(n => `<option value="${n}" ${n == pond ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
          <button type="button" class="btn btn-outline-danger btn-sm ind-del"><i class="bi bi-trash"></i></button>
        `
        div.querySelector('.ind-del').onclick = () => div.remove()
        container.appendChild(div)
      }

      // Cargar indicadores si existen (asumiendo formato JSON en notas_dsl temporalmente)
      try {
        const indData = plan.notas_dsl ? JSON.parse(plan.notas_dsl) : []
        indData.forEach(i => renderIndicador(i.texto, i.ponderacion))
      } catch(e) { /* fallback si no es JSON */ renderIndicador(plan.notas_dsl || '') }

      addBtn.onclick = () => renderIndicador()
    },
    onSave: async (modalBody) => {
      const filas = modalBody.querySelectorAll('.indicador-row')
      const indicadores = Array.from(filas).map(row => ({
        texto: row.querySelector('.ind-text').value.trim(),
        ponderacion: parseInt(row.querySelector('.ind-pond').value)
      })).filter(i => i.texto)

      const data = {
        tema: modalBody.querySelector('#plan-tema').value.trim(),
        clase_id: modalBody.querySelector('#plan-clase_id').value,
        objetivos: modalBody.querySelector('#plan-objetivos').value.trim(),
        contenido: modalBody.querySelector('#plan-contenido')?.value.trim() || '',
        notas_dsl: JSON.stringify(indicadores),
        fecha_inicio: modalBody.querySelector('#plan-fecha').value || null,
        instrumento: modalBody.querySelector('#plan-instrumento').value.trim() || null,
        evaluacion_metodo: modalBody.querySelector('#plan-eval').value.trim() || null,
      }

      const model = new Planificacion(data)
      const errores = model.validate()
      if (errores.length > 0) {
        AppToast.error(errores[0])
        return false
      }

      try {
        if (id) {
          await actualizarPlanificacion(id, data)
          AppToast.success('Plan actualizado correctamente')
        } else {
          await crearPlanificacion(data)
          AppToast.success('Plan creado correctamente')
        }
        renderPlanificacionView(state.container, { viewMode: state.viewMode })
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    },
  })
}

function _viewDetail(id) {
  const plan = hook.getById(id)
  if (!plan) return
  const config = Planificacion.getEstadoConfig(plan.estado)

  AppModal.open({
    title: `Plan: ${plan.clase_nombre || 'Sin clase'}`,
    hideSave: true,
    size: 'lg',
    body: `
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="small text-muted text-uppercase fw-bold mb-1">Tema</div>
          <div class="fw-bold">${escapeHTML(plan.tema)}</div>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge ${config.color} fs-6">${config.label}</span>
        </div>
      </div>
      ${
        plan.maestro_nombre
          ? `
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Maestro</div>
          <div>${escapeHTML(plan.maestro_nombre)}</div>
        </div>
      `
          : ''
      }
      ${
        plan.objetivos
          ? `
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Objetivos</div>
          <div class="text-muted">${escapeHTML(plan.objetivos)}</div>
        </div>
      `
          : ''
      }
      ${
        plan.contenido
          ? `
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Contenido DSL</div>
          <pre class="p-3 rounded border bg-body-tertiary small" style="white-space:pre-wrap">${escapeHTML(plan.contenido)}</pre>
        </div>
      `
          : ''
      }
      <div class="row g-2">
        ${plan.fecha_inicio ? `<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-calendar me-1"></i>${plan.fecha_inicio}</span></div>` : ''}
        ${plan.instrumento ? `<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${escapeHTML(plan.instrumento)}</span></div>` : ''}
        ${plan.evaluacion_metodo ? `<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-clipboard-check me-1"></i>${escapeHTML(plan.evaluacion_metodo)}</span></div>` : ''}
      </div>
    `,
  })
}

async function _approveOne(id) {
  try {
    await marcarRevisadasMasivo([id])
    AppToast.success('Plan aprobado y marcado como revisado')
    renderPlanificacionView(state.container, { viewMode: state.viewMode })
  } catch (err) {
    AppToast.error(err.message)
  }
}

async function _ejecutarPlan(id) {
  const plan = hook.getById(id)
  if (!plan) return

  let instrumento = plan.instrumento
  let nivel = null
  const claseId = plan.clase_id

  if (claseId) {
    const todasClases = await obtenerClases()
    const clase = todasClases.find((c) => c.id === claseId)
    if (clase) {
      instrumento = instrumento || clase.instrumento
      nivel = clase.plan_estudio
    }
  }

  const maestroId = hook.maestroActualId || plan.maestro_id

  const { openCoberturaModal } = await import('../components/coberturaModal.js')
  openCoberturaModal({
    plan,
    claseId,
    instrumento,
    nivel,
    maestroId,
    onConfirm: async () => {
      try {
        await actualizarPlanificacion(id, { estado: 'ejecutado' })
        AppToast.success('Plan marcado como ejecutado')
        renderPlanificacionView(state.container, { viewMode: state.viewMode, skipFetch: true })
      } catch (err) {
        AppToast.error(err.message)
      }
    },
    onSkip: async () => {
      try {
        await actualizarPlanificacion(id, { estado: 'ejecutado' })
        AppToast.success('Plan ejecutado (sin cobertura)')
        renderPlanificacionView(state.container, { viewMode: state.viewMode, skipFetch: true })
      } catch (err) {
        AppToast.error(err.message)
      }
    },
  })
}

async function openDeleteModal(id) {
  const plan = hook.getById(id)
  if (!plan) return
  AppModal.open({
    title: '⚠️ Eliminar Plan',
    saveText: 'Eliminar',
    body: `<p>¿Estás seguro de eliminar el plan <strong>"${escapeHTML(plan.tema)}"</strong>? Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      try {
        await eliminarPlanificacion(id)
        AppToast.success('Plan eliminado')
        renderPlanificacionView(state.container, { viewMode: state.viewMode, skipFetch: true })
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    },
  })
}

// ── Cobertura Curricular ────────────────────────────────────────────────────
/**
 * Vista administrativa que muestra TODAS las clases con su estado de planificación.
 * Clase sin plan → botón "Crear plan".
 * Clase con plan → muestra estado.
 */
export async function renderCoberturaView(container) {
  if (!container) return

  try {
    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando cobertura...</span>
        </div>
      </div>`

    const cobertura = await obtenerCoberturaCurricular()

    const total = cobertura.length
    const conPlan = cobertura.filter((c) => c.tiene_plan).length
    const sinPlan = total - conPlan
    const pctCobertura = total > 0 ? Math.round((conPlan / total) * 100) : 0

    container.innerHTML = `
    <div class="page-container">
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-grid-3x3-gap fs-4"></i>
          </div>
          <div>
            <h1 class="planificacion-title-premium page-title mb-0">Cobertura Curricular</h1>
            <p class="text-muted small mb-0">Todas las clases con su estado de planificación</p>
          </div>
        </div>
        <div class="planificacion-header-actions">
          <button class="btn btn-premium-action" id="btn-refresh-cobertura">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold text-primary">${total}</div>
            <div class="small text-muted">Total clases</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold text-success">${conPlan}</div>
            <div class="small text-muted">Con plan</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold text-danger">${sinPlan}</div>
            <div class="small text-muted">Sin plan</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold ${pctCobertura >= 80 ? 'text-success' : pctCobertura >= 50 ? 'text-warning' : 'text-danger'}">${pctCobertura}%</div>
            <div class="small text-muted">Cobertura</div>
          </div>
        </div>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Clase</th>
                <th>Instrumento</th>
                <th>Maestro</th>
                <th>Plan</th>
                <th class="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${cobertura.map(_renderCoberturaRow).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`

    container.querySelector('#btn-refresh-cobertura').addEventListener('click', () => {
      renderCoberturaView(container)
    })

    container.querySelectorAll('.btn-crear-plan-cobertura').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const claseId = btn.dataset.claseId
        const [clases, maestros] = await Promise.all([obtenerClases(), obtenerMaestros()])
        const { openPlanificacionModal } = await import('../components/planificacionModal.js')
        openPlanificacionModal(
          'create',
          null,
          clases,
          maestros,
          { clase_id: claseId },
          async (datos) => {
            await crearPlanificacion(datos)
            AppToast.success('Plan creado correctamente')
            renderCoberturaView(container)
          },
        )
      })
    })

    container.querySelectorAll('.btn-ver-plan-cobertura').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const planId = btn.dataset.planId
        const [plan, clases, maestros] = await Promise.all([
          import('../api/planificacionAdapter.js').then((m) => m.obtenerPlanificacion(planId)),
          obtenerClases(),
          obtenerMaestros(),
        ])
        const { openPlanificacionModal } = await import('../components/planificacionModal.js')
        openPlanificacionModal('edit', plan, clases, maestros, {}, async (datos) => {
          await actualizarPlanificacion(planId, datos)
          AppToast.success('Plan actualizado')
          renderCoberturaView(container)
        })
      })
    })
  } catch (error) {
    console.error('[coberturaView]', error)
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
          <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar cobertura</h5>
            <p class="mb-0 small">${escapeHTML(error.message)}</p>
          </div>
        </div>
      </div>`
  }
}

function _renderCoberturaRow(item) {
  const estadoBadge = item.tiene_plan
    ? _estadoBadgeCobertura(item.plan_estado)
    : '<span class="badge bg-secondary">Sin plan</span>'

  const accion = item.tiene_plan
    ? `<button class="btn btn-outline-primary btn-sm btn-ver-plan-cobertura" data-plan-id="${escapeHTML(item.plan_id)}">
        <i class="bi bi-eye me-1"></i>Ver plan
      </button>`
    : `<button class="btn btn-success btn-sm btn-crear-plan-cobertura" data-clase-id="${escapeHTML(item.clase_id)}" data-clase-nombre="${escapeHTML(item.clase_nombre)}">
        <i class="bi bi-plus-lg me-1"></i>Crear plan
      </button>`

  return `
    <tr>
      <td class="fw-medium">${escapeHTML(item.clase_nombre)}</td>
      <td>${escapeHTML(item.instrumento)}</td>
      <td>${escapeHTML(item.maestro_nombre)}</td>
      <td>${estadoBadge}</td>
      <td class="text-end">${accion}</td>
    </tr>`
}

function _estadoBadgeCobertura(estado) {
  const map = {
    planificado: { cls: 'bg-primary', icon: 'bi-file-text' },
    ejecutado: { cls: 'bg-warning text-dark', icon: 'bi-play-circle' },
    revisado: { cls: 'bg-success', icon: 'bi-check-circle' },
  }
  const cfg = map[estado] || { cls: 'bg-secondary', icon: 'bi-question' }
  return (
    '<span class="badge ' +
    cfg.cls +
    '"><i class="bi ' +
    cfg.icon +
    ' me-1"></i>' +
    estado +
    '</span>'
  )
}

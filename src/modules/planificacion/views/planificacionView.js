import '../styles/planificacion.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { Planificacion } from '../models/planificacion.model.js'
import {
  obtenerPlanificacionesConDetalles,
  actualizarPlanificacion,
  crearPlanificacion,
  eliminarPlanificacion,
  marcarRevisadasMasivo
} from '../api/planificacionApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { openCoberturaModal } from '../components/coberturaModal.js'
import { renderAsistentePedagogicoPanel } from '../components/asistentePedagogicoPanel.js'
import { openCurriculoListModal } from '../components/curriculoModal.js'

// ── DSL Template Library ─────────────────────────────────────────────────────
const DSL_TEMPLATES = [
  {
    id: 'escala',
    nombre: 'Escala Mayor',
    instrumento: 'Piano / Guitarra',
    descripcion: 'Trabajo de escalas diatónicas mayores en posición cerrada.',
    contenido: `[Indicador] Ejecuta la escala de Do mayor en dos octavas con digitación correcta
[Indicador] Mantiene tempo estable con metrónomo a 60 bpm
{Actividad} Calentamiento de dedos: ejercicios de Hanon 5 min
{Actividad} Escala lenta con atención al peso del brazo
{Actividad} Escala en tempo progresivo hasta 80 bpm`
  },
  {
    id: 'lectura',
    nombre: 'Lectura a Primera Vista',
    instrumento: 'General',
    descripcion: 'Desarrollar la capacidad de leer y ejecutar partituras sin preparación previa.',
    contenido: `[Indicador] Lee correctamente las figuras rítmicas (negra, corchea, blanca)
[Indicador] Identifica la clave y armadura antes de comenzar
{Actividad} Análisis visual de 2 min antes de tocar
{Actividad} Ejecución a tempo lento sin parar
{Actividad} Revisión de errores y segunda lectura`
  },
  {
    id: 'repertorio',
    nombre: 'Montaje de Repertorio',
    instrumento: 'General',
    descripcion: 'Proceso sistemático de aprendizaje de una obra musical.',
    contenido: `[Indicador] Memoriza la estructura formal de la obra (A-B-A)
[Indicador] Ejecuta las secciones complejas de manera fluida
{Actividad} División por secciones: aprender A, luego B
{Actividad} Trabajo de manos separadas en pasajes difíciles
{Actividad} Ensamble y trabajo de empalmes entre secciones`
  },
  {
    id: 'teoria',
    nombre: 'Teoría Musical Aplicada',
    instrumento: 'Teoría',
    descripcion: 'Integración de conceptos teóricos con la práctica instrumental.',
    contenido: `[Indicador] Identifica intervalos en el instrumento (2da, 3ra, 4ta, 5ta)
[Indicador] Construye y ejecuta acordes mayores y menores
{Actividad} Dictado rítmico (4 compases)
{Actividad} Identificación auditiva de intervalos
{Actividad} Construcción de acordes en el instrumento`
  }
]

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  planes: [],
  planesOriginales: [],
  cargando: false,
  viewMode: 'maestro', // 'maestro' | 'admin' | 'plantillas'
  activeTab: 'planes',
  asistenteRendered: false,
  seleccionados: new Set(),
  container: null
}

// ── Entry Point ───────────────────────────────────────────────────────────────
export async function renderPlanificacionView(container, { viewMode = 'maestro' } = {}) {
  if (!container) return
  state.container = container
  state.viewMode = viewMode
  state.seleccionados = new Set()
  state.asistenteRendered = false

  if (viewMode === 'plantillas') {
    renderTemplatesContent(container)
    return
  }

  try {
    state.cargando = true
    renderLoading(container)

    const planes = await obtenerPlanificacionesConDetalles()
    state.planes = planes
    state.planesOriginales = [...planes]
    state.cargando = false

    renderContent(container)
    _attachEvents(container)
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

  const headerTitle = isAdmin ? 'Todas las Planificaciones' : 'Mis Planes de Clase'
  const headerIcon  = isAdmin ? 'bi-shield-check' : 'bi-journal-check'
  const headerDesc  = isAdmin
    ? `${state.planesOriginales.length} planes pendientes de revisión`
    : `${state.planesOriginales.length} planes registrados`

  // Stats for admin mode
  const statsHtml = isAdmin ? _renderAdminStats() : ''

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
          ${isAdmin ? `
            <button class="btn btn-outline-secondary btn-sm" id="btn-curriculo-admin">
              <i class="bi bi-journal-bookmark me-1"></i>Currículo
            </button>
            <button class="btn btn-outline-success btn-sm" id="btn-aprobar-bulk" style="display:none">
              <i class="bi bi-check-all me-1"></i>Aprobar Seleccionados
            </button>
          ` : `
            <button class="btn btn-premium-action" id="btn-nuevo-plan">
              <i class="bi bi-plus-lg me-1"></i>Nuevo Plan
            </button>
          `}
        </div>
      </div>

      ${statsHtml}

      <!-- Toolbar -->
      <div class="planificacion-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1" style="min-width: 200px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por tema..." id="buscar-plan">
        </div>
        ${isAdmin ? `
        <div class="premium-select-container">
          <i class="bi bi-person select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-maestro">
            <option value="">Todos los maestros</option>
            ${Array.from(new Set(state.planesOriginales.map(p => p.maestro_nombre).filter(n => n && n !== 'Sin asignar'))).sort().map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join('')}
          </select>
        </div>
        ` : ''}
        <div class="premium-select-container">
          <i class="bi bi-book select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-clase">
            <option value="">Todas las clases</option>
            ${Array.from(new Set(state.planesOriginales.map(p => p.clase_nombre).filter(n => n && n !== 'Sin asignar'))).sort().map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('')}
          </select>
        </div>
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-estado">
            <option value="">Todos los estados</option>
            ${Planificacion.getEstados().map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
          </select>
        </div>
      </div>

      ${!isAdmin ? `
      <ul class="nav nav-tabs mb-3" id="planificacion-tabs">
        <li class="nav-item">
          <button class="nav-link active" data-tab="planes">
            <i class="bi bi-journal-text me-1"></i>
            Mis planes
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="plantillas">
            <i class="bi bi-file-earmark-template me-1"></i>Plantillas
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="asistente">
            <i class="bi bi-robot me-1"></i>Asistente IA
          </button>
        </li>
      </ul>
      ` : ''}

      <div id="tab-content-planes">
      <!-- Table -->
      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                ${isAdmin ? '<th style="width:36px"><input type="checkbox" id="check-all" title="Seleccionar todos"></th>' : ''}
                <th>Clase / Tema</th>
                ${isAdmin ? '<th class="d-none d-md-table-cell">Maestro</th>' : ''}
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
      </div>
      </div>

      ${!isAdmin ? `
      <div id="tab-content-plantillas" style="display:none">
        <div class="alert alert-info border-0 py-3" style="font-size:0.875rem;">
          <i class="bi bi-file-earmark-template me-2"></i>
          Las plantillas de planificación estarán disponibles próximamente.
        </div>
      </div>
      <div id="tab-content-asistente" style="display:none"></div>
      ` : ''}
    </div>
  `
}

function _renderAdminStats() {
  const planes = state.planesOriginales
  const pendientes = planes.filter(p => p.estado === 'ejecutado').length
  const revisados  = planes.filter(p => p.estado === 'revisado').length
  const total      = planes.length

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

function _renderTableRows(planes) {
  if (!planes || planes.length === 0) return ''
  const isAdmin = state.viewMode === 'admin'

  return planes.map(p => {
    const config = Planificacion.getEstadoConfig(p.estado)
    const accentClass = p.estado === 'revisado'
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
            ${!isAdmin ? `
              <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${p.id}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
            ` : ''}
            ${isAdmin && p.canApprove() ? `
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="approve" data-id="${p.id}" title="Aprobar">
                <i class="bi bi-check-circle"></i>
              </button>
            ` : ''}
            ${!isAdmin && p.estado === 'planificado' ? `
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="ejecutar" data-id="${p.id}" title="Marcar como ejecutado">
                <i class="bi bi-play-fill"></i>
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-secondary btn-icon-compact" data-action="view" data-id="${p.id}" title="Ver detalle">
              <i class="bi bi-eye"></i>
            </button>
            ${!p.isLocked() ? `
              <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `
  }).join('')
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
        ${isAdmin
          ? 'Una vez que los maestros creen sus planes, aparecerán aquí para revisión.'
          : 'Crea tu primer plan de clase usando el botón de arriba o usa una plantilla.'}
      </p>
    </div>
  `
}

// Mode: plantillas ───────────────────────────────────────────────────────────
function renderTemplatesContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-file-earmark-text fs-4"></i>
          </div>
          <div>
            <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
            <p class="text-muted small mb-0">Plantillas listas para usar — seleccioná una y personalizala</p>
          </div>
        </div>
      </div>

      <div class="row g-3">
        ${DSL_TEMPLATES.map(t => `
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
        `).join('')}
      </div>
    </div>
  `

  // Attach template actions
  container.querySelectorAll('button[data-template-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tpl = DSL_TEMPLATES.find(t => t.id === btn.dataset.templateId)
      if (tpl) _openTemplateModal(tpl)
    })
  })
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
      const { data } = await supabase.from('clases').select('id, nombre').order('nombre')
      const sel = modalBody.querySelector('#tpl-clase_id')
      sel.innerHTML = '<option value="">Seleccionar clase...</option>' +
        (data || []).map(c => `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`).join('')
    },
    onSave: async (modalBody) => {
      const planData = {
        tema: modalBody.querySelector('#tpl-tema').value.trim(),
        clase_id: modalBody.querySelector('#tpl-clase_id').value,
        objetivos: modalBody.querySelector('#tpl-objetivos').value.trim(),
        contenido: modalBody.querySelector('#tpl-contenido').value.trim()
      }
      try {
        await crearPlanificacion(planData)
        AppToast.success('Plan creado desde plantilla')
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

// ── Event Handlers ────────────────────────────────────────────────────────────
function _attachEvents(container) {
  const isAdmin = state.viewMode === 'admin'

  container.querySelector('#buscar-plan')?.addEventListener('input', _applyFilters)
  container.querySelector('#select-estado')?.addEventListener('change', _applyFilters)
  container.querySelector('#select-clase')?.addEventListener('change', _applyFilters)
  if (isAdmin) {
    container.querySelector('#select-maestro')?.addEventListener('change', _applyFilters)
  }

  container.querySelector('#btn-help-planificacion')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Planificación',
      intro: 'Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase, en qué fecha, y si fue ejecutado o no.',
      sections: [
        { icon: 'bi-journal-text',           title: 'Tab Mis planes',          description: 'Lista tus planes personales. Filtrá por estado (planificado, ejecutado, cancelado) y creá nuevos desde "Nuevo plan".',                                    color: '#3b82f6' },
        { icon: 'bi-file-earmark-template',  title: 'Tab Plantillas',          description: 'Plantillas reutilizables en formato DSL. Sirven como base para crear nuevos planes rápidamente.',                                                          color: '#6366f1' },
        { icon: 'bi-journal-check',          title: 'Todas las planes (admin)', description: 'Solo visible para administradores. Muestra los planes de todos los maestros para supervisión.',                                                            color: '#10b981' },
        { icon: 'bi-circle-fill',            title: 'Estados del plan',         description: '"Planificado" = no dictado aún. "Ejecutado" = clase dada. "Cancelado" = no se realizó. Mantenerlos actualizados mejora los reportes.',                    color: '#f59e0b' },
      ],
    })
  })

  if (!isAdmin) {
    container.querySelector('#btn-nuevo-plan')?.addEventListener('click', () => openEditModal(null))
  }

  // Check-all for admin
  if (isAdmin) {
    container.querySelector('#check-all')?.addEventListener('change', (e) => {
      const checked = e.target.checked
      state.seleccionados = checked ? new Set(state.planes.map(p => p.id)) : new Set()
      container.querySelectorAll('.plan-check').forEach(cb => { cb.checked = checked })
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

  // Tab switching
  container.querySelectorAll('#planificacion-tabs .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab

      const allContent = ['planes', 'plantillas', 'asistente']
      allContent.forEach(tab => {
        const div = container.querySelector(`#tab-content-${tab}`)
        if (div) div.style.display = state.activeTab === tab ? 'block' : 'none'
      })

      container.querySelectorAll('#planificacion-tabs .nav-link').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      if (state.activeTab === 'asistente' && !state.asistenteRendered) {
        const asistenteDiv = container.querySelector('#tab-content-asistente')
        if (asistenteDiv) {
          renderAsistentePedagogicoPanel(asistenteDiv)
          state.asistenteRendered = true
        }
      }
    })
  })

  document.addEventListener('planificacion:nuevoPlan', (e) => {
    openEditModal(null)
  }, { once: true })

  if (isAdmin) {
    container.querySelector('#btn-curriculo-admin')?.addEventListener('click', () => {
      openCurriculoListModal()
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
    if (action === 'edit')    openEditModal(id)
    if (action === 'delete')  openDeleteModal(id)
    if (action === 'approve') _approveOne(id)
    if (action === 'view')    _viewDetail(id)
    if (action === 'ejecutar') _ejecutarPlan(id)
  })
}

function _applyFilters() {
  const term    = state.container.querySelector('#buscar-plan')?.value.toLowerCase() || ''
  const estado  = state.container.querySelector('#select-estado')?.value || ''
  const clase   = state.container.querySelector('#select-clase')?.value || ''
  const maestro = state.container.querySelector('#select-maestro')?.value || ''

  state.planes = state.planesOriginales.filter(p => {
    const matchSearch  = (p.tema || '').toLowerCase().includes(term) || (p.clase_nombre || '').toLowerCase().includes(term)
    const matchEstado  = !estado  || p.estado === estado
    const matchClase   = !clase   || p.clase_nombre === clase
    const matchMaestro = !maestro || p.maestro_nombre === maestro
    return matchSearch && matchEstado && matchClase && matchMaestro
  })

  const tbody  = state.container.querySelector('#planes-tbody')
  const empty  = state.container.querySelector('#empty-container')
  if (tbody) tbody.innerHTML = _renderTableRows(state.planes)
  if (empty)  empty.innerHTML = state.planes.length === 0 ? _renderEmpty() : ''
}

function _toggleBulkBtn() {
  const btn = state.container?.querySelector('#btn-aprobar-bulk')
  if (!btn) return
  btn.style.display = state.seleccionados.size > 0 ? '' : 'none'
}

// ── Modals ────────────────────────────────────────────────────────────────────
async function openEditModal(id, prefill = {}) {
  const plan = id ? state.planesOriginales.find(p => p.id === id) : new Planificacion(prefill)

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
          <label class="form-label-compact">Contenido Pedagógico (DSL)</label>
          <div class="border rounded p-2 bg-body-tertiary mb-1 d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '[Indicador] '">+ Indicador</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '{Actividad} '">+ Actividad</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '# Nota: '">+ Nota</button>
          </div>
          <textarea class="form-control input-dense font-monospace" id="plan-contenido" rows="6" placeholder="#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica&#10;#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5&#10;&#10;Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo">${escapeHTML(plan.contenido)}</textarea>
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
      const { data } = await supabase.from('clases').select('id, nombre').order('nombre')
      const sel = modalBody.querySelector('#plan-clase_id')
      sel.innerHTML = '<option value="">Seleccionar clase...</option>' +
        (data || []).map(c => `<option value="${c.id}" ${c.id === plan.clase_id ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`).join('')
    },
    onSave: async (modalBody) => {
      const data = {
        tema:              modalBody.querySelector('#plan-tema').value.trim(),
        clase_id:          modalBody.querySelector('#plan-clase_id').value,
        objetivos:         modalBody.querySelector('#plan-objetivos').value.trim(),
        contenido:         modalBody.querySelector('#plan-contenido').value.trim(),
        fecha_inicio:      modalBody.querySelector('#plan-fecha').value || null,
        instrumento:       modalBody.querySelector('#plan-instrumento').value.trim() || null,
        evaluacion_metodo: modalBody.querySelector('#plan-eval').value.trim() || null
      }

      const model = new Planificacion(data)
      const errores = model.validate()
      if (errores.length > 0) { AppToast.error(errores[0]); return false }

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
    }
  })
}

function _viewDetail(id) {
  const plan = state.planesOriginales.find(p => p.id === id)
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
      ${plan.maestro_nombre ? `
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Maestro</div>
          <div>${escapeHTML(plan.maestro_nombre)}</div>
        </div>
      ` : ''}
      ${plan.objetivos ? `
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Objetivos</div>
          <div class="text-muted">${escapeHTML(plan.objetivos)}</div>
        </div>
      ` : ''}
      ${plan.contenido ? `
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Contenido DSL</div>
          <pre class="p-3 rounded border bg-body-tertiary small" style="white-space:pre-wrap">${escapeHTML(plan.contenido)}</pre>
        </div>
      ` : ''}
      <div class="row g-2">
        ${plan.fecha_inicio ? `<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-calendar me-1"></i>${plan.fecha_inicio}</span></div>` : ''}
        ${plan.instrumento ? `<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${escapeHTML(plan.instrumento)}</span></div>` : ''}
        ${plan.evaluacion_metodo ? `<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-clipboard-check me-1"></i>${escapeHTML(plan.evaluacion_metodo)}</span></div>` : ''}
      </div>
    `
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
  const plan = state.planesOriginales.find(p => p.id === id)
  if (!plan) return

  let instrumento = plan.instrumento
  let nivel = null
  const claseId = plan.clase_id

  if (claseId) {
    const { data: clase } = await supabase
      .from('clases')
      .select('instrumento, plan_estudio')
      .eq('id', claseId)
      .single()
    if (clase) {
      instrumento = instrumento || clase.instrumento
      nivel = clase.plan_estudio
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: maestro } = await supabase
    .from('maestros')
    .select('id')
    .eq('user_id', user.id)
    .single()
  const maestroId = maestro?.id

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
        renderPlanificacionView(state.container, { viewMode: state.viewMode })
      } catch (err) {
        AppToast.error(err.message)
      }
    },
    onSkip: async () => {
      try {
        await actualizarPlanificacion(id, { estado: 'ejecutado' })
        AppToast.success('Plan ejecutado (sin cobertura)')
        renderPlanificacionView(state.container, { viewMode: state.viewMode })
      } catch (err) {
        AppToast.error(err.message)
      }
    }
  })
}

async function openDeleteModal(id) {
  const plan = state.planesOriginales.find(p => p.id === id)
  if (!plan) return
  AppModal.open({
    title: '⚠️ Eliminar Plan',
    saveText: 'Eliminar',
    body: `<p>¿Estás seguro de eliminar el plan <strong>"${escapeHTML(plan.tema)}"</strong>? Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      try {
        await eliminarPlanificacion(id)
        AppToast.success('Plan eliminado')
        renderPlanificacionView(state.container, { viewMode: state.viewMode })
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

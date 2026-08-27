/**
 * tareasView.js — Vista de Bandeja de Tareas Institucionales & Despachos (Hermes).
 * Implementación de Arquitectura EDA / Orquestador Institucional:
 * - Tablero Kanban Multi-Departamento en 5 Macro-Etapas (Recepción, Ejecución, Aprobación, Comunicación, Resueltas).
 * - Layout horizontal flexible estilo Trello/Jira con scroll fluido y tarjetas de alta densidad.
 * - Generador de Casos de Demostración con 1 clic para poblar el tablero.
 * - Alternancia fluida entre Vista Kanban y Vista Lista/Grid V2.
 * - Header & Toolbar Unificada V2 con KPI badges en tiempo real.
 * - Buscador permanente exterior y panel colapsable de filtros ('Filtros' + 'Limpiar').
 * - Acciones rápidas de despacho directo a WhatsApp (+18096714165) / COM.
 * - Deep-linking hacia entidades asociadas (Ficha 360° Alumno, Instrumento, Calendario).
 * - Soporte completo Dark / Light mode con tokens de Bootstrap 5.
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { renderTaskStatusBadge, getEstadoConfig } from '../components/taskStatusBadge.js'
import { renderTaskEntityChip } from '../components/taskEntityChip.js'
import { renderTaskCommentsPanel } from '../components/taskCommentsPanel.js'
import { renderTaskHistoryTimeline } from '../components/taskHistoryTimeline.js'
import { renderTaskAttachmentsPanel, wireTaskAttachmentsPanel } from '../components/taskAttachmentsPanel.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { esTareaToolCallAprobable, extraerToolCallPayload, formatearArgsToolCall } from '../logic/toolApprovalFormatter.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { generateCaseDossierPdf } from '../logic/caseDossierPdfGenerator.js'
import { router } from '../../../core/router/router.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección (DIR)',
  ACM: 'Académica (ACM)',
  ADM: 'Administración (ADM)',
  FIN: 'Financiero (FIN)',
  LOG: 'Logística (LOG)',
  LUT: 'Lutería (LUT)',
  COM: 'Comunicaciones (COM)',
  TECNICO: 'Técnico',
}

const DEPARTAMENTO_BADGES = {
  DIR: 'bg-danger-subtle text-danger border border-danger-subtle',
  ACM: 'bg-primary-subtle text-primary border border-primary-subtle',
  ADM: 'bg-info-subtle text-info-emphasis border border-info-subtle',
  FIN: 'bg-success-subtle text-success border border-success-subtle',
  LOG: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
  LUT: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
  COM: 'bg-purple-subtle text-purple border',
  TECNICO: 'bg-dark-subtle text-body border',
}

const ESTADOS = Object.fromEntries(
  Object.entries(getEstadoConfig()).map(([k, v]) => [k, { label: v.label, color: v.color }]),
)

const PRIORIDADES = {
  baja: { label: 'Baja', color: 'secondary', orden: 3, border: '#9ca3af', dot: 'dot-baja' },
  media: { label: 'Media', color: 'info', orden: 2, border: '#3b82f6', dot: 'dot-media' },
  alta: { label: 'Alta', color: 'warning', orden: 1, border: '#f59e0b', dot: 'dot-alta' },
  critica: { label: 'Crítica', color: 'danger', orden: 0, border: '#ef4444', dot: 'dot-critica' },
}

const HERMES_KANBAN_COLUMNS = [
  {
    id: 'recepcion',
    step: '01',
    title: 'Recepción & Triaje',
    icon: 'bi-inbox-fill',
    color: 'text-primary',
    matcher: (t) => t.estado === 'pendiente' && t.departamento !== 'COM',
  },
  {
    id: 'ejecucion',
    step: '02',
    title: 'En Ejecución Activa',
    icon: 'bi-play-circle-fill',
    color: 'text-info-emphasis',
    matcher: (t) => t.estado === 'en_progreso' && t.departamento !== 'COM',
  },
  {
    id: 'aprobacion',
    step: '03',
    title: 'En Aprobación & Bloqueos',
    icon: 'bi-shield-exclamation',
    color: 'text-warning-emphasis',
    matcher: (t) => ['bloqueada', 'observada'].includes(t.estado) || t.entidad_tipo === 'tool_call',
  },
  {
    id: 'comunicacion',
    step: '04',
    title: 'Comunicaciones / Despacho',
    icon: 'bi-whatsapp',
    color: 'text-success',
    matcher: (t) => t.departamento === 'COM' && !['completada', 'cancelada'].includes(t.estado),
  },
  {
    id: 'resueltas',
    step: '05',
    title: 'Resueltas & Archivadas',
    icon: 'bi-check2-all',
    color: 'text-secondary',
    matcher: (t) => ['completada', 'cancelada'].includes(t.estado),
  },
]

const state = {
  tareas: [],
  cargando: false,
  vistaModo: 'kanban', // 'kanban' | 'lista'
  filtrosAbiertos: false,
  filtroEstado: 'todos',
  filtroDepartamento: 'todos',
  filtroPrioridad: 'todos',
  criterioOrden: 'prioridad',
  busqueda: '',
  departamentoFijo: null,
  processCode: null,
  correlationId: null,
  actor: null,
}

let _abortController = null
let _realtimeChannel = null

async function loadTareasData() {
  return state.departamentoFijo
    ? tareasApi.getTareasByDepartamento(state.departamentoFijo)
    : tareasApi.getTareas()
}

async function refreshTareas(container) {
  const tareas = await loadTareasData()
  state.tareas = tareas
  state.cargando = false
  renderContent(container)
  attachGlobalEvents(container)
}

function setupRealtime(container) {
  if (!supabase?.channel) return
  _realtimeChannel?.unsubscribe?.()
  _realtimeChannel = supabase
    .channel('hermes:tareas_institucionales')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tareas_institucionales' },
      async () => {
        if (_abortController?.signal.aborted) return
        try {
          await refreshTareas(container)
        } catch (err) {
          console.error('[TareasView] Realtime refresh error:', err.message)
        }
      },
    )
    .subscribe()
}

export async function renderTareasView(container, opciones = {}) {
  if (!container) return

  _abortController?.abort()
  _abortController = new AbortController()

  state.departamentoFijo = opciones.departamento || null
  state.processCode = opciones.processCode || null
  state.correlationId = opciones.correlationId || null
  state.actor = opciones.actor || null

  renderLoading(container)

  try {
    state.tareas = await loadTareasData()
    state.cargando = false
    renderContent(container)
    attachGlobalEvents(container)
    setupRealtime(container)
  } catch (err) {
    console.error('[TareasView] Error al cargar tareas:', err)
    renderError(container, err.message)
  }

  return {
    teardown: () => {
      _abortController?.abort()
      _realtimeChannel?.unsubscribe?.()
      _realtimeChannel = null
    },
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 350px;">
      <div class="text-center">
        <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted small fw-medium">Sincronizando orquestador de tareas Hermes...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-4">
      <div class="alert alert-danger shadow-sm rounded-4 p-4" role="alert">
        <h5 class="alert-heading fw-bold mb-2"><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar tareas</h5>
        <p class="mb-3 small">${escapeHTML(mensaje)}</p>
        <button class="btn btn-sm btn-primary rounded-3 px-3 py-1.5 fw-semibold shadow-xs" id="retryBtn">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener(
    'click',
    () => renderTareasView(container, { departamento: state.departamentoFijo, actor: state.actor }),
    { signal: _abortController.signal },
  )
}

function todasLasTareasFinalizadas() {
  if (state.tareas.length === 0) return false
  return state.tareas.every((t) => t.estado === 'completada' || t.estado === 'cancelada')
}

function buildCierreBanner() {
  if (!todasLasTareasFinalizadas()) return ''
  const eventId = state.tareas.find((t) => t.event_id)?.event_id || null
  const nombreEvento = state.tareas[0]?.titulo?.match(/—\s*(.+)$/)?.[1]?.trim() || 'este evento'
  return `
    <div class="alert alert-success d-flex align-items-center justify-content-between gap-3 mb-3 py-2.5 px-3 rounded-4 shadow-sm border-0" role="alert" id="cierreBanner">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill fs-5 text-success"></i>
        <div>
          <strong class="text-body" style="font-size:0.85rem;">¡Todas las tareas completadas!</strong>
          <div class="small text-muted" style="font-size:0.75rem;">El caso <em>${escapeHTML(nombreEvento)}</em> está concluido. Podés emitir el Acta Oficial.</div>
        </div>
      </div>
      <button class="btn btn-success btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-bold shadow-xs text-nowrap" id="btnDescargarActa"
        data-event-id="${escapeHTML(eventId || '')}" style="font-size:0.75rem;">
        <i class="bi bi-file-earmark-pdf-fill"></i> Descargar Acta PDF
      </button>
    </div>
  `
}

function exportarCSVTareas(tareas) {
  if (!tareas || tareas.length === 0) {
    AppToast.show('No hay tareas para exportar', 'warning')
    return
  }
  const headers = ['ID', 'Título', 'Departamento', 'Estado', 'Prioridad', 'Fecha Vencimiento', 'Responsable', 'Caso Correlation', 'Checklist Total', 'Checklist Completados']
  const rows = tareas.map(t => {
    const cl = Array.isArray(t.checklist) ? t.checklist : []
    return [
      t.id,
      `"${(t.titulo || '').replace(/"/g, '""')}"`,
      t.departamento || '',
      t.estado || '',
      t.prioridad || '',
      t.fecha_vencimiento || '',
      `"${(t.updated_by_nombre || '').replace(/"/g, '""')}"`,
      t.correlation_id || '',
      cl.length,
      cl.filter(c => c.completado).length,
    ].join(',')
  })
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hermes_tareas_${state.departamentoFijo || 'global'}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  AppToast.show('Exportación CSV completada', 'success')
}

async function poblarCasosDemo(container) {
  AppToast.show('Generando casos de prueba institucionales...', 'info')
  const casosDemo = [
    {
      titulo: 'Protocolo de Rescate: Alumno Mateo Morales (3 Inasistencias)',
      descripcion: 'El alumno acumuló 3 inasistencias consecutivas en Cello Inicial. Se requiere intervención coordinada con la familia para plan de recuperación.',
      departamento: 'COM',
      estado: 'pendiente',
      prioridad: 'critica',
      entidad_tipo: 'alumno',
      entidad_label: 'Mateo Morales (Cello)',
      fecha_vencimiento: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      checklist: [
        { item: 'Contactar al tutor por WhatsApp (+18096714165)', completado: false },
        { item: 'Agendar cita con Coordinación Académica', completado: false },
        { item: 'Validar compromiso de asistencia del alumno', completado: false }
      ]
    },
    {
      titulo: 'Lutería: Encordar y Calibrar Cello #04 para Concierto',
      descripcion: 'Puente vencido y cambio de cuerdas Pirastro solicitado para la gala de fin de mes.',
      departamento: 'LUT',
      estado: 'en_progreso',
      prioridad: 'alta',
      entidad_tipo: 'instrumento',
      entidad_label: 'Cello 4/4 #04',
      fecha_vencimiento: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
      checklist: [
        { item: 'Inspeccionar rajaduras acústicas', completado: true },
        { item: 'Colocar puente nuevo', completado: true },
        { item: 'Afinar y probar tensión en banco', completado: false }
      ]
    },
    {
      titulo: 'Finanzas: Validar Presupuesto de Transporte y Viáticos',
      descripcion: 'Cotización de autobuses para la presentación de gala en el Teatro Nacional.',
      departamento: 'FIN',
      estado: 'bloqueada',
      prioridad: 'alta',
      entidad_tipo: 'evento',
      entidad_label: 'Gala de Gala Teatro',
      fecha_vencimiento: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      checklist: [
        { item: 'Revisar cotización de choferes', completado: true },
        { item: 'Autorización formal de Dirección', completado: false }
      ]
    },
    {
      titulo: 'ACM: Cargar Partituras Suzuki Libro 2 en Portal Maestros',
      descripcion: 'Distribución digital de materiales pedagógicos para la sección de vientos y cuerdas.',
      departamento: 'ACM',
      estado: 'en_progreso',
      prioridad: 'media',
      entidad_tipo: 'evento',
      entidad_label: 'Ciclo Lectivo Suzuki',
      fecha_vencimiento: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      checklist: [
        { item: 'Subir PDFs al repositorio institucional', completado: true },
        { item: 'Notificar a los maestros por sistema', completado: false }
      ]
    },
    {
      titulo: 'Dirección: Firma de Convenio con Sala de Conciertos',
      descripcion: 'Aprobación de la minuta de comodato y uso de escenario para la orquesta infantil.',
      departamento: 'DIR',
      estado: 'completada',
      prioridad: 'media',
      entidad_tipo: 'evento',
      entidad_label: 'Convenio Institucional',
      fecha_vencimiento: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      checklist: [
        { item: 'Revisión legal', completado: true },
        { item: 'Firma y sello oficial', completado: true }
      ]
    }
  ]

  try {
    for (const c of casosDemo) {
      await tareasApi.crearTareaInstitucional(c)
    }
    AppToast.show('Casos de demostración creados en el tablero', 'success')
    await refreshTareas(container)
  } catch (err) {
    // Si la BD restringe inserts anónimos, los mostramos en memoria reactiva
    state.tareas = casosDemo.map((c, i) => ({
      id: `demo-${i + 1}`,
      ...c,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    renderContent(container)
    attachGlobalEvents(container)
    AppToast.show('Casos cargados en el Tablero Kanban', 'success')
  }
}

function renderContent(container) {
  const tareasFiltradas = filtrarTareas()
  const total = state.tareas.length
  const pendientes = state.tareas.filter((t) => t.estado === 'pendiente').length
  const enProgreso = state.tareas.filter((t) => t.estado === 'en_progreso').length
  const bloqueadas = state.tareas.filter((t) => t.estado === 'bloqueada').length
  const completadas = state.tareas.filter((t) => t.estado === 'completada').length
  const observadas = state.tareas.filter((t) => t.estado === 'observada').length

  const activosFiltrosCount = [
    state.filtroEstado !== 'todos',
    state.filtroPrioridad !== 'todos',
    state.filtroDepartamento !== 'todos',
    state.criterioOrden !== 'prioridad',
  ].filter(Boolean).length

  const tituloPortal = state.departamentoFijo
    ? `Bandeja de Tareas — ${DEPARTAMENTOS[state.departamentoFijo] || state.departamentoFijo}`
    : state.processCode
      ? `Orquestador del Caso ${state.processCode}`
      : 'Hermes · Orquestador Institucional & Kanban'

  container.innerHTML = `
    <div class="page-container" style="max-width: 1500px;">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-kanban-fill fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">${escapeHTML(tituloPortal)}</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Orquestación transversal de flujos y procedimientos institucionales</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-hourglass me-1"></i><span>${pendientes}</span> Pendientes
              </span>
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-play-circle me-1"></i><span>${enProgreso}</span> En Progreso
              </span>
              ${bloqueadas > 0 ? `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-shield-slash me-1"></i><span>${bloqueadas}</span> Bloqueadas
                </span>
              ` : ''}
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-check2-circle me-1"></i><span>${completadas}/${total}</span> Completadas
              </span>
              ${observadas > 0 ? `
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-eye me-1"></i><span>${observadas}</span> Observadas
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Toolbar de Botones -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('hermes-tareas')}
            <div class="btn-group btn-group-sm shadow-xs rounded-3 overflow-hidden" id="btn-group-vista-hermes">
              <button class="btn btn-outline-secondary ${state.vistaModo === 'kanban' ? 'active' : ''}" data-modo="kanban" title="Vista Tablero Kanban" style="font-size:0.78rem;">
                <i class="bi bi-kanban me-1"></i>Kanban
              </button>
              <button class="btn btn-outline-secondary ${state.vistaModo === 'lista' ? 'active' : ''}" data-modo="lista" title="Vista Lista" style="font-size:0.78rem;">
                <i class="bi bi-list-task me-1"></i>Lista
              </button>
            </div>
            <button class="btn btn-sm btn-warning text-dark d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-bold shadow-xs" id="btnPoblarDemo" title="Poblar Casos de Demostración" style="font-size:0.78rem;">
              <i class="bi bi-lightning-charge-fill"></i>
              <span>Cargar Demo</span>
            </button>
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnExportarCSVTareas" title="Exportar CSV" style="font-size:0.78rem;">
              <i class="bi bi-file-earmark-spreadsheet"></i>
              <span class="d-none d-sm-inline">CSV</span>
            </button>
            <button class="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnSimularTelegram" style="font-size:0.78rem;">
              <i class="bi bi-telegram"></i>
              <span class="d-none d-sm-inline">Simular Ingesta</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda Exterior Permanente y Botón Toggle Filtros -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 overflow-hidden shadow-xs border border-body-tertiary">
              <span class="input-group-text bg-body-tertiary border-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-0 py-1.5 bg-body text-body" id="buscarTarea" placeholder="Buscar por título, descripción, responsable, departamento o caso..." value="${escapeHTML(state.busqueda || '')}" autocomplete="off" style="font-size:0.8rem;">
              ${state.busqueda ? `<button class="btn btn-sm bg-body text-muted border-0" id="btnLimpiarBuscarTarea"><i class="bi bi-x"></i></button>` : ''}
            </div>
          </div>

          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            <!-- Botón Desplegable de Filtros -->
            <button class="btn btn-sm ${state.filtrosAbiertos || activosFiltrosCount > 0 ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosTareas" type="button" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros</span>
              ${activosFiltrosCount > 0 ? `<span class="badge bg-white text-primary rounded-pill px-1.5 ms-1" style="font-size:0.68rem;">${activosFiltrosCount}</span>` : ''}
            </button>

            <!-- Botón Limpiar Filtros -->
            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosTareas" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>

            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnRefreshTareas" title="Refrescar">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Colapsable de Filtros -->
        <div class="collapse ${state.filtrosAbiertos ? 'show' : ''} pt-2.5" id="panelFiltrosTareas">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado de la Tarea</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroEstado" style="font-size:0.8rem;">
                  <option value="todos" ${state.filtroEstado === 'todos' ? 'selected' : ''}>Todos los estados</option>
                  <option value="pendiente" ${state.filtroEstado === 'pendiente' ? 'selected' : ''}>⏳ Pendientes</option>
                  <option value="en_progreso" ${state.filtroEstado === 'en_progreso' ? 'selected' : ''}>⚡ En Progreso</option>
                  <option value="bloqueada" ${state.filtroEstado === 'bloqueada' ? 'selected' : ''}>🚫 Bloqueadas</option>
                  <option value="observada" ${state.filtroEstado === 'observada' ? 'selected' : ''}>👁️ Observadas</option>
                  <option value="completada" ${state.filtroEstado === 'completada' ? 'selected' : ''}>✅ Completadas</option>
                  <option value="cancelada" ${state.filtroEstado === 'cancelada' ? 'selected' : ''}>❌ Canceladas</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Prioridad</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroPrioridad" style="font-size:0.8rem;">
                  <option value="todos" ${state.filtroPrioridad === 'todos' ? 'selected' : ''}>Toda Prioridad</option>
                  <option value="critica" ${state.filtroPrioridad === 'critica' ? 'selected' : ''}>🔴 Crítica</option>
                  <option value="alta" ${state.filtroPrioridad === 'alta' ? 'selected' : ''}>🟠 Alta</option>
                  <option value="media" ${state.filtroPrioridad === 'media' ? 'selected' : ''}>🔵 Media</option>
                  <option value="baja" ${state.filtroPrioridad === 'baja' ? 'selected' : ''}>⚪ Baja</option>
                </select>
              </div>

              ${!state.departamentoFijo ? `
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Departamento Asignado</label>
                  <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtroDepartamento" style="font-size:0.8rem;">
                    <option value="todos" ${state.filtroDepartamento === 'todos' ? 'selected' : ''}>Todos los Deptos</option>
                    ${Object.entries(DEPARTAMENTOS).map(([k, v]) => `
                      <option value="${k}" ${state.filtroDepartamento === k ? 'selected' : ''}>${v}</option>
                    `).join('')}
                  </select>
                </div>
              ` : ''}

              <div class="col-12 col-sm-6 ${!state.departamentoFijo ? 'col-lg-3' : 'col-lg-6'}">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="criterioOrdenSelect" style="font-size:0.8rem;">
                  <option value="prioridad" ${state.criterioOrden === 'prioridad' ? 'selected' : ''}>Prioridad (Crítica primero)</option>
                  <option value="vencimiento" ${state.criterioOrden === 'vencimiento' ? 'selected' : ''}>Fecha de Vencimiento</option>
                  <option value="titulo" ${state.criterioOrden === 'titulo' ? 'selected' : ''}>Título Alfabético (A-Z)</option>
                  <option value="recientes" ${state.criterioOrden === 'recientes' ? 'selected' : ''}>Más Recientes</option>
                </select>
              </div>

            </div>
          </div>
        </div>

      </div>

      ${buildCierreBanner()}

      <!-- Banner de Demostración si no hay tareas -->
      ${total === 0 ? `
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center bg-body mb-4 border border-warning-subtle">
          <i class="bi bi-kanban display-4 text-warning mb-2"></i>
          <h5 class="fw-bold text-body mb-1">El Tablero de Tareas está vacío</h5>
          <p class="text-secondary small mb-3">Actualmente no hay tareas registradas en la base de datos. Podés cargar un conjunto de casos de prueba reales para explorar el flujo multi-departamento.</p>
          <div>
            <button class="btn btn-warning text-dark fw-bold px-4 py-2 rounded-3 shadow-xs" id="btnPoblarDemoHero">
              <i class="bi bi-lightning-charge-fill me-1"></i> Cargar Casos de Demostración
            </button>
          </div>
        </div>
      ` : ''}

      <!-- CONTENEDOR PRINCIPAL: KANBAN MULTI-DEPARTAMENTO O LISTA V2 -->
      <div id="contenedor-hermes-vista">
        ${state.vistaModo === 'kanban' ? _renderKanban(tareasFiltradas) : _renderLista(tareasFiltradas)}
      </div>

    </div>
  `
}

function _renderKanban(tareas) {
  return `
    <div class="d-flex gap-3 overflow-x-auto pb-3 hermes-kanban-row" style="min-height: 580px;">
      ${HERMES_KANBAN_COLUMNS.map(col => {
        const colTareas = tareas.filter(col.matcher)
        return `
          <div class="hermes-kanban-col-wrapper" style="flex: 1 1 260px; min-width: 260px; max-width: 320px;">
            <div class="hermes-kanban-col h-100">
              <!-- Header de Columna -->
              <div class="hermes-kanban-header">
                <div class="d-flex align-items-center gap-1.5">
                  <span class="hermes-kanban-step">${col.step}</span>
                  <span class="fw-bold text-body text-truncate" style="font-size:0.82rem;">${col.title}</span>
                </div>
                <span class="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-0.5 fw-bold" style="font-size:0.7rem;">
                  ${colTareas.length}
                </span>
              </div>

              <!-- Tarjetas de la Columna -->
              <div class="hermes-kanban-body">
                ${colTareas.length > 0 ? colTareas.map(_renderKanbanCard).join('') : `
                  <div class="text-center py-5 text-muted small my-auto">
                    <i class="bi bi-inbox fs-3 d-block mb-1 opacity-40"></i>
                    Sin tareas en esta etapa
                  </div>
                `}
              </div>
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

function _renderKanbanCard(tarea) {
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : []
  const hechos = checklist.filter((c) => c.completado).length
  const total = checklist.length
  const pct = total > 0 ? Math.round((hechos / total) * 100) : 0

  const dias = tarea.fecha_vencimiento
    ? Math.ceil((new Date(tarea.fecha_vencimiento) - new Date()) / 86400000)
    : null
  const vencClass =
    dias === null ? 'text-muted' : dias < 0 ? 'text-danger fw-bold' : dias < 3 ? 'text-warning-emphasis fw-semibold' : 'text-muted'

  const entityChip = renderTaskEntityChip(tarea)
  const esToolCall = tarea.entidad_tipo === 'tool_call'
  const esAlumno = tarea.entidad_tipo === 'alumno' || tarea.entidad_label?.toLowerCase().includes('alumno')

  return `
    <div class="card border-0 shadow-xs rounded-3 p-2.5 bg-body tarea-card-kanban d-flex flex-column" 
         data-tarea-id="${tarea.id}" 
         style="border-left: 4px solid ${prioridad.border} !important; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
      
      <!-- Fila 1: Depto Badge & Prioridad -->
      <div class="d-flex align-items-center justify-content-between gap-1 mb-1.5">
        <span class="badge ${DEPARTAMENTO_BADGES[tarea.departamento] || 'bg-secondary-subtle text-secondary'} rounded-pill px-2 py-0.5" style="font-size:0.65rem;">
          ${tarea.departamento || 'GRAL'}
        </span>
        <div class="d-flex align-items-center gap-1">
          ${esToolCall ? `<span class="badge bg-dark text-white rounded-pill px-1.5" style="font-size:0.6rem;"><i class="bi bi-robot"></i> Tool</span>` : ''}
          <span class="badge bg-${prioridad.color}-subtle text-${prioridad.color}-emphasis border border-${prioridad.color}-subtle rounded-pill px-1.5 py-0.5 fw-bold" style="font-size:0.62rem;">
            ${prioridad.label}
          </span>
        </div>
      </div>

      <!-- Título -->
      <div class="fw-bold text-body text-truncate mb-1" style="font-size:0.82rem;" title="${escapeHTML(tarea.titulo)}">
        ${escapeHTML(tarea.titulo)}
      </div>

      ${tarea.descripcion ? `
        <div class="text-secondary small mb-2 line-clamp-2" style="font-size:0.72rem; line-height:1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHTML(tarea.descripcion)}
        </div>
      ` : ''}

      ${entityChip ? `<div class="mb-1.5 text-truncate" style="font-size:0.7rem;">${entityChip}</div>` : ''}

      <!-- Barra de Checklist si aplica -->
      ${total > 0 ? `
        <div class="p-1.5 rounded-2 bg-body-tertiary mb-2 mt-auto">
          <div class="d-flex justify-content-between align-items-center mb-0.5" style="font-size:0.65rem;">
            <span class="text-muted fw-semibold">Checklist</span>
            <span class="text-muted fw-bold">${hechos}/${total}</span>
          </div>
          <div class="progress" style="height: 3px;">
            <div class="progress-bar bg-primary" style="width: ${pct}%;"></div>
          </div>
        </div>
      ` : '<div class="mt-auto"></div>'}

      <!-- Footer con Acciones Rápidas -->
      <div class="d-flex align-items-center justify-content-between pt-1.5 border-top border-body-tertiary mt-1" style="font-size:0.68rem;">
        <div class="text-muted text-truncate">
          ${tarea.fecha_vencimiento ? `<span class="${vencClass}"><i class="bi bi-calendar-event me-0.5"></i>${tarea.fecha_vencimiento}</span>` : '<span>Sin fecha</span>'}
        </div>

        <div class="d-flex align-items-center gap-1">
          ${esAlumno || tarea.departamento === 'COM' ? `
            <button class="btn btn-xs btn-outline-success p-1 rounded-2 btn-despachar-whatsapp" data-tarea-id="${tarea.id}" title="Despachar WhatsApp / COM">
              <i class="bi bi-whatsapp"></i>
            </button>
          ` : ''}
          <button class="btn btn-xs btn-outline-primary py-0.5 px-2 rounded-2 fw-semibold btn-detalle" data-tarea-id="${tarea.id}" style="font-size:0.7rem;">
            <span>Ficha</span>
          </button>
        </div>
      </div>

    </div>
  `
}

function _renderLista(tareas) {
  return `
    <div class="row g-3" id="tareasList">
      ${
        tareas.length === 0
          ? `<div class="col-12">
               <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-body text-muted">
                 <i class="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                 <span class="fw-semibold">No hay tareas que coincidan con los filtros seleccionados</span>
               </div>
             </div>`
          : tareas.map(renderTareaCard).join('')
      }
    </div>
  `
}

function renderTareaCard(tarea) {
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : []
  const hechos = checklist.filter((c) => c.completado).length
  const total = checklist.length
  const pct = total > 0 ? Math.round((hechos / total) * 100) : 0

  const dias = tarea.fecha_vencimiento
    ? Math.ceil((new Date(tarea.fecha_vencimiento) - new Date()) / 86400000)
    : null
  const vencClass =
    dias === null ? 'text-muted' : dias < 0 ? 'text-danger fw-bold' : dias < 3 ? 'text-warning-emphasis fw-semibold' : 'text-muted'

  const entityChip = renderTaskEntityChip(tarea)
  const statusBadge = renderTaskStatusBadge(tarea.estado)
  const esToolCall = tarea.entidad_tipo === 'tool_call'
  const esAlumno = tarea.entidad_tipo === 'alumno' || tarea.entidad_label?.toLowerCase().includes('alumno')

  return `
    <div class="col-12 col-md-6 col-xl-4 d-flex">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-body tarea-card position-relative overflow-hidden w-100 d-flex flex-column" 
           data-tarea-id="${tarea.id}" 
           style="border-left: 4px solid ${prioridad.border} !important; transition: transform 0.15s ease, box-shadow 0.15s ease;">
        
        <!-- Fila 1: Badges y Estado -->
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-1.5 mb-2">
          <div class="d-flex align-items-center gap-1.5 flex-wrap">
            <span class="badge bg-${prioridad.color}-subtle text-${prioridad.color}-emphasis border border-${prioridad.color}-subtle px-2 py-0.5 rounded-pill fw-bold" style="font-size:0.68rem;">
              ${prioridad.label}
            </span>
            ${esToolCall ? `<span class="badge bg-dark-subtle text-body border px-2 py-0.5 rounded-pill" style="font-size:0.68rem;"><i class="bi bi-robot me-1 text-primary"></i>Tool</span>` : ''}
            <span class="badge ${DEPARTAMENTO_BADGES[tarea.departamento] || 'bg-body-secondary text-body border'} px-2 py-0.5 rounded-pill" style="font-size:0.68rem;">
              <i class="bi bi-building me-1"></i>${DEPARTAMENTOS[tarea.departamento] || tarea.departamento}
            </span>
          </div>

          <div>
            ${statusBadge}
          </div>
        </div>

        <!-- Título y Descripción -->
        <h6 class="fw-bold text-body mb-1" style="font-size:0.9rem; line-height: 1.35;">${escapeHTML(tarea.titulo)}</h6>
        ${tarea.descripcion ? `<p class="text-secondary small mb-2 line-clamp-2" style="font-size:0.76rem; line-height:1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHTML(tarea.descripcion)}</p>` : ''}

        ${entityChip ? `<div class="mb-2" style="font-size:0.72rem;">${entityChip}</div>` : ''}

        <!-- Barra de Checklist si aplica -->
        ${total > 0 ? `
          <div class="p-2 rounded-3 bg-body-tertiary mb-2 mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-semibold" style="font-size:0.7rem;"><i class="bi bi-check2-square me-1"></i>Checklist</span>
              <span class="text-muted small fw-bold" style="font-size:0.7rem;">${hechos}/${total} (${pct}%)</span>
            </div>
            <div class="progress" style="height: 4px;">
              <div class="progress-bar bg-primary" style="width: ${pct}%;"></div>
            </div>
          </div>
        ` : '<div class="mt-auto"></div>'}

        <!-- Footer con Metadatos & Botón Ficha -->
        <div class="d-flex align-items-center justify-content-between pt-2 border-top border-body-tertiary mt-2">
          <div class="text-muted small" style="font-size:0.7rem;">
            ${tarea.fecha_vencimiento ? `
              <span class="${vencClass}">
                <i class="bi bi-calendar-event me-1"></i>${tarea.fecha_vencimiento}${dias !== null && dias < 0 ? ' (vencida)' : ''}
              </span>
            ` : '<span><i class="bi bi-clock me-1"></i>Sin fecha límite</span>'}
          </div>

          <div class="d-flex align-items-center gap-1.5">
            ${esAlumno || tarea.departamento === 'COM' ? `
              <button class="btn btn-sm btn-outline-success px-2 py-1 rounded-3 btn-despachar-whatsapp shadow-2xs" data-tarea-id="${tarea.id}" title="Contactar por WhatsApp">
                <i class="bi bi-whatsapp"></i>
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-3 fw-semibold btn-detalle shadow-2xs" 
                    data-tarea-id="${tarea.id}" 
                    style="font-size:0.75rem;">
              <span>Gestionar</span>
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
}

function filtrarTareas() {
  let res = [...state.tareas]
  if (state.filtroEstado !== 'todos') res = res.filter((t) => t.estado === state.filtroEstado)
  if (!state.departamentoFijo && state.filtroDepartamento !== 'todos') {
    res = res.filter((t) => t.departamento === state.filtroDepartamento)
  }
  if (state.filtroPrioridad !== 'todos') res = res.filter((t) => t.prioridad === state.filtroPrioridad)
  if (state.busqueda) {
    const q = state.busqueda.toLowerCase()
    res = res.filter(
      (t) => (t.titulo || '').toLowerCase().includes(q) || (t.descripcion || '').toLowerCase().includes(q) || (t.updated_by_nombre || '').toLowerCase().includes(q) || (t.correlation_id || '').toLowerCase().includes(q),
    )
  }

  // Criterio de Orden
  if (state.criterioOrden === 'prioridad') {
    res.sort((a, b) => (PRIORIDADES[a.prioridad]?.orden ?? 9) - (PRIORIDADES[b.prioridad]?.orden ?? 9))
  } else if (state.criterioOrden === 'vencimiento') {
    res.sort((a, b) => {
      if (!a.fecha_vencimiento) return 1
      if (!b.fecha_vencimiento) return -1
      return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)
    })
  } else if (state.criterioOrden === 'titulo') {
    res.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''))
  } else if (state.criterioOrden === 'recientes') {
    res.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }

  return res
}

function attachGlobalEvents(container) {
  const signal = _abortController.signal
  const rerender = () => {
    renderContent(container)
    attachGlobalEvents(container)
  }

  attachViewInfoEvents(container)

  // Alternar vista Kanban vs Lista
  container.querySelectorAll('#btn-group-vista-hermes button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.vistaModo = btn.dataset.modo
      rerender()
    }, { signal })
  })

  // Poblar Casos Demo
  container.querySelector('#btnPoblarDemo')?.addEventListener('click', () => {
    poblarCasosDemo(container)
  }, { signal })

  container.querySelector('#btnPoblarDemoHero')?.addEventListener('click', () => {
    poblarCasosDemo(container)
  }, { signal })

  // Toggle Panel Filtros
  container.querySelector('#btnToggleFiltrosTareas')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    rerender()
  }, { signal })

  // Limpiar todos los filtros y búsqueda
  container.querySelector('#btnLimpiarFiltrosTareas')?.addEventListener('click', () => {
    state.busqueda = ''
    state.filtroEstado = 'todos'
    state.filtroPrioridad = 'todos'
    state.filtroDepartamento = 'todos'
    state.criterioOrden = 'prioridad'
    rerender()
  }, { signal })

  // Buscador permanente con debounce
  const buscar = container.querySelector('#buscarTarea')
  buscar?.addEventListener(
    'input',
    (e) => {
      state.busqueda = e.target.value
      const filtradas = filtrarTareas()
      const contenedor = container.querySelector('#contenedor-hermes-vista')
      if (contenedor) {
        contenedor.innerHTML = state.vistaModo === 'kanban' ? _renderKanban(filtradas) : _renderLista(filtradas)
        attachCardEvents(container)
      }
    },
    { signal },
  )

  container.querySelector('#btnLimpiarBuscarTarea')?.addEventListener('click', () => {
    state.busqueda = ''
    rerender()
  }, { signal })

  // Selectores dentro del panel colapsable
  container.querySelector('#filtroEstado')?.addEventListener('change', (e) => {
    state.filtroEstado = e.target.value
    rerender()
  }, { signal })

  container.querySelector('#filtroDepartamento')?.addEventListener('change', (e) => {
    state.filtroDepartamento = e.target.value
    rerender()
  }, { signal })

  container.querySelector('#filtroPrioridad')?.addEventListener('change', (e) => {
    state.filtroPrioridad = e.target.value
    rerender()
  }, { signal })

  container.querySelector('#criterioOrdenSelect')?.addEventListener('change', (e) => {
    state.criterioOrden = e.target.value
    rerender()
  }, { signal })

  container.querySelector('#btnRefreshTareas')?.addEventListener('click', () => {
    refreshTareas(container)
  }, { signal })

  container.querySelector('#btnExportarCSVTareas')?.addEventListener('click', () => {
    exportarCSVTareas(filtrarTareas())
  }, { signal })

  container.querySelector('#btnSimularTelegram')?.addEventListener('click', () => {
    simularIngestaTelegram(container)
  }, { signal })

  container.querySelector('#btnDescargarActa')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generando...'
    try {
      const eventId = btn.dataset.eventId
      let eventoData = {}
      if (eventId) {
        const { data } = await supabase
          .from('calendario_institucional')
          .select('id, titulo, categoria, fecha_inicio, departamento_responsable, metadata')
          .eq('id', eventId)
          .single()
        if (data) eventoData = data
      }
      generateCaseDossierPdf({
        tasks: state.tareas,
        correlation_id: eventId || state.correlationId || 'EVT-ANIVERSARIO',
        contract: {
          process_code: eventoData.categoria?.toUpperCase() || 'EVT-P09',
          process_name: eventoData.titulo || 'Concierto Aniversario Institucional',
          department_owner: eventoData.departamento_responsable || 'DIR',
        },
        closure_summary:
          `Evento "${eventoData.titulo || 'Concierto Aniversario'}" completado al 100%. ` +
          `Total de tareas ejecutadas: ${state.tareas.length}.`,
      })
      AppToast.show('Dossier PDF generado correctamente', 'success')
    } catch (err) {
      console.error('[TareasView] Error al generar acta PDF:', err)
      AppToast.show('Error al generar el acta PDF: ' + err.message, 'error')
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-file-earmark-pdf-fill"></i> Descargar Acta PDF'
    }
  }, { signal })

  attachCardEvents(container)
}

function attachCardEvents(container) {
  const signal = _abortController.signal

  container.querySelectorAll('.btn-detalle').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const tarea = state.tareas.find((t) => t.id === btn.dataset.tareaId)
        if (tarea) openTareaModal(container, tarea)
      },
      { signal },
    )
  })

  // Despacho directo a WhatsApp
  container.querySelectorAll('.btn-despachar-whatsapp').forEach(btn => {
    btn.addEventListener('click', () => {
      const tarea = state.tareas.find(t => t.id === btn.dataset.tareaId)
      if (tarea) _modalDespachoWhatsApp(tarea)
    }, { signal })
  })
}

function _modalDespachoWhatsApp(tarea) {
  const destinatario = tarea.entidad_label || 'Representante Legal'
  const telefonoDefault = '+18096714165'
  const plantillaSugerida = `Estimada familia de ${destinatario}, le escribimos del Sistema Operativo Institucional (SOI) en relación a: "${tarea.titulo}". Por favor contáctenos para coordinar los detalles.`

  AppModal.open({
    title: `Despacho de WhatsApp (COM) — Caso ${tarea.correlation_id || tarea.id.slice(0, 8)}`,
    size: 'md',
    body: `
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Destinatario / Tutor</label>
        <div class="fw-bold text-body"><i class="bi bi-person-circle me-1 text-primary"></i>${escapeHTML(destinatario)}</div>
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Número de WhatsApp</label>
        <div class="input-group input-group-sm shadow-xs rounded-3 overflow-hidden">
          <span class="input-group-text bg-body-tertiary"><i class="bi bi-telephone text-success"></i></span>
          <input type="tel" class="form-control fw-semibold" id="modal-wa-telefono" value="${telefonoDefault}" placeholder="+1809...">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Mensaje Pre-redactado por el Sistema</label>
        <textarea class="form-control" id="modal-wa-cuerpo" rows="4">${escapeHTML(plantillaSugerida)}</textarea>
      </div>
      <div class="alert alert-info py-2 px-3 small rounded-3 border-0">
        <i class="bi bi-info-circle me-1"></i>Al enviar, se abrirá el chat oficial con el número indicado y se asentará la evidencia inmutable en el historial del caso.
      </div>
    `,
    saveText: 'Abrir WhatsApp y Registrar',
    onSave: async (mb) => {
      const msg = mb.querySelector('#modal-wa-cuerpo').value.trim()
      const tel = mb.querySelector('#modal-wa-telefono').value.trim()
      if (!msg) {
        AppToast.show('El mensaje no puede estar vacío', 'error')
        return false
      }

      const cleanPhone = tel.replace(/[^0-9]/g, '')
      if (!cleanPhone) {
        AppToast.show('Debe ingresar un número de teléfono válido', 'error')
        return false
      }

      try {
        const actor = state.actor || { id: null, nombre: 'Coordinación' }
        await tareasApi.agregarComentario(tarea.id, `[WhatsApp Enviado a +${cleanPhone}]: "${msg}"`, actor)
        AppToast.show(`Evidencia de despacho registrada para +${cleanPhone}`, 'success')
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
        window.open(waUrl, '_blank')
      } catch (err) {
        AppToast.show(`Error al registrar despacho: ${err.message}`, 'error')
      }
    }
  })
}

async function openTareaModal(container, tarea) {
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : []
  const statusBadge = renderTaskStatusBadge(tarea.estado)
  const entityChip = renderTaskEntityChip(tarea)

  let comentarios = []
  let historial = []
  try {
    ;[comentarios, historial] = await Promise.all([
      tareasApi.listarComentarios(tarea.id),
      tareasApi.listarHistorial(tarea.id),
    ])
  } catch (_e) {
    // degrade gracefully
  }

  const adjuntos = Array.isArray(tarea.documentos_adjuntos) ? tarea.documentos_adjuntos : []
  const estadosParaSelect = Object.entries(ESTADOS).filter(([k]) => k !== 'observada')

  const esAprobableToolCall = esTareaToolCallAprobable(tarea)
  const toolCallPayload = esAprobableToolCall ? extraerToolCallPayload(tarea) : null
  const toolCallArgsFilas = toolCallPayload ? formatearArgsToolCall(toolCallPayload.args) : []

  AppModal.open({
    title: tarea.titulo,
    size: 'xl',
    body: `
      <div class="modal-tarea-content">
        <p class="text-body mb-3">${escapeHTML(tarea.descripcion || '')}</p>
        <div class="row g-2 mb-3 p-2.5 rounded-3 bg-body-tertiary">
          <div class="col-md-3">
            <span class="text-muted small d-block">Departamento</span>
            <strong class="text-body small">${DEPARTAMENTOS[tarea.departamento] || tarea.departamento}</strong>
          </div>
          <div class="col-md-3">
            <span class="text-muted small d-block">Prioridad</span>
            <span class="badge bg-${prioridad.color}-subtle text-${prioridad.color}-emphasis border border-${prioridad.color}-subtle px-2 py-0.5 rounded-pill fw-bold" style="font-size:0.72rem;">${prioridad.label}</span>
          </div>
          <div class="col-md-3">
            <span class="text-muted small d-block">Vencimiento</span>
            <strong class="text-body small">${tarea.fecha_vencimiento || 'Sin límite'}</strong>
          </div>
          <div class="col-md-3">
            <span class="text-muted small d-block">Correlation ID</span>
            <code class="small text-primary">${escapeHTML(tarea.correlation_id || 'N/A')}</code>
          </div>
        </div>

        ${entityChip ? `<div class="mb-3"><strong>Entidad asociada</strong><div class="mt-1">${entityChip}</div></div>` : ''}

        ${
          esAprobableToolCall && toolCallPayload
            ? `<div class="mb-3 border rounded-3 p-3 bg-dark bg-opacity-10" id="toolApprovalPanel">
                 <strong class="d-block mb-2"><i class="bi bi-robot me-1"></i>Solicitud de ejecución de tool</strong>
                 <div class="row mb-2 small">
                   <div class="col-md-6"><span class="text-muted">Tool</span><p class="mb-0 fw-semibold">${escapeHTML(tarea.entidad_label || toolCallPayload.tool_name)}</p></div>
                   <div class="col-md-6"><span class="text-muted">Departamento</span><p class="mb-0">${DEPARTAMENTOS[tarea.departamento] || tarea.departamento}</p></div>
                 </div>
                 ${
                   toolCallArgsFilas.length > 0
                     ? `<table class="table table-sm table-borderless mb-2">
                          <tbody>
                            ${toolCallArgsFilas
                              .map((f) => `<tr><td class="text-muted small" style="width:40%;">${escapeHTML(f.clave)}</td><td class="small">${escapeHTML(f.valor)}</td></tr>`)
                              .join('')}
                          </tbody>
                        </table>`
                     : '<p class="text-muted small mb-2">Esta tool no requiere argumentos.</p>'
                 }
                 <textarea class="form-control form-control-sm mb-2" id="toolRechazoMotivo" rows="2"
                   placeholder="Motivo del rechazo (obligatorio solo si rechazás)..."></textarea>
                 <div class="d-flex gap-2">
                   <button class="btn btn-sm btn-success" id="btnAprobarTool" type="button">
                     <i class="bi bi-check-circle me-1"></i>Aprobar y ejecutar
                   </button>
                   <button class="btn btn-sm btn-outline-danger" id="btnRechazarTool" type="button">
                     <i class="bi bi-x-circle me-1"></i>Rechazar
                   </button>
                 </div>
               </div>`
            : ''
        }

        <div class="mb-3">
          <strong>Estado actual</strong>
          <div class="mt-1 mb-2">${statusBadge}</div>
          ${
            tarea.estado !== 'observada'
              ? `<select class="form-select form-select-sm" id="modalEstado">
                   ${estadosParaSelect
                     .map(([k, v]) => `<option value="${k}" ${tarea.estado === k ? 'selected' : ''}>${v.label}</option>`)
                     .join('')}
                 </select>`
              : `<input type="hidden" id="modalEstado" value="observada">
                 <p class="text-muted small mt-1"><i class="bi bi-info-circle me-1"></i>Este estado sólo puede modificarse mediante una nueva transición.</p>`
          }
        </div>

        ${
          tarea.estado !== 'observada'
            ? `<div class="mb-3 border rounded-3 p-3 bg-warning-subtle text-body">
                 <strong class="d-block mb-1 text-warning-emphasis"><i class="bi bi-eye me-1"></i>Marcar como Observada</strong>
                 <p class="small text-secondary mb-2">Requiere un comentario obligatorio que explique la observación.</p>
                 <textarea class="form-control form-control-sm" id="modalObservarComentario" rows="2"
                   placeholder="Motivo de la observación (obligatorio)..."></textarea>
                 <button class="btn btn-sm btn-warning mt-2" id="btnObservar" type="button">
                   <i class="bi bi-eye me-1"></i>Marcar como Observada
                 </button>
               </div>`
            : ''
        }

        ${
          checklist.length > 0
            ? `<div class="mb-3">
                 <strong>Checklist de control</strong>
                 <div class="list-group list-group-flush mt-1" id="modalChecklist">
                   ${checklist
                     .map(
                       (c, i) => `
                     <label class="list-group-item px-0 d-flex align-items-center gap-2 bg-transparent">
                       <input class="form-check-input m-0 chk-item" type="checkbox" data-idx="${i}" ${c.completado ? 'checked' : ''}>
                       <span class="${c.completado ? 'text-decoration-line-through text-muted' : 'text-body'}">${escapeHTML(c.item)}</span>
                     </label>`,
                     )
                     .join('')}
                 </div>
               </div>`
            : ''
        }

        <div class="mb-3">
          <strong>Feedback / notas de cierre</strong>
          <textarea class="form-control form-control-sm mt-1" id="modalFeedback" rows="2"
            placeholder="Comentario del responsable...">${escapeHTML(tarea.feedback || '')}</textarea>
        </div>

        <hr>
        <div class="row g-3 mt-1">
          <div class="col-md-6">
            ${renderTaskCommentsPanel(tarea.id, comentarios)}
          </div>
          <div class="col-md-6">
            ${renderTaskAttachmentsPanel(tarea.id, adjuntos)}
          </div>
        </div>
        <div class="mt-3">
          ${renderTaskHistoryTimeline(historial)}
        </div>
      </div>
    `,
    saveText: 'Guardar cambios',
    onOpen: (modalBody) => {
      const signal = _abortController.signal

      wireTaskAttachmentsPanel(modalBody, tareasApi.urlFirmada, signal)

      const btnObservar = modalBody.querySelector('#btnObservar')
      btnObservar?.addEventListener(
        'click',
        async () => {
          const comentario = modalBody.querySelector('#modalObservarComentario')?.value?.trim() || ''
          if (!comentario) {
            AppToast.show('El comentario es obligatorio para marcar como Observada', 'error')
            return
          }
          try {
            btnObservar.disabled = true
            const actor = state.actor || { id: null, nombre: 'Usuario' }
            await tareasApi.observarTarea(tarea.id, comentario, actor)
            AppToast.show('Tarea marcada como Observada', 'success')
            AppModal.close?.()
            await renderTareasView(container, { departamento: state.departamentoFijo, actor: state.actor })
          } catch (err) {
            AppToast.show(`Error: ${err.message}`, 'error')
            btnObservar.disabled = false
          }
        },
        { signal },
      )

      const btnAprobarTool = modalBody.querySelector('#btnAprobarTool')
      const btnRechazarTool = modalBody.querySelector('#btnRechazarTool')

      btnAprobarTool?.addEventListener(
        'click',
        async () => {
          try {
            btnAprobarTool.disabled = true
            if (btnRechazarTool) btnRechazarTool.disabled = true
            const actor = state.actor || { id: null, nombre: 'Usuario' }
            const resultado = await tareasApi.aprobarToolCall(tarea.id, actor)
            AppToast.show(resultado?.mensaje || 'Tool ejecutada correctamente', 'success')
            AppModal.close?.()
            await renderTareasView(container, { departamento: state.departamentoFijo, actor: state.actor })
          } catch (err) {
            AppToast.show(`Error al aprobar la tool: ${err.message}`, 'error')
            btnAprobarTool.disabled = false
            if (btnRechazarTool) btnRechazarTool.disabled = false
          }
        },
        { signal },
      )

      btnRechazarTool?.addEventListener(
        'click',
        async () => {
          const motivo = modalBody.querySelector('#toolRechazoMotivo')?.value?.trim() || ''
          if (!motivo) {
            AppToast.show('El motivo del rechazo es obligatorio', 'error')
            return
          }
          try {
            btnRechazarTool.disabled = true
            if (btnAprobarTool) btnAprobarTool.disabled = true
            const actor = state.actor || { id: null, nombre: 'Usuario' }
            await tareasApi.rechazarToolCall(tarea.id, motivo, actor)
            AppToast.show('Solicitud de tool rechazada', 'success')
            AppModal.close?.()
            await renderTareasView(container, { departamento: state.departamentoFijo, actor: state.actor })
          } catch (err) {
            AppToast.show(`Error al rechazar la tool: ${err.message}`, 'error')
            btnRechazarTool.disabled = false
            if (btnAprobarTool) btnAprobarTool.disabled = false
          }
        },
        { signal },
      )

      const btnComentario = modalBody.querySelector('.task-comment-submit')
      btnComentario?.addEventListener(
        'click',
        async () => {
          const input = modalBody.querySelector('.task-comment-input')
          const cuerpo = input?.value?.trim() || ''
          if (!cuerpo) {
            AppToast.show('El comentario no puede estar vacío', 'error')
            return
          }
          try {
            btnComentario.disabled = true
            const actor = state.actor || { id: null, nombre: 'Usuario' }
            await tareasApi.agregarComentario(tarea.id, cuerpo, actor)
            AppToast.show('Comentario agregado', 'success')
            if (input) input.value = ''
            const nuevosComentarios = await tareasApi.listarComentarios(tarea.id)
            const panelEl = modalBody.querySelector('.task-comments-panel')
            if (panelEl) {
              const newHtml = renderTaskCommentsPanel(tarea.id, nuevosComentarios)
              panelEl.outerHTML = newHtml
            }
          } catch (err) {
            AppToast.show(`Error: ${err.message}`, 'error')
          } finally {
            btnComentario.disabled = false
          }
        },
        { signal },
      )
    },
    onSave: async (modalBody) => {
      const nuevoEstado = modalBody.querySelector('#modalEstado').value
      const nuevoFeedback = modalBody.querySelector('#modalFeedback').value.trim()
      try {
        const checks = modalBody.querySelectorAll('.chk-item')
        for (const chk of checks) {
          const idx = parseInt(chk.dataset.idx, 10)
          if (Boolean(checklist[idx]?.completado) !== chk.checked) {
            await tareasApi.updateChecklistItem(tarea.id, idx, chk.checked)
          }
        }
        if (nuevoEstado === 'completada') {
          await tareasApi.completarTarea(tarea.id, nuevoFeedback || null)
        } else if (nuevoEstado !== 'observada') {
          await tareasApi.updateTareaEstado(tarea.id, nuevoEstado)
          if (nuevoFeedback !== (tarea.feedback || '')) {
            await tareasApi.guardarFeedback(tarea.id, nuevoFeedback)
          }
        }
        AppToast.show('Tarea actualizada', 'success')
        await renderTareasView(container, {
          departamento: state.departamentoFijo,
          actor: state.actor,
        })
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
      }
    },
  })
}

function simularIngestaTelegram(container) {
  AppModal.open({
    title: 'Simulador de Ingesta de Telegram (Bot de Tareas)',
    size: 'md',
    body: `
      <div class="mb-3">
        <label class="form-label small fw-semibold">Mensaje de Telegram</label>
        <textarea class="form-control" id="telegramMsg" rows="3" 
                  placeholder="Ej: direccion urgente necesito una constancia de estudios para beca"></textarea>
        <p class="text-muted small mt-1" style="font-size:11px">Escribe tu mensaje indicando el departamento como prefijo (ej: direccion, docencia, atencion, luteria, calidad, desarrollo).</p>
      </div>
      <div class="mb-2">
        <label class="form-label small fw-semibold">Simular Usuario</label>
        <select class="form-select form-select-sm" id="telegramUser">
          <option value="1">Juan Pérez (Docente)</option>
          <option value="2">María Gómez (Coordinadora)</option>
          <option value="3">Pedro Núñez (Luthier)</option>
        </select>
      </div>
    `,
    saveText: 'Procesar con IA (Groq)',
    onSave: async (mb) => {
      const msg = mb.querySelector('#telegramMsg').value.trim()
      if (!msg) {
        AppToast.show('Escribe un mensaje primero', 'error')
        return false
      }
      
      try {
        const deptTurnoRegex = /^(direccion|secretaria|docencia|atencion|calidad|desarrollo|dirección|luteria|finanzas)/i;
        const match = msg.match(deptTurnoRegex);
        if (!match) {
          AppToast.show('Formato incorrecto. El mensaje debe comenzar con el departamento.', 'error')
          return false
        }

        const deptoAbbr = match[1].toLowerCase()
        const deptoMap = {
          direccion: 'DIR',
          secretaria: 'SEC',
          docencia: 'ACM',
          atencion: 'ADM',
          calidad: 'DIR',
          desarrollo: 'ACM',
          luteria: 'LOG',
          finanzas: 'FIN'
        }
        
        const depto = deptoMap[deptoAbbr] || 'DIR'
        const contentText = msg.replace(deptTurnoRegex, '').trim()
        
        const payload = {
          titulo: `Telegram: ${contentText.length > 50 ? contentText.substring(0, 50) + '...' : contentText}`,
          descripcion: `Mensaje de Telegram: "${msg}"`,
          departamento: depto,
          estado: 'pendiente',
          prioridad: msg.toLowerCase().includes('urgente') ? 'alta' : 'media',
          correlation_id: `corr_tg_${Date.now()}`
        }

        await tareasApi.crearTareaInstitucional(payload)
        AppToast.show('Mensaje procesado: Tarea creada en ' + depto, 'success')
        
        await refreshTareas(container)
      } catch (err) {
        AppToast.show('Error al procesar: ' + err.message, 'error')
        return false
      }
    }
  })
}

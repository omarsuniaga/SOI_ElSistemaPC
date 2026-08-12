/**
 * casoDetalleView.js — Detalle y Expediente Digital de un Caso Hermes (Process Backbone)
 *
 * Mapea:
 * documento SOI → process_code/contrato → caso Hermes/correlation_id →
 * departamentos responsables → tareas → tareasView → cierre/evidencias.
 *
 * @param {HTMLElement} container
 * @param {{ processCode?: string, correlationId?: string }} opciones
 */

import '../styles/tareas.css'
import '../styles/procedimientos.css'
import * as tareasApi from '../api/tareasApi.js'
import { openCerrarCasoModal } from '../components/cerrarCasoModal.js'
import { generateCaseDossierPdf } from '../logic/caseDossierPdfGenerator.js'
import { router } from '../../../core/router/router.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección',
  ACM: 'Académica',
  ADM: 'Administración',
  FIN: 'Financiero',
  LOG: 'Logística',
  COM: 'Comunicaciones',
  TECNICO: 'Técnico',
  LUT: 'Lutería',
  OPR: 'Operaciones',
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function badgeForState(state) {
  const map = {
    pendiente: 'secondary',
    en_progreso: 'info',
    completada: 'success',
    bloqueada: 'danger',
    cancelada: 'dark',
    observada: 'warning',
  }
  return map[state] || 'secondary'
}

const state = { detail: null, cargando: false }

export async function renderCasoDetalleView(container, opciones = {}) {
  const ac = new AbortController()
  await cargarDetalle(container, opciones)

  const onClick = async (e) => {
    const goTasks = e.target.closest('[data-open-case-tasks]')
    if (goTasks) {
      router.navigate('hermes-tareas', {
        processCode: goTasks.dataset.processCode,
        correlationId: goTasks.dataset.correlationId,
      })
      return
    }

    const goProcedimientos = e.target.closest('#btn-back-procedimientos')
    if (goProcedimientos) {
      router.navigate('hermes-procedimientos')
      return
    }

    const closeBtn = e.target.closest('#btn-cerrar-caso')
    if (closeBtn) {
      const caseId = closeBtn.dataset.caseId
      const title = state.detail?.contract?.process_name || state.detail?.tasks?.[0]?.titulo || 'Caso Hermes'
      if (!caseId) return

      openCerrarCasoModal({
        caseId,
        title,
        caseDetail: state.detail,
        onClosed: () => router.navigate('hermes-procedimientos'),
      })
      return
    }

    const exportPdfBtn = e.target.closest('#btn-exportar-acta-pdf')
    if (exportPdfBtn) {
      if (state.detail) {
        generateCaseDossierPdf(state.detail, { autoDownload: true })
      }
      return
    }
  }

  container.addEventListener('click', onClick, { signal: ac.signal })

  return { teardown: () => ac.abort() }
}

async function cargarDetalle(container, opciones) {
  try {
    state.cargando = true
    renderLoading(container)
    state.detail = await tareasApi.getProcessCaseDetail({
      correlationId: opciones.correlationId || null,
      processCode: opciones.processCode || null,
    })
    state.cargando = false
    render(container, opciones)
  } catch (err) {
    state.cargando = false
    container.innerHTML = `
      <div class="alert alert-danger m-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        No pude cargar el expediente del caso: ${esc(err.message)}
      </div>`
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 340px;">
      <div class="text-center text-muted">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="mb-0">Cargando expediente digital del caso…</p>
      </div>
    </div>`
}

function render(container, opciones) {
  const detail = state.detail || {}
  const contract = detail.contract || null
  const tasks = detail.tasks || []
  const metrics = detail.metrics || { total: 0, completadas: 0, bloqueadas: 0, observadas: 0, evidencias: 0 }
  const code = contract?.process_code || opciones.processCode || tasks[0]?.process_code || '—'
  const title = contract?.process_name || tasks[0]?.titulo || 'Caso Hermes'
  const owner = contract?.department_owner || tasks[0]?.departamento || '—'
  const departments = (contract?.responsible_departments || [...new Set(tasks.map((t) => t.departamento))])
    .map((d) => `<span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle me-1">${esc(DEPARTAMENTOS[d] || d)}</span>`)
    .join('')
  const requiredEvidence = (contract?.required_evidence || [])
    .map((e) => `<li class="mb-1">${esc(e.label || e.type || e)}</li>`)
    .join('')
  const closureCriteria = (contract?.closure_criteria || [])
    .map((c) => `<li class="mb-1">${esc(c)}</li>`)
    .join('')
  const tasksHtml = tasks.length === 0
    ? `<div class="text-muted small py-3 text-center">No se encontraron tareas vinculadas a este expediente.</div>`
    : tasks.map(renderTaskItem).join('')
  const closed = metrics.total > 0 && metrics.total === metrics.completadas && metrics.bloqueadas === 0

  container.innerHTML = `
    <div class="proc-container">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <div class="text-muted small mb-1">
            <i class="bi bi-folder2-open text-primary me-1"></i>Expediente Institucional
          </div>
          <h3 class="mb-1 fw-bold">${esc(title)}</h3>
          <div class="small text-muted">
            Process Code: <strong class="text-primary">${esc(code)}</strong> · Correlation ID: <code>${esc(detail.correlation_id || opciones.correlationId || '—')}</code>
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button id="btn-back-procedimientos" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Procedimientos
          </button>
          <button id="btn-exportar-acta-pdf" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-file-earmark-pdf me-1"></i> Exportar Acta PDF
          </button>
          <button class="btn btn-primary btn-sm" data-open-case-tasks data-process-code="${esc(code)}" data-correlation-id="${esc(detail.correlation_id || opciones.correlationId || '')}">
            <i class="bi bi-list-check me-1"></i> Ver Tareas del Caso
          </button>
          ${closed && (detail.correlation_id || opciones.correlationId) ? `
          <button id="btn-cerrar-caso" class="btn btn-success btn-sm" data-case-id="${esc(detail.correlation_id || opciones.correlationId)}">
            <i class="bi bi-check2-all me-1"></i> Concluir Caso
          </button>` : ''}
        </div>
      </div>

      <!-- Métricas del Expediente -->
      <div class="row row-cols-2 row-cols-lg-4 g-2 mb-4 proc-kpis-grid">
        ${kpi('Total Tareas', metrics.total, 'primary', 'bi-list-task')}
        ${kpi('Completadas', metrics.completadas, 'success', 'bi-check-circle')}
        ${kpi('Bloqueadas', metrics.bloqueadas, metrics.bloqueadas > 0 ? 'danger' : 'success', 'bi-slash-circle')}
        ${kpi('Evidencias Adjuntas', metrics.evidencias, 'info', 'bi-paperclip')}
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <!-- Información del Contrato SOI -->
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h6 class="mb-3 fw-bold"><i class="bi bi-bezier2 text-primary me-2"></i>Contrato SOI Asociado</h6>
              <div class="row g-3 small">
                <div class="col-md-6">
                  <div class="text-muted">Departamento Dueño</div>
                  <div class="fw-semibold">${esc(DEPARTAMENTOS[owner] || owner)}</div>
                </div>
                <div class="col-md-6">
                  <div class="text-muted">Documento Canónico</div>
                  <div class="fw-semibold">${esc(contract?.canonical_doc_path || 'Manual Operativo SOI')}</div>
                </div>
                <div class="col-12">
                  <div class="text-muted">Departamentos Responsables</div>
                  <div class="mt-1">${departments || '<span class="text-muted">—</span>'}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Tareas del Caso -->
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0 fw-bold"><i class="bi bi-clipboard-check text-primary me-2"></i>Tareas del Expediente</h6>
                <span class="badge bg-secondary-subtle text-secondary-emphasis">${tasks.length} tareas</span>
              </div>
              <div class="vstack gap-2">
                ${tasksHtml}
              </div>
            </div>
          </section>
        </div>

        <div class="col-lg-4">
          <!-- Evidencias Requeridas -->
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h6 class="mb-3 fw-bold"><i class="bi bi-collection text-primary me-2"></i>Evidencias Requeridas</h6>
              ${requiredEvidence ? `<ul class="small mb-0 ps-3">${requiredEvidence}</ul>` : '<div class="text-muted small">No definidas en el contrato.</div>'}
            </div>
          </section>

          <!-- Criterios de Cierre -->
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h6 class="mb-3 fw-bold"><i class="bi bi-check2-square text-primary me-2"></i>Criterios de Cierre</h6>
              ${closureCriteria ? `<ul class="small mb-0 ps-3">${closureCriteria}</ul>` : '<div class="text-muted small">Todas las tareas departamentales completadas.</div>'}
              <hr>
              <div class="small text-muted mb-1">Estado de Auditoría</div>
              <div class="fw-bold ${closed ? 'text-success' : 'text-warning'}">
                <i class="bi ${closed ? 'bi-patch-check-fill' : 'bi-hourglass-split'} me-1"></i>
                ${closed ? 'Listo para Resolución y Cierre' : 'En Ejecución / Pendiente'}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>`
}

function renderTaskItem(task) {
  const progress = Array.isArray(task.checklist) && task.checklist.length > 0
    ? Math.round((task.checklist.filter((item) => item.completado).length / task.checklist.length) * 100)
    : (task.estado === 'completada' ? 100 : 0)
  const color = badgeForState(task.estado)

  return `
    <div class="border rounded-3 p-3 bg-body shadow-sm">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${esc(task.titulo)}</div>
          <div class="small text-muted">${esc(DEPARTAMENTOS[task.departamento] || task.departamento)} · ${esc(task.process_code || 'Tarea de proceso')}</div>
        </div>
        <span class="badge bg-${color} text-capitalize">${esc(task.estado)}</span>
      </div>
      <div class="small text-muted mt-2">${task.fecha_vencimiento ? `Vence: ${esc(task.fecha_vencimiento)}` : 'Sin fecha límite'}</div>
      <div class="progress progress-minimal mt-2" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar bg-${color}" style="width: ${progress}%"></div>
      </div>
    </div>`
}

function kpi(label, value, color, icon) {
  return `
    <div class="col">
      <div class="proc-kpi-card h-100">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="kpi-num text-${color}">${value}</div>
            <div class="kpi-label">${label}</div>
          </div>
          <i class="bi ${icon} fs-4 text-${color} opacity-75"></i>
        </div>
      </div>
    </div>`
}

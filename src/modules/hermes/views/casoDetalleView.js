/**
 * casoDetalleView.js — Detalle de un caso/procedimiento Hermes.
 *
 * Mapea:
 * documento SOI → process_code/contrato → caso Hermes/correlation_id →
 * departamentos responsables → tareas → tareasView → cierre/evidencias.
 *
 * @param {HTMLElement} container
 * @param {{ processCode?: string, correlationId?: string }} opciones
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'
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
    container.innerHTML = `<div class="alert alert-danger m-3">No pude cargar el caso: ${esc(err.message)}</div>`
    return { teardown: () => ac.abort() }
  }

  container.addEventListener('click', (e) => {
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
    }
  }, { signal: ac.signal })

  return { teardown: () => ac.abort() }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 320px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted mb-0">Cargando detalle del caso…</p>
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
    .map((d) => `<span class="badge bg-light text-dark border me-1">${esc(DEPARTAMENTOS[d] || d)}</span>`)
    .join('')
  const requiredEvidence = (contract?.required_evidence || [])
    .map((e) => `<li class="mb-1">${esc(e.label || e.type || e)}</li>`)
    .join('')
  const closureCriteria = (contract?.closure_criteria || [])
    .map((c) => `<li class="mb-1">${esc(c)}</li>`)
    .join('')
  const tasksHtml = tasks.length === 0
    ? `<div class="text-muted small">No se encontraron tareas para este caso.</div>`
    : tasks.map(renderTaskItem).join('')
  const closed = metrics.total > 0 && metrics.total === metrics.completadas && metrics.bloqueadas === 0

  container.innerHTML = `
    <div class="p-3 p-md-4">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <div class="text-muted small">Caso / procedimiento</div>
          <h3 class="mb-1">${esc(title)}</h3>
          <div class="small text-muted">Process code: <strong>${esc(code)}</strong> · Correlation: <code>${esc(detail.correlation_id || opciones.correlationId || '—')}</code></div>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-back-procedimientos" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> Procedimientos
          </button>
          <button class="btn btn-primary btn-sm" data-open-case-tasks data-process-code="${esc(code)}" data-correlation-id="${esc(detail.correlation_id || opciones.correlationId || '')}">
            <i class="bi bi-list-check"></i> Ver tareas del caso
          </button>
        </div>
      </div>

      <div class="row row-cols-2 row-cols-lg-4 g-2 mb-4">
        ${kpi('Tareas', metrics.total, 'primary', 'bi-list-task')}
        ${kpi('Completadas', metrics.completadas, 'success', 'bi-check-circle')}
        ${kpi('Bloqueadas', metrics.bloqueadas, 'danger', 'bi-slash-circle')}
        ${kpi('Evidencias', metrics.evidencias, 'info', 'bi-paperclip')}
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-bezier2 me-2"></i>Contrato SOI</h5>
              <div class="row g-3 small">
                <div class="col-md-6"><div class="text-muted">Dueño</div><div class="fw-semibold">${esc(DEPARTAMENTOS[owner] || owner)}</div></div>
                <div class="col-md-6"><div class="text-muted">Documento canónico</div><div class="fw-semibold">${esc(contract?.canonical_doc_path || '—')}</div></div>
                <div class="col-12"><div class="text-muted">Departamentos responsables</div><div class="mt-1">${departments || '<span class="text-muted">—</span>'}</div></div>
              </div>
            </div>
          </section>

          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-clipboard-check me-2"></i>Tareas del caso</h5>
              <div class="vstack gap-2">
                ${tasksHtml}
              </div>
            </div>
          </section>
        </div>

        <div class="col-lg-4">
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-collection me-2"></i>Evidencia requerida</h5>
              ${requiredEvidence ? `<ul class="small mb-0">${requiredEvidence}</ul>` : '<div class="text-muted small">No definida en el contrato.</div>'}
            </div>
          </section>

          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-check2-square me-2"></i>Criterio de cierre</h5>
              ${closureCriteria ? `<ul class="small mb-0">${closureCriteria}</ul>` : '<div class="text-muted small">No definido en el contrato.</div>'}
              <hr>
              <div class="small text-muted mb-1">Estado del caso</div>
              <div class="fw-semibold ${closed ? 'text-success' : 'text-warning'}">
                ${closed ? 'Listo para cierre' : 'Aún abierto'}
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
    : 0
  const color = badgeForState(task.estado)
  return `
    <div class="border rounded-3 p-3 bg-body">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${esc(task.titulo)}</div>
          <div class="small text-muted">${esc(DEPARTAMENTOS[task.departamento] || task.departamento)} · ${esc(task.process_code || 'sin process_code')}</div>
        </div>
        <span class="badge bg-${color} text-capitalize">${esc(task.estado)}</span>
      </div>
      <div class="small text-muted mt-2">${task.fecha_vencimiento ? `Vence: ${esc(task.fecha_vencimiento)}` : 'Sin vencimiento'}</div>
      <div class="progress mt-2" style="height: 6px;">
        <div class="progress-bar bg-${color}" style="width: ${progress}%"></div>
      </div>
    </div>`
}

function kpi(label, value, color, icon) {
  return `
    <div class="col">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body py-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${icon} fs-4 text-${color}"></i>
            <div>
              <div class="fs-4 fw-bold lh-1">${value}</div>
              <div class="small text-muted">${label}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`
}

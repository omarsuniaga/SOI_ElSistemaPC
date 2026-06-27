/**
 * procedimientosView.js — Vista consolidada de Procedimientos (Portal Director, SP-3).
 *
 * Agrupa las tareas institucionales por correlation_id (el CASO/procedimiento) y muestra
 * el avance global, el desglose por estado, los departamentos involucrados y la prioridad
 * máxima. Lee de tareasApi.getProcedimientos() (RPC fn_procedimientos_resumen en real,
 * agrupación en memoria en mock).
 *
 * Patrón: retorna { teardown() }.
 *
 * @param {HTMLElement} container
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'
import { router } from '../../../core/router/router.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección', ACM: 'Académica', ADM: 'Administración', FIN: 'Financiero',
  LOG: 'Logística', COM: 'Comunicaciones', TECNICO: 'Técnico', LUT: 'Lutería', OPR: 'Operaciones',
}
const PRIORIDAD_COLOR = { critica: 'danger', alta: 'warning', media: 'info', baja: 'secondary' }

const state = { procedimientos: [], processContracts: [], cargando: false }

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export async function renderProcedimientosView(container) {
  const ac = new AbortController()
  await cargar(container)

  const onClick = async (e) => {
    if (e.target.closest('#btn-refrescar-proc')) return cargar(container)
    const detailBtn = e.target.closest('[data-open-case-detail]')
    if (detailBtn) {
      router.navigate('hermes-caso', {
        processCode: detailBtn.dataset.processCode || null,
        correlationId: detailBtn.dataset.correlationId || null,
      })
      return
    }
    const contractBtn = e.target.closest('[data-start-process-code]')
    if (contractBtn) {
      const processCode = contractBtn.dataset.startProcessCode
      const contract = state.processContracts.find((item) => item.process_code === processCode)
      const titulo = window.prompt(
        `Título del caso para ${processCode}:`,
        contract?.process_name || processCode,
      )
      if (!titulo?.trim()) return
      const descripcion = window.prompt('Descripción breve del caso:') || ''
      try {
        await tareasApi.startProcessCase({
          process_code: processCode,
          title: titulo.trim(),
          description: descripcion.trim() || null,
          source: 'manual',
          priority: 'media',
          metadata: { opened_from: 'procedimientos_view' },
        })
        alert('Caso SOI abierto: Hermes generó las tareas departamentales del contrato.')
        cargar(container)
      } catch (err) {
        alert(`Error: ${err.message}`)
      }
      return
    }
    if (e.target.closest('#btn-caso-alumno')) {
      const nombre = window.prompt('Nombre del alumno en riesgo:')
      if (!nombre?.trim()) return
      const motivo = window.prompt('Motivo (ausencias, bajo progreso, morosidad…):') || ''
      try {
        await tareasApi.reportarAlumnoRiesgo(null, nombre.trim(), motivo.trim())
        alert('Caso abierto: se delegaron tareas a Académico, Comunicación, Finanzas y Dirección.')
        cargar(container)
      } catch (err) {
        alert(`Error: ${err.message}`)
      }
    }
  }
  container.addEventListener('click', onClick, { signal: ac.signal })

  return { teardown: () => ac.abort() }
}

async function cargar(container) {
  try {
    state.cargando = true
    render(container)
    const [procedimientos, processContracts] = await Promise.all([
      tareasApi.getProcedimientos(),
      tareasApi.getProcessContracts(),
    ])
    state.procedimientos = procedimientos
    state.processContracts = processContracts
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">Error cargando procedimientos: ${esc(err.message)}</div>`
    return
  } finally {
    state.cargando = false
  }
  render(container)
}

function kpisGlobales(procs) {
  const totalProc = procs.length
  const enCurso = procs.filter((p) => p.pct_avance < 100 && p.total > p.canceladas).length
  const bloqueados = procs.filter((p) => p.bloqueadas > 0).length
  const observados = procs.filter((p) => p.observadas > 0).length
  const criticos = procs.filter((p) => p.prioridad_max === 'critica').length
  return { totalProc, enCurso, bloqueados, observados, criticos }
}

function render(container) {
  if (state.cargando && state.procedimientos.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-5"><div class="spinner-border" role="status"></div><p class="mt-2">Cargando procedimientos…</p></div>`
    return
  }

  const procs = state.procedimientos
  const k = kpisGlobales(procs)

  const kpiCard = (label, valor, color, icon) => `
    <div class="col">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body py-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${icon} fs-4 text-${color}"></i>
            <div>
              <div class="fs-4 fw-bold lh-1">${valor}</div>
              <div class="small text-muted">${label}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  const cards = procs.length === 0
    ? `<div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1"></i><p class="mt-2">No hay procedimientos activos.</p></div>`
    : procs.map(renderProcCard).join('')
  const contractCards = state.processContracts.length === 0
    ? `<div class="text-muted small">No hay contratos SOI activos registrados.</div>`
    : state.processContracts.map(renderProcessContractCard).join('')

  container.innerHTML = `
    <div class="p-3 p-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 class="mb-0"><i class="bi bi-diagram-3 me-2"></i>Procedimientos institucionales</h3>
          <p class="text-muted mb-0 small">Vista consolidada del Director — avance por caso (correlation_id)</p>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-caso-alumno" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-person-exclamation"></i> Caso: alumno en riesgo
          </button>
          <button id="btn-refrescar-proc" class="btn btn-outline-primary btn-sm" ${state.cargando ? 'disabled' : ''}>
            <i class="bi bi-arrow-clockwise"></i> ${state.cargando ? 'Actualizando…' : 'Refrescar'}
          </button>
        </div>
      </div>

      <div class="row row-cols-2 row-cols-md-5 g-2 mb-4">
        ${kpiCard('Procedimientos', k.totalProc, 'primary', 'bi-diagram-3')}
        ${kpiCard('En curso', k.enCurso, 'info', 'bi-hourglass-split')}
        ${kpiCard('Con bloqueos', k.bloqueados, 'danger', 'bi-slash-circle')}
        ${kpiCard('Con observadas', k.observados, 'warning', 'bi-eye')}
        ${kpiCard('Críticos', k.criticos, 'danger', 'bi-exclamation-octagon')}
      </div>

      <section class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="mb-0"><i class="bi bi-bezier2 me-2"></i>Contratos SOI ejecutables</h5>
          <p class="text-muted small mb-3">Procesos documentados que Hermes puede convertir en caso + tareas auditables.</p>
          <div class="row row-cols-1 row-cols-lg-3 g-3">
            ${contractCards}
          </div>
        </div>
      </section>

      <div class="row row-cols-1 row-cols-lg-2 g-3">
        ${cards}
      </div>
    </div>`
}

function renderProcCard(p) {
  const prioColor = PRIORIDAD_COLOR[p.prioridad_max] || 'secondary'
  const barColor = p.bloqueadas > 0 ? 'bg-danger' : p.pct_avance === 100 ? 'bg-success' : 'bg-primary'
  const deptChips = (p.departamentos || [])
    .map((d) => `<span class="badge bg-light text-dark border me-1">${esc(DEPARTAMENTOS[d] || d)}</span>`)
    .join('')

  const alertas = []
  if (p.bloqueadas > 0) alertas.push(`<span class="badge bg-danger me-1"><i class="bi bi-slash-circle"></i> ${p.bloqueadas} bloqueada${p.bloqueadas > 1 ? 's' : ''}</span>`)
  if (p.observadas > 0) alertas.push(`<span class="badge bg-warning text-dark me-1"><i class="bi bi-eye"></i> ${p.observadas} observada${p.observadas > 1 ? 's' : ''}</span>`)

  return `
    <div class="col">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 class="card-title mb-0">${esc(p.titulo_muestra)}</h6>
            <span class="badge bg-${prioColor} text-capitalize">${esc(p.prioridad_max)}</span>
          </div>
          <div class="mb-2">${deptChips}</div>
          <div class="progress mb-1" style="height: 8px;" role="progressbar" aria-valuenow="${p.pct_avance}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar ${barColor}" style="width: ${p.pct_avance}%"></div>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span>${p.pct_avance}% completado</span>
            <span>${p.completadas}/${p.total} tareas</span>
          </div>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>${alertas.join('') || '<span class="badge bg-light text-success border"><i class="bi bi-check-circle"></i> sin bloqueos</span>'}</div>
            <button class="btn btn-sm btn-outline-secondary" data-open-case-detail data-process-code="${esc(p.process_code || '')}" data-correlation-id="${esc(p.correlation_id || '')}">
              <i class="bi bi-binoculars"></i> Ver caso
            </button>
          </div>
        </div>
      </div>
    </div>`
}

function renderProcessContractCard(contract) {
  const departments = (contract.responsible_departments || [])
    .map((d) => `<span class="badge bg-light text-dark border me-1">${esc(DEPARTAMENTOS[d] || d)}</span>`)
    .join('')
  const automation = {
    manual: 'Manual',
    semi_auto: 'Semi-auto',
    automated: 'Automatizado',
    deprecated: 'Deprecado',
  }[contract.automation_status] || contract.automation_status

  return `
    <div class="col">
      <div class="border rounded-3 p-3 h-100 bg-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-semibold">${esc(contract.process_code)}</div>
            <div class="small">${esc(contract.process_name)}</div>
          </div>
          <span class="badge bg-primary-subtle text-primary border">${esc(automation)}</span>
        </div>
        <div class="mt-2 small text-muted">
          Dueño: ${esc(DEPARTAMENTOS[contract.department_owner] || contract.department_owner)}
        </div>
        <div class="mt-2">${departments}</div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="small text-muted">${contract.recurrence_count || 0} recurrencia${contract.recurrence_count === 1 ? '' : 's'}</span>
          <button class="btn btn-sm btn-outline-primary" data-start-process-code="${esc(contract.process_code)}">
            <i class="bi bi-play-circle"></i> Abrir caso
          </button>
        </div>
      </div>
    </div>`
}

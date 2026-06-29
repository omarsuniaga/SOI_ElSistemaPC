import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { getCasesByStudent } from '../services/studentCasesService.js'
import { analyzeStudentRisk } from '../services/studentRiskDetectorService.js'

const state = {
  container: null,
  alumnoId: null,
  alumno: null,
  risk: null,
  progressSummary: null,
  observationSummary: null,
  attendanceSummary: null,
  classes: [],
  cases: [],
}

function escapeHTML(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
}

function getRiskBadge(level) {
  const map = {
    bajo: 'bg-info-subtle text-info-emphasis',
    medio: 'bg-warning-subtle text-warning-emphasis',
    alto: 'bg-warning text-dark',
    critico: 'bg-danger text-white',
  }
  return map[level] || 'bg-secondary-subtle text-secondary-emphasis'
}

export async function renderStudentPedagogicalProfileView(container, params = {}) {
  if (!container) return
  state.container = container
  state.alumnoId = params?.id || null

  if (!state.alumnoId) {
    container.innerHTML = '<div class="page-container"><div class="alert alert-warning">No se especific? alumno.</div></div>'
    return
  }

  _injectStyles()
  container.innerHTML = '<div class="page-container d-flex align-items-center justify-content-center" style="min-height:360px;"><div class="spinner-border text-primary"></div></div>'
  await _load()
}

async function _load() {
  try {
    const [alumnoRes, inscripcionesRes, progressRes, observationsRes, attendanceRes, cases, risk] = await Promise.all([
      supabase.from('alumnos').select('*').eq('id', state.alumnoId).single(),
      supabase.from('alumnos_clases').select('clase:clases(id, nombre, instrumento)').eq('alumno_id', state.alumnoId),
      supabase.from('progresos').select('calificacion, clase_id').eq('alumno_id', state.alumnoId),
      supabase.from('observaciones_alumnos').select('id, estado, prioridad, requiere_seguimiento').eq('alumno_id', state.alumnoId),
      supabase.from('asistencias').select('estado, fecha').eq('alumno_id', state.alumnoId).gte('fecha', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
      getCasesByStudent(state.alumnoId),
      analyzeStudentRisk(state.alumnoId),
    ])

    if (alumnoRes.error) throw alumnoRes.error
    state.alumno = alumnoRes.data
    state.classes = (inscripcionesRes.data || []).map((i) => i.clase).filter(Boolean)
    state.cases = cases || []
    state.risk = risk || null

    const progressRows = progressRes.data || []
    const progressValues = progressRows.map((row) => Number(row.calificacion)).filter((value) => !Number.isNaN(value))
    state.progressSummary = {
      total: progressRows.length,
      average: progressValues.length ? (progressValues.reduce((a, b) => a + b, 0) / progressValues.length) : null,
    }

    const observations = observationsRes.data || []
    state.observationSummary = {
      total: observations.length,
      open: observations.filter((item) => item.estado === 'abierta' || item.estado === 'seguimiento').length,
      high: observations.filter((item) => item.prioridad === 'alta').length,
    }

    const attendance = attendanceRes.data || []
    const present = attendance.filter((item) => item.estado === 'P').length
    state.attendanceSummary = {
      total: attendance.length,
      present,
      rate: attendance.length ? Math.round((present / attendance.length) * 100) : null,
    }

    _render()
  } catch (error) {
    console.error('[studentPedagogicalProfileView]', error)
    state.container.innerHTML = `<div class="page-container"><div class="alert alert-warning">Error al cargar la ficha pedag?gica: ${escapeHTML(error.message || 'Error desconocido')}</div></div>`
  }
}

function _render() {
  const alumno = state.alumno
  const firstClass = state.classes[0] || null
  const activeCase = state.cases.find((item) => item.estado !== 'archivado') || state.cases[0] || null
  const riskLevel = state.risk?.nivelRiesgo || 'sin datos'

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button class="btn btn-sm btn-outline-secondary" id="btn-back-student-profile"><i class="bi bi-arrow-left me-1"></i>Volver</button>
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-person-vcard fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Ficha Pedag?gica 360</h1>
          <p class="text-muted small mb-0">${escapeHTML(alumno.nombre_completo || 'Alumno')}</p>
        </div>
        <span class="badge ${getRiskBadge(state.risk?.nivelRiesgo)}">Riesgo: ${escapeHTML(riskLevel)}</span>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="student-hub-card"><div class="student-hub-label">Asistencia 4 semanas</div><div class="student-hub-value">${state.attendanceSummary.rate ?? '?'}${state.attendanceSummary.rate !== null ? '%' : ''}</div></div></div>
        <div class="col-6 col-md-3"><div class="student-hub-card"><div class="student-hub-label">Promedio</div><div class="student-hub-value">${state.progressSummary.average !== null ? state.progressSummary.average.toFixed(2) : '?'}</div></div></div>
        <div class="col-6 col-md-3"><div class="student-hub-card"><div class="student-hub-label">Observaciones abiertas</div><div class="student-hub-value">${state.observationSummary.open}</div></div></div>
        <div class="col-6 col-md-3"><div class="student-hub-card"><div class="student-hub-label">Casos institucionales</div><div class="student-hub-value">${state.cases.length}</div></div></div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="student-hub-surface mb-3">
            <div class="small text-uppercase fw-bold text-muted mb-2">Alumno</div>
            <div class="fw-semibold mb-1">${escapeHTML(alumno.nombre_completo || '?')}</div>
            <div class="small text-muted">Instrumento: ${escapeHTML(alumno.instrumento_principal || '?')}</div>
            <div class="small text-muted">Nivel: ${escapeHTML(alumno.nivel_actual || alumno.nivel || '?')}</div>
            <div class="small text-muted">Representante: ${escapeHTML(alumno.representante_nombre || '?')}</div>
          </div>

          <div class="student-hub-surface">
            <div class="small text-uppercase fw-bold text-muted mb-2">Clases</div>
            ${state.classes.length ? state.classes.map((item) => `<div class="small mb-1">? ${escapeHTML(item.nombre)}${item.instrumento ? ` <span class="text-muted">(${escapeHTML(item.instrumento)})</span>` : ''}</div>`).join('') : '<div class="small text-muted">Sin clases registradas.</div>'}
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="student-hub-surface mb-3">
            <div class="small text-uppercase fw-bold text-muted mb-3">Acciones r?pidas</div>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-primary" id="btn-hub-seguimiento"><i class="bi bi-person-lines-fill me-1"></i>Seguimiento</button>
              <button class="btn btn-sm btn-outline-primary" id="btn-hub-progresos"><i class="bi bi-graph-up me-1"></i>Progresos</button>
              <button class="btn btn-sm btn-outline-warning" id="btn-hub-observaciones"><i class="bi bi-clipboard2-pulse me-1"></i>Observaciones</button>
              <button class="btn btn-sm btn-outline-success" id="btn-hub-planificacion"><i class="bi bi-journal-text me-1"></i>Planificaci?n</button>
              <button class="btn btn-sm btn-outline-success" id="btn-hub-bitacora" ${firstClass ? '' : 'disabled'}><i class="bi bi-journal-check me-1"></i>Bit?cora</button>
              <button class="btn btn-sm btn-outline-secondary" id="btn-hub-caso" ${activeCase ? '' : 'disabled'}><i class="bi bi-shield-check me-1"></i>Caso institucional</button>
            </div>
          </div>

          <div class="student-hub-surface mb-3">
            <div class="small text-uppercase fw-bold text-muted mb-2">Riesgo y evidencia</div>
            ${state.risk?.razones?.length ? state.risk.razones.map((reason) => `<div class="small mb-1">? ${escapeHTML(reason)}</div>`).join('') : '<div class="small text-muted">Sin evidencia cr?tica reciente.</div>'}
          </div>

          <div class="student-hub-surface">
            <div class="small text-uppercase fw-bold text-muted mb-2">Estado institucional</div>
            ${activeCase ? `<div class="small mb-1"><strong>Caso activo:</strong> ${escapeHTML(activeCase.titulo || 'Caso institucional')}</div><div class="small text-muted">Estado: ${escapeHTML(activeCase.estado || '?')} ? Riesgo: ${escapeHTML(activeCase.nivel_riesgo || '?')}</div>` : '<div class="small text-muted">No hay caso institucional abierto.</div>'}
          </div>
        </div>
      </div>
    </div>`

  _attachEvents({ firstClass, activeCase })
}

function _attachEvents({ firstClass, activeCase }) {
  state.container.querySelector('#btn-back-student-profile')?.addEventListener('click', () => router.navigate('pedagogico-dashboard'))

  state.container.querySelector('#btn-hub-seguimiento')?.addEventListener('click', () => {
    sessionStorage.setItem('teacher-followup-student', JSON.stringify({
      alumnoId: state.alumnoId,
      alumnoNombre: state.alumno?.nombre_completo || '',
      sourceContext: 'student-hub',
    }))
    router.navigate('pedagogico-seguimiento')
  })

  state.container.querySelector('#btn-hub-progresos')?.addEventListener('click', () => {
    sessionStorage.setItem('teacher-progress-focus-student', JSON.stringify({
      alumnoId: state.alumnoId,
      alumnoNombre: state.alumno?.nombre_completo || '',
      sourceContext: 'student-hub',
    }))
    router.navigate('progresos')
  })

  state.container.querySelector('#btn-hub-observaciones')?.addEventListener('click', () => {
    sessionStorage.setItem('teacher-observation-focus-student', JSON.stringify({
      alumnoId: state.alumnoId,
      alumnoNombre: state.alumno?.nombre_completo || '',
      sourceContext: 'student-hub',
    }))
    router.navigate('observaciones')
  })

  state.container.querySelector('#btn-hub-planificacion')?.addEventListener('click', () => {
    sessionStorage.setItem('teacher-planning-focus-student', JSON.stringify({
      alumnoId: state.alumnoId,
      alumnoNombre: state.alumno?.nombre_completo || '',
      claseId: firstClass?.id || '',
      claseNombre: firstClass?.nombre || '',
      instrumento: state.alumno?.instrumento_principal || firstClass?.instrumento || '',
      sourceContext: 'student-hub',
    }))
    router.navigate('planificacion')
  })

  state.container.querySelector('#btn-hub-bitacora')?.addEventListener('click', () => {
    if (!firstClass?.id) return
    sessionStorage.setItem('teacher-bitacora-focus-student', JSON.stringify({
      alumnoId: state.alumnoId,
      alumnoNombre: state.alumno?.nombre_completo || '',
      claseId: firstClass.id,
      claseNombre: firstClass.nombre || '',
      sourceContext: 'student-hub',
    }))
    router.navigate('bitacora-clase', { claseId: firstClass.id })
  })

  state.container.querySelector('#btn-hub-caso')?.addEventListener('click', () => {
    if (!activeCase?.id) {
      AppToast.info('Este alumno no tiene caso institucional abierto.')
      return
    }
    router.navigate('pedagogico-caso', { id: activeCase.id })
  })
}

function _injectStyles() {
  if (document.getElementById('student-hub-styles')) return
  const style = document.createElement('style')
  style.id = 'student-hub-styles'
  style.textContent = `
    .student-hub-card,
    .student-hub-surface {
      background: var(--pm-surface);
      color: var(--pm-text);
      border: 1px solid var(--pm-border);
      border-radius: 16px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    }
    .student-hub-card {
      padding: 1rem;
      height: 100%;
    }
    .student-hub-surface {
      padding: 1rem 1.1rem;
    }
    .student-hub-label {
      font-size: 0.78rem;
      color: var(--bs-secondary-color);
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 0.35rem;
    }
    .student-hub-value {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }
    [data-bs-theme="dark"] .student-hub-card,
    [data-bs-theme="dark"] .student-hub-surface {
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
    }
  `
  document.head.appendChild(style)
}

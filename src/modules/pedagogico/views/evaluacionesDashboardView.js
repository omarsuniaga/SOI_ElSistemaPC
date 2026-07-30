/**
 * evaluacionesDashboardView.js — Evaluaciones pedagógicas: ve evaluaciones por clase,
 * contenido evaluado, puntuación por alumno, y cobertura por maestro.
 */
import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'

// ── Entry Point ────────────────────────────────────────────────────────────────
export async function renderEvaluacionesDashboardView(container) {
  if (!container) return
  container.innerHTML = _renderSkeleton()

  try {
    const clases = await _fetchClasesActivas()
    container.innerHTML = _renderContent(clases)
    _attachEvents(container)
    if (clases.length > 0) {
      await _loadEvaluaciones(container, clases[0].id)
    }
  } catch (err) {
    console.error('[EvaluacionesDashboard]', err)
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar evaluaciones: ${escapeHTML(err.message)}</div>
      </div>`
  }
}

// ── Data Fetching ──────────────────────────────────────────────────────────────
async function _fetchClasesActivas() {
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento')
    .eq('estado', 'activa')
    .order('nombre')

  if (error) throw error
  return data || []
}

async function _fetchEvaluaciones(claseId) {
  const { data, error } = await supabase
    .from('view_evaluaciones_pedagogicas')
    .select('*')
    .eq('clase_id', claseId)
    .order('covered_date', { ascending: false })

  if (error) throw error
  return data || []
}

async function _fetchCobertura(claseId) {
  const { data, error } = await supabase.rpc('fn_evaluacion_cobertura', {
    p_clase_id: claseId,
  })
  if (error) throw error
  return data || { total_indicators: 0, evaluated_indicators: 0, coverage_pct: 0, by_teacher: [] }
}

// ── Render ─────────────────────────────────────────────────────────────────────
function _renderSkeleton() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-clipboard2-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Evaluaciones</h1>
          <p class="text-muted small mb-0">Cargando...</p>
        </div>
      </div>
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    </div>`
}

function _renderContent(clases) {
  const claseOptions = clases.map((c, i) =>
    `<option value="${c.id}" ${i === 0 ? 'selected' : ''}>${escapeHTML(c.nombre)}${c.instrumento ? ' (' + escapeHTML(c.instrumento) + ')' : ''}</option>`
  ).join('')

  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-clipboard2-check fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Evaluaciones</h1>
          <p class="text-muted small mb-0">Calificaciones por indicador, cobertura por maestro</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-eval" title="Ayuda" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <!-- Selector de clase -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <label class="form-label-compact mb-0 fw-semibold" style="font-size:0.82rem;">Clase:</label>
            <select class="form-select input-dense" id="eval-clase-select" style="max-width:320px;">
              ${claseOptions}
            </select>
            <button class="btn btn-sm btn-outline-primary ms-auto" id="btn-refresh-eval">
              <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- KPIs de cobertura -->
      <div id="eval-coverage-kpis" class="row g-3 mb-4">
        <div class="col-12 text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary"></div>
        </div>
      </div>

      <!-- Cobertura por maestro -->
      <div class="card border-0 shadow-sm mb-4" id="eval-teacher-section">
        <div class="card-header border-0 d-flex align-items-center gap-2">
          <i class="bi bi-person-badge text-primary"></i>
          <span class="fw-semibold" style="font-size:0.9rem;">Cobertura por maestro</span>
        </div>
        <div class="card-body p-0" id="eval-teacher-body">
          <div class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</div>
        </div>
      </div>

      <!-- Matriz de evaluaciones por alumno -->
      <div class="card border-0 shadow-sm mb-4" id="eval-students-section">
        <div class="card-header border-0 d-flex align-items-center gap-2">
          <i class="bi bi-people text-success"></i>
          <span class="fw-semibold" style="font-size:0.9rem;">Evaluaciones por alumno</span>
        </div>
        <div class="card-body p-0" id="eval-students-body">
          <div class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</div>
        </div>
      </div>

      <!-- Timeline de evaluaciones recientes -->
      <div class="card border-0 shadow-sm mb-4" id="eval-timeline-section">
        <div class="card-header border-0 d-flex align-items-center gap-2">
          <i class="bi bi-clock-history text-info"></i>
          <span class="fw-semibold" style="font-size:0.9rem;">Evaluaciones recientes</span>
        </div>
        <div class="card-body p-0" id="eval-timeline-body">
          <div class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</div>
        </div>
      </div>
    </div>`
}

// ── Load Data into Sections ────────────────────────────────────────────────────
async function _loadEvaluaciones(container, claseId) {
  const [evaluaciones, cobertura] = await Promise.all([
    _fetchEvaluaciones(claseId),
    _fetchCobertura(claseId),
  ])

  _renderCoverageKpis(container, cobertura)
  _renderTeacherCoverage(container, cobertura.by_teacher || [])
  _renderStudentMatrix(container, evaluaciones)
  _renderTimeline(container, evaluaciones)
}

function _renderCoverageKpis(container, cobertura) {
  const section = container.querySelector('#eval-coverage-kpis')
  if (!section) return

  const pct = cobertura.coverage_pct || 0
  const pctColor = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'

  section.innerHTML = `
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body text-center">
          <div class="fw-bold text-${pctColor}" style="font-size:1.8rem;">${pct}%</div>
          <div class="text-muted" style="font-size:0.75rem;">Cobertura total</div>
          <div class="progress mt-2" style="height:4px;">
            <div class="progress-bar bg-${pctColor}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body text-center">
          <div class="fw-bold text-primary" style="font-size:1.8rem;">${cobertura.evaluated_indicators || 0}</div>
          <div class="text-muted" style="font-size:0.75rem;">Indicadores evaluados</div>
          <div class="text-muted" style="font-size:0.65rem;">de ${cobertura.total_indicators || 0} total</div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body text-center">
          <div class="fw-bold text-info" style="font-size:1.8rem;">${cobertura.evaluated_students || 0}</div>
          <div class="text-muted" style="font-size:0.75rem;">Alumnos evaluados</div>
          <div class="text-muted" style="font-size:0.65rem;">de ${cobertura.total_students || 0} total</div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body text-center">
          <div class="fw-bold text-secondary" style="font-size:1.8rem;">${(cobertura.by_teacher || []).length}</div>
          <div class="text-muted" style="font-size:0.75rem;">Maestros evaluando</div>
        </div>
      </div>
    </div>`
}

function _renderTeacherCoverage(container, teachers) {
  const body = container.querySelector('#eval-teacher-body')
  if (!body) return

  if (!teachers.length) {
    body.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-person-badge fs-3 d-block mb-2 opacity-40"></i>
        <p class="mb-0 small">No hay evaluaciones registradas para esta clase.</p>
      </div>`
    return
  }

  body.innerHTML = teachers.map((t) => {
    const pct = t.pct || 0
    const pctColor = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'
    return `
      <div class="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
        <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
             style="width:36px;height:36px;font-size:0.75rem;font-weight:700;">
          ${(t.teacher_name || '?').charAt(0)}
        </div>
        <div class="flex-grow-1">
          <div class="fw-semibold" style="font-size:0.875rem;">${escapeHTML(t.teacher_name || 'Desconocido')}</div>
          <div class="text-muted" style="font-size:0.72rem;">${t.evaluated} de ${t.total} indicadores evaluados</div>
        </div>
        <div class="text-end">
          <div class="fw-bold text-${pctColor}" style="font-size:1.1rem;">${pct}%</div>
          <div class="progress mt-1" style="height:3px;width:80px;">
            <div class="progress-bar bg-${pctColor}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`
  }).join('')
}

function _renderStudentMatrix(container, evaluaciones) {
  const body = container.querySelector('#eval-students-body')
  if (!body) return

  if (!evaluaciones.length) {
    body.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-people fs-3 d-block mb-2 opacity-40"></i>
        <p class="mb-0 small">No hay evaluaciones registradas para esta clase.</p>
      </div>`
    return
  }

  // Group by student
  const byStudent = {}
  evaluaciones.forEach((e) => {
    if (!byStudent[e.student_id]) {
      byStudent[e.student_id] = { name: e.student_name, evaluations: [] }
    }
    byStudent[e.student_name] = byStudent[e.student_name] || byStudent[e.student_id]
    byStudent[e.student_id].evaluations.push(e)
  })

  const students = Object.values(byStudent)

  body.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0" style="font-size:0.85rem;">
        <thead class="table-light">
          <tr>
            <th style="position:sticky;left:0;background:var(--bs-body-bg);z-index:1;">Alumno</th>
            <th class="text-center">Evaluaciones</th>
            <th class="text-center">Promedio nota</th>
            <th class="text-center">Aprobados</th>
            <th class="text-center">Reprobados</th>
            <th class="text-center">Pendientes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${students.map((s) => {
            const evals = s.evaluaciones || s.evaluations || []
            const withNota = evals.filter((e) => e.nota != null)
            const avg = withNota.length > 0
              ? (withNota.reduce((sum, e) => sum + e.nota, 0) / withNota.length).toFixed(1)
              : '—'
            const aprobados = evals.filter((e) => e.result === 'achieved' || e.result === 'approved').length
            const reprobados = evals.filter((e) => e.result === 'failed').length
            const pendientes = evals.filter((e) => !e.result || e.result === 'pending').length
            const avgNum = parseFloat(avg)
            const avgColor = isNaN(avgNum) ? 'secondary' : avgNum >= 4 ? 'success' : avgNum >= 3 ? 'warning' : 'danger'

            return `
              <tr>
                <td style="position:sticky;left:0;background:var(--bs-body-bg);z-index:1;">
                  <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                         style="width:28px;height:28px;font-size:0.65rem;font-weight:700;">
                      ${(s.name || '?').charAt(0)}
                    </div>
                    <span class="fw-semibold">${escapeHTML(s.name)}</span>
                  </div>
                </td>
                <td class="text-center">${evals.length}</td>
                <td class="text-center"><span class="fw-bold text-${avgColor}">${avg}</span></td>
                <td class="text-center">${aprobados > 0 ? `<span class="badge bg-success-subtle text-success">${aprobados}</span>` : '<span class="text-muted">—</span>'}</td>
                <td class="text-center">${reprobados > 0 ? `<span class="badge bg-danger-subtle text-danger">${reprobados}</span>` : '<span class="text-muted">—</span>'}</td>
                <td class="text-center">${pendientes > 0 ? `<span class="badge bg-secondary-subtle text-secondary">${pendientes}</span>` : '<span class="text-muted">—</span>'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary btn-ver-detalle-alumno" data-student-id="${e.student_id}" title="Ver detalle">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>`
}

function _renderTimeline(container, evaluaciones) {
  const body = container.querySelector('#eval-timeline-body')
  if (!body) return

  if (!evaluaciones.length) {
    body.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-clock-history fs-3 d-block mb-2 opacity-40"></i>
        <p class="mb-0 small">No hay evaluaciones recientes.</p>
      </div>`
    return
  }

  // Show last 10 evaluations
  const recent = evaluaciones.slice(0, 10)

  const resultBadge = (result) => {
    const map = {
      achieved: 'bg-success-subtle text-success',
      approved: 'bg-success-subtle text-success',
      failed: 'bg-danger-subtle text-danger',
      pending: 'bg-secondary-subtle text-secondary',
    }
    const label = { achieved: 'Logrado', approved: 'Aprobado', failed: 'No logrado', pending: 'Pendiente' }
    return `<span class="badge ${map[result] || 'bg-secondary-subtle text-secondary'}">${label[result] || result || '—'}</span>`
  }

  body.innerHTML = recent.map((e) => {
    const fecha = e.covered_date
      ? new Date(e.covered_date + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: 'short' })
      : '—'
    return `
      <div class="d-flex align-items-start gap-3 px-3 py-2 border-bottom" style="font-size:0.85rem;">
        <div class="text-muted flex-shrink-0 mt-1" style="width:50px;font-size:0.75rem;">${fecha}</div>
        <div class="flex-grow-1">
          <span class="fw-semibold">${escapeHTML(e.student_name)}</span>
          <span class="text-muted mx-1">·</span>
          <span class="text-muted">${escapeHTML(e.indicator_name || e.indicator_description || '')}</span>
          ${e.nota != null ? `<span class="badge bg-light text-dark border ms-1">${e.nota}/5</span>` : ''}
        </div>
        <div class="flex-shrink-0">${resultBadge(e.result)}</div>
        <div class="flex-shrink-0 text-muted" style="font-size:0.72rem;">${escapeHTML(e.maestro_name || '')}</div>
      </div>`
  }).join('')
}

// ── Events ─────────────────────────────────────────────────────────────────────
function _attachEvents(container) {
  // Class selector
  const select = container.querySelector('#eval-clase-select')
  if (select) {
    select.addEventListener('change', () => {
      _loadEvaluaciones(container, select.value)
    })
  }

  // Refresh button
  container.querySelector('#btn-refresh-eval')?.addEventListener('click', () => {
    if (select) _loadEvaluaciones(container, select.value)
  })

  // Student detail click (delegated)
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-ver-detalle-alumno')
    if (btn) {
      _openStudentDetailModal(btn.dataset.studentId, container)
    }
  })

  // Help button
  container.querySelector('#btn-help-eval')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Evaluaciones Pedagógicas',
      intro: 'Explore las calificaciones y evaluaciones de los alumnos por clase. Observe qué indicadores han sido evaluados, la cobertura por maestro y el detalle de cada alumno.',
      sections: [
        { icon: 'bi-clipboard2-check', title: 'Cobertura total', description: 'Porcentaje de indicadores del plan que ya han sido evaluados por al menos un maestro.', color: '#f59e0b' },
        { icon: 'bi-person-badge', title: 'Cobertura por maestro', description: 'Cuántos indicadores evaluó cada maestro respecto al total de la clase.', color: '#3b82f6' },
        { icon: 'bi-people', title: 'Evaluaciones por alumno', description: 'Matriz de alumnos × indicadores con su nota, estado (logrado/reprobado/pendiente) y promedio.', color: '#10b981' },
        { icon: 'bi-clock-history', title: 'Evaluaciones recientes', description: 'Timeline de las últimas 10 evaluaciones registradas con fecha, alumno, indicador y resultado.', color: '#06b6d4' },
      ],
    })
  })
}

async function _openStudentDetailModal(studentId, container) {
  const claseId = container.querySelector('#eval-clase-select')?.value
  if (!claseId || !studentId) return

  AppModal.open({
    title: 'Detalle de evaluaciones',
    hideSave: true,
    cancelText: 'Cerrar',
    size: 'lg',
    body: `<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Cargando...</div>`,
    onOpen: async (modalBody) => {
      try {
        const { data: evaluaciones, error } = await supabase
          .from('view_evaluaciones_pedagogicas')
          .select('*')
          .eq('clase_id', claseId)
          .eq('student_id', studentId)
          .order('covered_date', { ascending: false })

        if (error) throw error

        const evals = evaluaciones || []
        const studentName = evals[0]?.student_name || 'Alumno'

        if (!evals.length) {
          modalBody.innerHTML = `
            <div class="text-center py-4 text-muted">
              <i class="bi bi-clipboard fs-3 d-block mb-2 opacity-40"></i>
              <p class="mb-0">No hay evaluaciones registradas para este alumno en esta clase.</p>
            </div>`
          return
        }

        const withNota = evals.filter((e) => e.nota != null)
        const avg = withNota.length > 0
          ? (withNota.reduce((sum, e) => sum + e.nota, 0) / withNota.length).toFixed(1)
          : '—'

        const resultBadge = (result) => {
          const map = {
            achieved: 'bg-success-subtle text-success',
            approved: 'bg-success-subtle text-success',
            failed: 'bg-danger-subtle text-danger',
            pending: 'bg-secondary-subtle text-secondary',
          }
          const label = { achieved: 'Logrado', approved: 'Aprobado', failed: 'No logrado', pending: 'Pendiente' }
          return `<span class="badge ${map[result] || 'bg-secondary-subtle text-secondary'}">${label[result] || result || '—'}</span>`
        }

        modalBody.innerHTML = `
          <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                 style="width:44px;height:44px;font-size:1rem;font-weight:700;">
              ${studentName.charAt(0)}
            </div>
            <div>
              <h5 class="mb-0 fw-bold">${escapeHTML(studentName)}</h5>
              <div class="text-muted small">${evals.length} evaluaciones · Promedio: <strong>${avg}</strong>/5</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="font-size:0.85rem;">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Indicador</th>
                  <th>Nivel/Tema</th>
                  <th class="text-center">Nota</th>
                  <th>Resultado</th>
                  <th>Maestro</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                ${evals.map((e) => {
                  const fecha = e.covered_date
                    ? new Date(e.covered_date + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: '2-digit' })
                    : '—'
                  return `
                    <tr>
                      <td class="text-muted" style="white-space:nowrap;">${fecha}</td>
                      <td class="fw-semibold">${escapeHTML(e.indicator_name || e.indicator_description || '')}</td>
                      <td class="text-muted small">${escapeHTML(e.level_name || '')} / ${escapeHTML(e.node_name || '')}</td>
                      <td class="text-center">${e.nota != null ? `<span class="badge bg-light text-dark border">${e.nota}/5</span>` : '—'}</td>
                      <td>${resultBadge(e.result)}</td>
                      <td class="text-muted small">${escapeHTML(e.maestro_name || '')}</td>
                      <td class="text-muted small" style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHTML(e.observations || '')}">${escapeHTML(e.observations || '—')}</td>
                    </tr>`
                }).join('')}
              </tbody>
            </table>
          </div>`
      } catch (err) {
        modalBody.innerHTML = `<div class="alert alert-warning">Error: ${escapeHTML(err.message)}</div>`
      }
    },
  })
}

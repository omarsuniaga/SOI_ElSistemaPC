import { getAlumnosDestacados, getAlumnosEnRiesgoAcademico } from '../api/metricsApi.js'

let currentInstrumento = ''
let allData = { destacados: [], riesgo: [] }

function dispatchObservacionesEvent(alumnoId) {
  window.dispatchEvent(new CustomEvent('navigate:observaciones', { detail: { alumnoId } }))
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getInstrumentos(alumnos) {
  const instrumentos = new Set()
  ;[...alumnos].forEach(a => {
    if (a.instrumento_principal) instrumentos.add(a.instrumento_principal)
  })
  return Array.from(instrumentos).sort()
}

function renderCard(alumno) {
  const { nombre_completo, instrumento_principal, nivel, promedio_calificacion, tasa_asistencia } = alumno
  const estrella = promedio_calificacion >= 4.5 ? '<span class="text-warning">⭐</span>' : ''
  const asistenciaBadge = tasa_asistencia >= 95 
    ? '<span class="badge bg-success">Excelente</span>' 
    : tasa_asistencia >= 80
    ? '<span class="badge bg-warning text-dark">Regular</span>'
    : '<span class="badge bg-danger">Baja</span>'

  return `
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-1">${escapeHtml(nombre_completo)} ${estrella}</h5>
        <p class="text-muted small mb-2">${escapeHtml(instrumento_principal)} • ${escapeHtml(nivel) || 'Sin nivel'}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-bold text-primary">${promedio_calificacion?.toFixed(1) || '-'}</span>
          ${asistenciaBadge}
        </div>
        <div class="mt-2">
          <div class="progress" style="height: 6px;">
            <div class="progress-bar ${tasa_asistencia >= 95 ? 'bg-success' : tasa_asistencia >= 80 ? 'bg-warning' : 'bg-danger'}" 
                 role="progressbar" 
                 style="width: ${tasa_asistencia || 0}%" 
                 aria-valuenow="${tasa_asistencia || 0}" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
            </div>
          </div>
          <small class="text-muted">Asistencia: ${tasa_asistencia?.toFixed(1) || '-'}%</small>
        </div>
      </div>
    </div>
  `
}

function renderDestacadosSection(alumnos, instrumentoFilter) {
  let filtered = [...alumnos].sort((a, b) => (b.promedio_calificacion || 0) - (a.promedio_calificacion || 0))
  
  if (instrumentoFilter) {
    filtered = filtered.filter(a => a.instrumento_principal === instrumentoFilter)
  }

  if (filtered.length === 0) {
    return `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-emoji-smile display-4"></i>
        <p>No hay alumnos destacados para este filtro.</p>
      </div>
    `
  }

  const cards = filtered.map(renderCard).join('')
  return `
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      ${cards}
    </div>
  `
}

function renderIndicadorProblema(tipo) {
  if (tipo === 'bajo_rendimiento') {
    return '<span class="badge bg-danger"><i class="bi bi-graph-down me-1"></i>Bajo Rendimiento</span>'
  }
  if (tipo === 'baja_asistencia') {
    return '<span class="badge bg-warning text-dark"><i class="bi bi-calendar-x me-1"></i>Baja Asistencia</span>'
  }
  return ''
}

function renderRiesgoRow(alumno) {
  const { id, nombre_completo, instrumento_principal, nivel, promedio_calificacion, tasa_asistencia, tipo_problema } = alumno
  const rowClass = tipo_problema === 'bajo_rendimiento' ? 'table-danger' : tipo_problema === 'baja_asistencia' ? 'table-warning' : ''

  return `
    <tr class="${rowClass}">
      <td class="align-middle fw-semibold">${escapeHtml(nombre_completo)}</td>
      <td class="align-middle">${escapeHtml(instrumento_principal) || '-'}</td>
      <td class="align-middle">${escapeHtml(nivel) || '-'}</td>
      <td class="align-middle">
        <span class="badge ${promedio_calificacion < 3 ? 'bg-danger' : promedio_calificacion < 4 ? 'bg-warning text-dark' : 'bg-success'}">
          ${promedio_calificacion?.toFixed(1) || '-'}
        </span>
      </td>
      <td class="align-middle">
        <div class="d-flex align-items-center gap-2">
          <div class="progress flex-grow-1" style="height: 8px; width: 60px;">
            <div class="progress-bar ${tasa_asistencia < 80 ? 'bg-danger' : tasa_asistencia < 95 ? 'bg-warning' : 'bg-success'}" 
                 role="progressbar" 
                 style="width: ${tasa_asistencia || 0}%">
            </div>
          </div>
          <small class="text-muted">${tasa_asistencia?.toFixed(1) || '-'}%</small>
        </div>
      </td>
      <td class="align-middle">${renderIndicadorProblema(tipo_problema)}</td>
      <td class="align-middle">
        <button class="btn btn-sm btn-outline-primary btn-ver-obs" data-alumno-id="${escapeHtml(id)}">
          <i class="bi bi-eye me-1"></i>Ver
        </button>
      </td>
    </tr>
  `
}

function renderRiesgoSection(alumnos, instrumentoFilter) {
  let filtered = [...alumnos]
  
  if (instrumentoFilter) {
    filtered = filtered.filter(a => a.instrumento_principal === instrumentoFilter)
  }

  if (filtered.length === 0) {
    return `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-check-circle display-4 text-success"></i>
        <p>No hay alumnos en riesgo académico. ¡Excelente!</p>
      </div>
    `
  }

  const rows = filtered.map(renderRiesgoRow).join('')

  return `
    <div class="table-responsive">
      <table class="table table-hover align-middle table-sm">
        <thead class="table-light">
          <tr>
            <th>Alumno</th>
            <th>Instrumento</th>
            <th>Nivel</th>
            <th>Promedio</th>
            <th>Asistencia</th>
            <th>Indicador</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `
}

function renderInstrumentoFilter(instrumentos, selected) {
  const options = '<option value="">Todos los instrumentos</option>' +
    instrumentos.map(i => `<option value="${escapeHtml(i)}" ${i === selected ? 'selected' : ''}>${escapeHtml(i)}</option>`).join('')

  return `
    <div class="mb-4">
      <label class="form-label fw-semibold">
        <i class="bi bi-funnel me-2"></i>Filtrar por instrumento:
      </label>
      <select class="form-select w-auto" id="filtro-instrumento" style="min-width: 200px;">
        ${options}
      </select>
    </div>
  `
}

function renderLoading() {
  return `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando datos académicos...</p>
    </div>
  `
}

function renderError(msg) {
  return `
    <div class="alert alert-danger m-3" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Error:</strong> ${msg}
    </div>
  `
}

function renderContent() {
  const allInstrumentos = getInstrumentos([...allData.destacados, ...allData.riesgo])
  const filterHtml = renderInstrumentoFilter(allInstrumentos, currentInstrumento)
  
  const sectionA = `
    <div class="mb-5">
      <h4 class="mb-3"><span class="text-success">🎓</span> Alumnos Destacados</h4>
      ${renderDestacadosSection(allData.destacados, currentInstrumento)}
    </div>
  `

  const sectionB = `
    <div>
      <h4 class="mb-3 text-danger"><span class="text-danger">⚠️</span> Alumnos en Riesgo Académico</h4>
      ${renderRiesgoSection(allData.riesgo, currentInstrumento)}
    </div>
  `

  return filterHtml + sectionA + sectionB
}

function attachEventHandlers(container) {
  const select = container.querySelector('#filtro-instrumento')
  if (select) {
    select.addEventListener('change', (e) => {
      currentInstrumento = e.target.value
      container.innerHTML = renderContent()
      attachEventHandlers(container)
    })
  }

  container.querySelectorAll('.btn-ver-obs').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const alumnoId = btn.dataset.alumnoId
      if (alumnoId) {
        dispatchObservacionesEvent(alumnoId)
      }
    })
  })
}

export async function renderDestacadosView(container) {
  if (typeof container === 'string') {
    container = document.querySelector(container)
  }

  container.innerHTML = renderLoading()

  try {
    const [destacados, riesgo] = await Promise.all([
      getAlumnosDestacados(),
      getAlumnosEnRiesgoAcademico(),
    ])

    allData = { destacados, riesgo }

    container.innerHTML = renderContent()
    attachEventHandlers(container)

  } catch (err) {
    container.innerHTML = renderError(err.message)
  }
}
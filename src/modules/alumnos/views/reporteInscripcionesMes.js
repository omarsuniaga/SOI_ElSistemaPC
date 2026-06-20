import { obtenerAlumnosPorMes } from '../api/alumnosApi.js'
import { descargarReporteMensual } from '../domain/generarReporteMensual.js'
import { openEditAlumnoModal } from '../domain/editarAlumnoModal.js'
import { calcularCompletitud as calcularCompletitudDomain } from '../domain/completitudAlumno.js'

const MESES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function buildMonthOptions() {
  const hoy = new Date()
  let html = ''
  for (let i = 0; i < 24; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const selected = i === 0 ? 'selected' : ''
    html += `<option value="${y}-${m}" ${selected}>${MESES[m]} ${y}</option>`
  }
  return html
}

function edad(fechaStr) {
  if (!fechaStr) return null
  try {
    const [y, m, d] = fechaStr.split('-').map(Number)
    const hoy = new Date()
    let age = hoy.getFullYear() - y
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) age--
    return age
  } catch {
    return null
  }
}

function calcularCompletitud(alumno) {
  const r = calcularCompletitudDomain(alumno)
  const completados = r.camposCompletos.length
  const total = r.camposCompletos.length + r.camposFaltantes.length
  let estado
  if (r.nivel === 'completo') estado = 'completa'
  else if (r.nivel === 'bueno' || r.nivel === 'parcial') estado = 'casi_completa'
  else estado = 'incompleta'

  return { completados, total, porcentaje: r.porcentaje, camposFaltantes: r.camposFaltantes, estado }
}

function badgeHtml(estado, porcentaje) {
  const styles = {
    completa: { rgb: 'var(--bs-success-rgb)', color: 'var(--bs-success)' },
    casi_completa: { rgb: 'var(--bs-warning-rgb)', color: 'var(--bs-warning)' },
    incompleta: { rgb: 'var(--bs-danger-rgb)', color: 'var(--bs-danger)' },
  }
  const s = styles[estado]
  const label =
    estado === 'completa'
      ? 'Completa'
      : `${porcentaje}% — ${estado === 'casi_completa' ? 'Faltan campos' : 'Incompleta'}`
  const icon =
    estado === 'completa'
      ? 'bi-check-circle-fill'
      : estado === 'casi_completa'
        ? 'bi-exclamation-circle-fill'
        : 'bi-x-circle-fill'

  return `<span class="badge border px-2 py-1"
            style="background-color: rgba(var(--bs-${estado === 'completa' ? 'success' : estado === 'casi_completa' ? 'warning' : 'danger'}-rgb), 0.12); color: var(--bs-${estado === 'completa' ? 'success' : estado === 'casi_completa' ? 'warning' : 'danger'}); border-color: rgba(var(--bs-${estado === 'completa' ? 'success' : estado === 'casi_completa' ? 'warning' : 'danger'}-rgb), 0.3) !important;">
            <i class="bi ${icon} me-1"></i>${label}
          </span>`
}

function renderResumen(alumnos) {
  if (!alumnos.length) return ''
  const total = alumnos.length
  const completas = alumnos.filter((a) => calcularCompletitud(a).estado === 'completa').length
  const incompletas = alumnos.filter((a) => calcularCompletitud(a).estado === 'incompleta').length
  const casiCompletas = alumnos.filter(
    (a) => calcularCompletitud(a).estado === 'casi_completa',
  ).length

  return `
    <div class="row g-3 mt-1 mb-2">
      <div class="col-6 col-md-3">
        <div class="card text-center border-primary h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-primary">${total}</div>
            <div class="small text-muted">Total inscritos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-success h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-success">${completas}</div>
            <div class="small text-muted">Completas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-warning h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-warning-emphasis">${casiCompletas}</div>
            <div class="small text-muted">Casi completas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-danger h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-danger">${incompletas}</div>
            <div class="small text-muted">Incompletas</div>
          </div>
        </div>
      </div>
    </div>`
}

function renderLista(alumnos) {
  if (!alumnos.length) {
    return `<div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>No hay alumnos inscritos en este período.
            </div>`
  }

  const items = alumnos
    .map((a, i) => {
      const { porcentaje, camposFaltantes, estado, completados, total } = calcularCompletitud(a)
      const telefono = a.representante_tlf || a.madre_tlf_whatsapp || '—'
      const edadVal = edad(a.fecha_nacimiento)
      const edadStr = edadVal !== null ? `${edadVal} años` : ''

      const missingBadges =
        camposFaltantes.length > 0
          ? `<div class="d-flex flex-wrap gap-1 mt-1">
             ${camposFaltantes
               .slice(0, 4)
               .map(
                 (c) =>
                   `<span class="badge reporte-theme-badge border px-1 py-0" style="font-size:.6rem;">${c.label}</span>`,
               )
               .join('')}
             ${camposFaltantes.length > 4 ? `<span class="badge reporte-theme-badge border px-1 py-0" style="font-size:.6rem">+${camposFaltantes.length - 4}</span>` : ''}
           </div>`
          : ''

      return `
      <div class="list-group-item list-group-item-action px-3 py-2" data-alumno-id="${a.id}" role="button">
        <div class="d-flex align-items-center gap-3">
          <div class="flex-shrink-0 text-center" style="width:28px">
            <span class="text-muted small">${i + 1}</span>
          </div>
          <div class="flex-grow-1 min-width-0">
            <div class="fw-semibold text-truncate">${a.nombre_completo || '—'}</div>
            <div class="small text-muted">
              ${telefono !== '—' ? `<i class="bi bi-telephone me-1"></i>${telefono}` : ''}
              ${edadStr ? `<span class="ms-2"><i class="bi bi-calendar3 me-1"></i>${edadStr}</span>` : ''}
            </div>
            ${missingBadges}
          </div>
          <div class="flex-shrink-0 text-end ms-2">
            ${badgeHtml(estado, porcentaje)}
            <div class="small text-muted mt-1">${completados}/${total}</div>
          </div>
          <div class="flex-shrink-0 text-muted">
            <i class="bi bi-arrow-up-right-square"></i>
          </div>
        </div>
      </div>`
    })
    .join('')

  return `
    <div class="card shadow-sm mt-3">
      <div class="card-header bg-white py-2 d-flex justify-content-between align-items-center">
        <span class="fw-semibold small text-muted">ALUMNOS INSCRITOS</span>
        <span class="badge reporte-theme-badge rounded-pill">${alumnos.length}</span>
      </div>
      <div class="list-group list-group-flush" id="lista-inscritos">
        ${items}
      </div>
    </div>`
}

function initOpenEditOnClick(container) {
  container.addEventListener('click', (e) => {
    const item = e.target.closest('[data-alumno-id]')
    if (!item) return
    const id = item.dataset.alumnoId
    if (!id) return
    const btn = item.closest('#reporte-resultado')?.querySelector('#btn-filtrar')
    openEditAlumnoModal(id, {
      onSaved: () => btn?.click(),
    })
  })
}

export async function renderReporteInscripcionesMes(container) {
  const hoy = new Date()
  let currentYear = hoy.getFullYear()
  let currentMonth = hoy.getMonth() + 1
  let alumnosActuales = []

  async function cargar(year, month) {
    const resultDiv = container.querySelector('#reporte-resultado')
    if (resultDiv)
      resultDiv.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando inscritos de ${MESES[month]} ${year}...</p>
      </div>`

    try {
      alumnosActuales = await obtenerAlumnosPorMes(year, month)

      if (resultDiv) {
        resultDiv.innerHTML = renderResumen(alumnosActuales) + renderLista(alumnosActuales)
        initOpenEditOnClick(resultDiv)
      }

      const btnPdf = container.querySelector('#btn-descargar-pdf')
      if (btnPdf) {
        btnPdf.disabled = alumnosActuales.length === 0
        btnPdf.textContent =
          alumnosActuales.length > 0
            ? `Descargar PDF (${alumnosActuales.length} alumnos)`
            : 'Sin inscritos'
      }
    } catch (err) {
      console.error(err)
      if (resultDiv)
        resultDiv.innerHTML = `
        <div class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los datos. Por favor intenta de nuevo.
        </div>`
    }
  }

  container.innerHTML = `
    <div class="container-fluid py-3">
      <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 class="mb-0"><i class="bi bi-file-earmark-bar-graph me-2 text-primary"></i>Reporte de Inscripciones</h4>
          <p class="text-muted small mb-0">Alumnos inscritos por mes — El Sistema Punta Cana</p>
        </div>
        <button id="btn-descargar-pdf" class="btn btn-primary" disabled>
          <i class="bi bi-file-earmark-pdf me-2"></i>Descargar PDF
        </button>
      </div>

      <div class="card shadow-sm">
        <div class="card-body pb-2">
          <div class="row align-items-end g-2">
            <div class="col-auto">
              <label class="form-label mb-1 small fw-semibold">Período</label>
              <select id="select-mes" class="form-select form-select-sm" style="min-width:180px">
                ${buildMonthOptions()}
              </select>
            </div>
            <div class="col-auto">
              <button id="btn-filtrar" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-search me-1"></i>Consultar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="reporte-resultado"></div>
    </div>`

  container.querySelector('#btn-filtrar')?.addEventListener('click', () => {
    const val = container.querySelector('#select-mes')?.value ?? ''
    const [y, m] = val.split('-').map(Number)
    if (y && m) {
      currentYear = y
      currentMonth = m
      cargar(y, m)
    }
  })

  container.querySelector('#btn-descargar-pdf')?.addEventListener('click', () => {
    try {
      descargarReporteMensual(alumnosActuales, currentYear, currentMonth)
    } catch (e) {
      console.error('Error generando PDF:', e)
      alert('Error al generar el PDF. Por favor intenta de nuevo.')
    }
  })

  cargar(currentYear, currentMonth)
}

/**
 * Vista: Reporte mensual de inscripciones — Admin
 * Permite filtrar por mes/año y descargar el PDF.
 */

import { obtenerAlumnosPorMes } from '../api/alumnosApi.js'
import { descargarReporteMensual } from '../domain/generarReporteMensual.js'

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function buildMonthOptions() {
  const hoy = new Date()
  let html = ''
  // Últimos 24 meses
  for (let i = 0; i < 24; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const selected = i === 0 ? 'selected' : ''
    html += `<option value="${y}-${m}" ${selected}>${MESES[m]} ${y}</option>`
  }
  return html
}

function conductaLabel(val) {
  return { no: 'Sin problemas', pocas_veces: 'Pocas veces', si: 'Sí', violento: 'Violento' }[val] ?? (val ?? '—')
}

function interesLabel(val) {
  return { cantar: 'Cantar', instrumento: 'Instrumento', ambas: 'Ambas' }[val] ?? (val ?? '—')
}

function pad(val) {
  const s = String(val ?? '').trim()
  return s || '—'
}

function edad(fechaStr) {
  if (!fechaStr) return '—'
  try {
    const [y, m, d] = fechaStr.split('-').map(Number)
    const hoy = new Date()
    let age = hoy.getFullYear() - y
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) age--
    return `${age} años`
  } catch { return '—' }
}

function renderTabla(alumnos) {
  if (!alumnos.length) {
    return `<div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>No hay alumnos inscritos en este período.
            </div>`
  }

  const filas = alumnos.map((a, i) => `
    <tr>
      <td class="text-center text-muted">${i + 1}</td>
      <td>
        <div class="fw-semibold">${pad(a.nombre_completo)}</div>
        <small class="text-muted">${edad(a.fecha_nacimiento)} · ${pad(a.nacionalidad)}</small>
      </td>
      <td>${pad(a.municipio_residencia)}</td>
      <td>
        <div>${pad(a.representante_nombre)}</div>
        <small class="text-muted">${pad(a.representante_tlf)}</small>
      </td>
      <td class="text-center">${interesLabel(a.interes_musical)}</td>
      <td class="text-center">${pad(a.instrumento_interes)}</td>
      <td class="text-center">
        ${a.requiere_iniciacion_musical
          ? '<span class="badge bg-warning text-dark">Iniciación</span>'
          : '<span class="badge bg-success">Avanzado</span>'}
      </td>
      <td class="text-center">
        ${a.acepta_pago_600
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-x-circle text-danger"></i>'}
      </td>
      <td class="text-center">
        ${a.familia_monoparental
          ? '<span class="badge bg-secondary">Sí</span>'
          : '<span class="text-muted">No</span>'}
      </td>
      <td class="text-center">
        ${a.beneficiario_subsidio_estado
          ? '<span class="badge bg-info text-dark">Sí</span>'
          : '<span class="text-muted">No</span>'}
      </td>
    </tr>`).join('')

  return `
    <div class="table-responsive mt-3">
      <table class="table table-sm table-hover align-middle" id="tabla-reporte">
        <thead class="table-dark">
          <tr>
            <th style="width:36px">#</th>
            <th>Alumno</th>
            <th>Municipio</th>
            <th>Representante</th>
            <th class="text-center">Interés</th>
            <th class="text-center">Instrumento</th>
            <th class="text-center">Nivel</th>
            <th class="text-center">Pagó 600</th>
            <th class="text-center">Monopar.</th>
            <th class="text-center">Subsidio</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>`
}

function renderResumen(alumnos) {
  if (!alumnos.length) return ''
  const con = alumnos.filter(a => a.tiene_conocimientos_musicales === true).length
  const ini = alumnos.filter(a => a.requiere_iniciacion_musical === true).length
  const sub = alumnos.filter(a => a.beneficiario_subsidio_estado === true).length
  const mono = alumnos.filter(a => a.familia_monoparental === true).length

  return `
    <div class="row g-3 mt-1 mb-2">
      <div class="col-6 col-md-3">
        <div class="card text-center border-primary">
          <div class="card-body py-2">
            <div class="fs-2 fw-bold text-primary">${alumnos.length}</div>
            <div class="small text-muted">Inscritos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-warning">
          <div class="card-body py-2">
            <div class="fs-2 fw-bold text-warning">${ini}</div>
            <div class="small text-muted">Requieren iniciación</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-secondary">
          <div class="card-body py-2">
            <div class="fs-2 fw-bold text-secondary">${mono}</div>
            <div class="small text-muted">Fam. monoparental</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-info">
          <div class="card-body py-2">
            <div class="fs-2 fw-bold text-info">${sub}</div>
            <div class="small text-muted">Beneficiarios subsidio</div>
          </div>
        </div>
      </div>
    </div>`
}

export async function renderReporteInscripcionesMes(container) {
  const hoy = new Date()
  let currentYear = hoy.getFullYear()
  let currentMonth = hoy.getMonth() + 1
  let alumnosActuales = []

  async function cargar(year, month) {
    const resultDiv = container.querySelector('#reporte-resultado')
    if (resultDiv) resultDiv.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando inscritos de ${MESES[month]} ${year}...</p>
      </div>`

    try {
      alumnosActuales = await obtenerAlumnosPorMes(year, month)

      if (resultDiv) {
        resultDiv.innerHTML = renderResumen(alumnosActuales) + renderTabla(alumnosActuales)
      }

      // Actualizar botón de descarga
      const btnPdf = container.querySelector('#btn-descargar-pdf')
      if (btnPdf) {
        btnPdf.disabled = alumnosActuales.length === 0
        btnPdf.textContent = alumnosActuales.length > 0
          ? `Descargar PDF (${alumnosActuales.length} alumnos)`
          : 'Sin inscritos'
      }
    } catch (err) {
      console.error(err)
      if (resultDiv) resultDiv.innerHTML = `
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

  // Eventos
  container.querySelector('#btn-filtrar')?.addEventListener('click', () => {
    const val = container.querySelector('#select-mes')?.value ?? ''
    const [y, m] = val.split('-').map(Number)
    if (y && m) { currentYear = y; currentMonth = m; cargar(y, m) }
  })

  container.querySelector('#btn-descargar-pdf')?.addEventListener('click', () => {
    try {
      descargarReporteMensual(alumnosActuales, currentYear, currentMonth)
    } catch (e) {
      console.error('Error generando PDF:', e)
      alert('Error al generar el PDF. Por favor intenta de nuevo.')
    }
  })

  // Carga inicial
  cargar(currentYear, currentMonth)
}

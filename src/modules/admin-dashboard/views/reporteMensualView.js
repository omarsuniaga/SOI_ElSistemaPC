/**
 * reporteMensualView.js — Resumen Ejecutivo Mensual (Portal ADM).
 * Consume get_resumen_academico_mensual() vía academicReportsApi y presenta
 * KPIs de asistencia, patrón semanal, alumnos en zona roja y cumplimiento docente.
 * Incluye exportación a PDF profesional e interactividad de filtros.
 */

import { getResumenAcademicoMensual } from '../api/academicReportsApi.js'
import { descargarPdfResumenMensual } from '../services/academicReportsPdfService.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import '../styles/admin-dashboard.css'

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export class ReporteMensualView {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.data = null
    const now = new Date()
    this.selectedMes = now.getMonth() + 1
    this.selectedAnio = now.getFullYear()
    this.isExporting = false
  }

  async init() {
    if (!this.container) return
    await this.cargarDatos()
  }

  async cargarDatos() {
    this.container.innerHTML = `
      <div class="premium-loading text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div class="text-muted fw-semibold">Consultando resumen mensual (${MESES[this.selectedMes]} ${this.selectedAnio})...</div>
      </div>
    `
    try {
      this.data = await getResumenAcademicoMensual({
        mes: this.selectedMes,
        anio: this.selectedAnio,
      })
      this.render()
    } catch (err) {
      console.error('[ReporteMensualView] Error:', err)
      this.container.innerHTML = `
        <div class="admin-dashboard-container p-4">
          ${this.renderHeader(null)}
          <div class="alert alert-danger d-flex align-items-center gap-3 mt-3">
            <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            <div>
              <div class="fw-bold">No se pudo cargar el resumen mensual</div>
              <div class="small">${escapeHTML(err.message || String(err))}</div>
            </div>
          </div>
        </div>
      `
      this.attachEventListeners()
    }
  }

  render() {
    const d = this.data
    const resumen = d?.resumen_general || { mes: this.selectedMes, anio: this.selectedAnio }
    const efectividad = d?.efectividad_clases
    const patron = d?.patron_semanal
    const riesgo = Array.isArray(d?.alumnos_en_riesgo) ? d.alumnos_en_riesgo : []
    const docentes = Array.isArray(d?.cumplimiento_docente) ? d.cumplimiento_docente : []

    this.container.innerHTML = `
      <div class="admin-dashboard-container p-3 p-md-4">
        ${this.renderHeader(resumen)}

        <!-- 1. KPIs Principales -->
        <section class="metrics-section mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold m-0"><i class="bi bi-speedometer2 text-primary me-2"></i>Métricas Generales</h5>
            <span class="text-muted small">Corte: <strong>${resumen.fecha_inicio || 'Inicio'}</strong> al <strong>${resumen.fecha_fin || 'Fin'}</strong></span>
          </div>
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-primary border-4">
                <div class="text-muted small fw-semibold">Tasa de Asistencia Global</div>
                <div class="fs-2 fw-bold text-primary my-1">${resumen.tasa_asistencia_pct ?? 0}%</div>
                <div class="small text-muted">${resumen.presentes ?? 0} presentes · ${resumen.tardes ?? 0} tardes</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-info border-4">
                <div class="text-muted small fw-semibold">Ratio de Justificación</div>
                <div class="fs-2 fw-bold text-info my-1">${resumen.ratio_justificacion_pct ?? 0}%</div>
                <div class="small text-muted">${resumen.justificados ?? 0} justificados de ${resumen.ausentes ?? 0} ausencias</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-success border-4">
                <div class="text-muted small fw-semibold">Efectividad de Clases</div>
                <div class="fs-2 fw-bold text-success my-1">${efectividad?.tasa_efectividad_pct ?? 0}%</div>
                <div class="small text-muted">${efectividad?.dictadas ?? 0} dictadas de ${efectividad?.total_programadas ?? 0} prog.</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-danger border-4">
                <div class="text-muted small fw-semibold">Alumnos en Zona Roja</div>
                <div class="fs-2 fw-bold text-danger my-1">${riesgo.length}</div>
                <div class="small text-muted">≥2 inasistencias en el mes</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Patrón Semanal de Concurrencia -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h5 class="fw-bold m-0"><i class="bi bi-calendar-week text-primary me-2"></i>Patrón Semanal de Concurrencia</h5>
              <div class="d-flex gap-3 small">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <i class="bi bi-arrow-up-circle me-1"></i>Pico: <strong>${escapeHTML(patron?.dia_pico_asistencia || 'N/A')}</strong>
                </span>
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                  <i class="bi bi-arrow-down-circle me-1"></i>Valle: <strong>${escapeHTML(patron?.dia_valle_asistencia || 'N/A')}</strong>
                </span>
              </div>
            </div>
            ${this.renderPatronSemanalVisual(patron?.dias || [])}
          </div>
        </section>

        <!-- 3. Alumnos en Zona Roja -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold m-0 text-danger"><i class="bi bi-exclamation-octagon-fill me-2"></i>Alerta Temprana: Alumnos en Riesgo (${riesgo.length})</h5>
              <span class="badge bg-danger-subtle text-danger">Requiere Intervención</span>
            </div>
            ${this.renderRiesgoTable(riesgo)}
          </div>
        </section>

        <!-- 4. Semáforo de Cumplimiento Docente -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold m-0"><i class="bi bi-person-check text-primary me-2"></i>Cumplimiento y Registro Docente</h5>
              <span class="text-muted small">${docentes.length} maestros evaluados</span>
            </div>
            ${this.renderDocentesTable(docentes)}
          </div>
        </section>
      </div>
    `

    this.attachEventListeners()
  }

  renderHeader(resumen) {
    const mesActual = resumen?.mes || this.selectedMes
    const anioActual = resumen?.anio || this.selectedAnio

    return `
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-4 bg-primary text-white p-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
            <i class="bi bi-graph-up fs-4"></i>
          </div>
          <div>
            <h3 class="fw-bold m-0 text-body">Resumen Académico Mensual</h3>
            <p class="text-muted small m-0">Monitoreo de asistencia, alertas tempranas y cumplimiento docente</p>
          </div>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <!-- Selector de Mes -->
          <select id="selReporteMes" class="form-select form-select-sm" style="width: auto;">
            ${MESES.slice(1)
              .map((m, idx) => `<option value="${idx + 1}" ${idx + 1 === mesActual ? 'selected' : ''}>${m}</option>`)
              .join('')}
          </select>

          <!-- Selector de Año -->
          <select id="selReporteAnio" class="form-select form-select-sm" style="width: auto;">
            <option value="2026" ${anioActual === 2026 ? 'selected' : ''}>2026</option>
            <option value="2025" ${anioActual === 2025 ? 'selected' : ''}>2025</option>
          </select>

          <!-- Botón de Descarga PDF -->
          <button id="btnDescargarPdfMensual" class="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm rounded-3">
            <i class="bi bi-file-earmark-pdf"></i>
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    `
  }

  renderPatronSemanalVisual(dias) {
    if (!dias.length) {
      return `<div class="text-center py-3 text-muted small">Sin datos de días de la semana.</div>`
    }

    return `
      <div class="row g-2 pt-2">
        ${dias
          .map((d) => {
            const pct = d.tasa_asistencia_dia ?? 0
            const colorClass = pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-primary' : 'bg-warning text-dark'
            return `
            <div class="col">
              <div class="p-2 border rounded-3 text-center bg-body-tertiary">
                <div class="fw-bold small text-body">${escapeHTML(d.dia_nombre || 'Día')}</div>
                <div class="progress my-2" style="height: 6px;">
                  <div class="progress-bar ${colorClass}" style="width: ${pct}%;"></div>
                </div>
                <div class="fw-semibold small">${pct}%</div>
                <div class="text-muted" style="font-size: 0.7rem;">${d.presentes_dia || 0} P / ${d.ausentes_dia || 0} A</div>
              </div>
            </div>`
          })
          .join('')}
      </div>
    `
  }

  renderRiesgoTable(riesgo) {
    if (!riesgo.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-check-circle fs-3 d-block mb-2 text-success"></i>Excelente: No hay alumnos con ≥2 inasistencias en este mes.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Alumno</th>
              <th>Cátedra / Instrumento</th>
              <th>Representante</th>
              <th>Contacto</th>
              <th class="text-center">Total Inasistencias</th>
              <th class="text-center">Injustificadas</th>
            </tr>
          </thead>
          <tbody>
            ${riesgo
              .map(
                (r) => `
              <tr>
                <td><strong class="text-body">${escapeHTML(r.nombre_completo)}</strong></td>
                <td><span class="badge bg-secondary-subtle text-secondary border">${escapeHTML(r.instrumento_principal || 'N/A')}</span></td>
                <td class="small">${escapeHTML(r.representante_nombre || '—')}</td>
                <td class="small"><a href="tel:${escapeHTML(r.representante_tlf || '')}" class="text-decoration-none"><i class="bi bi-telephone me-1"></i>${escapeHTML(r.representante_tlf || '—')}</a></td>
                <td class="text-center"><span class="badge bg-danger-subtle text-danger fs-6">${r.total_inasistencias ?? 0}</span></td>
                <td class="text-center"><strong class="text-danger">${r.ausencias_injustificadas ?? 0}</strong></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderDocentesTable(docentes) {
    if (!docentes.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-inbox fs-3 d-block mb-2"></i>Sin registros de sesiones docentes en este mes.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Docente</th>
              <th>Especialidad</th>
              <th class="text-center">Sesiones Cerradas</th>
              <th class="text-center">Pendientes</th>
              <th class="text-center">% Cumplimiento</th>
              <th class="text-center">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${docentes
              .map((m) => {
                const pct = m.cumplimiento_pct ?? 0
                const badgeBg = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning text-dark' : 'bg-danger'
                return `
              <tr>
                <td><strong class="text-body">${escapeHTML(m.maestro_nombre)}</strong></td>
                <td><span class="text-muted small">${escapeHTML(m.especialidad || '—')}</span></td>
                <td class="text-center font-monospace">${m.sesiones_cerradas ?? 0} / ${m.total_sesiones ?? 0}</td>
                <td class="text-center"><span class="badge ${m.sesiones_pendientes > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}">${m.sesiones_pendientes ?? 0}</span></td>
                <td class="text-center"><span class="badge ${badgeBg}">${pct}%</span></td>
                <td class="text-center small text-muted"><i class="bi bi-chat-text me-1"></i>${m.sesiones_con_observaciones ?? 0}</td>
              </tr>`
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  attachEventListeners() {
    const selMes = document.getElementById('selReporteMes')
    const selAnio = document.getElementById('selReporteAnio')
    const btnPdf = document.getElementById('btnDescargarPdfMensual')

    if (selMes) {
      selMes.addEventListener('change', (e) => {
        this.selectedMes = Number(e.target.value)
        this.cargarDatos()
      })
    }

    if (selAnio) {
      selAnio.addEventListener('change', (e) => {
        this.selectedAnio = Number(e.target.value)
        this.cargarDatos()
      })
    }

    if (btnPdf) {
      btnPdf.addEventListener('click', async () => {
        if (!this.data || this.isExporting) return
        this.isExporting = true
        btnPdf.disabled = true
        btnPdf.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Generando PDF...`

        try {
          await descargarPdfResumenMensual(this.data, this.selectedMes, this.selectedAnio)
        } catch (err) {
          console.error('[ReporteMensualView] Error al exportar PDF:', err)
          alert('Hubo un error al generar el PDF.')
        } finally {
          this.isExporting = false
          btnPdf.disabled = false
          btnPdf.innerHTML = `<i class="bi bi-file-earmark-pdf"></i> <span>Descargar PDF</span>`
        }
      })
    }
  }
}

export default ReporteMensualView

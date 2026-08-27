/**
 * reporteSemestralView.js — Informe Ejecutivo Semestral (Portal ADM).
 * Consume get_informe_academico_semestral() vía academicReportsApi y presenta
 * evolución longitudinal, cuadro de honor, ausentismo, retención, mérito y desempeño docente.
 * Incluye exportación a PDF profesional e interactividad.
 */

import { getInformeAcademicoSemestral } from '../api/academicReportsApi.js'
import { descargarPdfInformeSemestral } from '../services/academicReportsPdfService.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import '../styles/admin-dashboard.css'

export class ReporteSemestralView {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.data = null
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
        <div class="text-muted fw-semibold">Consultando informe del período académico...</div>
      </div>
    `
    try {
      this.data = await getInformeAcademicoSemestral()
      this.render()
    } catch (err) {
      console.error('[ReporteSemestralView] Error:', err)
      this.container.innerHTML = `
        <div class="admin-dashboard-container p-4">
          ${this.renderHeader(null)}
          <div class="alert alert-danger d-flex align-items-center gap-3 mt-3">
            <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            <div>
              <div class="fw-bold">No se pudo cargar el informe semestral</div>
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
    const periodo = d?.periodo || {}
    const evolucion = Array.isArray(d?.evolucion_mensual) ? d.evolucion_mensual : []
    const honor = Array.isArray(d?.cuadro_honor) ? d.cuadro_honor : []
    const ausencias = Array.isArray(d?.ranking_ausencias) ? d.ranking_ausencias : []
    const causas = Array.isArray(d?.causas_justificaciones) ? d.causas_justificaciones : []
    const retencion = Array.isArray(d?.retencion_por_catedra) ? d.retencion_por_catedra : []
    const destacados = Array.isArray(d?.alumnos_destacados) ? d.alumnos_destacados : []
    const audicionesRealizadas = Boolean(d?.audiciones_realizadas)

    this.container.innerHTML = `
      <div class="admin-dashboard-container p-3 p-md-4">
        ${this.renderHeader(periodo)}

        <!-- 1. Evolución Longitudinal de Asistencia -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold m-0"><i class="bi bi-graph-up-arrow text-primary me-2"></i>Evolución Longitudinal de Asistencia</h5>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Cronograma del Semestre</span>
            </div>
            ${this.renderEvolucion(evolucion, periodo)}
          </div>
        </section>

        <!-- 2. Cuadro de Honor y Alumnos Destacados (Fase de Audiciones) -->
        <div class="row g-4 mb-4">
          <!-- Cuadro de Honor -->
          <div class="col-12 col-xl-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100 position-relative ${!audicionesRealizadas ? 'bg-body-tertiary' : ''}">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold m-0 text-success"><i class="bi bi-trophy-fill me-2"></i>Cuadro de Honor (≥95% Asistencia)</h5>
                <span class="badge ${audicionesRealizadas ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary border'}">
                  ${audicionesRealizadas ? `${honor.length} alumnos` : '<i class="bi bi-lock-fill me-1"></i>Bloqueado'}
                </span>
              </div>
              ${this.renderHonorTable(honor, audicionesRealizadas)}
            </div>
          </div>

          <!-- Alumnos Destacados (Merit Score) -->
          <div class="col-12 col-xl-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100 position-relative ${!audicionesRealizadas ? 'bg-body-tertiary' : ''}">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold m-0 text-primary"><i class="bi bi-star-fill me-2"></i>Alumnos Destacados (Merit Score)</h5>
                <span class="badge ${audicionesRealizadas ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary border'}">
                  ${audicionesRealizadas ? 'Logros & Indicadores' : '<i class="bi bi-lock-fill me-1"></i>Bloqueado'}
                </span>
              </div>
              ${this.renderDestacadosTable(destacados, audicionesRealizadas)}
            </div>
          </div>
        </div>

        <!-- 3. Retención por Cátedra y Causas de Inasistencia -->
        <div class="row g-4 mb-4">
          <!-- Retención por Cátedra -->
          <div class="col-12 col-xl-7">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold m-0"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Retención de Matrícula por Cátedra</h5>
                <span class="text-muted small">${retencion.length} cátedras</span>
              </div>
              ${this.renderRetencionTable(retencion)}
            </div>
          </div>

          <!-- Causas de Justificación -->
          <div class="col-12 col-xl-5">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold m-0"><i class="bi bi-chat-left-text-fill text-info me-2"></i>Motivos de Inasistencia</h5>
                <span class="text-muted small">Justificaciones</span>
              </div>
              ${this.renderCausasTable(causas)}
            </div>
          </div>
        </div>

        <!-- 4. Top Ausentismo -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div>
                <h5 class="fw-bold m-0 text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Ranking de Absentismo del Período (Días Lectivos con Falta)</h5>
                <p class="text-muted small m-0">Medición institucional por jornadas completas y días de ausencia para intervención con representantes</p>
              </div>
              <span class="badge bg-danger-subtle text-danger border border-danger-subtle">Seguimiento por Jornadas</span>
            </div>
            ${this.renderAusenciasTable(ausencias)}
          </div>
        </section>

        <!-- 5. Evaluación Consolidada Docente -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold m-0"><i class="bi bi-award-fill text-primary me-2"></i>Evaluación y Solvencia Docente del Semestre</h5>
              <span class="text-muted small">${docentes.length} docentes evaluados</span>
            </div>
            ${this.renderDocentesTable(docentes)}
          </div>
        </section>
      </div>
    `

    this.attachEventListeners()
  }

  obtenerMesesPeriodo(periodo, evolucionExistente = []) {
    const mesesNombres = [
      '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    const hoy = new Date()
    const hoyAnio = hoy.getFullYear()
    const hoyMes = hoy.getMonth() + 1
    const hoyDia = hoy.getDate()

    // Fechas de inicio y fin del período académico
    const fInicio = periodo?.fecha_inicio ? new Date(periodo.fecha_inicio + 'T00:00:00') : new Date(hoyAnio, 7, 10)
    const fFin = periodo?.fecha_fin ? new Date(periodo.fecha_fin + 'T00:00:00') : new Date(hoyAnio, 11, 19)

    const mapaExistente = new Map(
      (evolucionExistente || []).map((e) => [`${e.anio}-${Number(e.mes)}`, e])
    )

    const meses = []
    let cursor = new Date(fInicio.getFullYear(), fInicio.getMonth(), 1)
    const finLimit = new Date(fFin.getFullYear(), fFin.getMonth(), 1)

    while (cursor <= finLimit) {
      const anio = cursor.getFullYear()
      const mes = cursor.getMonth() + 1
      const key = `${anio}-${mes}`
      const mesNombre = `${mesesNombres[mes]} ${anio}`
      const diasEnMes = new Date(anio, mes, 0).getDate()

      // Determinar estado temporal y progreso de llenado día a día
      let estado = 'bloqueado' // 'concluido' | 'en_curso' | 'bloqueado'
      let progresoTemporalPct = 0
      let diasTranscurridos = 0

      if (anio < hoyAnio || (anio === hoyAnio && mes < hoyMes)) {
        estado = 'concluido'
        progresoTemporalPct = 100
        diasTranscurridos = diasEnMes
      } else if (anio === hoyAnio && mes === hoyMes) {
        estado = 'en_curso'
        diasTranscurridos = Math.min(hoyDia, diasEnMes)
        progresoTemporalPct = Math.min(100, Math.max(1, Math.round((diasTranscurridos / diasEnMes) * 100)))
      } else {
        estado = 'bloqueado'
        progresoTemporalPct = 0
        diasTranscurridos = 0
      }

      const datosMes = mapaExistente.get(key) || null

      meses.push({
        anio,
        mes,
        mesNombre,
        diasEnMes,
        diasTranscurridos,
        progresoTemporalPct,
        estado,
        tasa_asistencia_pct: datosMes?.tasa_asistencia_pct ?? 0,
        presentes_total: datosMes?.presentes_total ?? 0,
        ausentes_total: datosMes?.ausentes_total ?? 0,
        total_registros: datosMes?.total_registros ?? 0,
      })

      cursor.setMonth(cursor.getMonth() + 1)
    }

    return meses
  }

  renderHeader(periodo) {
    const label = periodo?.nombre || 'Período Académico Activo'
    const fechaFinTexto = periodo?.fecha_fin
      ? new Date(periodo.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      : '19 de diciembre'

    return `
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-4 bg-primary text-white p-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="fw-bold m-0 text-body">Informe del Período Académico</h3>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Ciclo en Curso</span>
            </div>
            <p class="text-muted small m-0">${escapeHTML(label)} · Balance pedagógico, retención y seguimiento longitudinal</p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button id="btnDescargarPdfSemestral" class="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm rounded-3">
            <i class="bi bi-file-earmark-pdf"></i>
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      <div class="alert alert-info border-info-subtle bg-info-subtle bg-opacity-25 d-flex align-items-center gap-3 p-3 rounded-4 mb-4 shadow-sm">
        <i class="bi bi-hourglass-split fs-3 text-info"></i>
        <div class="small">
          <strong class="d-block text-body mb-1">Período Académico en Curso (Finaliza el ${fechaFinTexto})</strong>
          <span class="text-muted">Las fichas mensuales se van desbloqueando progresivamente a medida que transcurre el calendario. Las barras de progreso mensual se llenan día a día hasta alcanzar el 100% al concluir cada mes.</span>
        </div>
      </div>
    `
  }

  renderEvolucion(evolucion, periodo) {
    const meses = this.obtenerMesesPeriodo(periodo, evolucion)

    if (!meses.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-inbox fs-3 d-block mb-2"></i>Sin datos históricos de asistencia para este período todavía.</div>`
    }

    return `
      <div class="row g-3">
        ${meses
          .map((m) => {
            if (m.estado === 'bloqueado') {
              return `
              <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="p-3 border rounded-3 bg-body-tertiary position-relative" style="filter: grayscale(1); opacity: 0.65; border: 1px dashed var(--bs-border-color) !important;">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-body-secondary small">${escapeHTML(m.mesNombre)}</span>
                    <span class="badge bg-secondary-subtle text-secondary border"><i class="bi bi-lock-fill me-1"></i>Bloqueado</span>
                  </div>
                  <div class="d-flex justify-content-between text-muted mt-2" style="font-size: 0.7rem;">
                    <span>Progreso del mes</span>
                    <span>0%</span>
                  </div>
                  <div class="progress my-1" style="height: 5px;">
                    <div class="progress-bar bg-secondary" style="width: 0%;"></div>
                  </div>
                  <div class="text-muted mt-2" style="font-size: 0.72rem;">
                    <i class="bi bi-clock me-1"></i>Se desbloquea al iniciar el mes
                  </div>
                </div>
              </div>`
            }

            if (m.estado === 'en_curso') {
              const pct = m.tasa_asistencia_pct ?? 0
              const barClass = pct >= 85 ? 'bg-success' : pct >= 70 ? 'bg-primary' : 'bg-warning text-dark'
              return `
              <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="p-3 border border-primary border-opacity-50 rounded-3 bg-primary-subtle bg-opacity-10 shadow-sm position-relative">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-primary small"><i class="bi bi-play-circle-fill me-1 text-primary"></i>${escapeHTML(m.mesNombre)}</span>
                    <span class="badge bg-primary text-white">En Curso</span>
                  </div>
                  
                  <!-- Barra de llenado día a día -->
                  <div class="d-flex justify-content-between text-muted mt-2" style="font-size: 0.7rem;">
                    <span>Día ${m.diasTranscurridos} de ${m.diasEnMes}</span>
                    <span class="fw-bold text-primary">${m.progresoTemporalPct}% transcurrido</span>
                  </div>
                  <div class="progress my-1" style="height: 6px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: ${m.progresoTemporalPct}%;"></div>
                  </div>

                  <!-- Asistencia registrada hasta la fecha -->
                  <div class="d-flex justify-content-between text-muted mt-2 pt-1 border-top" style="font-size: 0.75rem;">
                    <span>Asist. acumulada: <strong class="${pct >= 85 ? 'text-success' : 'text-primary'}">${pct}%</strong></span>
                    <span>${m.presentes_total} P · ${m.ausentes_total} A</span>
                  </div>
                </div>
              </div>`
            }

            // Concluido
            const pct = m.tasa_asistencia_pct ?? 0
            const barClass = pct >= 85 ? 'bg-success' : pct >= 70 ? 'bg-primary' : 'bg-warning text-dark'
            return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="p-3 border rounded-3 bg-body-tertiary">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold text-body small">${escapeHTML(m.mesNombre)}</span>
                  <span class="badge ${barClass}">${pct}% Asist.</span>
                </div>
                
                <div class="d-flex justify-content-between text-muted mt-2" style="font-size: 0.7rem;">
                  <span>Mes completado</span>
                  <span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>100%</span>
                </div>
                <div class="progress my-1" style="height: 5px;">
                  <div class="progress-bar bg-success" style="width: 100%;"></div>
                </div>

                <div class="d-flex justify-content-between text-muted mt-2 pt-1 border-top" style="font-size: 0.75rem;">
                  <span>${m.presentes_total || 0} asistencias</span>
                  <span>${m.ausentes_total || 0} faltas</span>
                </div>
              </div>
            </div>`
          })
          .join('')}
      </div>
    `
  }

  renderHonorTable(honor, audicionesRealizadas = false) {
    if (!audicionesRealizadas) {
      return `
        <div class="p-4 text-center rounded-3 bg-body-tertiary border border-dashed my-auto d-flex flex-column align-items-center justify-content-center" style="min-height: 200px; filter: grayscale(1); opacity: 0.75;">
          <div class="rounded-circle bg-secondary-subtle text-secondary d-inline-flex align-items-center justify-content-center p-3 mb-2" style="width: 48px; height: 48px;">
            <i class="bi bi-lock-fill fs-4"></i>
          </div>
          <h6 class="fw-bold text-body small mb-1">Sección Reservada para Audiciones</h6>
          <p class="text-muted small m-0" style="max-width: 340px; font-size: 0.78rem;">
            El Cuadro de Honor se habilitará automáticamente tras la realización y validación de las audiciones del semestre.
          </p>
        </div>
      `
    }

    if (!honor.length) {
      return `<div class="text-center py-4 text-muted small">Sin alumnos con ≥95% de asistencia.</div>`
    }
    return `
      <div class="table-responsive" style="max-height: 280px;">
        <table class="table table-hover table-sm align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Alumno</th>
              <th>Cátedra</th>
              <th class="text-center">Clases</th>
              <th class="text-center">% Asist.</th>
            </tr>
          </thead>
          <tbody>
            ${honor
              .map(
                (h) => `
              <tr>
                <td><strong class="text-body">${escapeHTML(h.nombre_completo)}</strong></td>
                <td><span class="badge bg-secondary-subtle text-secondary">${escapeHTML(h.instrumento_principal || 'N/A')}</span></td>
                <td class="text-center font-monospace">${h.asistencias}/${h.total_clases}</td>
                <td class="text-center"><span class="badge bg-success">${h.porcentaje_asistencia ?? 0}%</span></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderDestacadosTable(destacados, audicionesRealizadas = false) {
    if (!audicionesRealizadas) {
      return `
        <div class="p-4 text-center rounded-3 bg-body-tertiary border border-dashed my-auto d-flex flex-column align-items-center justify-content-center" style="min-height: 200px; filter: grayscale(1); opacity: 0.75;">
          <div class="rounded-circle bg-secondary-subtle text-secondary d-inline-flex align-items-center justify-content-center p-3 mb-2" style="width: 48px; height: 48px;">
            <i class="bi bi-lock-fill fs-4"></i>
          </div>
          <h6 class="fw-bold text-body small mb-1">Sección Reservada para Audiciones</h6>
          <p class="text-muted small m-0" style="max-width: 340px; font-size: 0.78rem;">
            Las puntuaciones de mérito e indicadores se publicarán oficialmente al concluir la jornada de audiciones.
          </p>
        </div>
      `
    }

    if (!destacados.length) {
      return `<div class="text-center py-4 text-muted small">Sin datos de logros e indicadores aún.</div>`
    }
    return `
      <div class="table-responsive" style="max-height: 280px;">
        <table class="table table-hover table-sm align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Alumno</th>
              <th>Cátedra</th>
              <th class="text-center">Logros</th>
              <th class="text-center">Indicadores</th>
              <th class="text-center">Merit Score</th>
            </tr>
          </thead>
          <tbody>
            ${destacados
              .map(
                (a) => `
              <tr>
                <td><strong class="text-body">${escapeHTML(a.nombre_completo)}</strong></td>
                <td><span class="badge bg-secondary-subtle text-secondary">${escapeHTML(a.instrumento_principal || 'N/A')}</span></td>
                <td class="text-center small"><i class="bi bi-trophy text-warning me-1"></i>${a.total_logros || 0}</td>
                <td class="text-center small"><i class="bi bi-check2-circle text-success me-1"></i>${a.indicadores_aprobados || 0}</td>
                <td class="text-center"><span class="badge bg-primary fs-6">${a.merit_score || 0} pts</span></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderRetencionTable(retencion) {
    if (!retencion.length) {
      return `<div class="text-center py-4 text-muted small">Sin datos de retención.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Cátedra / Instrumento</th>
              <th class="text-center">Matrícula Inicial</th>
              <th class="text-center">Activos al Cierre</th>
              <th class="text-center">Bajas</th>
              <th class="text-center">% Retención</th>
            </tr>
          </thead>
          <tbody>
            ${retencion
              .map((r) => {
                const pct = r.tasa_retencion_pct ?? 0
                const badgeBg = pct >= 85 ? 'bg-success' : pct >= 70 ? 'bg-primary' : 'bg-warning text-dark'
                return `
              <tr>
                <td><strong>${escapeHTML(r.instrumento)}</strong></td>
                <td class="text-center font-monospace">${r.total_matriculados || 0}</td>
                <td class="text-center font-monospace text-success">${r.activos_cierre || 0}</td>
                <td class="text-center font-monospace text-danger">${r.retirados || 0}</td>
                <td class="text-center"><span class="badge ${badgeBg}">${pct}%</span></td>
              </tr>`
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderCausasTable(causas) {
    if (!causas.length) {
      return `<div class="text-center py-4 text-muted small">Sin justificaciones registradas.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Motivo Declarado</th>
              <th class="text-center">Cantidad</th>
              <th class="text-center">%</th>
            </tr>
          </thead>
          <tbody>
            ${causas
              .map(
                (c) => `
              <tr>
                <td>${escapeHTML(c.motivo)}</td>
                <td class="text-center font-monospace">${c.cantidad || 0}</td>
                <td class="text-center"><span class="badge bg-secondary-subtle text-secondary">${c.porcentaje || 0}%</span></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderAusenciasTable(ausencias) {
    if (!ausencias.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-check-circle fs-3 d-block mb-2 text-success"></i>Sin alumnos con ausencias acumuladas en este período.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Alumno</th>
              <th>Cátedra</th>
              <th>Representante</th>
              <th>Contacto</th>
              <th class="text-center">Días Asistidos / Total</th>
              <th class="text-center">Días Ausente</th>
              <th class="text-center">% Ausentismo Diario</th>
              <th class="text-center">Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            ${ausencias
              .map((a) => {
                const totalDias = a.total_dias_convocados ?? a.total_clases ?? 0
                const diasFalta = a.dias_con_falta ?? a.total_ausencias_injustificadas ?? 0
                const diasAsist = a.dias_con_asistencia ?? a.asistencias ?? Math.max(0, totalDias - diasFalta)
                const pct = a.porcentaje_dias_ausente ?? a.porcentaje_inasistencia ?? (totalDias > 0 ? Math.round((diasFalta / totalDias) * 100) : 0)

                let badgeSeveridad = ''
                if (pct >= 85 || diasAsist === 0) {
                  badgeSeveridad = '<span class="badge bg-danger text-white"><i class="bi bi-exclamation-octagon-fill me-1"></i>Abandono Total</span>'
                } else if (pct >= 50) {
                  badgeSeveridad = '<span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="bi bi-exclamation-triangle-fill me-1"></i>Riesgo Alto</span>'
                } else {
                  badgeSeveridad = '<span class="badge bg-secondary-subtle text-secondary border">Inasistencia Parcial</span>'
                }

                return `
                <tr>
                  <td><strong class="text-body">${escapeHTML(a.nombre_completo)}</strong></td>
                  <td><span class="badge bg-secondary-subtle text-secondary border">${escapeHTML(a.instrumento_principal || 'N/A')}</span></td>
                  <td class="small">${escapeHTML(a.representante_nombre || '—')}</td>
                  <td class="small"><a href="tel:${escapeHTML(a.representante_tlf || '')}" class="text-decoration-none"><i class="bi bi-telephone me-1"></i>${escapeHTML(a.representante_tlf || '—')}</a></td>
                  <td class="text-center font-monospace small"><strong class="text-body">${diasAsist}</strong> / ${totalDias} días</td>
                  <td class="text-center"><span class="badge bg-danger-subtle text-danger fs-6">${diasFalta} días</span></td>
                  <td class="text-center font-monospace fw-bold text-danger">${pct}%</td>
                  <td class="text-center">${badgeSeveridad}</td>
                </tr>`
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderDocentesTable(docentes) {
    if (!docentes.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-inbox fs-3 d-block mb-2"></i>Sin registros docentes en este período.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Docente</th>
              <th>Especialidad</th>
              <th class="text-center">Sesiones Totales</th>
              <th class="text-center">Cumplidas</th>
              <th class="text-center">Observaciones</th>
              <th class="text-center">% Solvencia</th>
              <th class="text-center">Score Global</th>
            </tr>
          </thead>
          <tbody>
            ${docentes
              .map((m) => {
                const solvencia = m.solvencia_registro_pct ?? 0
                const score = m.score_docente_global ?? 0
                const scoreBadge = score >= 80 ? 'bg-success' : score >= 60 ? 'bg-primary' : 'bg-warning text-dark'
                return `
              <tr>
                <td><strong class="text-body">${escapeHTML(m.maestro_nombre)}</strong></td>
                <td><span class="text-muted small">${escapeHTML(m.especialidad || '—')}</span></td>
                <td class="text-center font-monospace">${m.total_sesiones_semestre || 0}</td>
                <td class="text-center font-monospace text-success">${m.sesiones_cumplidas || 0}</td>
                <td class="text-center small"><i class="bi bi-journal-text me-1"></i>${m.observaciones_cargadas || 0}</td>
                <td class="text-center font-monospace">${solvencia}%</td>
                <td class="text-center"><span class="badge ${scoreBadge} fs-6">${score} pts</span></td>
              </tr>`
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  attachEventListeners() {
    const btnPdf = document.getElementById('btnDescargarPdfSemestral')

    if (btnPdf) {
      btnPdf.addEventListener('click', async () => {
        if (!this.data || this.isExporting) return
        this.isExporting = true
        btnPdf.disabled = true
        btnPdf.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Generando PDF...`

        try {
          await descargarPdfInformeSemestral(this.data)
        } catch (err) {
          console.error('[ReporteSemestralView] Error al exportar PDF:', err)
          alert('Hubo un error al generar el PDF del período.')
        } finally {
          this.isExporting = false
          btnPdf.disabled = false
          btnPdf.innerHTML = `<i class="bi bi-file-earmark-pdf"></i> <span>Descargar PDF</span>`
        }
      })
    }
  }
}

export default ReporteSemestralView

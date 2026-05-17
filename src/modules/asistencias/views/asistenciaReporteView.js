import { getPeriodos, getPeriodoActivo, getSesionesPorRango } from '../api/asistenciasApi.js'
import { createKpiCard } from '../../metricas/components/kpiCard.js'

const state = {
  periodoActivo: null,
  periodos: [],
  datos: { 
    programas: {}, 
    niveles: {}, 
    totales: { sesiones: 0, presentes: 0, ausentes: 0, justificados: 0 } 
  },
  cargando: false,
}

export async function renderAsistenciaReporteView(container) {
  state.cargando = true
  container.innerHTML = renderSkeleton()
  await _loadData()
  state.cargando = false
  _render(container)
}

function renderSkeleton() {
  return `
    <div class="admin-report-view">
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Cargando reportes de asistencia...</p>
      </div>
    </div>
  `
}

async function _loadData() {
  const [periodos, activo] = await Promise.all([getPeriodos(), getPeriodoActivo()])
  state.periodos = periodos
  state.periodoActivo = activo

  if (!activo) return

  const sesiones = await getSesionesPorRango({ periodoId: activo.id })
  state.datos = _procesarDatos(sesiones)
}

function _procesarDatos(sesiones) {
  const porPrograma = {}
  const porNivel = {}
  let totalSesiones = 0
  let totalPresentes = 0
  let totalAusentes = 0
  let totalJustificados = 0

  for (const grupo of sesiones) {
    for (const sesion of grupo.sesiones) {
      const programa = sesion.claseNombre?.split('-')[0]?.trim() || 'General'
      const nivel = sesion.instrumento || 'General'

      if (!porPrograma[programa]) {
        porPrograma[programa] = { total: 0, presentes: 0, ausentes: 0, justificados: 0 }
      }
      porPrograma[programa].total += sesion.totalRegistros || 0
      porPrograma[programa].presentes += sesion.totalPresentes || 0
      porPrograma[programa].ausentes += sesion.totalAusentes || 0
      porPrograma[programa].justificados += sesion.totalJustificados || 0

      if (!porNivel[nivel]) {
        porNivel[nivel] = { total: 0, presentes: 0, ausentes: 0, justificados: 0 }
      }
      porNivel[nivel].total += sesion.totalRegistros || 0
      porNivel[nivel].presentes += sesion.totalPresentes || 0
      porNivel[nivel].ausentes += sesion.totalAusentes || 0
      porNivel[nivel].justificados += sesion.totalJustificados || 0

      totalSesiones++
      totalPresentes += sesion.totalPresentes || 0
      totalAusentes += sesion.totalAusentes || 0
      totalJustificados += sesion.totalJustificados || 0
    }
  }

  return {
    programas: porPrograma,
    niveles: porNivel,
    totales: { sesiones: totalSesiones, presentes: totalPresentes, ausentes: totalAusentes, justificados: totalJustificados }
  }
}

function _render(container) {
  const { programas, niveles, totales } = state.datos
  const tasa = totales.presentes + totales.ausentes + totales.justificados
    ? Math.round((totales.presentes / tasa) * 100)
    : 0

  container.innerHTML = `
    <div class="admin-report-view px-3 px-md-4 py-3">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-graph-up me-2 text-primary"></i>Reportes de Asistencia</h4>
          <p class="text-secondary small mb-0">Panel administrativo de análisis de asistencia</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="exportXlsx">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel
          </button>
          <button class="btn btn-outline-danger btn-sm" id="exportPdf">
            <i class="bi bi-file-earmark-pdf me-1"></i>PDF
          </button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">${createKpiCard({ titulo: 'Sesiones', valor: totales.sesiones, colorClass: 'primary', icono: 'bi-calendar3' })}</div>
        <div class="col-md-3">${createKpiCard({ titulo: 'Tasa Asistencia', valor: `${tasa}%`, colorClass: tasa >= 80 ? 'success' : tasa >= 50 ? 'warning' : 'danger', icono: 'bi-check-circle' })}</div>
        <div class="col-md-3">${createKpiCard({ titulo: 'Ausentes', valor: totales.ausentes, colorClass: 'danger', icono: 'bi-x-circle' })}</div>
        <div class="col-md-3">${createKpiCard({ titulo: 'Justificados', valor: totales.justificados, colorClass: 'warning', icono: 'bi-file-earmark-check' })}</div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-pie-chart me-2"></i>Por Programa</h5>
            </div>
            <div class="card-body" id="programasChart">
              ${_renderBarChart(programas, 'programa')}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-bar-chart me-2"></i>Por Instrumento/Nivel</h5>
            </div>
            <div class="card-body" id="nivelesChart">
              ${_renderBarChart(niveles, 'nivel')}
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mt-2">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-list-ul me-2"></i>Detalle por Programa</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Programa</th>
                      <th class="text-center">Total Registros</th>
                      <th class="text-center">Presentes</th>
                      <th class="text-center">Ausentes</th>
                      <th class="text-center">Justificados</th>
                      <th class="text-center">Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(programas).map(([prog, data]) => {
                      const total = data.presentes + data.ausentes + data.justificados
                      const tasa = total ? Math.round((data.presentes / total) * 100) : 0
                      return `
                        <tr>
                          <td class="fw-semibold">${prog}</td>
                          <td class="text-center">${total}</td>
                          <td class="text-center text-success">${data.presentes}</td>
                          <td class="text-center text-danger">${data.ausentes}</td>
                          <td class="text-center text-warning">${data.justificados}</td>
                          <td class="text-center">
                            <span class="badge bg-${tasa >= 80 ? 'success' : tasa >= 50 ? 'warning' : 'danger'}">${tasa}%</span>
                          </td>
                        </tr>
                      `
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function _renderBarChart(data, key) {
  if (!Object.keys(data).length) {
    return '<p class="text-muted text-center py-3">Sin datos disponibles</p>'
  }

  const entries = Object.entries(data).sort((a, b) => (b[1].presentes + b[1].ausentes) - (a[1].presentes + a[1].ausentes))
  const maxTotal = Math.max(...entries.map(([, d]) => d.presentes + d.ausentes + d.justificados))

  return entries.slice(0, 8).map(([label, d]) => {
    const total = d.presentes + d.ausentes + d.justificados
    const pctPresentes = total ? (d.presentes / total) * 100 : 0
    const pctAusentes = total ? (d.ausentes / total) * 100 : 0
    const pctJustificados = total ? (d.justificados / total) * 100 : 0

    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span class="small fw-semibold">${label}</span>
          <span class="small text-muted">${total} registros</span>
        </div>
        <div class="progress" style="height: 20px; border-radius: 4px;">
          <div class="progress-bar bg-success" style="width: ${pctPresentes}%">${pctPresentes > 15 ? Math.round(pctPresentes) + '%' : ''}</div>
          <div class="progress-bar bg-danger" style="width: ${pctAusentes}%">${pctAusentes > 15 ? Math.round(pctAusentes) + '%' : ''}</div>
          <div class="progress-bar bg-warning" style="width: ${pctJustificados}%">${pctJustificados > 15 ? Math.round(pctJustificados) + '%' : ''}</div>
        </div>
      </div>
    `
  }).join('')
}
import { getInstitutionTrendReportWithFilling } from '../api/adminReportingApi.js'
import '../styles/directorTrendReport.css'

export function directorTrendReportView(containerId) {
  const container = document.getElementById(containerId)
  let reportData = null

  function renderSummaryCards(summary) {
    return `
      <div class="trend-summary-cards">
        <div class="trend-card primary">
          <div class="card-label">Uso de IA Promedio</div>
          <div class="card-value">${summary.avg_ai_usage_institution || 0}%</div>
          <div class="stat-subtitle">De las clases registradas</div>
        </div>
        <div class="trend-card success">
          <div class="card-label">Asistencia Primero</div>
          <div class="card-value">${summary.asistencia_first_percent || 0}%</div>
          <div class="stat-subtitle">Orden de llenado preferente</div>
        </div>
        <div class="trend-card warning">
          <div class="card-label">Observaciones Primero</div>
          <div class="card-value">${summary.observaciones_first_percent || 0}%</div>
          <div class="stat-subtitle">Enfoque en comentarios iniciales</div>
        </div>
      </div>
    `
  }

  function renderDateTrends(trends) {
    const sortedDates = Object.keys(trends).sort().reverse()

    return `
      <div class="premium-table-container">
        <table class="trends-table premium-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total Clases</th>
              <th>Asistencia 1°</th>
              <th>Promedio IA</th>
            </tr>
          </thead>
          <tbody>
            ${sortedDates.slice(0, 10).map(date => `
              <tr>
                <td><strong>${date}</strong></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">${trends[date].total_classes || 0}</span></td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">${trends[date].asistencia_first_percent || 0}%</span></td>
                <td><span class="badge bg-success bg-opacity-10 text-success px-2 py-1">${trends[date].avg_ai_usage_percent || 0}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  return {
    async init() {
      container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes de tendencias...</div>
        </div>
      `

      try {
        reportData = await getInstitutionTrendReportWithFilling(30)
        this.render()
      } catch (err) {
        console.error('[directorTrendReportView] Error:', err)
        container.innerHTML = `
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>Error cargando tendencias: ${err.message}</div>
          </div>
        `
      }
    },

    render() {
      const html = `
        <div class="director-trend-report">
          <!-- Premium Page Header -->
          <div class="report-header mb-4">
            <div class="admin-header-brand">
              <div class="admin-header-icon-wrapper">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div class="admin-header-title-section">
                <h1>Reporte de Tendencias Institucionales</h1>
                <p>Análisis de comportamiento de llenado de asistencias últimos 30 días</p>
              </div>
            </div>
          </div>

          ${renderSummaryCards(reportData.institution_summary)}

          <section class="date-trends-section">
            <h2>Tendencias por Fecha</h2>
            ${renderDateTrends(reportData.date_trends)}
          </section>

          <div class="generated-timestamp">
            Generado: ${new Date(reportData.generatedAt).toLocaleString()}
          </div>
        </div>
      `

      container.innerHTML = html
    }
  }
}

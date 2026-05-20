import { getInstitutionTrendReportWithFilling } from '../api/adminReportingApi.js'
import '../styles/directorTrendReport.css'

export function directorTrendReportView(containerId) {
  const container = document.getElementById(containerId)
  let reportData = null

  function renderSummaryCards(summary) {
    return `
      <div class="trend-summary-cards">
        <div class="trend-card">
          <div class="card-label">Uso de IA Promedio</div>
          <div class="card-value">${summary.avg_ai_usage_institution}%</div>
        </div>
        <div class="trend-card">
          <div class="card-label">Asistencia Primero</div>
          <div class="card-value">${summary.asistencia_first_percent}%</div>
        </div>
        <div class="trend-card">
          <div class="card-label">Observaciones Primero</div>
          <div class="card-value">${summary.observaciones_first_percent}%</div>
        </div>
      </div>
    `
  }

  function renderDateTrends(trends) {
    const sortedDates = Object.keys(trends).sort().reverse()

    return `
      <table class="trends-table">
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
              <td>${date}</td>
              <td>${trends[date].total_classes}</td>
              <td>${trends[date].asistencia_first_percent}%</td>
              <td>${trends[date].avg_ai_usage_percent}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  return {
    async init() {
      container.innerHTML = '<div class="loading">Cargando reportes de tendencias...</div>'

      try {
        reportData = await getInstitutionTrendReportWithFilling(30)
        this.render()
      } catch (err) {
        console.error('[directorTrendReportView] Error:', err)
        container.innerHTML = `<div class="error">Error cargando tendencias: ${err.message}</div>`
      }
    },

    render() {
      const html = `
        <div class="director-trend-report">
          <div class="report-header">
            <h1>📈 Reporte de Tendencias Institucionales</h1>
            <p>Análisis de comportamiento de llenado de asistencias últimos 30 días</p>
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

import '../styles/analyticsFillingBehavior.css'
import { getTeacherFillingMetrics } from '../api/analyticsFillingBehaviorService.js'

export function analyticsFillingBehaviorWidget(containerId) {
  const container = document.getElementById(containerId)

  function renderMaestroTable(metrics) {
    return `
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Maestro</th>
            <th>Total Clases</th>
            <th>Asistencia 1°</th>
            <th>Duración Obs (seg)</th>
            <th>IA Promedio</th>
          </tr>
        </thead>
        <tbody>
          ${metrics.map(m => `
            <tr>
              <td>${m.maestro_nombre}</td>
              <td>${m.total_clases}</td>
              <td>${m.orden_asistencia_primero}</td>
              <td>${m.promedio_duracion_observaciones}</td>
              <td>${m.uso_ai_fill_percent}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  function calculateStats(data) {
    const total = data.length
    const asistenciaPrimero = data.filter(m => m.orden_asistencia_primero === 1).length
    const observacionesPrimero = data.filter(m => m.orden_observaciones_primero === 1).length
    const simultaneo = data.filter(m => m.orden_simultaneo === 1).length

    const avgAiUsage = data.length > 0
      ? (data.reduce((sum, m) => sum + (m.uso_ai_fill_percent || 0), 0) / data.length).toFixed(1)
      : 0

    return {
      asistenciaPrimero: total > 0 ? ((asistenciaPrimero / total) * 100).toFixed(1) : 0,
      observacionesPrimero: total > 0 ? ((observacionesPrimero / total) * 100).toFixed(1) : 0,
      simultaneo: total > 0 ? ((simultaneo / total) * 100).toFixed(1) : 0,
      avgAiUsage,
      total
    }
  }

  return {
    async init() {
      container.innerHTML = '<div class="loading">Cargando analítica...</div>'

      try {
        const metrics = await getTeacherFillingMetrics()

        if (!metrics || metrics.length === 0) {
          container.innerHTML = '<div class="no-data">No hay datos disponibles</div>'
          return
        }

        this.render(metrics)
      } catch (err) {
        console.error('[analyticsFillingBehaviorWidget] Error:', err)
        container.innerHTML = `<div class="error">Error cargando analítica: ${err.message}</div>`
      }
    },

    render(metrics) {
      if (metrics.length === 0) {
        // Keep the loading message if no metrics
        return
      }

      const stats = calculateStats(metrics)

      const metricsHtml = metrics.map(m =>
        `<div>${m.maestro_nombre}</div>`
      ).join('')

      const html = `
        <div class="analytics-widget">
          <h2>📊 Analítica de Llenado de Asistencias</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Asistencia Primero</div>
              <div class="stat-value">${stats.asistenciaPrimero}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Observaciones Primero</div>
              <div class="stat-value">${stats.observacionesPrimero}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Simultáneo</div>
              <div class="stat-value">${stats.simultaneo}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Uso IA Promedio</div>
              <div class="stat-value">${stats.avgAiUsage}%</div>
            </div>
          </div>
          <div class="metrics-list">
            ${metricsHtml}
          </div>
          <section class="maestro-metrics-section">
            <h3>Detalle por Maestro</h3>
            ${renderMaestroTable(metrics)}
          </section>
        </div>
      `

      container.innerHTML = html
    }
  }
}

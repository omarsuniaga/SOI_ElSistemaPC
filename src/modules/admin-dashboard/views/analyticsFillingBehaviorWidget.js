import '../styles/analyticsFillingBehavior.css'
import { getTeacherFillingMetrics } from '../api/analyticsFillingBehaviorService.js'
import { InfoTooltip, attachInfoTooltipEvents, injectInfoTooltipStyles } from '../../../shared/components/InfoTooltip.js'

export function analyticsFillingBehaviorWidget(containerId) {
  const container = document.getElementById(containerId)

  function renderMaestroTable(metrics) {
    return `
      <div class="premium-table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Maestro</th>
              <th>Total Clases ${InfoTooltip('cumplimiento_sesiones')}</th>
              <th>Asistencia 1° ${InfoTooltip('analitca_comportamiento')}</th>
              <th>Duración Obs (seg) ${InfoTooltip('observacion')}</th>
              <th>IA Promedio ${InfoTooltip('confianza_ia')}</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.map(m => `
              <tr>
                <td><strong>${m.maestro_nombre}</strong></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">${m.total_clases || 0}</span></td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">${m.orden_asistencia_primero || 0}</span></td>
                <td><span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1">${m.promedio_duracion_observaciones || 0}s</span></td>
                <td>
                  <span class="badge ${m.uso_ai_fill_percent > 70 ? 'bg-success text-white' : m.uso_ai_fill_percent > 30 ? 'bg-primary text-white' : 'bg-secondary bg-opacity-10 text-secondary'} px-2 py-1">
                    ${m.uso_ai_fill_percent || 0}%
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
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

  const widget = {
    async init() {
      injectInfoTooltipStyles()
      container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando analítica...</div>
        </div>
      `

      try {
        const metrics = await getTeacherFillingMetrics()

        if (!metrics || metrics.length === 0) {
          container.innerHTML = `
            <div class="analytics-widget">
              <div class="premium-no-data">No hay datos disponibles</div>
            </div>
          `
          return
        }

        this.render(metrics)
      } catch (err) {
        console.error('[analyticsFillingBehaviorWidget] Error:', err)
        container.innerHTML = `
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>Error cargando analítica: ${err.message}</div>
          </div>
        `
      }
    },

    render(metrics) {
      if (metrics.length === 0) {
        return
      }

      const stats = calculateStats(metrics)

      const html = `
        <div class="analytics-widget">
          <h2><i class="bi bi-bar-chart-steps text-primary"></i> Analítica de Llenado de Asistencias ${InfoTooltip('analitca_comportamiento')}</h2>

          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-label">Asistencia Primero ${InfoTooltip('analitca_comportamiento')}</div>
              <div class="stat-value">${stats.asistenciaPrimero}%</div>
              <div class="stat-subtitle">Orden de llenado preferido</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Observaciones Primero ${InfoTooltip('observacion')}</div>
              <div class="stat-value">${stats.observacionesPrimero}%</div>
              <div class="stat-subtitle">Enfoque en comentarios</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-label">Simultáneo ${InfoTooltip('analitca_comportamiento')}</div>
              <div class="stat-value">${stats.simultaneo}%</div>
              <div class="stat-subtitle">Registro en tiempo real</div>
            </div>
            <div class="stat-card success">
              <div class="stat-label">Uso IA Promedio ${InfoTooltip('confianza_ia')}</div>
              <div class="stat-value">${stats.avgAiUsage}%</div>
              <div class="stat-subtitle">Asistente activado</div>
            </div>
          </div>

          <section class="maestro-metrics-section">
            <h3>Detalle por Maestro</h3>
            ${renderMaestroTable(metrics)}
          </section>
        </div>
      `

      container.innerHTML = html
      attachInfoTooltipEvents(container)
    },

    destroy() {
      if (container) {
        container.innerHTML = ''
      }
    }
  }

  return widget
}

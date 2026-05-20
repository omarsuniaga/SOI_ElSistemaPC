export function analyticsFillingBehaviorWidget(containerId) {
  const container = document.getElementById(containerId)

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
      container.innerHTML = '<div class="loading">Cargando analítica</div>'

      const response = await fetch('/api/analytics/fill-metrics')
      const metrics = await response.json()

      this.render(metrics)
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
        </div>
      `

      container.innerHTML = html
    }
  }
}

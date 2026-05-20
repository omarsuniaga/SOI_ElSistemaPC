export function analyticsFillingBehaviorWidget(containerId) {
  const container = document.getElementById(containerId)

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
      const metricsHtml = metrics.map(m =>
        `<div>${m.maestro_nombre}</div>`
      ).join('')
      container.innerHTML = metricsHtml
    }
  }
}

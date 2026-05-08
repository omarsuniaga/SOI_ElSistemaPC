import { metricasService } from '../services/metricasService.js'
import { createKpiCard } from '../components/kpiCard.js'

export async function renderMetricasCompletaView(container) {
  container.innerHTML = `
    <div class="metricas-completa-view">
      <div id="mc-header" class="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="fw-bold mb-0">Métricas del Período</h2>
          <p class="text-muted mb-0" id="periodo-label">Cargando...</p>
        </div>
      </div>
      <div class="row g-3 mb-4" id="mc-kpis"></div>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0">Alertas del Período</h5>
            </div>
            <div class="card-body" id="mc-alertas"></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0">Contenido por Sesión</h5>
            </div>
            <div class="card-body" id="mc-contenido"></div>
          </div>
        </div>
      </div>
    </div>
  `

  await loadData()
}

async function loadData() {
  try {
    const { periodoActivo, alertas, alertasActivas } = await metricasService.getDashboardData()

    const periodoLabel = document.getElementById('periodo-label')
    periodoLabel.textContent = periodoActivo
      ? `${periodoActivo.nombre} (${periodoActivo.fecha_inicio} - ${periodoActivo.fecha_fin})`
      : 'Sin período activo'

    const kpis = document.getElementById('mc-kpis')
    kpis.innerHTML = `
      <div class="col-md-3">${createKpiCard({ titulo: 'Alumnos', valor: periodoActivo?.total_alumnos || 0, colorClass: 'primary', icono: 'bi-people' })}</div>
      <div class="col-md-3">${createKpiCard({ titulo: 'Asistencia', valor: `${periodoActivo?.tasa_asistencia_promedio?.toFixed(1) || 0}%`, colorClass: 'success', icono: 'bi-calendar-check' })}</div>
      <div class="col-md-3">${createKpiCard({ titulo: 'Promedio', valor: periodoActivo?.promedio_calificaciones?.toFixed(2) || '0.00', colorClass: 'info', icono: 'bi-graph-up' })}</div>
      <div class="col-md-3">${createKpiCard({ titulo: 'En Riesgo', valor: periodoActivo?.alumnos_en_riesgo || 0, colorClass: 'danger', icono: 'bi-exclamation-triangle' })}</div>
    `

    const alertasContainer = document.getElementById('mc-alertas')
    if (alertasActivas.length === 0) {
      alertasContainer.innerHTML = '<p class="text-muted">Sin alertas activas</p>'
    } else {
      alertasContainer.innerHTML = alertasActivas.map(a => `
        <div class="alert alert-${a.color === 'rojo' ? 'danger' : a.color === 'naranja' ? 'warning' : 'info'} mb-2 py-2">
          <strong>${a.tipo}</strong> - Umbral: ${a.umbral}%
        </div>
      `).join('')
    }

    const contenidoContainer = document.getElementById('mc-contenido')
    contenidoContainer.innerHTML = '<p class="text-muted">Cargando contenido...</p>'

  } catch (error) {
    console.error('Error loading metricas:', error)
    container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`
  }
}
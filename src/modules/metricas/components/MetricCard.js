import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * MetricCard - Componente estandarizado para visualización de KPIs.
 * @param {Object} props
 * @param {string} props.label - Título de la métrica.
 * @param {string|number} props.value - Valor principal.
 * @param {string} props.color - success | danger | warning | primary | info.
 * @param {string} props.icon - Clase de icono de Bootstrap (bi-*).
 * @returns {string} HTML string.
 */
export function renderMetricCard({ label, value, color = 'primary', icon = 'bi-graph-up' }) {
  const bgClass = `bg-${color}`
  const textClass = `text-${color}`
  
  return `
    <div class="card border-0 shadow-sm h-100 pm-metric-card">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="metric-icon ${bgClass} bg-opacity-10 ${textClass} rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi ${icon}"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px;">${escapeHTML(label)}</div>
            <div class="h3 mb-0 fw-extrabold ${textClass}">${value}</div>
          </div>
        </div>
      </div>
    </div>
  `
}

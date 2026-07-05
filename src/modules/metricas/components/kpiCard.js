/**
 * Crea una tarjeta de KPI académica.
 * @param {Object} props
 * @param {string} props.titulo
 * @param {string|number} props.valor
 * @param {string} [props.subtitulo]
 * @param {string} [props.colorClass] - 'danger', 'warning', 'success', 'primary', etc.
 * @param {string} [props.icono] - Clase de Lucide o similar (ej: 'bi-people')
 * @param {'subiendo'|'bajando'|'estable'} [props.tendencia]
 * @returns {string} HTML String
 */
export function createKpiCard({ titulo, valor, subtitulo, colorClass = 'primary', icono, tendencia }) {
  const showTrend = tendencia && ['subiendo', 'bajando', 'estable'].includes(tendencia)
  const trendIcon = tendencia === 'subiendo' ? '↑' : tendencia === 'bajando' ? '↓' : '→'
  const trendClass = tendencia === 'subiendo' ? 'text-success' : tendencia === 'bajando' ? 'text-danger' : 'text-muted'

  return `
    <div class="card kpi-card h-100 border-0 border-start border-4 border-${colorClass} shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="card-subtitle text-muted text-uppercase small fw-bold mb-0" style="font-size: 0.65rem; letter-spacing: 0.05em;">${titulo}</h6>
          ${icono ? `<i class="bi ${icono} text-${colorClass} fs-4"></i>` : ''}
        </div>
        <div class="d-flex align-items-baseline gap-2">
          <h3 class="card-title mb-0 fw-bold">${valor}</h3>
          ${showTrend ? `<span class="small ${trendClass} fw-bold" style="font-size: 0.8rem;">${trendIcon}</span>` : ''}
        </div>
        ${subtitulo ? `<p class="card-text text-muted small mb-0 mt-1" style="font-size: 0.75rem;">${subtitulo}</p>` : ''}
      </div>
    </div>
  `
}

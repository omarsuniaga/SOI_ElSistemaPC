/**
 * Utilidades para el módulo de métricas académico.
 */

/**
 * Formatea un score de riesgo (0-100).
 * @param {number} score 
 * @returns {{text: string, colorClass: string}}
 */
export function formatScore(score) {
  let colorClass = 'text-success'
  if (score >= 60) colorClass = 'text-danger'
  else if (score >= 35) colorClass = 'text-warning'

  return {
    text: `${score}/100`,
    colorClass
  }
}

/**
 * Formatea una tasa (asistencia, rendimiento, etc).
 * @param {number} tasa 
 * @returns {{text: string, colorClass: string}}
 */
export function formatTasa(tasa) {
  let colorClass = 'text-danger'
  if (tasa >= 90) colorClass = 'text-success'
  else if (tasa >= 70) colorClass = 'text-warning'

  return {
    text: `${tasa.toFixed(1)}%`,
    colorClass
  }
}

/**
 * Formatea un cambio/delta entre períodos.
 * @param {number} delta 
 * @returns {{text: string, colorClass: string}}
 */
export function formatDelta(delta) {
  const isPositive = delta > 0
  const icon = isPositive ? '↑' : delta < 0 ? '↓' : '→'
  const sign = isPositive ? '+' : ''
  const colorClass = isPositive ? 'text-success' : delta < 0 ? 'text-danger' : 'text-muted'

  return {
    text: `${sign}${delta.toFixed(1)} ${icon}`,
    colorClass
  }
}

/**
 * Mapea niveles técnicos a etiquetas legibles.
 * @param {string} nivel 
 * @returns {string}
 */
export function getNivelLabel(nivel) {
  if (!nivel) return 'N/A'
  const niveles = {
    'inicial': 'Inicial',
    'basico': 'Básico',
    'intermedio': 'Intermedio',
    'avanzado': 'Avanzado'
  }
  return niveles[nivel.toLowerCase()] || nivel
}

/**
 * Retorna clase Bootstrap según el color de alerta.
 * @param {string} color 
 * @returns {string}
 */
export function getColorAlerta(color) {
  if (!color) return 'secondary'
  const colors = {
    'rojo': 'danger',
    'naranja': 'warning',
    'amarillo': 'info'
  }
  return colors[color.toLowerCase()] || 'secondary'
}

/**
 * Calcula la tendencia de una serie de valores.
 * @param {number[]} valores 
 * @returns {'subiendo'|'bajando'|'estable'}
 */
export function calcularTendencia(valores) {
  if (!valores || valores.length < 2) return 'estable'
  
  const ultimo = valores[valores.length - 1]
  const penultimo = valores[valores.length - 2]
  
  if (ultimo > penultimo) return 'subiendo'
  if (ultimo < penultimo) return 'bajando'
  return 'estable'
}

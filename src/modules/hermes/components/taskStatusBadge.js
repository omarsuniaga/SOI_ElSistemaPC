/**
 * taskStatusBadge.js — Badge de estado para tareas institucionales.
 * Incluye el estado SP-0 "observada" con estilo distintivo (warning/amber).
 * Componente puro de render: recibe estado string, devuelve HTML string.
 */

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   color: 'secondary', icon: 'bi-clock' },
  en_progreso: { label: 'En Progreso', color: 'info',      icon: 'bi-play-circle' },
  completada:  { label: 'Completada',  color: 'success',   icon: 'bi-check-circle' },
  bloqueada:   { label: 'Bloqueada',   color: 'danger',    icon: 'bi-x-octagon' },
  cancelada:   { label: 'Cancelada',   color: 'dark',      icon: 'bi-dash-circle' },
  // SP-0: observada has a distinctive amber/warning style to signal it needs attention
  observada:   { label: 'Observada',   color: 'warning',   icon: 'bi-eye' },
}

/**
 * Renders a Bootstrap badge for the given task estado.
 * @param {string} estado
 * @returns {string} HTML string
 */
export function renderTaskStatusBadge(estado) {
  const config = ESTADO_CONFIG[estado] ?? { label: estado, color: 'secondary', icon: 'bi-question-circle' }
  return `<span class="badge bg-${config.color} task-status-badge" data-estado="${estado}"><i class="bi ${config.icon} me-1"></i>${config.label}</span>`
}

/**
 * Returns the Bootstrap color class name for the given estado.
 * Useful for progress bars and other elements that need the color token.
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoColor(estado) {
  return (ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente).color
}

/**
 * Returns the human-readable label for the given estado.
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoLabel(estado) {
  return (ESTADO_CONFIG[estado] ?? { label: estado }).label
}

/**
 * Returns all valid estado keys including SP-0 observada.
 * @returns {string[]}
 */
export function getEstadoKeys() {
  return Object.keys(ESTADO_CONFIG)
}

/**
 * Returns the full config map (for building <select> options etc.)
 * @returns {Record<string, {label: string, color: string, icon: string}>}
 */
export function getEstadoConfig() {
  return { ...ESTADO_CONFIG }
}

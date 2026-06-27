/**
 * taskEntityChip.js — Chip "Tipo: label" de la entidad asociada a la tarea.
 * SP-0 / D1: asociación polimórfica (alumno, maestro, postulante, representante,
 * instrumento, evento, otro).
 * Componente puro de render: recibe un objeto tarea (o fragmento), devuelve HTML string.
 */

const ENTIDAD_ICONS = {
  alumno:        'bi-person',
  maestro:       'bi-person-workspace',
  postulante:    'bi-person-plus',
  representante: 'bi-people',
  instrumento:   'bi-music-note-beamed',
  evento:        'bi-calendar-event',
  otro:          'bi-link-45deg',
}

const ENTIDAD_LABELS = {
  alumno:        'Alumno',
  maestro:       'Maestro',
  postulante:    'Postulante',
  representante: 'Representante',
  instrumento:   'Instrumento',
  evento:        'Evento',
  otro:          'Otro',
}

/**
 * Renders a chip showing the associated entity of a task.
 * Returns an empty string when no entity is associated.
 *
 * @param {{ entidad_tipo?: string, entidad_label?: string }} tarea
 * @returns {string} HTML string
 */
export function renderTaskEntityChip(tarea) {
  if (!tarea?.entidad_tipo) return ''

  const tipo = tarea.entidad_tipo
  const label = tarea.entidad_label || tipo
  const icon = ENTIDAD_ICONS[tipo] ?? 'bi-link-45deg'
  const tipoLabel = ENTIDAD_LABELS[tipo] ?? tipo

  const escapedLabel = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const escapedTipo = String(tipoLabel).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 task-entity-chip" title="${escapedTipo}: ${escapedLabel}">` +
    `<i class="bi ${icon} me-1"></i>${escapedTipo}: ${escapedLabel}` +
    `</span>`
}

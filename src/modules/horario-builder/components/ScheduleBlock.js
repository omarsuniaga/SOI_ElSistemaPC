// src/modules/horario-builder/components/ScheduleBlock.js
import { getInstrumentColor, getTeacherColor } from '../utils/colorMap.js';
import { escapeHtml } from '../utils/escapeHtml.js';

/**
 * Returns the HTML string for one schedule block in the grid.
 * Styles live in styles/horario-builder.css — clases .schedule-block__*.
 *
 * @param {Object} assignment - Shape:
 *   { clase_id, clase_nombre, instrumento, maestro_id, maestro_nombre,
 *     salon_nombre, hora_inicio, hora_fin, locked, hasConflict }
 * @param {Object} options
 * @param {boolean} options.draggable - Whether block is draggable (default false)
 * @returns {string} HTML string
 */
export function createScheduleBlock(assignment, { draggable = false } = {}) {
  const {
    clase_id,
    clase_nombre,
    instrumento = 'General',
    maestro_id,
    maestro_nombre = '',
    salon_nombre = '',
    hora_inicio,
    hora_fin,
    locked = false,
    hasConflict = false,
  } = assignment

  const instrColor = getInstrumentColor(instrumento)
  const teachColor = getTeacherColor(maestro_id || '')
  const isActuallyDraggable = draggable && !locked

  // Initials for teacher avatar dot
  const initials = escapeHtml(
    maestro_nombre
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase(),
  )

  const safeClaseId = escapeHtml(clase_id)
  const conflictClass = hasConflict ? ' schedule-block--conflict' : ''
  const conflictBadge = hasConflict
    ? '<span class="sb-conflict-icon" title="Conflicto detectado">⚠</span>'
    : ''

  const lockBtn = isActuallyDraggable
    ? `<button class="sb-lock-btn" data-clase-id="${safeClaseId}" data-locked="${locked}"
               title="${locked ? 'Desbloquear' : 'Bloquear'}">
         ${locked ? '🔒' : '🔓'}
       </button>`
    : locked
      ? '<span class="sb-lock-icon">🔒</span>'
      : ''

  const draggableAttr = isActuallyDraggable ? 'draggable="true"' : ''

  return `
    <div class="schedule-block${conflictClass}"
         data-clase-id="${safeClaseId}"
         data-locked="${locked}"
         ${draggableAttr}>
      <div class="schedule-block__header" style="background:${instrColor};">
        <span class="schedule-block__title">${escapeHtml(clase_nombre)}</span>
        <span class="schedule-block__actions">${conflictBadge}${lockBtn}</span>
      </div>
      <div class="schedule-block__body">
        <span class="schedule-block__teacher-dot"
              style="background:${teachColor};">${initials}</span>
        <span class="schedule-block__teacher-name">${escapeHtml(maestro_nombre)}</span>
      </div>
      ${salon_nombre
        ? `<div class="schedule-block__footer">${escapeHtml(salon_nombre)} · ${hora_inicio}–${hora_fin}</div>`
        : ''}
    </div>
  `
}

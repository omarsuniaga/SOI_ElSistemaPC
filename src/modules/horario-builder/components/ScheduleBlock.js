// src/modules/horario-builder/components/ScheduleBlock.js
import { getInstrumentColor, getTeacherColor } from '../utils/colorMap.js';
import { escapeHtml } from '../utils/escapeHtml.js';

/**
 * Returns the HTML string for one schedule block in the grid.
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
    clase_id, clase_nombre, instrumento = 'General',
    maestro_id, maestro_nombre = '',
    salon_nombre = '', hora_inicio, hora_fin,
    locked = false, hasConflict = false
  } = assignment;

  const instrColor  = getInstrumentColor(instrumento);
  const teachColor  = getTeacherColor(maestro_id || '');
  const isActuallyDraggable = draggable && !locked;

  // Initials for teacher dot
  const initials = escapeHtml(
    maestro_nombre
      .split(' ')
      .slice(0, 2)
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase()
  );

  const conflictStyle  = hasConflict  ? 'border: 2px solid #ef4444;' : 'border: 2px solid transparent;';
  const conflictBadge  = hasConflict  ? '<span class="sb-conflict-icon" title="Conflicto detectado">⚠</span>' : '';
  const safeClaseId = escapeHtml(clase_id);
  const lockBtn = isActuallyDraggable
    ? `<button class="sb-lock-btn" data-clase-id="${safeClaseId}" data-locked="${locked}"
               style="background:none;border:none;cursor:pointer;padding:0;font-size:0.65rem;line-height:1;"
               title="${locked ? 'Desbloquear' : 'Bloquear'}">
         ${locked ? '🔒' : '🔓'}
       </button>`
    : (locked ? '<span class="sb-lock-icon">🔒</span>' : '');
  const draggableAttr   = isActuallyDraggable ? 'draggable="true"' : '';

  return `
    <div class="schedule-block"
         data-clase-id="${safeClaseId}"
         data-locked="${locked}"
         ${draggableAttr}
         style="border-radius:0.4rem;overflow:hidden;${conflictStyle}cursor:${isActuallyDraggable ? 'grab' : 'default'};user-select:none;margin-bottom:2px;">
      <!-- Instrument header bar -->
      <div class="sb-header" style="background:${instrColor};padding:3px 6px;display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span style="font-size:0.65rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${escapeHtml(clase_nombre)}</span>
        <span style="display:flex;gap:2px;flex-shrink:0;">${conflictBadge}${lockBtn}</span>
      </div>
      <!-- Teacher / room body -->
      <div class="sb-body" style="background:#f8fafc;padding:3px 6px;display:flex;align-items:center;gap:5px;">
        <span class="sb-teacher-dot" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${teachColor};font-size:0.45rem;font-weight:700;color:#1e293b;flex-shrink:0;">${initials}</span>
        <span style="font-size:0.58rem;color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(maestro_nombre)}</span>
      </div>
      ${salon_nombre ? `<div style="background:#f1f5f9;padding:2px 6px;font-size:0.55rem;color:#64748b;border-top:1px solid #e2e8f0;">${escapeHtml(salon_nombre)} · ${hora_inicio}–${hora_fin}</div>` : ''}
    </div>
  `;
}

// src/modules/horario-builder/components/ScheduleGrid.js
import { DIAS_SEMANA } from '../models/scheduleConstraints.model.js';
import { createScheduleBlock } from './ScheduleBlock.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const EMPTY_STATE = '<p class="text-muted text-center py-4">No hay asignaciones para mostrar.</p>';

/**
 * Rounds a time string like '10:30' down to the hour: '10:00'.
 * @param {string} timeStr
 * @returns {string}
 */
function roundToHour(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return '00:00';
  const [h] = timeStr.split(':');
  return `${h.padStart(2, '0')}:00`;
}

/**
 * Renders a weekly grid (table-like) view grouped by hour × day.
 * @param {Array}   assignments
 * @param {boolean} draggable
 * @param {string}  periodoId - Current period ID (for display only)
 * @returns {string} HTML
 */
function renderGridView(assignments, draggable, periodoId) {
  // Build map: hour -> day -> [assignment]
  const hourDayMap = new Map();
  for (const a of assignments) {
    const hour = roundToHour(a.hora_inicio);
    if (!hourDayMap.has(hour)) hourDayMap.set(hour, new Map());
    const dayMap = hourDayMap.get(hour);
    const dayKey = (a.dia || '').toLowerCase();
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, []);
    dayMap.get(dayKey).push(a);
  }
  const hours = [...hourDayMap.keys()].sort();

  const headerCells = DIAS_SEMANA.map(
    d => `<th class="sg-col-header" data-day="${d.key}" style="text-align:center;padding:4px 6px;font-size:0.75rem;">${d.label}</th>`
  ).join('');

  const rows = hours.map(hour => {
    const dayMap = hourDayMap.get(hour);
    const cells = DIAS_SEMANA.map(d => {
      const blocks = (dayMap.get(d.key) || [])
        .map(a => createScheduleBlock(a, { draggable }))
        .join('');
      return `<td class="sg-cell" data-day="${d.key}" data-hour="${hour}" style="vertical-align:top;padding:3px;min-width:100px;">${blocks}</td>`;
    }).join('');
    return `<tr>
      <td class="sg-hour-label" style="font-size:0.7rem;color:#64748b;padding:4px 8px;white-space:nowrap;vertical-align:top;">${hour}</td>
      ${cells}
    </tr>`;
  }).join('');

  return `
    <div class="schedule-grid-wrapper" style="overflow-x:auto;">
      <table class="schedule-grid" style="width:100%;border-collapse:collapse;">
        ${periodoId ? `<caption class="text-muted" style="caption-side:top;font-size:0.75rem;padding-bottom:4px;">${periodoId}</caption>` : ''}
        <thead>
          <tr>
            <th class="sg-hour-col" aria-label="Hora" style="min-width:56px;"></th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Renders a grouped-list view.
 * @param {Array}  assignments
 * @param {string} groupKey    - property name to group by
 * @param {boolean} draggable
 * @returns {string} HTML
 */
function renderGroupedView(assignments, groupKey, draggable) {
  const groups = new Map();
  for (const a of assignments) {
    const key = a[groupKey] || '(Sin asignar)';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }

  const sections = [...groups.entries()].map(([groupName, items]) => {
    const blocks = items.map(a => createScheduleBlock(a, { draggable })).join('');
    return `
      <div class="sg-group" style="margin-bottom:1rem;">
        <h4 class="sg-group-title" style="font-size:0.85rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">${escapeHtml(groupName)}</h4>
        <div class="sg-group-blocks" style="display:flex;flex-wrap:wrap;gap:6px;">${blocks}</div>
      </div>
    `;
  }).join('');

  return `<div class="schedule-grouped-view">${sections}</div>`;
}

/**
 * Renders a weekly schedule grid for the given view mode.
 *
 * @param {Object}  params
 * @param {Array}   params.assignments  - Array of assignment objects (already annotated with hasConflict)
 * @param {string}  params.activeView   - One of: 'grid' | 'teacher' | 'room' | 'student'
 * @param {boolean} params.draggable    - Whether blocks are draggable
 * @param {string}  params.periodoId    - Current period ID (for display only)
 * @returns {string} HTML string for the full grid
 */
export function createScheduleGrid({ assignments, activeView, draggable = false, periodoId } = {}) {
  if (!assignments || assignments.length === 0) return EMPTY_STATE;

  switch (activeView) {
    case 'teacher':
      return renderGroupedView(assignments, 'maestro_nombre', draggable);
    case 'room':
      return renderGroupedView(assignments, 'salon_nombre', draggable);
    case 'student':
      return renderGroupedView(assignments, 'clase_nombre', draggable);
    case 'grid':
    default:
      return renderGridView(assignments, draggable, periodoId);
  }
}

/**
 * Attaches DOM listeners needed for the grid (currently none — D&D handled separately in Task 8).
 * Reserved for future expansion.
 *
 * @param {HTMLElement} container
 */
// Reserved for future use; D&D is managed by DragDropManager.
export function attachScheduleGridListeners(_container) {}

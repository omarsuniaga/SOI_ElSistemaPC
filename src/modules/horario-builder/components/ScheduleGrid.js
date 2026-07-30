// src/modules/horario-builder/components/ScheduleGrid.js
import { DIAS_SEMANA } from '../models/scheduleConstraints.model.js';
import { createScheduleBlock } from './ScheduleBlock.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { roundToHour } from '../utils/timeUtils.js';

const EMPTY_STATE = '<p class="text-muted text-center py-4">No hay asignaciones para mostrar.</p>';

function normalizeDayKey(dayStr) {
  if (!dayStr) return '';
  return dayStr
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Renders a weekly grid (table-like) view grouped by hour × day.
 * @param {Array}   assignments
 * @param {boolean} draggable
 * @param {string}  periodoId - Current period ID (for display only)
 * @returns {string} HTML
 */
function renderGridView(assignments, draggable, periodoId) {
  // Build map: hour -> dayKey -> [assignment]
  const hourDayMap = new Map();
  for (const a of assignments) {
    const hour = roundToHour(a.hora_inicio || '08:00');
    if (!hourDayMap.has(hour)) hourDayMap.set(hour, new Map());
    const dayMap = hourDayMap.get(hour);
    const dayKey = normalizeDayKey(a.dia);
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, []);
    dayMap.get(dayKey).push(a);
  }

  const defaultHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const hours = Array.from(new Set([...defaultHours, ...hourDayMap.keys()])).sort();

  const headerCells = DIAS_SEMANA.map(
    d => `<th class="sg-col-header" data-day="${d.key}">${d.label}</th>`
  ).join('');

  const rows = hours.map(hour => {
    const dayMap = hourDayMap.get(hour);
    const cells = DIAS_SEMANA.map(d => {
      const normKey = normalizeDayKey(d.key);
      const blocks = (dayMap?.get(normKey) || [])
        .map(a => createScheduleBlock(a, { draggable }))
        .join('');
      return `<td class="sg-cell" data-day="${d.key}" data-hour="${hour}">${blocks}</td>`;
    }).join('');
    return `<tr>
      <td class="sg-hour-label">${hour}</td>
      ${cells}
    </tr>`;
  }).join('');

  return `
    <div class="schedule-grid-wrapper mt-3">
      <table class="schedule-grid">
        <thead>
          <tr>
            <th class="sg-hour-col" aria-label="Hora">Hora</th>
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
      <div class="sg-group">
        <h4 class="sg-group-title">${escapeHtml(groupName)}</h4>
        <div class="sg-group-blocks">${blocks}</div>
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
    case 'class':
      return renderGroupedView(assignments, 'clase_nombre', draggable);
    case 'student':
      return renderGridView(assignments, draggable, periodoId);
    case 'grid':
    default:
      return renderGridView(assignments, draggable, periodoId);
  }
}

/**
 * Attaches DOM listeners needed for the grid.
 *
 * @param {HTMLElement} _container
 */
export function attachScheduleGridListeners(_container) {}

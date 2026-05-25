import { DIAS_SEMANA } from '../models/scheduleConstraints.model.js';

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Availability Grid component rendering a Google-Calendar-style weekly view.
 * Uses absolute pixel-positioning based on minutes for high-fidelity schedules.
 */
export function createAvailabilityGrid({
  teachers = [],
  classrooms = [],
  assignments = [],
  selectedTeacherId = 'all',
  onEditAssignment = null
}) {
  const startHour = 9; // 09:00
  const endHour = 19;  // 19:00
  const hourHeight = 55; // pixels per hour
  const startMinutes = startHour * 60;
  const totalMinutes = (endHour - startHour) * 60;
  const gridHeight = (endHour - startHour) * hourHeight;

  // Generate hourly labels
  const hourLabelsHtml = [];
  for (let h = startHour; h < endHour; h++) {
    hourLabelsHtml.push(`
      <div class="hb-time-label-cell" style="height: ${hourHeight}px; border-bottom: 1px dashed var(--hb-border); text-align: right; padding-right: 8px; font-size: 0.75rem; color: var(--hb-text-muted);">
        ${h.toString().padStart(2, '0')}:00
      </div>
    `);
  }

  // Generate day columns html
  const columnsHtml = DIAS_SEMANA.map((day, idx) => {
    // 1. Get availability slots to show
    let availSlots = [];
    if (selectedTeacherId === 'all') {
      // In "all" mode, union of all teachers' availabilities might overlap,
      // but showing them stacked or merged could be noisy. Let's merge overlapping blocks
      // for a cleaner visual representation of "when is the school active".
      // Or just render a faint layer. Let's stack them or show a merged overlay.
      availSlots = getMergedAvailabilityForAll(teachers, day.key);
    } else {
      const teacher = teachers.find(t => t.id === selectedTeacherId);
      if (teacher && teacher.disponibilidad) {
        availSlots = teacher.disponibilidad[day.key] || [];
      }
    }

    const availHtml = availSlots.map(slot => {
      const startMin = timeToMinutes(slot.inicio);
      const endMin = timeToMinutes(slot.fin);
      
      // Calculate top & height in pixels
      const top = ((startMin - startMinutes) / totalMinutes) * gridHeight;
      const height = ((endMin - startMin) / totalMinutes) * gridHeight;

      if (top < 0 || height <= 0 || top + height > gridHeight) return '';

      return `
        <div class="hb-slot-available" style="top: ${top}px; height: ${height}px;">
          ${selectedTeacherId === 'all' ? 'Institución Abierta' : 'Disponible'}
        </div>
      `;
    }).join('');

    // 2. Get assignments to show in this column
    const filteredAssignments = assignments.filter(as => {
      const matchesDay = as.dia?.toLowerCase() === day.key.toLowerCase();
      if (!matchesDay) return false;
      if (selectedTeacherId === 'all') return true;
      return as.maestro_id === selectedTeacherId;
    });

    const assignmentsHtml = filteredAssignments.map(as => {
      const startMin = timeToMinutes(as.hora_inicio);
      const endMin = timeToMinutes(as.hora_fin);
      
      const top = ((startMin - startMinutes) / totalMinutes) * gridHeight;
      const height = ((endMin - startMin) / totalMinutes) * gridHeight;

      if (top < 0 || height <= 0) return '';

      const teacherColor = as.color || 'var(--hb-primary-light)';
      const isConflict = as.conflict;

      return `
        <div class="hb-slot-assigned hb-draggable-class ${isConflict ? 'border-danger' : ''}" 
             draggable="true"
             style="top: ${top}px; height: ${height}px; background-color: ${isConflict ? 'var(--hb-danger-light)' : teacherColor}; border-left-color: ${isConflict ? 'var(--hb-danger)' : 'var(--hb-primary)'}; color: var(--hb-gray-800);"
             data-id="${as.clase_id}"
             title="${as.clase_nombre} - Prof: ${as.maestro_nombre}\nSalón: ${as.salon_nombre}\nHorario: ${as.hora_inicio} - ${as.hora_fin}">
          <div style="font-weight: 700; font-size: 0.75rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            ${as.clase_nombre}
          </div>
          <div style="font-size: 0.65rem; opacity: 0.8; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            👤 ${as.maestro_nombre.split(' ')[0]} | 🏫 ${as.salon_nombre.split(' ')[0]}
          </div>
          <div style="font-size: 0.6rem; opacity: 0.7;">
             🕒 ${as.hora_inicio}-${as.hora_fin}
          </div>
        </div>
      `;
    }).join('');

    // Generate grid horizontal lines inside day column
    const linesHtml = [];
    for (let h = startHour; h < endHour; h++) {
      linesHtml.push(`
        <div style="position: absolute; left: 0; right: 0; top: ${(h - startHour) * hourHeight}px; height: 1px; border-bottom: 1px dashed var(--hb-border); pointer-events: none;"></div>
      `);
    }

    return `
      <div class="hb-day-column" data-day="${day.key}" style="position: relative; height: ${gridHeight}px; border-left: 1px solid var(--hb-border); background: var(--hb-grid-bg);">
        ${linesHtml.join('')}
        ${availHtml}
        ${assignmentsHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="hb-calendar-container">
      <div class="hb-calendar-grid" style="display: grid; grid-template-columns: 80px repeat(6, 1fr); min-width: 800px; border-bottom: 1px solid var(--hb-border); background: var(--hb-card-bg);">
        <div class="hb-cal-header" style="padding: 10px; font-weight: 700; text-align: center; color: var(--hb-text-muted);">Hora</div>
        ${DIAS_SEMANA.map(d => `<div class="hb-cal-header" style="padding: 10px; font-weight: 700; text-align: center; color: var(--hb-primary);">${d.label}</div>`).join('')}
      </div>
      <div class="hb-calendar-grid" style="display: grid; grid-template-columns: 80px repeat(6, 1fr); min-width: 800px; position: relative; height: ${gridHeight}px; background: var(--hb-card-bg);">
        <div class="hb-time-labels-col" style="position: relative; height: ${gridHeight}px; border-right: 1px solid var(--hb-border);">
          ${hourLabelsHtml.join('')}
        </div>
        ${columnsHtml}
      </div>
    </div>
  `;
}

/**
 * Utility to merge availability intervals of all teachers.
 * Keeps UI cleaner when viewing "All".
 */
function getMergedAvailabilityForAll(teachers, dayKey) {
  const allIntervals = [];
  teachers.forEach(t => {
    const slots = t.disponibilidad?.[dayKey] || [];
    slots.forEach(s => {
      allIntervals.push({ start: timeToMinutes(s.inicio), end: timeToMinutes(s.fin) });
    });
  });

  if (allIntervals.length === 0) return [];

  // Sort intervals by start time
  allIntervals.sort((a, b) => a.start - b.start);

  const merged = [allIntervals[0]];
  for (let i = 1; i < allIntervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = allIntervals[i];

    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push(curr);
    }
  }

  // Convert back to HH:MM format
  return merged.map(i => ({
    inicio: minutesToTime(i.start),
    fin: minutesToTime(i.end)
  }));
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

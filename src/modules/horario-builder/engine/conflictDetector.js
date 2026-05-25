function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(a, b, gap = 0) {
  const aStart = timeToMinutes(a.hora_inicio);
  const aEnd   = timeToMinutes(a.hora_fin);
  const bStart = timeToMinutes(b.hora_inicio);
  const bEnd   = timeToMinutes(b.hora_fin);
  return aStart < (bEnd + gap) && (bStart - gap) < aEnd;
}

/**
 * Detects teacher and room conflicts in a list of schedule assignments.
 *
 * @param {Array} assignments - Array of assignment objects with shape:
 *   { clase_id, clase_nombre, maestro_id, maestro_nombre, salon_id, salon_nombre,
 *     dia, hora_inicio, hora_fin }
 * @param {Object} options
 * @param {boolean} options.returnAnnotated - If true, also returns assignments
 *   array with `hasConflict` flag set on each item.
 * @param {number} options.gapMinutes - Minimum gap between classes (default 0).
 * @returns {Array|Object} Array of conflict objects, or { conflicts, assignments }
 *   if returnAnnotated is true.
 *
 * Each conflict object:
 *   { type: 'teacher'|'room', ids: [clase_id, clase_id], day, hora_inicio,
 *     description: string }
 */
export function detectConflicts(assignments, { returnAnnotated = false, gapMinutes = 0 } = {}) {
  const conflicts = [];
  const conflictingIds = new Set();

  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const a = assignments[i];
      const b = assignments[j];

      if (a.dia !== b.dia) continue;
      if (!overlaps(a, b, gapMinutes)) continue;

      if (a.maestro_id && a.maestro_id === b.maestro_id) {
        conflicts.push({
          type: 'teacher',
          ids: [a.clase_id, b.clase_id],
          day: a.dia,
          hora_inicio: a.hora_inicio,
          description: `${a.maestro_nombre} tiene dos clases al mismo tiempo: "${a.clase_nombre}" y "${b.clase_nombre}"`
        });
        conflictingIds.add(a.clase_id);
        conflictingIds.add(b.clase_id);
      }

      if (a.salon_id && a.salon_id === b.salon_id) {
        conflicts.push({
          type: 'room',
          ids: [a.clase_id, b.clase_id],
          day: a.dia,
          hora_inicio: a.hora_inicio,
          description: `${a.salon_nombre} está ocupado por "${a.clase_nombre}" y "${b.clase_nombre}" al mismo tiempo`
        });
        conflictingIds.add(a.clase_id);
        conflictingIds.add(b.clase_id);
      }
    }
  }

  if (!returnAnnotated) return conflicts;

  const annotated = assignments.map(a => ({
    ...a,
    hasConflict: conflictingIds.has(a.clase_id)
  }));

  return { conflicts, assignments: annotated };
}

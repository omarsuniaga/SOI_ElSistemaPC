import { JORNADA } from '../models/scheduleConstraints.model.js';

// ─── HELPERS ────────────────────────────────────────────────────

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Checks if two intervals [start1, end1] and [start2, end2] overlap, considering an optional gap.
 */
function isOverlapping(start1, end1, start2, end2, gap = 0) {
  return start1 < (end2 + gap) && (start2 - gap) < end1;
}

/**
 * Intersects teacher availability slots with the institutional JORNADA for a given day.
 */
function getEffectiveAvailability(teacherDisp, dayKey, jornada) {
  const teacherSlots = teacherDisp[dayKey] || [];
  const dayJornada = jornada[dayKey];
  
  if (!dayJornada || dayJornada.inicio === '00:00' && dayJornada.fin === '00:00') {
    return []; // Closed on this day
  }

  const jStart = timeToMinutes(dayJornada.inicio);
  const jEnd = timeToMinutes(dayJornada.fin);

  const effective = [];
  teacherSlots.forEach(slot => {
    const sStart = timeToMinutes(slot.inicio);
    const sEnd = timeToMinutes(slot.fin);

    const intersectStart = Math.max(sStart, jStart);
    const intersectEnd = Math.min(sEnd, jEnd);

    if (intersectStart < intersectEnd) {
      effective.push({ start: intersectStart, end: intersectEnd });
    }
  });

  return effective;
}

// ─── ENGINE ─────────────────────────────────────────────────────

export function generateOptimizedSchedule({ clasesConMaestro, maestros, salones, config }) {
  const currentConfig = {
    jornada: config?.jornada || JORNADA,
    gapMinimo: config?.gapMinimo !== undefined ? parseInt(config.gapMinimo) : 15,
    duracionBloque: config?.duracionBloque !== undefined ? parseInt(config.duracionBloque) : 60
  };

  const assignments = [];
  const noAsignadas = [];

  // Track scheduled load: teacherId -> [{ day, start, end, classId }]
  const teacherSchedules = {};
  maestros.forEach(m => { teacherSchedules[m.id] = []; });

  // Track scheduled load: salonId -> [{ day, start, end, classId }]
  const salonSchedules = {};
  salones.forEach(s => { salonSchedules[s.id] = []; });

  // 1. Prepare classes data and calculate constraint score
  const classesToSchedule = clasesConMaestro.map(cl => {
    const teacher = maestros.find(m => m.id === cl.maestro_principal_id);
    let totalAvailableMinutes = 0;

    if (teacher && teacher.disponibilidad) {
      Object.keys(teacher.disponibilidad).forEach(day => {
        const eff = getEffectiveAvailability(teacher.disponibilidad, day, currentConfig.jornada);
        eff.forEach(slot => {
          totalAvailableMinutes += (slot.end - slot.start);
        });
      });
    }

    return {
      ...cl,
      duracion: cl.duracion || currentConfig.duracionBloque,
      totalAlumnos: cl.total_alumnos || 0,
      availableMinutes: totalAvailableMinutes || 1, // Avoid division by zero
    };
  });

  // 2. Sort classes:
  // - Teachers with LESS available time first (MRV - Most Constrained Variable)
  // - Classes with MORE students first (need larger rooms, which are scarcer)
  classesToSchedule.sort((a, b) => {
    if (a.availableMinutes !== b.availableMinutes) {
      return a.availableMinutes - b.availableMinutes; // ascending available minutes
    }
    return b.totalAlumnos - a.totalAlumnos; // descending students count
  });

  // 3. Perform scheduling
  classesToSchedule.forEach(clase => {
    const teacher = maestros.find(m => m.id === clase.maestro_principal_id);
    if (!teacher) {
      noAsignadas.push({
        clase_id: clase.id,
        nombre: clase.nombre,
        razon: `El maestro principal asignado (ID: ${clase.maestro_principal_id}) no está registrado.`
      });
      return;
    }

    const duration = clase.duracion;
    const candidates = [];

    // Find all valid candidate slots
    Object.keys(currentConfig.jornada).forEach(day => {
      const dayJornada = currentConfig.jornada[day];
      if (!dayJornada || (dayJornada.inicio === '00:00' && dayJornada.fin === '00:00')) return;

      const effectiveDisp = getEffectiveAvailability(teacher.disponibilidad || {}, day, currentConfig.jornada);
      if (effectiveDisp.length === 0) return;

      const jStart = timeToMinutes(dayJornada.inicio);
      const jEnd = timeToMinutes(dayJornada.fin);

      // Check salons with capacity >= students
      const candidateSalones = salones.filter(s => s.capacidad >= clase.totalAlumnos && s.is_active !== false);
      if (candidateSalones.length === 0) return;

      effectiveDisp.forEach(availSlot => {
        // Slide a window of 'duration' inside the availability
        for (let start = availSlot.start; start + duration <= availSlot.end; start += 30) {
          const end = start + duration;

          // Check if teacher is free in this slot
          const teacherConflicts = (teacherSchedules[teacher.id] || []).some(s => 
            s.day === day && isOverlapping(start, end, s.start, s.end, currentConfig.gapMinimo)
          );
          if (teacherConflicts) continue;

          // For each valid salon, check if it's free
          candidateSalones.forEach(salon => {
            const salonConflicts = (salonSchedules[salon.id] || []).some(s => 
              s.day === day && isOverlapping(start, end, s.start, s.end, currentConfig.gapMinimo)
            );
            if (salonConflicts) return;

            // Found a valid candidate!
            candidates.push({
              day,
              start,
              end,
              salon,
              teacher
            });
          });
        }
      });
    });

    if (candidates.length === 0) {
      // Find exact bottleneck reason
      const roomsCapable = salones.filter(s => s.capacidad >= clase.totalAlumnos && s.is_active !== false);
      let reason = 'Sin disponibilidad compatible con maestro y salones.';
      if (roomsCapable.length === 0) {
        reason = `No hay salones activos con capacidad suficiente para ${clase.totalAlumnos} alumnos.`;
      } else {
        reason = `Conflicto de agenda: el maestro ${teacher.nombre} o los salones adecuados están ocupados en sus horas disponibles.`;
      }

      noAsignadas.push({
        clase_id: clase.id,
        nombre: clase.nombre,
        razon: reason
      });
      return;
    }

    // 4. Rank candidates to select the absolute best
    candidates.forEach(cand => {
      let score = 100;

      // Restricción de salón ajustada: penalizar salones excesivamente grandes para esta clase
      // (así mantenemos los salones grandes libres para clases grandes)
      const spaceWaisted = cand.salon.capacidad - clase.totalAlumnos;
      score -= Math.min(spaceWaisted * 2, 40);

      // Balancear carga docente: penalizar si el maestro ya tiene muchas horas asignadas
      const teacherHours = (teacherSchedules[cand.teacher.id] || []).reduce((acc, s) => acc + (s.end - s.start), 0) / 60;
      score -= Math.min(teacherHours * 3, 20);

      // Agrupamiento/Compactación: premiar horarios pegados a otras clases del maestro para evitar "horas huecas"
      const hasAdjacent = (teacherSchedules[cand.teacher.id] || []).some(s => 
        s.day === cand.day && (s.end === cand.start || s.start === cand.end)
      );
      if (hasAdjacent) {
        score += 15; // Reward compactness
      }

      cand.score = score;
    });

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    // 5. Apply the assignment
    assignments.push({
      clase_id: clase.id,
      clase_nombre: clase.nombre,
      maestro_id: teacher.id,
      maestro_nombre: teacher.nombre,
      salon_id: best.salon.id,
      salon_nombre: best.salon.nombre,
      dia: best.day,
      hora_inicio: minutesToTime(best.start),
      hora_fin: minutesToTime(best.end),
      color: hashStringToColor(teacher.id) // Consistently assign a Consitent Color for visual mapping
    });

    // Update teacher & salon schedules in memory
    teacherSchedules[teacher.id].push({
      day: best.day,
      start: best.start,
      end: best.end,
      classId: clase.id
    });

    salonSchedules[best.salon.id].push({
      day: best.day,
      start: best.start,
      end: best.end,
      classId: clase.id
    });
  });

  // Calculate Metrics
  const totalClases = clasesConMaestro.length;
  const clasesAsignadas = assignments.length;
  const clasesNoAsignadas = noAsignadas.length;

  const ocupacionSalones = {};
  salones.forEach(s => {
    const occupiedMins = (salonSchedules[s.id] || []).reduce((acc, slot) => acc + (slot.end - slot.start), 0);
    // Total institutional weekly minutes open
    let totalWeeklyMins = 0;
    Object.keys(currentConfig.jornada).forEach(day => {
      const dJ = currentConfig.jornada[day];
      if (dJ && (dJ.inicio !== '00:00' || dJ.fin !== '00:00')) {
        totalWeeklyMins += (timeToMinutes(dJ.fin) - timeToMinutes(dJ.inicio));
      }
    });
    ocupacionSalones[s.id] = {
      nombre: s.nombre,
      porcentaje: Math.round((occupiedMins / (totalWeeklyMins || 1)) * 100)
    };
  });

  const cargaMaestros = {};
  maestros.forEach(m => {
    const occupiedMins = (teacherSchedules[m.id] || []).reduce((acc, slot) => acc + (slot.end - slot.start), 0);
    cargaMaestros[m.id] = {
      nombre: m.nombre,
      horas: Math.round((occupiedMins / 60) * 10) / 10
    };
  });

  // Final Overall Score: percentage of successfully scheduled classes minus penalty for low salon efficiency
  const successRate = totalClases > 0 ? (clasesAsignadas / totalClases) * 100 : 100;
  const finalScore = Math.max(0, Math.round(successRate));

  return {
    assignments,
    noAsignadas,
    metricas: {
      totalClases,
      clasesAsignadas,
      clasesNoAsignadas,
      ocupacionSalones,
      cargaMaestros,
      score: finalScore
    }
  };
}

// Consistent color generation for teachers
function hashStringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate consistent pastel HSL colors for aesthetics
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 88%)`; // Sleek pastel color
}

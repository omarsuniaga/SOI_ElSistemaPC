import { supabase } from '../../lib/supabaseClient.js';

// ─── CONSTANTS ──────────────────────────────────────────────────
const DIAS_VALIDOS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ─── VALIDATION ─────────────────────────────────────────────────

/**
 * Converts "HH:MM" to minutes since midnight for comparison.
 * @param {string} time - Time string in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Checks if two time ranges overlap.
 * @param {{ inicio: string, fin: string }} a
 * @param {{ inicio: string, fin: string }} b
 * @returns {boolean}
 */
function franjasOverlap(a, b) {
  const aStart = timeToMinutes(a.inicio);
  const aEnd = timeToMinutes(a.fin);
  const bStart = timeToMinutes(b.inicio);
  const bEnd = timeToMinutes(b.fin);
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Validates an array of time slots for a single day.
 * Returns an array of error messages (empty = valid).
 * @param {Array<{ inicio: string, fin: string }>} franjas
 * @param {string} diaLabel - Day label for error messages
 * @returns {string[]} Error messages
 */
function validateFranjasForDay(franjas, diaLabel) {
  const errors = [];

  for (let i = 0; i < franjas.length; i++) {
    const f = franjas[i];

    // Format check
    if (!TIME_REGEX.test(f.inicio) || !TIME_REGEX.test(f.fin)) {
      errors.push(`${diaLabel}: franja ${i + 1} tiene formato de hora inválido (use HH:MM)`);
      continue;
    }

    // inicio must be before fin
    if (timeToMinutes(f.inicio) >= timeToMinutes(f.fin)) {
      errors.push(`${diaLabel}: franja ${i + 1} — la hora de inicio (${f.inicio}) debe ser anterior a la de fin (${f.fin})`);
      continue;
    }

    // Overlap check against subsequent franjas
    for (let j = i + 1; j < franjas.length; j++) {
      if (franjasOverlap(f, franjas[j])) {
        errors.push(`${diaLabel}: las franjas ${i + 1} y ${j + 1} se solapan`);
      }
    }
  }

  return errors;
}

/**
 * Validates the full availability object.
 * @param {Object} disponibilidad - { dayKey: [{ inicio, fin }] }
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDisponibilidad(disponibilidad) {
  if (!disponibilidad || typeof disponibilidad !== 'object') {
    return { valid: false, errors: ['Disponibilidad debe ser un objeto'] };
  }

  const errors = [];

  for (const [dia, franjas] of Object.entries(disponibilidad)) {
    if (!DIAS_VALIDOS.includes(dia)) {
      errors.push(`Día inválido: "${dia}"`);
      continue;
    }

    if (!Array.isArray(franjas)) {
      errors.push(`${dia}: las franjas deben ser un array`);
      continue;
    }

    const dayErrors = validateFranjasForDay(franjas, dia);
    errors.push(...dayErrors);
  }

  return { valid: errors.length === 0, errors };
}

// ─── API FUNCTIONS ──────────────────────────────────────────────

/**
 * Gets the availability for a specific teacher.
 * @param {string} maestroId - Teacher UUID
 * @returns {Promise<Object>} Availability object { lunes: [...], ... }
 */
export async function getDisponibilidad(maestroId) {
  const { data, error } = await supabase
    .from('maestros')
    .select('disponibilidad')
    .eq('id', maestroId)
    .single();

  if (error) {
    console.error('[DisponibilidadApi] Error fetching:', error.message);
    throw new Error('No se pudo obtener la disponibilidad');
  }

  return data?.disponibilidad || {};
}

/**
 * Updates the availability for a specific teacher.
 * Validates before persisting.
 * @param {string} maestroId - Teacher UUID
 * @param {Object} disponibilidad - { dayKey: [{ inicio, fin }] }
 * @returns {Promise<{ success: boolean, errors?: string[] }>}
 */
export async function updateDisponibilidad(maestroId, disponibilidad) {
  // Validate before saving
  const validation = validateDisponibilidad(disponibilidad);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const { error } = await supabase
    .from('maestros')
    .update({ disponibilidad })
    .eq('id', maestroId);

  if (error) {
    console.error('[DisponibilidadApi] Error updating:', error.message);
    return { success: false, errors: [error.message] };
  }

  return { success: true };
}

/**
 * Gets availability for multiple teachers in bulk.
 * Used by admin to load all teachers at once.
 * @param {string[]} [maestroIds] - Optional array of teacher UUIDs. If omitted, fetches all active.
 * @returns {Promise<Array<{ id: string, nombre: string, especialidad: string, habilidades: string[], disponibilidad: Object }>>}
 */
export async function getDisponibilidadBulk(maestroIds) {
  let query = supabase
    .from('maestros')
    .select('id, nombre_completo, especialidad, habilidades, disponibilidad')
    .eq('activo', true)
    .order('nombre_completo', { ascending: true });

  if (maestroIds?.length) {
    query = query.in('id', maestroIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[DisponibilidadApi] Error fetching bulk:', error.message);
    throw new Error('No se pudieron cargar las disponibilidades');
  }

  return data.map(m => ({
    id: m.id,
    nombre: m.nombre_completo || '',
    especialidad: m.especialidad || '',
    habilidades: Array.isArray(m.habilidades) ? m.habilidades : [],
    disponibilidad: m.disponibilidad || {},
  }));
}

// ─── UTILITY EXPORTS ────────────────────────────────────────────
export { timeToMinutes, franjasOverlap, DIAS_VALIDOS };

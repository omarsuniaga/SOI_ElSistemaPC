import { supabase } from '../../../lib/supabaseClient.js';
import { timeToMinutes } from '../../../portal-maestros/api/disponibilidadApi.js';

// ─── HELPERS ────────────────────────────────────────────────────

/**
 * Checks if a teacher's availability for a given day fully covers a requested time range.
 * @param {Array<{ inicio: string, fin: string }>} franjas - Teacher's slots for that day
 * @param {string} horaInicio - Required start time (HH:MM)
 * @param {string} horaFin - Required end time (HH:MM)
 * @returns {boolean}
 */
function franjaCoversFully(franjas, horaInicio, horaFin) {
  const reqStart = timeToMinutes(horaInicio);
  const reqEnd = timeToMinutes(horaFin);

  return franjas.some(f => {
    const slotStart = timeToMinutes(f.inicio);
    const slotEnd = timeToMinutes(f.fin);
    return slotStart <= reqStart && slotEnd >= reqEnd;
  });
}

// ─── API FUNCTIONS ──────────────────────────────────────────────

/**
 * Fetches all active teachers with their availability and skills.
 * Designed for admin schedule builder.
 * @returns {Promise<Array<{
 *   id: string, nombre: string, especialidad: string,
 *   habilidades: string[], disponibilidad: Object, activo: boolean
 * }>>}
 */
export async function getAllDisponibilidades() {
  const { data, error } = await supabase
    .from('maestros')
    .select('id, nombre_completo, especialidad, habilidades, disponibilidad, activo')
    .eq('activo', true)
    .order('nombre_completo', { ascending: true });

  if (error) {
    console.error('[MaestroDisponibilidadApi] Error:', error.message);
    throw new Error('No se pudieron cargar las disponibilidades de maestros');
  }

  return data.map(m => ({
    id: m.id,
    nombre: m.nombre_completo || '',
    especialidad: m.especialidad || '',
    habilidades: Array.isArray(m.habilidades) ? m.habilidades : [],
    disponibilidad: m.disponibilidad || {},
    activo: m.activo,
  }));
}

/**
 * Finds teachers available during a specific time slot on a given day.
 * @param {string} dia - Day key (e.g. 'lunes', 'martes')
 * @param {string} horaInicio - Start time (HH:MM)
 * @param {string} horaFin - End time (HH:MM)
 * @returns {Promise<Array<{ id: string, nombre: string, especialidad: string, habilidades: string[] }>>}
 */
export async function getMaestrosDisponiblesEnFranja(dia, horaInicio, horaFin) {
  const todos = await getAllDisponibilidades();

  return todos.filter(m => {
    const franjas = m.disponibilidad[dia];
    if (!franjas || !Array.isArray(franjas) || franjas.length === 0) return false;
    return franjaCoversFully(franjas, horaInicio, horaFin);
  }).map(({ id, nombre, especialidad, habilidades }) => ({
    id, nombre, especialidad, habilidades,
  }));
}

/**
 * Finds teachers available for a specific class:
 * available in the time slot AND skilled in the required instrument.
 * @param {string} instrumento - Required instrument/specialty
 * @param {string} dia - Day key
 * @param {string} horaInicio - Start time (HH:MM)
 * @param {string} horaFin - End time (HH:MM)
 * @returns {Promise<Array<{ id: string, nombre: string, especialidad: string, habilidades: string[] }>>}
 */
export async function getMaestrosDisponiblesParaClase(instrumento, dia, horaInicio, horaFin) {
  const disponibles = await getMaestrosDisponiblesEnFranja(dia, horaInicio, horaFin);
  const instrLower = instrumento.toLowerCase();

  return disponibles.filter(m => {
    // Check main specialty
    if (m.especialidad?.toLowerCase().includes(instrLower)) return true;
    // Check skills array
    if (m.habilidades.some(h => h.toLowerCase().includes(instrLower))) return true;
    return false;
  });
}

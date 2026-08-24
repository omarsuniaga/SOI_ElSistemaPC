/**
 * historialClasesService.js
 *
 * Carga el historial de "clases dadas" de un maestro: sesiones confirmadas
 * con contenido tal cual lo escribió, roster de asistencia con causa de
 * justificación, y hora/salón (con respaldo en el horario recurrente
 * cuando la sesión no los trae).
 *
 * Es la fuente de datos única compartida por dos consumidores:
 *   - portal-maestros/views/misClasesView.js — vista propia del maestro
 *   - modules/admin-dashboard/views/maestroClasesContenidoView.js — vista
 *     de admin/superadmin/coordinación académica sobre CUALQUIER maestro
 *
 * Por eso recibe `maestroId` explícito y NUNCA lo resuelve desde la sesión
 * local (`getMaestroLocal()`) — quien llama decide de quién es el
 * historial. `getSesiones/getHorariosClases/getSalones` de
 * maestroDataService.js ya son así (reciben ids explícitos); solo
 * `getMisClases()` está acoplada al usuario logueado, así que aquí se
 * repite esa consulta parametrizada por maestroId en vez de reusarla.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { DIAS_ES } from '../utils/portalUtils.js'
import { getSesiones, getSalones, getHorariosClases } from './maestroDataService.js'
import { calcAttendanceStats } from './reportService.js'

export const RANGOS = [
  { dias: 7, label: 'Últimos 7 días' },
  { dias: 30, label: 'Últimos 30 días' },
  { dias: 90, label: 'Últimos 90 días' },
]

export function rangoFechas(dias) {
  const hasta = new Date()
  const desde = new Date(hasta)
  desde.setDate(desde.getDate() - dias)
  return {
    desde: desde.toISOString().split('T')[0],
    hasta: hasta.toISOString().split('T')[0],
  }
}

/** Mismo filtro que usa maestroDataService.getMisClases(), parametrizado. */
async function _getClasesDeMaestro(maestroId) {
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, maestro_principal_id')
    .or(`maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId},maestro_id.eq.${maestroId}`)
  if (error) {
    console.warn('[HistorialClases] Error cargando clases del maestro:', error.message)
    return []
  }
  return data || []
}

/**
 * Nombres de alumnos por id. El JSONB sesiones_clase.asistencia solo trae
 * alumno_id — se resuelven los nombres aparte, y por id directo (no por
 * inscripción activa) para que un alumno que ya no está en la clase siga
 * apareciendo con su nombre en el historial.
 */
async function _cargarNombresAlumnos(alumnoIds) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .in('id', alumnoIds)
  if (error) {
    console.warn('[HistorialClases] Error cargando nombres de alumnos:', error.message)
    return []
  }
  return data || []
}

/**
 * Causa de justificación por sesión+alumno. Es una tabla aparte del JSONB
 * de asistencia — el estado 'A'/'J' no trae el motivo, solo lo tiene
 * `justificaciones`.
 */
async function _cargarJustificaciones(sesionIds) {
  const { data, error } = await supabase
    .from('justificaciones')
    .select('sesion_id, alumno_id, motivo')
    .in('sesion_id', sesionIds)
  if (error) {
    console.warn('[HistorialClases] Error cargando justificaciones:', error.message)
    return []
  }
  return data || []
}

/**
 * Nombre del día de la semana (formato de `clase_horarios.dia`: minúscula,
 * con tilde — 'lunes', 'miércoles', 'sábado'...) a partir de una fecha
 * 'YYYY-MM-DD'.
 */
function _diaSemana(fecha) {
  const d = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return DIAS_ES[d.getDay()]
}

/**
 * Progreso individual registrado para una clase (tabla `progresos`):
 * estado_cualitativo (INICIADO/EN_PROGRESO/LOGRADO/DIFICULTAD) + calificación
 * 1-5 por alumno. Insumo del análisis con IA de "avanza/estancada".
 */
export async function cargarProgresosDeClase(claseId, { desde, hasta } = {}) {
  let query = supabase
    .from('progresos')
    .select('id, alumno_id, estado_cualitativo, calificacion, fecha_evaluacion')
    .eq('clase_id', claseId)
  if (desde) query = query.gte('fecha_evaluacion', desde)
  if (hasta) query = query.lte('fecha_evaluacion', hasta)

  const { data, error } = await query
  if (error) {
    console.warn('[HistorialClases] Error cargando progresos de la clase:', error.message)
    return []
  }
  return data || []
}

/**
 * Carga clases + sesiones confirmadas del maestro en el rango, resuelve
 * nombres de salón, roster de alumnos y causas de justificación.
 *
 * La mayoría de las sesiones (88 de 103 medidas en producción) no guardan
 * hora_inicio/hora_fin/salon_id propios — el maestro nunca los captura al
 * tomar asistencia. El horario real vive en `clase_horarios`, indexado por
 * día de la semana (una clase puede reunirse varios días con horarios
 * distintos). Se usa como respaldo cuando la sesión no trae el dato.
 *
 * @param {Object} params
 * @param {string} params.maestroId
 * @param {number} params.dias — tamaño del rango hacia atrás desde hoy
 * @param {string} [params.claseId] — 'todas' o un id de clase específico
 * @returns {Promise<{ clases: Array, sesiones: Array }>}
 */
export async function cargarHistorialClases({ maestroId, dias, claseId = 'todas' }) {
  const { desde, hasta } = rangoFechas(dias)

  const [clases, sesiones] = await Promise.all([
    _getClasesDeMaestro(maestroId),
    getSesiones(maestroId, desde, hasta),
  ])

  const claseById = new Map(clases.map((c) => [c.id, c]))

  // Solo sesiones confirmadas: un borrador no es una clase "dada" todavía.
  // Mismo criterio que usa el timeline de asistencias del admin.
  let confirmadas = sesiones.filter((s) => s.borrador === false)
  if (claseId !== 'todas') {
    confirmadas = confirmadas.filter((s) => s.clase_id === claseId)
  }

  const claseIds = [...new Set(confirmadas.map((s) => s.clase_id).filter(Boolean))]
  const alumnoIds = [
    ...new Set(confirmadas.flatMap((s) => (s.asistencia || []).map((a) => a.alumno_id)).filter(Boolean)),
  ]
  const sesionIds = confirmadas.map((s) => s.id)

  const [horarios, alumnos, justificaciones] = await Promise.all([
    claseIds.length > 0 ? getHorariosClases(claseIds) : Promise.resolve([]),
    alumnoIds.length > 0 ? _cargarNombresAlumnos(alumnoIds) : Promise.resolve([]),
    sesionIds.length > 0 ? _cargarJustificaciones(sesionIds) : Promise.resolve([]),
  ])

  const horarioByKey = new Map(horarios.map((h) => [`${h.clase_id}_${h.dia}`, h]))

  // Salones a resolver: los que trae la sesión directamente + los del
  // horario recurrente usado como respaldo.
  const salonIds = [
    ...new Set([
      ...confirmadas.map((s) => s.salon_id).filter(Boolean),
      ...horarios.map((h) => h.salon_id).filter(Boolean),
    ]),
  ]
  const salones = salonIds.length > 0 ? await getSalones(salonIds) : []

  const salonById = new Map(salones.map((s) => [s.id, s.nombre]))
  const nombreByAlumno = new Map(alumnos.map((a) => [a.id, a.nombre_completo]))
  const motivoByKey = new Map(justificaciones.map((j) => [`${j.sesion_id}_${j.alumno_id}`, j.motivo]))

  const sesionesConDatos = confirmadas
    .map((s) => {
      const stats = calcAttendanceStats(s.asistencia)
      const roster = (s.asistencia || [])
        .filter((a) => a.alumno_id)
        .map((a) => ({
          alumnoId: a.alumno_id,
          nombre: nombreByAlumno.get(a.alumno_id) || 'Alumno sin nombre',
          estado: a.estado,
          motivo: motivoByKey.get(`${s.id}_${a.alumno_id}`) || null,
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre))

      const horarioFallback = horarioByKey.get(`${s.clase_id}_${_diaSemana(s.fecha)}`)
      const horaInicio = s.hora_inicio || horarioFallback?.hora_inicio || null
      const horaFin = s.hora_fin || horarioFallback?.hora_fin || null
      const salonId = s.salon_id || horarioFallback?.salon_id || null

      return {
        id: s.id,
        fecha: s.fecha,
        horaInicio,
        horaFin,
        claseId: s.clase_id,
        claseNombre: claseById.get(s.clase_id)?.nombre || 'Clase sin nombre',
        salonNombre: salonId ? salonById.get(salonId) || null : null,
        contenido: (s.contenido || '').trim(),
        presentes: stats.P,
        ausentes: stats.A,
        justificados: stats.J,
        totalRegistros: stats.total,
        roster,
      }
    })
    .sort((a, b) => {
      if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha)
      return (b.horaInicio || '').localeCompare(a.horaInicio || '')
    })

  return { clases, sesiones: sesionesConDatos }
}

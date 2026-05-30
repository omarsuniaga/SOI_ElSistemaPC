// src/portal-maestros/services/emergenteJustificacionService.js
import { supabase } from '../../lib/supabaseClient.js'

const DIAS_ES_LARGO = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

/**
 * Auto-creates a justified session for every scheduled class on emergente.fecha.
 * Idempotent — re-calling with the same emergent updates existing sessions.
 *
 * @param {{ id: string, fecha: string, actividad: string, motivo: string }} emergente
 * @param {string} maestroId
 * @returns {Promise<{ justificadas: number, errores: string[] }>}
 */
export async function autoJustificarClasesProgramadas(emergente, maestroId) {
  const errores = []
  let justificadas = 0

  const [y, m, d] = emergente.fecha.split('-').map(Number)
  const fechaLocal = new Date(y, m - 1, d)
  const diaSemana = DIAS_ES_LARGO[fechaLocal.getDay()]

  // 1. Find classes for this teacher scheduled on this weekday
  const { data: clases, error: clError } = await supabase
    .from('clases')
    .select('id, nombre')
    .or(
      `maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId},maestro_id.eq.${maestroId}`,
    )

  if (clError || !clases?.length) return { justificadas: 0, errores: [] }

  const claseIds = clases.map((c) => c.id)

  const { data: horarios, error: hError } = await supabase
    .from('clase_horarios')
    .select('clase_id, hora_inicio, hora_fin')
    .in('clase_id', claseIds)
    .eq('dia', diaSemana)

  if (hError || !horarios?.length) return { justificadas: 0, errores: [] }

  const clasesDelDia = horarios.map((h) => ({
    ...h,
    nombre: clases.find((c) => c.id === h.clase_id)?.nombre || '',
  }))

  // 2. For each class: load students and upsert justified session
  for (const clase of clasesDelDia) {
    try {
      const { data: inscripciones } = await supabase
        .from('alumnos_clases')
        .select('alumno_id')
        .eq('clase_id', clase.clase_id)
        .eq('activo', true)

      const asistencia = (inscripciones || []).map((i) => ({
        alumno_id: i.alumno_id,
        estado: 'justificado',
      }))

      const contenido =
        `Clase suspendida por actividad especial: "${emergente.actividad || 'Actividad especial'}".` +
        (emergente.motivo ? ` Motivo: ${emergente.motivo}.` : '') +
        ' Todos los alumnos quedan justificados.'

      const { error: upsertError } = await supabase.from('sesiones_clase').upsert(
        {
          clase_id: clase.clase_id,
          fecha: emergente.fecha,
          maestro_id: maestroId,
          emergente_id: emergente.id,
          hora_inicio: clase.hora_inicio,
          hora_fin: clase.hora_fin,
          estado: 'registrada',
          borrador: false,
          asistencia,
          contenido,
        },
        { onConflict: 'clase_id,fecha,maestro_id' },
      )

      if (upsertError) {
        errores.push(`${clase.nombre}: ${upsertError.message}`)
      } else {
        justificadas++
      }
    } catch (err) {
      errores.push(`${clase.nombre}: ${err.message}`)
    }
  }

  return { justificadas, errores }
}

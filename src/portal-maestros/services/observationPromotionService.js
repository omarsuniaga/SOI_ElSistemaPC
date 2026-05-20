/**
 * observationPromotionService — Pipeline de promoción de observaciones.
 * Se encarga de guardar el contenido crudo de la sesión y 
 * "promover" las notas individuales a la ficha histórica de cada alumno.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { Observacion } from '../../modules/observaciones/models/observacion.model.js'

/**
 * Guarda la observación general de la sesión (contenido crudo y DSL).
 */
export async function guardarObservacionSesion({ sesionId, maestroId, raw, dsl, esBorrador = false }) {
  const { data, error } = await supabase
    .from('observaciones_sesion')
    .upsert({
      sesion_id: sesionId,
      maestro_id: maestroId,
      contenido_raw: raw,
      contenido_ia_dsl: dsl,
      es_borrador: esBorrador,
      updated_at: new Date().toISOString()
    }, { onConflict: 'sesion_id,maestro_id' })
    .select()

  return { data, error }
}

/**
 * Promueve las evaluaciones individuales a la tabla de observaciones_alumnos.
 * Esto permite que las notas tomadas en clase queden en la ficha histórica del alumno.
 * 
 * @param {string} sesionId 
 * @param {string} claseId 
 * @param {string} maestroId 
 * @param {object[]} evaluaciones - Lista de evaluaciones parseadas (alumno_id, observacion, nota, tarea)
 * @param {string} nombreClase - Nombre de la clase para el título de la observación
 */
export async function promocionarObservacionesAlumnos(sesionId, claseId, maestroId, evaluaciones, nombreClase = 'Clase') {
  if (!evaluaciones || evaluaciones.length === 0) return { success: true }

  // Filtrar solo las evaluaciones que tienen texto de observación
  const conObservacion = evaluaciones.filter(e => e.observacion && e.observacion.trim().length > 0)
  
  if (conObservacion.length === 0) return { success: true }

  const rows = conObservacion.map(e => {
    const obs = new Observacion({
      alumno_id: e.alumno_id,
      maestro_id: maestroId,
      clase_id: claseId,
      sesion_clase_id: sesionId,
      tipo: 'academico',
      titulo: `Evaluación SOI: ${nombreClase}`,
      descripcion: e.observacion,
      prioridad: 'media',
      estado: 'abierta',
      fecha_observacion: new Date().toISOString().split('T')[0]
    })
    
    // Saltamos validación estricta de longitud para promoción automática
    // pero aseguramos que el objeto sea válido para la DB
    return obs.toJSON()
  })

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .upsert(rows, { onConflict: 'sesion_clase_id,alumno_id' })

  if (error) {
    console.error('[Promotion] Error promoviendo observaciones:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

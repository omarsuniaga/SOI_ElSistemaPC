import { supabase } from '../../../lib/supabaseClient.js'
import { Observacion } from '../models/observacion.model.js'
import { promoteSessionObservations } from '../services/promoteObservations.js'

/**
 * Normaliza los datos de la base de datos a instancias del modelo
 */
function normalize(data) {
  if (!data) return null
  if (Array.isArray(data)) return data.map(o => new Observacion(o))
  return new Observacion(data)
}

export async function obtenerObservaciones() {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select(`
      *,
      alumno:alumnos(nombre_completo),
      maestro:maestros(nombre_completo)
    `)
    .order('fecha_observacion', { ascending: false })

  if (error) {
    console.error('Error cargando observaciones:', error.message)
    throw new Error('No se pudieron cargar las observaciones')
  }

  return data.map(o => {
    const model = new Observacion(o)
    model.alumno_nombre = o.alumno?.nombre_completo || 'Desconocido'
    model.maestro_nombre = o.maestro?.nombre_completo || 'N/A'
    return model
  })
}

export async function obtenerObservacion(id) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*, alumno:alumnos(nombre_completo)')
    .eq('id', id)
    .single()

  if (error) throw new Error('Observación no encontrada')
  
  const model = new Observacion(data)
  model.alumno_nombre = data.alumno?.nombre_completo || 'Desconocido'
  return model
}

export async function crearObservacion(obsData) {
  const model = new Observacion(obsData)
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores[0])

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .insert([model.toJSON()])
    .select()

  if (error) throw error
  return normalize(data[0])
}

export async function actualizarObservacion(id, actualizaciones) {
  const { data: original } = await supabase.from('observaciones_alumnos').select('*').eq('id', id).single()
  const model = new Observacion({ ...original, ...actualizaciones })
  
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores[0])

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update(model.toJSON())
    .eq('id', id)
    .select()

  if (error) throw error
  return normalize(data[0])
}

export async function eliminarObservacion(id) {
  const { error } = await supabase.from('observaciones_alumnos').delete().eq('id', id)
  if (error) throw error
}

export async function agregarSeguimiento(id, observacionSeguimiento) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({
      seguimiento_observacion: observacionSeguimiento.trim(),
      seguimiento_fecha: new Date().toISOString().split('T')[0],
      estado: 'seguimiento',
      requiere_seguimiento: true
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return normalize(data[0])
}

export async function resolverObservacion(id) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({ 
      estado: 'resuelta', 
      requiere_seguimiento: false 
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return normalize(data[0])
}

export async function getEstadisticas() {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('estado, prioridad, tipo')

  if (error) throw error

  return {
    total: data.length,
    abiertas: data.filter(o => o.estado === 'abierta').length,
    seguimiento: data.filter(o => o.estado === 'seguimiento').length,
    altas: data.filter(o => o.prioridad === 'alta').length,
    porTipo: data.reduce((acc, o) => {
      acc[o.tipo] = (acc[o.tipo] || 0) + 1
      return acc
    }, {})
  }
}

/**
 * Promote draft observations from session to canonical alumno table
 * Idempotent via SHA256 dedup. RLS-enforced.
 *
 * @param {string} sessionId - UUID of session
 * @param {string[]} alumnoIds - Array of alumno UUIDs to promote for
 * @returns {Promise<Object>} Promotion result with counts and errors
 */
export async function promoteObservations(sessionId, alumnoIds) {
  // Input validation
  if (!sessionId || typeof sessionId !== 'string') {
    return {
      promoted: 0,
      skipped: 0,
      errors: [{ code: 'INVALID_INPUT', message: 'sessionId is required and must be a string' }]
    }
  }

  if (!Array.isArray(alumnoIds) || (alumnoIds.length > 0 && !alumnoIds.every(id => typeof id === 'string'))) {
    return {
      promoted: 0,
      skipped: 0,
      errors: [{ code: 'INVALID_INPUT', message: 'alumnoIds must be an array of strings' }]
    }
  }

  // Early return for empty alumnoIds
  if (alumnoIds.length === 0) {
    return {
      promoted: 0,
      skipped: 0,
      errors: []
    }
  }

  try {
    // Fetch session metadata
    const sessionResult = await supabase.from('sesiones').select('id, clase_id')
    const sessionData = Array.isArray(sessionResult?.data) ? sessionResult.data[0] : sessionResult?.data
    const sessionError = sessionResult?.error

    if (sessionError || !sessionData) {
      return {
        promoted: 0,
        skipped: 0,
        errors: [{ code: 'INVALID_SESSION', message: `Session ${sessionId} not found` }]
      }
    }

    // Fetch observaciones_sesion rows (RLS enforced here)
    const sessionObsResult = await supabase.from('observaciones_sesion').select('*')
    const sessionObs = sessionObsResult?.data
    const sessionObsError = sessionObsResult?.error

    if (sessionObsError) {
      // Check for RLS permission denial
      if (sessionObsError.code === 'PGRST401' || sessionObsError.message?.includes('permission denied')) {
        return {
          promoted: 0,
          skipped: 0,
          errors: [{ code: 'INSUFFICIENT_PERMISSION', message: 'Not authorized to promote observations for this session' }]
        }
      }
      throw sessionObsError
    }

    // Fetch existing observaciones_alumnos for dedup check
    const alumnoObsResult = await supabase.from('observaciones_alumnos').select('sesion_id, alumno_id, contenido_parsed, dedup_key')
    const alumnoObs = alumnoObsResult?.data
    const alumnoObsError = alumnoObsResult?.error

    if (alumnoObsError) {
      throw alumnoObsError
    }

    // Call service to build promotion plan
    const promotionResult = await promoteSessionObservations(
      sessionId,
      alumnoIds,
      sessionObs || [],
      alumnoObs || []
    )

    // If nothing to promote, return early
    if (promotionResult.promoted === 0) {
      return {
        promoted: promotionResult.promoted,
        skipped: promotionResult.skipped,
        errors: promotionResult.errors
      }
    }

    // Extract rows marked for promotion
    const rowsToInsert = promotionResult.promotionPlan
      .filter(p => p.action === 'PROMOTE')
      .map(p => ({
        sesion_id: p.sesion_id,
        alumno_id: p.alumno_id,
        contenido_parsed: p.contenido_parsed,
        origen: 'sesion',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

    // Batch insert
    if (rowsToInsert.length > 0) {
      const insertResult = await supabase.from('observaciones_alumnos').insert(rowsToInsert)
      const insertError = insertResult?.error

      if (insertError) {
        // Check for RLS denial on insert
        if (insertError.code === 'PGRST401' || insertError.message?.includes('permission denied')) {
          return {
            promoted: 0,
            skipped: 0,
            errors: [{ code: 'INSUFFICIENT_PERMISSION', message: 'Not authorized to insert observations' }]
          }
        }
        throw insertError
      }
    }

    // Return success result
    return {
      promoted: promotionResult.promoted,
      skipped: promotionResult.skipped,
      errors: promotionResult.errors
    }
  } catch (error) {
    console.error('Error promoting observations:', error)
    return {
      promoted: 0,
      skipped: 0,
      errors: [{ code: 'DATABASE_ERROR', message: error.message }]
    }
  }
}

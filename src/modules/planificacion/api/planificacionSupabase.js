import { supabase } from '../../../lib/supabaseClient.js'
import { Planificacion } from '../models/planificacion.model.js'

/**
 * PlanificacionApi - Adaptador para la persistencia de planes curriculares.
 */

export async function obtenerPlanificaciones(maestroId = null) {
  let query = supabase.from('planificaciones').select('*')

  if (maestroId) {
    query = query.eq('maestro_id', maestroId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((p) => new Planificacion(p))
}

export async function obtenerPlanificacion(id) {
  const { data, error } = await supabase.from('planificaciones').select('*').eq('id', id).single()

  if (error) throw error
  return new Planificacion(data)
}

/**
 * Obtiene planificaciones enriquecidas con datos de clase y maestro
 */
export async function obtenerPlanificacionesConDetalles(maestroId = null) {
  let query = supabase.from('planificaciones').select(`
    *,
    clase:clases (nombre),
    maestro:maestros (nombre_completo)
  `)

  if (maestroId) {
    query = query.eq('maestro_id', maestroId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando planificaciones:', error.message)
    throw new Error('No se pudieron cargar las planificaciones')
  }

  return data.map(
    (p) =>
      new Planificacion({
        ...p,
        clase_nombre: p.clase?.nombre || 'Sin asignar',
        maestro_nombre: p.maestro?.nombre_completo || 'Sin asignar',
      }),
  )
}

export async function crearPlanificacion(planData) {
  const model = new Planificacion(planData)
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores.join('. '))

  const { data, error } = await supabase.from('planificaciones').insert([model.toJSON()]).select()

  if (error) throw error
  return new Planificacion(data[0])
}

export async function actualizarPlanificacion(id, actualizaciones) {
  // Para actualización parcial, primero obtenemos el original
  const { data: original } = await supabase
    .from('planificaciones')
    .select('*')
    .eq('id', id)
    .single()
  const model = new Planificacion({ ...original, ...actualizaciones })

  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores.join('. '))

  const { data, error } = await supabase
    .from('planificaciones')
    .update(model.toJSON())
    .eq('id', id)
    .select()

  if (error) throw error
  return new Planificacion(data[0])
}

export async function eliminarPlanificacion(id) {
  const { error } = await supabase.from('planificaciones').delete().eq('id', id)

  if (error) throw error
}

export async function marcarRevisadasMasivo(ids) {
  if (!ids || !ids.length) return []

  const { data, error } = await supabase
    .from('planificaciones')
    .update({ estado: 'revisado' })
    .in('id', ids)
    .select()

  if (error) throw error
  return (data || []).map((p) => new Planificacion(p))
}

export async function marcarRevisada(id) {
  const results = await marcarRevisadasMasivo([id])
  return results[0] || null
}

export async function marcarEjecutada(id) {
  return actualizarPlanificacion(id, { estado: 'ejecutado' })
}

// ── New functions ────────────────────────────────────────────────

export async function obtenerClases() {
  const { data, error } = await supabase.from('clases').select('*').order('nombre')
  if (error) throw error
  return data || []
}

export async function obtenerMaestros() {
  const { data, error } = await supabase
    .from('maestros')
    .select('id, nombre_completo')
    .eq('estado', 'activo')
    .order('nombre_completo')
  if (error) throw error
  return (data || []).map((m) => ({ id: m.id, nombre: m.nombre_completo }))
}

export async function obtenerMaestro(id) {
  const { data, error } = await supabase.from('maestros').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function obtenerSesiones(maestroId, fechaInicio, fechaFin) {
  let query = supabase.from('sesiones_clase').select('*').eq('maestro_id', maestroId)
  if (fechaInicio) query = query.gte('fecha', fechaInicio)
  if (fechaFin) query = query.lte('fecha', fechaFin)
  const { data, error } = await query.order('fecha', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Obtiene la cobertura curricular: todas las clases con o sin plan asociado.
 *
 * Hace un LEFT JOIN implícito via Supabase: clases → planificaciones.
 * Si una clase no tiene plan, planificaciones devuelve [] (array vacío).
 *
 * @param {string|null} maestroId  - Si se provee, filtra por maestro. null = todas las clases (admin).
 * @returns {Promise<Array<{
 *   clase_id: string,
 *   clase_nombre: string,
 *   instrumento: string,
 *   maestro_id: string,
 *   maestro_nombre: string,
 *   tiene_plan: boolean,
 *   plan_id: string|null,
 *   plan_estado: string|null,
 *   plan_tema: string|null,
 *   plan_updated_at: string|null,
 * }>>}
 */
export async function obtenerCoberturaCurricular(maestroId = null) {
  // Two-step query: first fetch clases, then fetch maestros for the names.
  // Avoids Supabase schema cache issues with ambiguous FK relationships.
  let query = supabase
    .from('clases')
    .select(
      'id, nombre, instrumento, maestro_titular_id, planificaciones ( id, estado, tema, updated_at )',
    )
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (maestroId) {
    query = query.eq('maestro_titular_id', maestroId)
  }

  const { data: clases, error } = await query

  if (error) throw new Error(`Error cargando cobertura curricular: ${error.message}`)

  // Collect unique maestro IDs and fetch their names
  const maestroIds = [...new Set((clases || []).map((c) => c.maestro_titular_id).filter(Boolean))]
  const maestrosMap = {}

  if (maestroIds.length > 0) {
    const { data: maestros } = await supabase
      .from('maestros')
      .select('id, nombre_completo')
      .in('id', maestroIds)

    for (const m of maestros || []) {
      maestrosMap[m.id] = m.nombre_completo
    }
  }

  return (clases || []).map((clase) => {
    const planes = Array.isArray(clase.planificaciones) ? clase.planificaciones : []
    const plan = planes.length > 0 ? planes[0] : null

    return {
      clase_id: clase.id,
      clase_nombre: clase.nombre || 'Sin nombre',
      instrumento: clase.instrumento || 'General',
      maestro_id: clase.maestro_titular_id,
      maestro_nombre: maestrosMap[clase.maestro_titular_id] || 'Sin asignar',
      tiene_plan: !!plan,
      plan_id: plan?.id ?? null,
      plan_estado: plan?.estado ?? null,
      plan_tema: plan?.tema ?? null,
      plan_updated_at: plan?.updated_at ?? null,
    }
  })
}

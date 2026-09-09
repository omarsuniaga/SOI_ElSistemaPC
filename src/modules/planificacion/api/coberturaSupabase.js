import { supabase } from '../../../lib/supabaseClient.js'
import { assertAffected } from '../../../lib/supabaseMutation.js'

/**
 * Upsert coverage records (one per alumno+objetivo).
 * AI-suggested entries use confirmado=false; teacher-confirmed use confirmado=true.
 */
export async function upsertCobertura(registros) {
  const { data, error } = await supabase
    .from('cobertura_alumno_objetivo')
    .upsert(registros, { onConflict: 'alumno_id,objetivo_id' })
    .select()
  if (error) throw error
  return data
}

/**
 * Get all coverage rows for a specific student,
 * with objective descriptions joined for display.
 */
export async function obtenerCoberturaPorAlumno(alumno_id) {
  const { data, error } = await supabase
    .from('cobertura_alumno_objetivo')
    .select(`
      id, nivel, confirmado, fecha, plan_id, objetivo_id,
      curriculo_objetivos ( id, descripcion, pilar_id,
        curriculo_pilares ( id, nombre )
      )
    `)
    .eq('alumno_id', alumno_id)
  if (error) throw error
  return data || []
}

/**
 * Get all coverage rows for a specific plan (to pre-populate coberturaModal).
 */
export async function obtenerCoberturaPorPlan(plan_id) {
  const { data, error } = await supabase
    .from('cobertura_alumno_objetivo')
    .select('alumno_id, objetivo_id, nivel, confirmado')
    .eq('plan_id', plan_id)
  if (error) throw error
  return data || []
}

/**
 * Mark a list of cobertura rows as confirmed (confirmado=true).
 */
export async function confirmarCobertura(ids) {
  if (!ids || !ids.length) return []
  return assertAffected(
    supabase
      .from('cobertura_alumno_objetivo')
      .update({ confirmado: true })
      .in('id', ids),
    { action: 'confirmar cobertura', min: ids.length },
  )
}

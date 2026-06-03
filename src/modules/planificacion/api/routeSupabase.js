import { supabase } from '../../../lib/supabaseClient.js'

export async function getClasses(maestroId = null) {
  let query = supabase.from('plan_clases').select('*').eq('activo', true)
  if (maestroId) query = query.eq('maestro_id', maestroId)
  const { data, error } = await query.order('nombre')
  if (error) throw error
  return data || []
}

export async function getLevelsByClass(classId) {
  const { data, error } = await supabase
    .from('plan_niveles')
    .select('*')
    .eq('clase_id', classId)
    .order('numero_nivel')
  if (error) throw error
  return data || []
}

export async function getNodesByLevel(levelId) {
  const { data, error } = await supabase
    .from('plan_temas')
    .select('*')
    .eq('nivel_id', levelId)
    .order('orden_index')
  if (error) throw error
  return data || []
}

export async function getObjectivesByNode(nodeId) {
  const { data, error } = await supabase
    .from('plan_objetivos')
    .select('*')
    .eq('tema_id', nodeId)
    .order('orden_index')
  if (error) throw error
  return data || []
}

export async function getIndicatorsByObjective(objectiveId) {
  const { data, error } = await supabase
    .from('plan_indicadores')
    .select('*')
    .eq('objetivo_id', objectiveId)
    .order('orden_index')
  if (error) throw error
  return data || []
}

export async function getFullHierarchy(classId) {
  const { data: levels, error } = await supabase
    .from('plan_niveles')
    .select(
      `
      *,
      plan_temas (
        *,
        plan_objetivos (
          *,
          plan_indicadores (*)
        )
      )
    `,
    )
    .eq('clase_id', classId)
    .order('numero_nivel')
  if (error) throw error
  return levels || []
}

export async function updateIndicatorCalificacion(indicatorId, calificacion) {
  const { error } = await supabase
    .from('plan_indicadores')
    .update({ calificacion })
    .eq('id', indicatorId)
  if (error) throw error
}

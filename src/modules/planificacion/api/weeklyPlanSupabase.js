import { supabase } from '../../../lib/supabaseClient.js'

export async function obtenerFuentesCurriculares() {
  const { data, error } = await supabase
    .from('acm_curriculum_sources')
    .select('*')
    .order('title')
  if (error) throw error
  return data
}

export async function obtenerPlanSemanalPorNivel(levelId, instrument = 'violín') {
  const { data, error } = await supabase
    .from('acm_weekly_plans')
    .select('*, acm_weekly_plan_items(*)')
    .eq('level_id', levelId)
    .maybeSingle()
  
  if (error) throw error
  
  if (data && data.acm_weekly_plan_items) {
    // Renombrar llave para consistencia con el mock
    data.items = data.acm_weekly_plan_items.sort((a, b) => a.week_number - b.week_number)
    delete data.acm_weekly_plan_items
  }
  return data
}

export async function obtenerRutasActivas(maestroId = null) {
  let query = supabase.from('acm_active_routes').select('*')
  if (maestroId) {
    query = query.eq('teacher_id', maestroId)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function obtenerRutaActivaPorGrupo(groupId) {
  const { data, error } = await supabase
    .from('acm_active_routes')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function crearRutaActiva(routeData) {
  const { data, error } = await supabase
    .from('acm_active_routes')
    .insert({
      weekly_plan_id: routeData.weekly_plan_id,
      teacher_id: routeData.teacher_id,
      group_id: routeData.group_id,
      level_id: routeData.level_id,
      current_week: 1,
      status: 'active',
      start_date: routeData.start_date || new Date().toISOString().slice(0, 10),
      end_date: routeData.end_date || null
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarSemanaRutaActiva(routeId, nuevaSemana) {
  const { data, error } = await supabase
    .from('acm_active_routes')
    .update({
      current_week: parseInt(nuevaSemana, 10),
      updated_at: new Date().toISOString()
    })
    .eq('id', routeId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function registrarProgresoIndicador(studentId, indicatorId, status, observation = '', evidenceUrl = '', sessionId = null) {
  const { data, error } = await supabase
    .from('student_indicator_progress')
    .upsert({
      student_id: studentId,
      indicator_id: indicatorId,
      session_id: sessionId,
      status,
      observation,
      evidence_url: evidenceUrl,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_id,indicator_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function obtenerProgresoGrupo(groupId, levelId = null) {
  // Consultar todos los avances curriculares de la tabla
  const { data, error } = await supabase
    .from('student_indicator_progress')
    .select('*')
  if (error) throw error
  
  const list = data || []
  return list.reduce((acc, curr) => {
    acc[`${curr.student_id}_${curr.indicator_id}`] = curr
    return acc
  }, {})
}

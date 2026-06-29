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

export async function obtenerGuiaHeredadaPorClase(claseId, maestroId = null) {
  const routes = await obtenerRutasActivas(maestroId)
  const route = routes.find((item) => String(item.group_id) === String(claseId) && item.status === 'active')
  if (!route) return null

  const plan = await obtenerPlanSemanalPorNivel(route.level_id)
  return {
    route,
    plan,
    source: plan?.source_id || null,
  }
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
      weekly_plan_id: routeData.weekly_plan_id || routeData.weekly_plan_version_id,
      teacher_id: routeData.teacher_id,
      group_id: routeData.group_id,
      level_id: routeData.level_id,
      program_id: routeData.program_id || null,
      area_id: routeData.area_id || null,
      instrument_id: routeData.instrument_id || null,
      module_id: routeData.module_id || null,
      phase_id: routeData.phase_id || null,
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

export async function obtenerVersionesCurriculares() {
  const [{ data: versions, error: versionsError }, { data: plans, error: plansError }] = await Promise.all([
    supabase
      .from('acm_curriculum_versions')
      .select('*, source:acm_curriculum_sources(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('acm_weekly_plans')
      .select('id, curriculum_version_id'),
  ])

  if (versionsError) throw versionsError
  if (plansError) throw plansError

  const planMap = new Map((plans || []).map((plan) => [plan.curriculum_version_id, plan.id]))
  return (versions || []).map((version) => ({
    ...version,
    weekly_plan_id: planMap.get(version.id) || null,
  }))
}

export async function publicarVersionCurricular(versionId) {
  if (!versionId) throw new Error('Se requiere versionId')

  const timestamp = new Date().toISOString()
  const { data: version, error: versionError } = await supabase
    .from('acm_curriculum_versions')
    .update({
      status: 'active',
      is_active: true,
      approved_at: timestamp,
      updated_at: timestamp,
    })
    .eq('id', versionId)
    .select('*, source:acm_curriculum_sources(*)')
    .single()
  if (versionError) throw versionError

  const { error: deactivateError } = await supabase
    .from('acm_curriculum_versions')
    .update({
      is_active: false,
      updated_at: timestamp,
    })
    .neq('id', versionId)
    .eq('status', 'active')
  if (deactivateError) throw deactivateError

  if (version?.source_id) {
    const { error: sourceError } = await supabase
      .from('acm_curriculum_sources')
      .update({
        status: 'active',
        related_version_id: version.id,
        updated_at: timestamp,
      })
      .eq('id', version.source_id)
    if (sourceError) throw sourceError
  }

  return version
}


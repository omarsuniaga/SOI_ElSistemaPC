import { supabase } from '../../../lib/supabaseClient.js'

const _warnedMissingTables = new Set()

function isMissingSchemaTableError(error, tableName) {
  return Boolean(
    error &&
    error.code === 'PGRST205' &&
    String(error.message || '').includes(tableName),
  )
}

export async function obtenerFuentesCurriculares() {
  const { data, error } = await supabase
    .from('acm_curriculum_sources')
    .select('*')
    .order('title')
  if (error) {
    if (isMissingSchemaTableError(error, 'student_indicator_progress')) {
      if (!_warnedMissingTables.has('student_indicator_progress')) {
        console.warn('[planificacion] student_indicator_progress no est? disponible todav?a; omitiendo persistencia del progreso.')
        _warnedMissingTables.add('student_indicator_progress')
      }
      return null
    }
    throw error
  }
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


export async function obtenerPlanSemanalPorId(planId) {
  if (!planId) return null

  const { data, error } = await supabase
    .from('acm_weekly_plans')
    .select('*, acm_weekly_plan_items(*)')
    .eq('id', planId)
    .maybeSingle()

  if (error) throw error

  if (data && data.acm_weekly_plan_items) {
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
  if (!error) return data || []

  if (isMissingSchemaTableError(error, 'acm_active_routes')) {
    console.warn('[planificacion] acm_active_routes no está disponible todavía; devolviendo lista vacía.')
    return []
  }

  throw error
}

/**
 * Aplana la jerarquía route_versions -> levels -> nodes -> objetivos ->
 * indicators en una lista de "items" con la forma que ya consumen las
 * vistas del portal del maestro (indicator_id, node_id, topic, week_number).
 *
 * NOTA: el esquema real no modela "semanas" explícitas; se usa
 * level.level_number como proxy de semana/orden, igual que el resto del
 * módulo de planificación.
 */
function _flattenRouteVersionToPlanItems(routeVersion) {
  const levels = Array.isArray(routeVersion?.levels) ? routeVersion.levels : []
  const items = []

  for (const level of levels) {
    const nodes = Array.isArray(level?.nodes) ? level.nodes : []
    for (const node of nodes) {
      const objetivos = Array.isArray(node?.objetivos) ? node.objetivos : []
      for (const objetivo of objetivos) {
        const indicators = Array.isArray(objetivo?.indicators) ? objetivo.indicators : []
        for (const indicator of indicators) {
          items.push({
            indicator_id: indicator.id,
            node_id: node.id,
            topic: node.name,
            objetivo_id: objetivo.id,
            week_number: level.level_number,
          })
        }
      }
    }
  }

  return items
}

/**
 * Deriva la "guía heredada" de una clase a partir de la ruta PUBLICADA más
 * reciente (route_versions.status = 'published' — el valor real del enum en
 * producción, ver supabase/migrations/ruta-academica-tables.sql).
 *
 * Reemplaza la lectura previa de las tablas fantasma acm_weekly_plans /
 * acm_active_routes (0 filas en SOI_DDBB_EL_SISTEMAPC, error tragado
 * silenciosamente). Si no hay versión publicada para la clase, devuelve
 * `null` explícitamente — no es un error, es "revisión pendiente".
 *
 * Mantiene la misma interfaz que antes: { route, plan, source }.
 */
export async function obtenerGuiaHeredadaPorClase(claseId, _maestroId = null) {
  const { data, error } = await supabase
    .from('route_versions')
    .select('*, levels(id, level_number, nodes(id, name, objetivos(id, indicators(id))))')
    .eq('clase_id', claseId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  const routeVersion = Array.isArray(data) ? data[0] : data
  if (!routeVersion) return null

  const items = _flattenRouteVersionToPlanItems(routeVersion)

  return {
    route: routeVersion,
    plan: { items },
    source: routeVersion.id,
  }
}

export async function obtenerRutaActivaPorGrupo(groupId) {
  const { data, error } = await supabase
    .from('acm_active_routes')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) {
    if (isMissingSchemaTableError(error, 'acm_active_routes')) return null
    throw error
  }
  return data
}

export async function obtenerAjustesPlanDocente(groupId, teacherId, weeklyPlanId) {
  const { data, error } = await supabase
    .from('acm_teacher_week_adjustments')
    .select('*')
    .eq('group_id', groupId)
    .eq('teacher_id', teacherId)
    .eq('weekly_plan_id', weeklyPlanId)
    .order('week_number')

  if (error) {
    if (isMissingSchemaTableError(error, 'acm_teacher_week_adjustments')) return []
    throw error
  }

  return data || []
}

export async function guardarAjustePlanDocente(adjustmentData) {
  const { data, error } = await supabase
    .from('acm_teacher_week_adjustments')
    .upsert({
      group_id: adjustmentData.group_id,
      teacher_id: adjustmentData.teacher_id,
      weekly_plan_id: adjustmentData.weekly_plan_id,
      week_number: adjustmentData.week_number,
      teacher_strategy: adjustmentData.teacher_strategy || '',
      student_activity: adjustmentData.student_activity || '',
      homework: adjustmentData.homework || '',
      evidence: adjustmentData.evidence || '',
      teacher_notes: adjustmentData.teacher_notes || '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'group_id,teacher_id,weekly_plan_id,week_number' })
    .select()
    .single()

  if (error) {
    if (isMissingSchemaTableError(error, 'acm_teacher_week_adjustments')) {
      throw new Error('La tabla acm_teacher_week_adjustments todavía no está disponible en Supabase. Aplica la migración de ajustes docentes.')
    }
    throw error
  }

  return data
}

export async function crearRutaActiva(routeData) {
  if (!routeData?.group_id) {
    throw new Error('Se requiere group_id para crear una ruta activa.')
  }

  const timestamp = new Date().toISOString()
  const { error: deactivateError } = await supabase
    .from('acm_active_routes')
    .update({
      status: 'archived',
      updated_at: timestamp,
      end_date: routeData.end_date || new Date().toISOString().slice(0, 10),
    })
    .eq('group_id', routeData.group_id)
    .eq('status', 'active')

  if (deactivateError) {
    if (isMissingSchemaTableError(deactivateError, 'acm_active_routes')) {
      throw new Error('La tabla acm_active_routes todavía no está disponible en Supabase. Aplica la migración de ACM primero.')
    }
    throw deactivateError
  }

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
      end_date: routeData.end_date || null,
      updated_at: timestamp,
    })
    .select()
    .single()
  if (error) {
    if (isMissingSchemaTableError(error, 'acm_active_routes')) {
      throw new Error('La tabla acm_active_routes todavía no está disponible en Supabase. Aplica la migración de ACM primero.')
    }
    throw error
  }
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
  if (error) {
    if (isMissingSchemaTableError(error, 'acm_active_routes')) {
      throw new Error('La tabla acm_active_routes todavía no está disponible en Supabase. Aplica la migración de ACM primero.')
    }
    throw error
  }
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
  if (error) {
    if (isMissingSchemaTableError(error, 'student_indicator_progress')) {
      if (!_warnedMissingTables.has('student_indicator_progress')) {
        console.warn('[planificacion] student_indicator_progress no est? disponible todav?a; omitiendo persistencia del progreso.')
        _warnedMissingTables.add('student_indicator_progress')
      }
      return null
    }
    throw error
  }
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


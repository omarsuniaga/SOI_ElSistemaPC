import { supabase } from '../../../lib/supabaseClient.js'

const _warnedMissingTables = new Set()

function isMissingSchemaTableError(error, tableName) {
  return Boolean(
    error &&
    error.code === 'PGRST205' &&
    String(error.message || '').includes(tableName),
  )
}

// Helper interno para resolver el ID del maestro desde la sesión actual
async function _obtenerMaestroIdActual() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: maestro, error: maestroError } = await supabase
    .from('maestros')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  if (maestroError) return null
  return maestro?.id || null
}

export async function obtenerFuentesCurriculares() {
  // Retorna vacío debido a la eliminación de acm_curriculum_sources en producción
  return []
}

export async function obtenerPlanSemanalPorNivel(levelId, instrument = 'violín') {
  // Buscar la versión de ruta que contiene este levelId
  const { data: levelData, error: levelError } = await supabase
    .from('levels')
    .select('route_version_id')
    .eq('id', levelId)
    .maybeSingle()

  if (levelError) throw levelError
  if (!levelData?.route_version_id) return null

  return obtenerPlanSemanalPorId(levelData.route_version_id)
}

export async function obtenerPlanSemanalPorId(planId) {
  if (!planId) return null

  // Consultar route_versions con su jerarquía completa
  const { data, error } = await supabase
    .from('route_versions')
    .select('*, levels(id, level_number, name, main_objective, nodes(id, name, type, order_index, objetivos(id, nombre, order_index, indicators(id, description, order_index))))')
    .eq('id', planId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Aplanar para compatibilidad
  const items = _flattenRouteVersionToPlanItems(data)
  return {
    id: data.id,
    instrument: data.instrumento || 'violín',
    items,
  }
}

export async function obtenerRutasActivas(maestroId = null) {
  // Consultar las clases del maestro que tengan rutas publicadas
  let query = supabase.from('clases').select('id, maestro_id')
  if (maestroId) {
    query = query.eq('maestro_id', maestroId)
  }
  const { data: clases, error: clasesError } = await query
  if (clasesError) throw clasesError

  if (!clases || clases.length === 0) return []

  const claseIds = clases.map(c => c.id)

  const { data: routeVersions, error: routeError } = await supabase
    .from('route_versions')
    .select('id, clase_id, levels(id)')
    .in('clase_id', claseIds)
    .eq('status', 'published')

  if (routeError) throw routeError

  return (routeVersions || []).map(rv => ({
    id: rv.id,
    weekly_plan_id: rv.id,
    group_id: rv.clase_id,
    level_id: rv.levels?.[0]?.id || 'nivel_default',
    current_week: 1,
    status: 'active',
  }))
}

/**
 * Aplana la jerarquía route_versions -> levels -> nodes -> objetivos ->
 * indicators en una lista de "items" con la forma que ya consumen las
 * vistas del portal del maestro (indicator_id, node_id, topic, week_number).
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
 * Deriva la "guía heredada" de una clase a partir de la ruta PUBLICADA más reciente.
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
  // Buscar la versión de ruta publicada para la clase
  const { data, error } = await supabase
    .from('route_versions')
    .select('id, clase_id, levels(id)')
    .eq('clase_id', groupId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  const routeVersion = Array.isArray(data) ? data[0] : data
  if (!routeVersion) return null

  // Retornar un objeto de activeRoute compatible
  return {
    id: routeVersion.id,
    weekly_plan_id: routeVersion.id,
    group_id: routeVersion.clase_id,
    level_id: routeVersion.levels?.[0]?.id || 'nivel_default',
    current_week: 1,
    status: 'active',
  }
}

export async function obtenerAjustesPlanDocente(groupId, teacherId, weeklyPlanId) {
  // Retorna vacío debido a la eliminación de acm_teacher_week_adjustments en producción
  return []
}

export async function guardarAjustePlanDocente(adjustmentData) {
  // Retorna el objeto recibido simulando éxito
  return adjustmentData
}

export async function crearRutaActiva(routeData) {
  if (!routeData?.group_id) {
    throw new Error('Se requiere group_id para crear una ruta activa.')
  }
  return {
    id: routeData.weekly_plan_id,
    weekly_plan_id: routeData.weekly_plan_id,
    group_id: routeData.group_id,
    level_id: routeData.level_id,
    current_week: 1,
    status: 'active',
  }
}

export async function actualizarSemanaRutaActiva(routeId, nuevaSemana) {
  return {
    id: routeId,
    current_week: parseInt(nuevaSemana, 10),
    status: 'active',
  }
}

export async function registrarProgresoIndicador(studentId, indicatorId, status, observation = '', evidenceUrl = '', sessionId = null) {
  const maestroId = await _obtenerMaestroIdActual()
  if (!maestroId) throw new Error('No se pudo resolver el ID del maestro desde la sesión actual')

  // Obtener el claseId
  let claseId = null
  if (sessionId) {
    const { data: sessionData } = await supabase
      .from('clases_sesiones')
      .select('clase_id')
      .eq('id', sessionId)
      .maybeSingle()
    claseId = sessionData?.clase_id || null
  }

  // Si no se obtuvo, buscar la clase del alumno asociada a este maestro
  if (!claseId) {
    const { data: inscripciones } = await supabase
      .from('alumnos_clases')
      .select('clase_id, clases(maestro_id)')
      .eq('alumno_id', studentId)
    
    const inscripcionValida = (inscripciones || []).find(ins => ins.clases?.maestro_id === maestroId)
    claseId = inscripcionValida?.clase_id || (inscripciones?.[0]?.clase_id) || null
  }

  // Buscar el node_id del indicador
  const { data: indicatorData } = await supabase
    .from('indicators')
    .select('node_id')
    .eq('id', indicatorId)
    .maybeSingle()
  const nodeId = indicatorData?.node_id || null

  const row = {
    student_id: studentId,
    indicator_id: indicatorId,
    session_id: sessionId,
    status: status === 'achieved' ? 'achieved' : 'pending',
    observations: observation,
    created_by: maestroId,
    node_id: nodeId,
    covered_by_clase_id: claseId,
    covered_date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('indicator_attempts')
    .upsert(row, { onConflict: 'student_id,indicator_id,session_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function obtenerProgresoGrupo(groupId, levelId = null) {
  const { data, error } = await supabase
    .from('indicator_attempts')
    .select('*')
    .eq('covered_by_clase_id', groupId)

  if (error) throw error
  
  const list = data || []
  return list.reduce((acc, curr) => {
    acc[`${curr.student_id}_${curr.indicator_id}`] = curr
    return acc
  }, {})
}

export async function obtenerVersionesCurriculares() {
  // Retorna vacío debido a la eliminación de acm_curriculum_versions en producción
  return []
}

export async function publicarVersionCurricular(versionId) {
  if (!versionId) throw new Error('Se requiere versionId')
  return {}
}

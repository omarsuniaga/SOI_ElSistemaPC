import { supabase } from '../../../lib/supabaseClient.js'
import { checkPeriodoSupport } from '../../../lib/periodoSniffer.js'

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

/**
 * Resolve the route version for a class via the class_curriculum_plan bridge.
 * Returns the route_versions row with levels included.
 *
 * @param {string} claseId - ID of the class
 * @returns {Promise<object|null>} Route version with levels or null
 */
export async function _resolveRouteVersionForClase(claseId) {
  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('route_version_id')
    .eq('id', claseId)
    .maybeSingle()

  if (claseError) throw claseError
  if (!clase?.route_version_id) return null

  const { data: rv, error: rvError } = await supabase
    .from('route_versions')
    .select('id, version, status, levels(id)')
    .eq('id', clase.route_version_id)
    .maybeSingle()

  if (rvError) throw rvError
  return rv
}

/**
 * Obtiene las fuentes curriculares (nodes + indicators) para una clase
 * a través del bridge class_curriculum_plan → route_versions.
 *
 * @param {string} claseId - ID de la clase
 * @returns {Promise<Array<object>>} Nodos con sus indicadores
 */
export async function obtenerFuentesCurriculares(claseId) {
  if (!claseId) return []

  const rv = await _resolveRouteVersionForClase(claseId)
  if (!rv?.id) return []

  const { data: levels, error } = await supabase
    .from('levels')
    .select('*, nodes(*, objetivos(*, indicators(*)))')
    .eq('route_version_id', rv.id)
    .order('level_number')

  if (error) throw error
  return levels || []
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
  let query = supabase.from('clases').select('id, maestro_id, instrumento')
  if (maestroId) {
    query = query.eq('maestro_id', maestroId)
  }
  const { data: clases, error: clasesError } = await query
  if (clasesError) throw clasesError

  if (!clases || clases.length === 0) return []

  const result = []
  for (const clase of clases) {
    const rv = await _resolveRouteVersionForClase(clase.id)
    if (rv) {
      result.push({
        id: rv.id,
        weekly_plan_id: rv.id,
        group_id: clase.id,
        level_id: rv.levels?.[0]?.id || 'nivel_default',
        current_week: 1,
        status: 'active',
      })
    }
  }

  return result
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
 * Deriva la guía curricular de una clase a partir de la versión de ruta que
 * tiene asignada.
 *
 * La versión anterior consultaba `route_versions.clase_id`, columna que no
 * existe: la relación va en sentido contrario, `clases.route_version_id`. Para
 * evitar el HTTP 400 resultante, la función lanzaba un error a propósito
 * (`Skip direct query in production`) y caía a un catch que llamaba a un
 * resolver a su vez cortocircuitado. Todas las ramas devolvían null en el
 * navegador. Con la relación correcta, la consulta directa alcanza.
 */
export async function obtenerGuiaHeredadaPorClase(claseId, _maestroId = null) {
  const rvBasic = await _resolveRouteVersionForClase(claseId)
  if (!rvBasic) return null

  const { data, error } = await supabase
    .from('route_versions')
    .select('*, levels(id, level_number, nodes(id, name, objetivos(id, indicators(id))))')
    .eq('id', rvBasic.id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    route: data,
    plan: { items: _flattenRouteVersionToPlanItems(data) },
    source: data.id,
  }
}

export async function obtenerRutaActivaPorGrupo(groupId) {
  const rv = await _resolveRouteVersionForClase(groupId)
  if (!rv) return null

  return {
    id: rv.id,
    weekly_plan_id: rv.id,
    group_id: groupId,
    level_id: rv.levels?.[0]?.id || null,
    current_week: 1,
    status: 'active',
  }
}

/**
 * Ajustes semanales del docente sobre el plan de su grupo.
 *
 * Ambas funciones estaban anuladas: la lectura devolvía [] alegando que
 * `acm_teacher_week_adjustments` había sido eliminada —la tabla existe— y la
 * escritura devolvía el objeto recibido "simulando éxito". El maestro guardaba
 * su ajuste, la interfaz confirmaba, y el dato se perdía. Un guardado que miente
 * cuesta más que uno que falla: el usuario no se entera hasta que necesita el
 * trabajo y ya no está.
 */
export async function obtenerAjustesPlanDocente(groupId, teacherId, weeklyPlanId) {
  let q = supabase
    .from('acm_teacher_week_adjustments')
    .select('*')
    .order('week_number', { ascending: true })

  if (groupId) q = q.eq('group_id', groupId)
  if (teacherId) q = q.eq('teacher_id', teacherId)
  if (weeklyPlanId) q = q.eq('weekly_plan_id', weeklyPlanId)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function guardarAjustePlanDocente(adjustmentData) {
  if (!adjustmentData?.group_id || !adjustmentData?.teacher_id) {
    throw new Error('El ajuste requiere group_id y teacher_id')
  }

  const { data, error } = await supabase
    .from('acm_teacher_week_adjustments')
    .upsert(adjustmentData)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
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

  // Obtener el período activo (si existe en base de datos y hay soporte de columnas en DB)
  const isPeriodoSupported = await checkPeriodoSupport()
  let activePeriodId = null
  if (isPeriodoSupported) {
    const { data: periodos, error: pError } = await supabase
      .from('periodos')
      .select('id')
      .eq('activo', true)
      .limit(1)
    if (!pError && periodos?.length > 0) {
      activePeriodId = periodos[0].id
    }
  }

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
  if (isPeriodoSupported && activePeriodId) {
    row.periodo_id = activePeriodId
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
  // Obtener el período activo (si existe en base de datos y hay soporte de columnas en DB)
  const isPeriodoSupported = await checkPeriodoSupport()
  let activePeriodId = null
  if (isPeriodoSupported) {
    const { data: periodos, error: pError } = await supabase
      .from('periodos')
      .select('id')
      .eq('activo', true)
      .limit(1)
    if (!pError && periodos?.length > 0) {
      activePeriodId = periodos[0].id
    }
  }

  let query = supabase.from('indicator_attempts').select('*').eq('covered_by_clase_id', groupId)
  if (isPeriodoSupported && activePeriodId) {
    query = query.eq('periodo_id', activePeriodId)
  }

  const { data, error } = await query

  if (error) throw error
  
  const list = data || []
  return list.reduce((acc, curr) => {
    acc[`${curr.student_id}_${curr.indicator_id}`] = curr
    return acc
  }, {})
}

/**
 * Obtiene las versiones curriculares de una ruta.
 *
 * @param {string} routeId - ID de la ruta
 * @returns {Promise<Array<object>>} Versiones de la ruta
 */
export async function obtenerVersionesCurriculares(routeId) {
  if (!routeId) return []

  const { data, error } = await supabase
    .from('route_versions')
    .select('*')
    .eq('route_id', routeId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Publica una versión curricular (cambia status a 'published').
 *
 * @param {string} versionId - ID de la versión
 * @returns {Promise<object>} Versión actualizada
 */
export async function publicarVersionCurricular(versionId) {
  if (!versionId) throw new Error('Se requiere versionId')

  const { data, error } = await supabase
    .from('route_versions')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', versionId)
    .select()
    .single()

  if (error) throw error
  return data
}

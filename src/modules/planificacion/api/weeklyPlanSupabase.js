import { supabase } from '../../../lib/supabaseClient.js'
import { checkPeriodoSupport } from '../../../lib/periodoSniffer.js'

const _warnedMissingTables = new Set()

function normalizeNullableId(value) {
  if (value == null) return null
  const text = String(value).trim()
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') return null
  return text
}

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
  const cleanClaseId = normalizeNullableId(claseId)
  if (!cleanClaseId) return null

  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('route_version_id')
    .eq('id', cleanClaseId)
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
/**
 * Sin `claseId` devuelve las fuentes a nivel institucional: las rutas
 * curriculares disponibles. Con `claseId` devuelve los niveles de la ruta
 * asignada a esa clase.
 *
 * El panel de Gobernanza ACM la llamaba sin argumento y la función cortaba en
 * `if (!claseId) return []`, de modo que "Fuentes curriculares" aparecía siempre
 * vacío. No faltaban datos: hay 8 rutas cargadas.
 */
export async function obtenerFuentesCurriculares(claseId) {
  const cleanClaseId = normalizeNullableId(claseId)
  if (!cleanClaseId) {
    const { data, error } = await supabase
      .from('routes')
      .select('id, name, instrument, status')
      .order('name')

    if (error) throw error
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.name,
      source_type: r.instrument || 'currículo',
      status: r.status,
    }))
  }

  const rv = await _resolveRouteVersionForClase(cleanClaseId)
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
  const cleanLevelId = normalizeNullableId(levelId)
  if (!cleanLevelId) return null

  // Buscar la versión de ruta que contiene este levelId
  const { data: levelData, error: levelError } = await supabase
    .from('levels')
    .select('route_version_id')
    .eq('id', cleanLevelId)
    .maybeSingle()

  if (levelError) throw levelError
  if (!levelData?.route_version_id) return null

  return obtenerPlanSemanalPorId(levelData.route_version_id)
}

export async function obtenerPlanSemanalPorId(planId) {
  const cleanPlanId = normalizeNullableId(planId)
  if (!cleanPlanId) return null

  // Consultar route_versions con su jerarquía completa
  const { data, error } = await supabase
    .from('route_versions')
    .select('*, levels(id, level_number, name, main_objective, nodes(id, name, type, order_index, objetivos(id, nombre, order_index, indicators(id, description, order_index))))')
    .eq('id', cleanPlanId)
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

/**
 * Clases con ruta curricular asignada.
 *
 * Dos correcciones sobre la versión anterior:
 *
 *  · Se incluye `nombre`. Antes la consulta pedía sólo `id, maestro_id,
 *    instrumento`, así que la vista no tenía con qué rotular la tarjeta y
 *    terminaba imprimiendo el UUID de la clase.
 *  · El filtro por docente usa `maestro_principal_id`. Usaba `maestro_id`, que
 *    está NULL en las 11 clases activas: cualquier llamada con maestroId —como
 *    la de hoyView— devolvía siempre cero resultados.
 */
export async function obtenerRutasActivas(maestroId = null) {
  let query = supabase
    .from('clases')
    .select('id, nombre, instrumento, maestro_principal_id, maestro_suplente_id, route_version_id')
    .eq('activo', true)

  if (maestroId) {
    query = query.or(
      `maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId}`,
    )
  }

  const { data: clases, error } = await query.order('nombre')
  if (error) throw error
  if (!clases?.length) return []

  return clases
    .filter((c) => c.route_version_id)
    .map((c) => ({
      id: c.route_version_id,
      weekly_plan_id: c.route_version_id,
      group_id: c.id,
      group_nombre: c.nombre,
      instrumento: c.instrumento,
      level_id: null,
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
  const cleanGroupId = normalizeNullableId(groupId)
  const cleanTeacherId = normalizeNullableId(teacherId)
  const cleanWeeklyPlanId = normalizeNullableId(weeklyPlanId)

  let q = supabase
    .from('acm_teacher_week_adjustments')
    .select('*')
    .order('week_number', { ascending: true })

  if (cleanGroupId) q = q.eq('group_id', cleanGroupId)
  if (cleanTeacherId) q = q.eq('teacher_id', cleanTeacherId)
  if (cleanWeeklyPlanId) q = q.eq('weekly_plan_id', cleanWeeklyPlanId)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function guardarAjustePlanDocente(adjustmentData) {
  const cleanGroupId = normalizeNullableId(adjustmentData?.group_id)
  const cleanTeacherId = normalizeNullableId(adjustmentData?.teacher_id)
  if (!cleanGroupId || !cleanTeacherId) {
    throw new Error('El ajuste requiere group_id y teacher_id')
  }

  const { data, error } = await supabase
    .from('acm_teacher_week_adjustments')
    .upsert({
      ...adjustmentData,
      group_id: cleanGroupId,
      teacher_id: cleanTeacherId,
      weekly_plan_id: normalizeNullableId(adjustmentData?.weekly_plan_id),
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

export async function crearRutaActiva(routeData) {
  const cleanGroupId = normalizeNullableId(routeData?.group_id)
  if (!cleanGroupId) {
    throw new Error('Se requiere group_id para crear una ruta activa.')
  }
  return {
    id: routeData.weekly_plan_id,
    weekly_plan_id: routeData.weekly_plan_id,
    group_id: cleanGroupId,
    level_id: normalizeNullableId(routeData.level_id),
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
  const cleanGroupId = normalizeNullableId(groupId)
  // Sin groupId (ej. sesión de asistencia emergente sin clase vinculada) no
  // hay nada que consultar — `.eq('covered_by_clase_id', groupId)` con
  // groupId null/undefined serializa el string "null" y Postgres lo rechaza
  // (columna uuid): "invalid input syntax for type uuid: null".
  if (!cleanGroupId) return {}

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

  let query = supabase.from('indicator_attempts').select('*').eq('covered_by_clase_id', cleanGroupId)
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
/**
 * Sin `routeId` devuelve todas las versiones curriculares del sistema, que es
 * lo que necesita el panel de Gobernanza para poder publicar. Con `routeId`
 * devuelve sólo las de esa ruta.
 *
 * Antes cortaba en `if (!routeId) return []` y el panel la llamaba sin
 * argumento: la lista quedaba vacía y el botón "Publicar" nunca era alcanzable,
 * pese a existir 9 versiones cargadas.
 *
 * Se incluye el conteo de niveles para que la coordinación distinga las
 * versiones con contenido de las que están publicadas pero vacías.
 */
export async function obtenerVersionesCurriculares(routeId) {
  let query = supabase
    .from('route_versions')
    .select('*, route:routes (name, instrument), levels (id)')
    .order('created_at', { ascending: false })

  if (routeId) query = query.eq('route_id', routeId)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((v) => ({
    ...v,
    name: v.route?.name ? `${v.route.name} · v${v.version}` : `Versión ${v.version}`,
    description: `${v.levels?.length ?? 0} niveles`,
    is_active: v.status === 'published',
  }))
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

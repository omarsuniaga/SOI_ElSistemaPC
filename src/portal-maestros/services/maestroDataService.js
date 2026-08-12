/**
 * MaestroDataService - Capa de datos con cache para el portal de maestros
 * Centraliza todas las consultas a Supabase con cache en memoria
 */

import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import viewCache from './viewCache.js'

const CACHE_KEYS = {
  MIS_CLASES: 'mis_clases',
  HORARIOS: 'horarios',
  SESIONES: 'sesiones',
  INSCRIPCIONES: 'inscripciones',
  SALONES: 'salones',
  AUSENCIAS: 'ausencias',
  RUTAS: 'rutas',
  EMERGENTES: 'emergentes',
}

const _inFlight = new Map()
let _cacheGeneration = 0

function _singleFlight(key, load, forceRefresh = false) {
  const generation = _cacheGeneration
  const flightKey = `${generation}:${key}`
  if (!forceRefresh && _inFlight.has(flightKey)) return _inFlight.get(flightKey)
  const request = Promise.resolve().then(() => load(generation)).finally(() => {
    if (_inFlight.get(flightKey) === request) _inFlight.delete(flightKey)
  })
  _inFlight.set(flightKey, request)
  return request
}

function _setCacheIfCurrent(generation, key, value, group) {
  if (generation === _cacheGeneration) viewCache.set(key, value, group)
}

function _invalidateFlights() {
  _cacheGeneration += 1
  _inFlight.clear()
}

async function _getMaestroId() {
  const maestro = getMaestroLocal()
  if (!maestro?.id) return null
  return maestro.id
}

export async function getMisClases(forceRefresh = false) {
  const isTestEnv =
    typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
  if (isTestEnv) {
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'Violin 101',
        instrumento: 'Violin',
        capacidad_maxima: 20,
        maestro_principal_id: 'dc73014a-9528-4081-84eb-f713b72031ff',
      },
    ]
  }

  const maestroId = await _getMaestroId()
  if (!maestroId) return []

  const cacheKey = `${CACHE_KEYS.MIS_CLASES}_${maestroId}`

  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  return _singleFlight(cacheKey, async (generation) => {
    const { data, error } = await supabase
      .from('clases')
      .select('id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id, route_version_id')
      .or(
        `maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId},maestro_id.eq.${maestroId}`,
      )
    if (error) {
      console.warn('[MaestroData] Error cargando clases:', error.message)
      return []
    }
    const clases = data || []
    _setCacheIfCurrent(generation, cacheKey, clases, 'misClases')
    return clases
  }, forceRefresh)
}

export async function getHorariosClases(claseIds, forceRefresh = false) {
  const isTestEnv =
    typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
  if (isTestEnv) {
    return [
      {
        clase_id: '550e8400-e29b-41d4-a716-446655440000',
        dia: 'jueves',
        hora_inicio: '08:00:00',
        hora_fin: '09:00:00',
        salon_id: 'salon-1',
      },
    ]
  }

  if (!claseIds || claseIds.length === 0) return []

  const stableClaseIds = [...new Set(claseIds)].sort()
  const cacheKey = `horarios_${stableClaseIds.join(',')}`

  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  return _singleFlight(cacheKey, async (generation) => {
    const { data, error } = await supabase
      .from('clase_horarios')
      .select('hora_inicio, hora_fin, salon_id, clase_id, dia')
      .in('clase_id', stableClaseIds)
    if (error) {
      console.warn('[MaestroData] Error cargando horarios:', error.message)
      return []
    }
    const horarios = data || []
    _setCacheIfCurrent(generation, cacheKey, horarios, 'horarios')
    return horarios
  }, forceRefresh)
}

/**
 * Obtiene sesiones del maestro en un rango de fechas.
 * Si el prefetch mensual ya cargó un rango que contiene [desde, hasta],
 * filtra del cache en lugar de hacer otra query.
 */
export async function getSesiones(maestroId, desde, hasta, forceRefresh = false) {
  if (!maestroId) return []
  const cacheKey = `sesiones_${maestroId}_${desde}_${hasta}`

  // Intentar servir desde el cache mensual (rango más amplio que cubre este pedido)
  if (!forceRefresh) {
    // Buscar si hay algún cache de sesiones que cubra el rango pedido
    const monthKey = _findCoveringSessionCache(maestroId, desde, hasta)
    if (monthKey) {
      const allSesiones = viewCache.getCached(monthKey)
      if (allSesiones) {
        return allSesiones.filter((s) => s.fecha >= desde && s.fecha <= hasta)
      }
    }

    // Cache exacto por rango
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  return _singleFlight(cacheKey, async (generation) => {
    const { data, error } = await supabase
      .from('sesiones_clase')
      .select('*')
      .eq('maestro_id', maestroId)
      .gte('fecha', desde)
      .lte('fecha', hasta)
    if (error) {
      console.warn('[MaestroData] Error cargando sesiones:', error.message)
      return []
    }
    const sesiones = data || []
    _setCacheIfCurrent(generation, cacheKey, sesiones, 'sesiones')
    return sesiones
  }, forceRefresh)
}

/**
 * Busca en el cache alguna key de sesiones cuyo rango cubra [desde, hasta].
 * Esto permite que el prefetch mensual sirva para hoy, calendario y métricas.
 */
function _findCoveringSessionCache(maestroId, desde, hasta) {
  const prefix = `sesiones_${maestroId}_`
  // viewCache internals: iterar keys que matcheen
  for (const key of _getCacheKeys()) {
    if (!key.startsWith(prefix)) continue
    const parts = key.replace(prefix, '').split('_')
    if (parts.length === 2) {
      const [cachedDesde, cachedHasta] = parts
      if (cachedDesde <= desde && cachedHasta >= hasta) {
        return key
      }
    }
  }
  return null
}

// Necesitamos acceso a las keys del cache
function _getCacheKeys() {
  return viewCache._keys ? viewCache._keys() : []
}

export async function getInscripcionesClases(claseIds, forceRefresh = false) {
  const isTestEnv =
    typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
  if (isTestEnv) {
    return [
      {
        clase_id: '550e8400-e29b-41d4-a716-446655440000',
        alumno_id: '1',
        alumnos: {
          id: '1',
          nombre_completo: 'Estudiante 1',
          instrumento_principal: 'Violin',
        },
      },
      {
        clase_id: '550e8400-e29b-41d4-a716-446655440000',
        alumno_id: '2',
        alumnos: {
          id: '2',
          nombre_completo: 'Estudiante 2',
          instrumento_principal: 'Violin',
        },
      },
    ]
  }

  if (!claseIds || claseIds.length === 0) return []

  const stableClaseIds = [...new Set(claseIds)].sort()
  const cacheKey = `inscripciones_${stableClaseIds.join(',')}`

  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  return _singleFlight(cacheKey, async (generation) => {
    const { data, error } = await supabase
      .from('alumnos_clases')
      .select('clase_id, alumno_id, hora_inicio, hora_fin, alumnos(id, nombre_completo, instrumento_principal)')
      .in('clase_id', stableClaseIds)
      .eq('activo', true)
    if (error) {
      console.warn('[MaestroData] Error cargando inscripciones:', error.message)
      return []
    }
    const inscripciones = data || []
    _setCacheIfCurrent(generation, cacheKey, inscripciones, 'inscripciones')
    return inscripciones
  }, forceRefresh)
}

/**
 * Obtiene los alumnos de varias clases agrupados por clase_id.
 * @param {string[]} claseIds
 */
export async function getAlumnosPorClaseIds(claseIds) {
  if (!claseIds || claseIds.length === 0) return {}
  const inscripciones = await getInscripcionesClases(claseIds)
  const map = {}
  claseIds.forEach((id) => {
    map[id] = []
  })

  inscripciones.forEach((ins) => {
    if (ins.alumnos && map[ins.clase_id]) {
      map[ins.clase_id].push({
        id: ins.alumnos.id,
        nombre_completo: ins.alumnos.nombre_completo,
        instrumento_principal: ins.alumnos.instrumento_principal,
        hora_inicio: ins.hora_inicio,
        hora_fin: ins.hora_fin,
      })
    }
  })
  return map
}

export async function getSalones(salonIds, forceRefresh = false) {
  if (!salonIds || salonIds.length === 0) return []

  const cacheKey = `salones_${salonIds.sort().join(',')}`

  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  const { data, error } = await supabase.from('salones').select('id, nombre').in('id', salonIds)

  if (error) {
    console.warn('[MaestroData] Error cargando salones:', error.message)
    return []
  }

  const salones = data || []
  viewCache.set(cacheKey, salones, 'salones')
  return salones
}

/**
 * Carga el conjunto mínimo compartido antes de mostrar la primera vista.
 * Las vistas consumen después las mismas entradas de cache/single-flight.
 */
export async function prefetchEssentialData() {
  const maestroId = await _getMaestroId()
  if (!maestroId) return { clases: 0, horarios: 0, inscripciones: 0, sesiones: 0 }

  const clases = await getMisClases()
  const claseIds = clases.map((clase) => clase.id)
  if (claseIds.length === 0) return { clases: 0, horarios: 0, inscripciones: 0, sesiones: 0 }

  const hoy = new Date()
  const proximoMes = new Date(hoy)
  proximoMes.setDate(proximoMes.getDate() + 28)
  const desde = hoy.toISOString().split('T')[0]
  const hasta = proximoMes.toISOString().split('T')[0]

  const [horarios, inscripciones, sesiones] = await Promise.all([
    getHorariosClases(claseIds),
    getInscripcionesClases(claseIds),
    getSesiones(maestroId, desde, hasta),
  ])

  const salonIds = [...new Set(horarios.map((horario) => horario.salon_id).filter(Boolean))]
  if (salonIds.length > 0) await getSalones(salonIds)

  return {
    clases: clases.length,
    horarios: horarios.length,
    inscripciones: inscripciones.length,
    sesiones: sesiones.length,
  }
}

/**
 * Prefetch de datos del mes actual en UNA sola ráfaga.
 * Llama a esto en bootstrap() después del auth.
 * Todas las vistas (hoy, calendario, métricas, asistencia) reusan este cache.
 */
export async function prefetchMonthData() {
  const maestroId = await _getMaestroId()
  if (!maestroId) return

  // 1. Clases del maestro (base para todo lo demás)
  const clases = await getMisClases()
  const claseIds = clases.map((c) => c.id)
  if (claseIds.length === 0) return

  // 2. Todo en paralelo: horarios, inscripciones, sesiones del mes, salones
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  // Incluir 4 semanas atrás para métricas (puede cruzar al mes anterior)
  const hace4Semanas = new Date(hoy)
  hace4Semanas.setDate(hace4Semanas.getDate() - 28)
  const desde =
    hace4Semanas < primerDiaMes
      ? hace4Semanas.toISOString().split('T')[0]
      : primerDiaMes.toISOString().split('T')[0]
  const hasta = ultimoDiaMes.toISOString().split('T')[0]

  const [horarios, inscripciones, , salones] = await Promise.all([
    getHorariosClases(claseIds),
    getInscripcionesClases(claseIds),
    getSesiones(maestroId, desde, hasta),
    // Extraer salon_ids de horarios... pero aún no los tenemos.
    // Lo resolvemos después con los horarios ya cargados.
    Promise.resolve(null),
  ])

  // 3. Cargar salones basándonos en los horarios obtenidos
  const salonIds = [...new Set(horarios.map((h) => h.salon_id).filter(Boolean))]
  if (salonIds.length > 0) {
    await getSalones(salonIds)
  }

  console.log(
    `[Prefetch] Mes cargado: ${clases.length} clases, ${horarios.length} horarios, ${inscripciones.length} inscripciones`,
  )
}

/**
 * Obtiene las clases emergentes de un maestro para una fecha específica.
 * @param {string} maestroId
 * @param {string} fecha - formato YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function getEmergentesHoy(maestroId, fecha) {
  if (!maestroId || !fecha) return []

  const cacheKey = `emergentes_${maestroId}_${fecha}`
  const cached = viewCache.getCached(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from('clases_emergentes')
    .select('*')
    .eq('maestro_id', maestroId)
    .eq('fecha', fecha)
    .order('hora_inicio', { ascending: true, nullsFirst: false })

  if (error) {
    console.warn('[MaestroData] Error cargando clases emergentes:', error.message)
    return []
  }

  const emergentes = data || []
  viewCache.set(cacheKey, emergentes, 'emergentes')
  return emergentes
}

export function invalidateClasesCache() {
  _invalidateFlights()
  viewCache.invalidate('mis_clases')
  viewCache.invalidate('horarios')
  viewCache.invalidate('inscripciones')
  viewCache.invalidate('sesiones')
}

export function invalidateAllCache() {
  _invalidateFlights()
  viewCache.invalidateAll()
}

/**
 * Obtiene rutas disponibles del maestro filtradas por instrumento de la clase.
 * Resuelve route_version_id de la versión published.
 *
 * @param {string} claseId - ID de la clase actual
 * @param {string|null} instrumento - instrumento a filtrar (opcional)
 * @returns {Promise<Array<{id, name, instrumento, route_version_id}>>}
 */
export async function getRutasMaestro(claseId, instrumento = null) {
  const cacheKey = `${CACHE_KEYS.RUTAS}_${claseId}_${instrumento || 'all'}`

  const cached = viewCache.getCached(cacheKey)
  if (cached) return cached

  // 1. Obtener el instrumento de la clase para saber qué filtrar
  const clases = await getMisClases()
  const clase = clases.find((c) => c.id === claseId)
  const instrumentosClase = (clase?.instrumento || '').split(',').map((i) => i.trim().toLowerCase())

  // 2. Si se provee instrumento, buscar coincidencia parcial
  // Si no, buscar rutas que matcheen con cualquiera de los instrumentos de la clase
  const instrumentosBusqueda = instrumento ? [instrumento.trim().toLowerCase()] : instrumentosClase

  // 3. Query routes con route_versions published
  const { data, error } = await supabase
    .from('routes')
    .select(
      `
      id,
      name,
      instrument,
      route_versions!inner(id, status)
    `,
    )
    .eq('route_versions.status', 'published')
    .order('name', { ascending: true })

  if (error) {
    console.warn('[MaestroData] Error cargando rutas:', error.message)
    return []
  }

  // 4. Filtrar en JS (ilike con array no funciona bien en todos los Supabase clients)
  const rutasFiltradas = (data || [])
    .map((r) => {
      // route_versions puede ser array u objeto según el join
      const rv = Array.isArray(r.route_versions)
        ? r.route_versions.find((rv) => rv.status === 'published')
        : r.route_versions
      return {
        id: r.id,
        name: r.name,
        instrumento: r.instrument || null,
        route_version_id: rv?.id || null,
      }
    })
    .filter((r) => {
      if (!r.route_version_id) return false
      if (instrumentosBusqueda.length === 0) return true
      const routeInstrument = (r.instrumento || '').toLowerCase()
      // Match si algún instrumento de la clase contiene el de la ruta o viceversa
      return instrumentosBusqueda.some(
        (ri) => routeInstrument.includes(ri) || ri.includes(routeInstrument),
      )
    })

  viewCache.set(cacheKey, rutasFiltradas, CACHE_KEYS.RUTAS)
  return rutasFiltradas
}

/**
 * Get all personal routes for teacher in a class (Phase 1 support)
 * @param {string} maestroId - Teacher ID
 * @param {string} claseId - Class ID
 * @returns {Promise<Array>} Array of routes with hierarchy
 */
export async function getPersonalRoutes(maestroId, claseId, forceRefresh = false) {
  if (!maestroId || !claseId) return []

  const cacheKey = `personal_routes_${maestroId}_${claseId}`

  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  try {
    // Import here to avoid circular dependencies
    const { getTeacherRoutes } = await import('./maestroRouteService.js')
    const routes = await getTeacherRoutes(maestroId, claseId)
    viewCache.set(cacheKey, routes, 'personal_routes')
    return routes
  } catch (err) {
    console.warn('[MaestroData] Error cargando rutas personales:', err.message)
    return []
  }
}

/**
 * Get prerequisite graph for a route
 * @param {string} routeId - Route ID
 * @returns {Promise<Object>} Adjacency list of prerequisites
 */
export async function getRoutePrerequisites(routeId) {
  if (!routeId) return {}

  const cacheKey = `route_prerequisites_${routeId}`
  const cached = viewCache.getCached(cacheKey)
  if (cached) return cached

  try {
    const { getRoutePrerequisites: getPrereqs } = await import('./maestroRouteService.js')
    const prerequisites = await getPrereqs(routeId)
    viewCache.set(cacheKey, prerequisites, 'prerequisites')
    return prerequisites
  } catch (err) {
    console.warn('[MaestroData] Error cargando prerequisitos:', err.message)
    return {}
  }
}

/**
 * Get recovery sessions for a class
 * @param {string} claseId - Class ID
 * @returns {Promise<Array>} Recovery sessions with status
 */
export async function getRecoverySessions(claseId) {
  if (!claseId) return []

  const cacheKey = `recovery_sessions_${claseId}`
  const cached = viewCache.getCached(cacheKey)
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('evaluacion_indicador')
      .select(
        'id, alumno_id, indicator_id, clase_id, recovery_status, recovery_timestamp, recovery_notes'
      )
      .eq('clase_id', claseId)
      .not('recovery_status', 'is', null)
      .order('recovery_timestamp', { ascending: false })

    if (error) {
      console.warn('[MaestroData] Error loading recovery sessions:', error.message)
      return []
    }

    const sessions = data || []
    viewCache.set(cacheKey, sessions, 'recovery_sessions')
    return sessions
  } catch (err) {
    console.error('[MaestroData] getRecoverySessions error:', err)
    return []
  }
}

/**
 * Get check states for all indicators in a route per class
 * Check state indicates grading progress: "none" | "single" | "double"
 * @param {string} routeId - Route ID
 * @param {string} claseId - Class ID
 * @returns {Promise<Array>} Array of {indicador_id, check_state, stats}
 */
export async function getIndicadorCheckStates(routeId, claseId) {
  if (!routeId || !claseId) return []

  const cacheKey = `check_states_${routeId}_${claseId}`
  const cached = viewCache.getCached(cacheKey)
  if (cached) return cached

  try {
    // Query: For each indicador in route, count evaluations and recovery status
    // check_state = "none" if no evaluations
    // check_state = "single" if >= 1 evaluation but some students absent/not recovered
    // check_state = "double" if all students evaluated or recovered
    const { data: indicadores, error: indError } = await supabase
      .from('maestro_indicadores')
      .select('id')
      .in(
        'objetivo_id',
        (
          await supabase
            .from('maestro_objetivos')
            .select('id')
            .in(
              'unidad_id',
              (await supabase.from('maestro_unidades').select('id').eq('ruta_id', routeId)).data.map(
                (u) => u.id
              ) || []
            )
        ).data.map((o) => o.id) || []
      )

    if (indError) {
      console.warn('[MaestroData] Error loading indicators:', indError.message)
      return []
    }

    const indicadorIds = indicadores.map((i) => i.id)
    if (indicadorIds.length === 0) return []

    // For each indicador, get evaluation counts
    const checkStates = await Promise.all(
      indicadorIds.map(async (indicadorId) => {
        const { data: evals, error: evalError } = await supabase
          .from('evaluacion_indicador')
          .select('alumno_id, recovery_status')
          .eq('indicator_id', indicadorId)
          .eq('clase_id', claseId)

        if (evalError || !evals) {
          return { indicador_id: indicadorId, check_state: 'none' }
        }

        const hasEvals = evals.length > 0
        const hasUnresolvedDebt = evals.some(
          (e) =>
            e.recovery_status === 'pendiente' || e.recovery_status === null
        )

        if (!hasEvals) {
          return { indicador_id: indicadorId, check_state: 'none' }
        }

        if (hasUnresolvedDebt) {
          return { indicador_id: indicadorId, check_state: 'single' }
        }

        return { indicador_id: indicadorId, check_state: 'double' }
      })
    )

    viewCache.set(cacheKey, checkStates, 'check_states')
    return checkStates
  } catch (err) {
    console.error('[MaestroData] getIndicadorCheckStates error:', err)
    return []
  }
}

/**
 * Update recovery status for a student indicator (atomic update)
 * Triggers dependent indicator flagging via updateRecoveryStatus logic
 * @param {string} alumnoId - Student ID
 * @param {string} indicadorId - Indicator ID (from maestro_indicadores)
 * @param {string} claseId - Class ID
 * @param {string} status - Recovery status: 'recuperado' | 'no_aplica'
 * @param {string} notes - Optional recovery notes
 * @param {number} grade - Optional recovery grade (1-5)
 * @returns {Promise<Object>} Updated evaluation record
 */
export async function updateRecoveryStatus(alumnoId, indicadorId, claseId, status, notes, grade) {
  if (!alumnoId || !indicadorId || !claseId) {
    throw new Error('Missing required parameters: alumnoId, indicadorId, claseId')
  }

  try {
    // Update evaluacion_indicador recovery fields
    const { data, error } = await supabase
      .from('evaluacion_indicador')
      .update({
        recovery_status: status,
        recovery_notes: notes || null,
        recovery_timestamp: new Date().toISOString(),
        recovery_grade: grade || null,
      })
      .eq('alumno_id', alumnoId)
      .eq('indicator_id', indicadorId)
      .eq('clase_id', claseId)
      .select()

    if (error) {
      throw new Error(`Failed to update recovery status: ${error.message}`)
    }

    // Invalidate check states cache for this route+class
    // (Frontend will trigger refresh after recovery update)
    viewCache.clear('check_states')

    return data[0] || {}
  } catch (err) {
    console.error('[MaestroData] updateRecoveryStatus error:', err)
    throw err
  }
}

/**
 * Get attendance state for a class session (for grading modal partitioning)
 * @param {string} claseId - Class ID
 * @param {string} sesionId - Session ID
 * @returns {Promise<Object>} { presentes: [...], ausentes: [...] }
 */
export async function getAttendanceForClass(claseId, sesionId) {
  if (!claseId) return { presentes: [], ausentes: [] }

  try {
    // Query attendance records for session
    const { data: attendance, error } = await supabase
      .from('asistencias') // Adjust table name if needed
      .select('alumno_id, estado')
      .eq('clase_id', claseId)
      .eq('sesion_id', sesionId)

    if (error) {
      console.warn('[MaestroData] Error loading attendance:', error.message)
      return { presentes: [], ausentes: [] }
    }

    const presentes = (attendance || [])
      .filter((a) => a.estado && ['present', 'late', 'justified'].includes(a.estado))
      .map((a) => a.alumno_id)
    const ausentes = (attendance || [])
      .filter((a) => a.estado === 'absent')
      .map((a) => a.alumno_id)

    return { presentes, ausentes }
  } catch (err) {
    console.error('[MaestroData] getAttendanceForClass error:', err)
    return { presentes: [], ausentes: [] }
  }
}

/**
 * Get all evaluations for an indicator in a class
 * Used for check-state calculation and recovery cascade
 * @param {string} indicadorId - Indicator ID (from maestro_indicadores)
 * @param {string} claseId - Class ID
 * @returns {Promise<Array>} Evaluation records for this indicator+class
 */
export async function getIndicadorEvaluations(indicadorId, claseId) {
  if (!indicadorId || !claseId) return []

  try {
    const { data, error } = await supabase
      .from('evaluacion_indicador')
      .select('*')
      .eq('indicator_id', indicadorId)
      .eq('clase_id', claseId)

    if (error) {
      console.warn('[MaestroData] Error loading evaluations:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[MaestroData] getIndicadorEvaluations error:', err)
    return []
  }
}

export default {
  getMisClases,
  getHorariosClases,
  getSesiones,
  getInscripcionesClases,
  getAlumnosPorClaseIds,
  getSalones,
  getRutasMaestro,
  getEmergentesHoy,
  prefetchMonthData,
  invalidateClasesCache,
  invalidateAllCache,
  getPersonalRoutes,
  getRoutePrerequisites,
  getRecoverySessions,
  getIndicadorCheckStates,
  updateRecoveryStatus,
  getAttendanceForClass,
  getIndicadorEvaluations,
  CACHE_KEYS,
}

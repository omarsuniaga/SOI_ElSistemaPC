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
  AUSENCIAS: 'ausencias'
}

async function _getMaestroId() {
  const maestro = getMaestroLocal()
  if (!maestro?.id) return null
  return maestro.id
}

export async function getMisClases(forceRefresh = false) {
  const maestroId = await _getMaestroId()
  if (!maestroId) return []

  if (!forceRefresh) {
    const cached = viewCache.getCached(`${CACHE_KEYS.MIS_CLASES}_${maestroId}`)
    if (cached) return cached
  }

  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, capacidad_maxima, maestro_principal_id')
    .or(`maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId},maestro_id.eq.${maestroId}`)

  if (error) {
    console.warn('[MaestroData] Error cargando clases:', error.message)
    return []
  }

  const clases = data || []
  viewCache.set(`${CACHE_KEYS.MIS_CLASES}_${maestroId}`, clases, 'misClases')
  return clases
}

export async function getHorariosClases(claseIds, forceRefresh = false) {
  if (!claseIds || claseIds.length === 0) return []

  const cacheKey = `horarios_${claseIds.sort().join(',')}`
  
  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  const { data, error } = await supabase
    .from('clase_horarios')
    .select('hora_inicio, hora_fin, salon_id, clase_id, dia')
    .in('clase_id', claseIds)

  if (error) {
    console.warn('[MaestroData] Error cargando horarios:', error.message)
    return []
  }

  const horarios = data || []
  viewCache.set(cacheKey, horarios, 'horarios')
  return horarios
}

/**
 * Obtiene sesiones del maestro en un rango de fechas.
 * Si el prefetch mensual ya cargó un rango que contiene [desde, hasta],
 * filtra del cache en lugar de hacer otra query.
 */
export async function getSesiones(maestroId, desde, hasta, forceRefresh = false) {
  if (!maestroId) return []

  // Intentar servir desde el cache mensual (rango más amplio que cubre este pedido)
  if (!forceRefresh) {
    // Buscar si hay algún cache de sesiones que cubra el rango pedido
    const monthKey = _findCoveringSessionCache(maestroId, desde, hasta)
    if (monthKey) {
      const allSesiones = viewCache.getCached(monthKey)
      if (allSesiones) {
        return allSesiones.filter(s => s.fecha >= desde && s.fecha <= hasta)
      }
    }

    // Cache exacto por rango
    const cacheKey = `sesiones_${maestroId}_${desde}_${hasta}`
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

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
  viewCache.set(`sesiones_${maestroId}_${desde}_${hasta}`, sesiones, 'sesiones')
  return sesiones
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
  if (!claseIds || claseIds.length === 0) return []

  const cacheKey = `inscripciones_${claseIds.sort().join(',')}`
  
  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)')
    .in('clase_id', claseIds)
    .eq('activo', true)

  if (error) {
    console.warn('[MaestroData] Error cargando inscripciones:', error.message)
    return []
  }

  const inscripciones = data || []
  viewCache.set(cacheKey, inscripciones, 'inscripciones')
  return inscripciones
}

export async function getSalones(salonIds, forceRefresh = false) {
  if (!salonIds || salonIds.length === 0) return []

  const cacheKey = `salones_${salonIds.sort().join(',')}`
  
  if (!forceRefresh) {
    const cached = viewCache.getCached(cacheKey)
    if (cached) return cached
  }

  const { data, error } = await supabase
    .from('salones')
    .select('id, nombre')
    .in('id', salonIds)

  if (error) {
    console.warn('[MaestroData] Error cargando salones:', error.message)
    return []
  }

  const salones = data || []
  viewCache.set(cacheKey, salones, 'salones')
  return salones
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
  const claseIds = clases.map(c => c.id)
  if (claseIds.length === 0) return

  // 2. Todo en paralelo: horarios, inscripciones, sesiones del mes, salones
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  // Incluir 4 semanas atrás para métricas (puede cruzar al mes anterior)
  const hace4Semanas = new Date(hoy)
  hace4Semanas.setDate(hace4Semanas.getDate() - 28)
  const desde = hace4Semanas < primerDiaMes
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
  const salonIds = [...new Set(horarios.map(h => h.salon_id).filter(Boolean))]
  if (salonIds.length > 0) {
    await getSalones(salonIds)
  }

  console.log(`[Prefetch] Mes cargado: ${clases.length} clases, ${horarios.length} horarios, ${inscripciones.length} inscripciones`)
}

export function invalidateClasesCache() {
  viewCache.invalidate('mis_clases')
  viewCache.invalidate('horarios')
  viewCache.invalidate('inscripciones')
  viewCache.invalidate('sesiones')
}

export function invalidateAllCache() {
  viewCache.invalidateAll()
}

export default {
  getMisClases,
  getHorariosClases,
  getSesiones,
  getInscripcionesClases,
  getSalones,
  prefetchMonthData,
  invalidateClasesCache,
  invalidateAllCache,
  CACHE_KEYS
}
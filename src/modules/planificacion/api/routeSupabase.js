import { supabase } from '../../../lib/supabaseClient.js'

// NOTA (curriculo-tres-planos, WU #3): este módulo leía de tablas DEPRECATED
// plan_clases / plan_niveles / plan_temas / plan_objetivos / plan_indicadores
// que NUNCA existieron en producción (SOI_DDBB_EL_SISTEMAPC). Ahora lee del
// esquema real: clases -> levels -> nodes -> objetivos -> indicators.
//
// La forma de salida (nombre, numero_nivel, plan_temas, plan_objetivos,
// plan_indicadores) se conserva a propósito para no romper a los
// consumidores actuales (rutaAcademicaView.js, routeMock.js en modo demo).

export async function getClasses(maestroId = null) {
  let query = supabase.from('clases').select('*').eq('activo', true)
  if (maestroId) query = query.eq('maestro_id', maestroId)
  const { data, error } = await query.order('nombre')
  if (error) throw error
  return data || []
}

/**
 * clases no tiene niveles/nodos directamente — la jerarquía real cuelga de
 * route_versions (routes -> route_versions -> levels). Se resuelve la
 * versión de ruta más reciente asociada a la clase (published primero, si
 * no hay, la más reciente por created_at) antes de leer levels/nodes.
 */
async function _resolveRouteVersionIdForClase(claseId) {
  const { data, error } = await supabase
    .from('route_versions')
    .select('id')
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row?.id || null
}

export async function getLevelsByClass(classId) {
  const routeVersionId = await _resolveRouteVersionIdForClase(classId)
  if (!routeVersionId) return []

  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('route_version_id', routeVersionId)
    .order('level_number')
  if (error) throw error
  return (data || []).map(_mapLevel)
}

export async function getNodesByLevel(levelId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('level_id', levelId)
    .order('order_index')
  if (error) throw error
  return (data || []).map(_mapNode)
}

export async function getObjectivesByNode(nodeId) {
  const { data, error } = await supabase
    .from('objetivos')
    .select('*')
    .eq('node_id', nodeId)
    .order('order_index')
  if (error) throw error
  return (data || []).map(_mapObjetivo)
}

export async function getIndicatorsByObjective(objectiveId) {
  const { data, error } = await supabase
    .from('indicators')
    .select('*')
    .eq('objetivo_id', objectiveId)
    .order('order_index')
  if (error) throw error
  return (data || []).map(_mapIndicator)
}

function _mapIndicator(indicator) {
  return {
    ...indicator,
    descripcion: indicator.description,
    orden_index: indicator.order_index,
  }
}

function _mapObjetivo(objetivo) {
  return {
    ...objetivo,
    nombre: objetivo.nombre,
    orden_index: objetivo.order_index,
    plan_indicadores: Array.isArray(objetivo.indicators)
      ? objetivo.indicators
          .slice()
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map(_mapIndicator)
      : undefined,
  }
}

function _mapNode(node) {
  return {
    ...node,
    nombre: node.name,
    tipo: node.type,
    orden_index: node.order_index,
    plan_objetivos: Array.isArray(node.objetivos)
      ? node.objetivos
          .slice()
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map(_mapObjetivo)
      : undefined,
  }
}

function _mapLevel(level) {
  return {
    ...level,
    nombre: level.name,
    numero_nivel: level.level_number,
    objetivo_general: level.main_objective,
    plan_temas: Array.isArray(level.nodes)
      ? level.nodes
          .slice()
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map(_mapNode)
      : undefined,
  }
}

export async function getFullHierarchy(classId) {
  const routeVersionId = await _resolveRouteVersionIdForClase(classId)
  if (!routeVersionId) return []

  const { data: levels, error } = await supabase
    .from('levels')
    .select(
      `
      *,
      nodes (
        *,
        objetivos (
          *,
          indicators (*)
        )
      )
    `,
    )
    .eq('route_version_id', routeVersionId)
    .order('level_number')
  if (error) throw error
  return (levels || []).map(_mapLevel)
}

export async function updateIndicatorCalificacion() {
  throw new Error(
    'updateIndicatorCalificacion ya no aplica: la calificación real se registra en indicator_attempts, ' +
      'no existe la columna indicators.calificacion en el esquema de producción.',
  )
}

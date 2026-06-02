import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene todas las rutas académicas
 */
export async function getRoutes() {
  const { data, error } = await supabase.from('routes').select('*').order('name')

  if (error) {
    console.error('Error fetching routes:', error.message)
    throw new Error('No se pudieron cargar las rutas')
  }

  return data
}

/**
 * Obtiene las versiones de una ruta específica
 */
export async function getRouteVersions(routeId) {
  const { data, error } = await supabase
    .from('route_versions')
    .select('*')
    .eq('route_id', routeId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('Error fetching route versions:', error.message)
    throw new Error('No se pudieron cargar las versiones de la ruta')
  }

  return data
}

/**
 * Recupera el árbol jerárquico completo de una versión de ruta.
 * Optimizado para cargar Bloques -> Niveles -> Nodos -> Indicadores.
 */
export async function getAcademicTree(routeVersionId) {
  if (!routeVersionId) return []

  try {
    // 1. Cargar Bloques
    const { data: blocks, error: bErr } = await supabase
      .from('blocks')
      .select('*')
      .eq('route_version_id', routeVersionId)
      .order('order_index')

    if (bErr) throw bErr
    if (!blocks.length) return []

    const blockIds = blocks.map((b) => b.id)

    const { data: levels, error: lErr } = await supabase
      .from('levels')
      .select('*')
      .in('block_id', blockIds)
      .order('order_index')
    if (lErr) throw lErr

    const levelIds = levels.map((l) => l.id)

    const { data: nodes, error: nErr } = await supabase
      .from('nodes')
      .select('*')
      .in('level_id', levelIds)
      .order('order_index')
      .limit(5000)
    if (nErr) throw nErr

    const nodeIds = nodes.map((n) => n.id)

    const { data: indicators, error: iErr } = await supabase
      .from('indicators')
      .select('*')
      .in('node_id', nodeIds)
      .order('order_index')
      .limit(10000)
    if (iErr) throw iErr

    // Construir jerarquía
    return blocks.map((block) => ({
      ...block,
      type: 'block',
      children: levels
        .filter((l) => l.block_id === block.id)
        .map((level) => ({
          ...level,
          type: 'level',
          children: nodes
            .filter((n) => n.level_id === level.id)
            .map((node) => ({
              ...node,
              type: 'node',
              children: indicators
                .filter((i) => i.node_id === node.id)
                .map((indicator) => ({
                  ...indicator,
                  type: 'indicator',
                })),
            })),
        })),
    }))
  } catch (error) {
    console.error('Error building academic tree:', error.message)
    throw new Error('Error al construir el árbol académico')
  }
}

/**
 * Gestión de Recursos de Nodo
 */

export async function getNodeResources(nodeId) {
  const { data, error } = await supabase
    .from('node_resources')
    .select('*')
    .eq('node_id', nodeId)
    .order('order_index')

  if (error) throw error
  return data
}

export async function saveNodeResource(resource) {
  const { id, ...data } = resource

  if (id) {
    const { data: updated, error } = await supabase
      .from('node_resources')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  } else {
    const { data: inserted, error } = await supabase
      .from('node_resources')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return inserted
  }
}

export async function deleteNodeResource(id) {
  const { error } = await supabase.from('node_resources').delete().eq('id', id)

  if (error) throw error
  return true
}

/**
 * Actualización de metadatos de nodos
 */
export async function updateNode(nodeId, updates) {
  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', nodeId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * ANALÍTICA ACADÉMICA (La Torre de Control)
 */

/**
 * Obtiene el Radar Institucional: Visión 360 de alumnos, su nivel actual y salud académica.
 */
export async function getInstitutionalRadar() {
  const { data, error } = await supabase
    .from('view_institutional_radar')
    .select('*')
    .order('days_inactive', { ascending: false })

  if (error) {
    console.error('Error fetching institutional radar:', error.message)
    throw new Error('No se pudo cargar el radar institucional')
  }

  return data
}

/**
 * Obtiene los "Puntos Calientes" (Hotspots): Nodos con mayor tasa de falla.
 */
export async function getNodeHotspots() {
  const { data, error } = await supabase
    .from('view_node_difficulty')
    .select('*')
    .order('failure_percentage', { ascending: false })

  if (error) {
    console.error('Error fetching node hotspots:', error.message)
    throw new Error('No se pudieron cargar los puntos calientes pedagógicos')
  }

  return data
}

/**
 * Obtiene alumnos estancados (sin actividad pedagógica real por más de 15 días).
 */
export async function getStagnantStudents() {
  const { data, error } = await supabase
    .from('view_institutional_radar')
    .select('*')
    .eq('health_status', 'stagnant')
    .order('days_inactive', { ascending: false })

  if (error) {
    console.error('Error fetching stagnant students:', error.message)
    throw new Error('No se pudo cargar el reporte de alumnos estancados')
  }

  return data
}

/**
 * MaestroRouteService - Teacher Personal Route Management
 * Handles CRUD operations on maestro_routes hierarchy (UNIDADES > OBJETIVOS > INDICADORES)
 * Includes DAG validation, prerequisite management, and ACM catalog import
 */

import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

/**
 * Get all routes for a teacher in a given class
 * @param {string} maestroId - Teacher ID
 * @param {string} claseId - Class ID
 * @returns {Promise<Array>} Array of route objects with full hierarchy
 */
export async function getTeacherRoutes(maestroId, claseId) {
  try {
    // Fetch all routes for teacher+class combo
    const { data: routes, error: routesError } = await supabase
      .from('maestro_routes')
      .select('id, maestro_id, clase_id, nombre, descripcion, created_at, updated_at')
      .eq('maestro_id', maestroId)
      .eq('clase_id', claseId)

    if (routesError) {
      console.warn('[MaestroRouteService] Error fetching routes:', routesError.message)
      return []
    }

    if (!routes || routes.length === 0) return []

    // For each route, fetch full hierarchy
    const enrichedRoutes = await Promise.all(
      routes.map(async (route) => {
        const unidades = await _fetchUnidadesWithChildren(route.id)
        return { ...route, unidades }
      })
    )

    return enrichedRoutes
  } catch (err) {
    console.error('[MaestroRouteService] getTeacherRoutes error:', err)
    return []
  }
}

/**
 * Create a new route with full hierarchy (unidades, objetivos, indicadores)
 * @param {string} maestroId - Teacher ID
 * @param {string} claseId - Class ID
 * @param {string} nombre - Route name
 * @param {Array} unidades - Array of unidad objects with nested objetivos and indicadores
 * @returns {Promise<Object>} Created route with hierarchy
 */
export async function createRoute(maestroId, claseId, nombre, unidades) {
  try {
    // Validate DAG before creating
    const dagError = validateDAG(unidades)
    if (dagError) {
      throw new Error(`DAG validation failed: ${dagError}`)
    }

    // Create maestro_routes entry
    const { data: routeData, error: routeError } = await supabase
      .from('maestro_routes')
      .insert({
        maestro_id: maestroId,
        clase_id: claseId,
        nombre,
        descripcion: null,
      })
      .select()

    if (routeError) {
      throw new Error(`Failed to create route: ${routeError.message}`)
    }

    const routeId = routeData[0].id

    // Insert unidades (level 1)
    for (const unidad of unidades) {
      const { data: unidadData, error: unidadError } = await supabase
        .from('maestro_unidades')
        .insert({
          ruta_id: routeId,
          orden: unidad.orden || 0,
          nombre: unidad.nombre,
          descripcion: unidad.descripcion || null,
        })
        .select()

      if (unidadError) {
        throw new Error(`Failed to create unidad: ${unidadError.message}`)
      }

      const unidadId = unidadData[0].id

      // Insert objetivos (level 2)
      if (unidad.objetivos && Array.isArray(unidad.objetivos)) {
        for (const objetivo of unidad.objetivos) {
          const { data: objetivoData, error: objetivoError } = await supabase
            .from('maestro_objetivos')
            .insert({
              unidad_id: unidadId,
              orden: objetivo.orden || 0,
              nombre: objetivo.nombre,
              descripcion: objetivo.descripcion || null,
            })
            .select()

          if (objetivoError) {
            throw new Error(`Failed to create objetivo: ${objetivoError.message}`)
          }

          const objetivoId = objetivoData[0].id

          // Insert indicadores (level 3)
          if (objetivo.indicadores && Array.isArray(objetivo.indicadores)) {
            for (const indicador of objetivo.indicadores) {
              const { data: indicadorData, error: indicadorError } = await supabase
                .from('maestro_indicadores')
                .insert({
                  objetivo_id: objetivoId,
                  orden: indicador.orden || 0,
                  nombre: indicador.nombre,
                  criterios_json: indicador.criterios_json || null,
                })
                .select()

              if (indicadorError) {
                throw new Error(`Failed to create indicador: ${indicadorError.message}`)
              }

              // Insert prerequisites for this indicator
              const indicadorId = indicadorData[0].id
              if (indicador.prerequisito_indicador_id) {
                const { error: prereqError } = await supabase
                  .from('indicador_prerequisito')
                  .insert({
                    indicador_id: indicadorId,
                    prerequisito_indicador_id: indicador.prerequisito_indicador_id,
                  })

                if (prereqError) {
                  console.warn('[MaestroRouteService] Warning setting prerequisite:', prereqError.message)
                }
              }
            }
          }
        }
      }
    }

    // Return created route with hierarchy
    return getTeacherRoutes(maestroId, claseId).then((routes) => routes[0])
  } catch (err) {
    console.error('[MaestroRouteService] createRoute error:', err)
    throw err
  }
}

/**
 * Update an existing route (modify hierarchy)
 * @param {string} routeId - Route ID to update
 * @param {Array} unidades - Updated unidades array with nested structure
 * @returns {Promise<Object>} Updated route
 */
export async function updateRoute(routeId, unidades) {
  try {
    // Validate DAG before updating
    const dagError = validateDAG(unidades)
    if (dagError) {
      throw new Error(`DAG validation failed: ${dagError}`)
    }

    // Note: Full update would require careful deletion/re-insertion logic
    // For Phase 1, this is a placeholder that updates route timestamp
    const { data: routeData, error: routeError } = await supabase
      .from('maestro_routes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', routeId)
      .select()

    if (routeError) {
      throw new Error(`Failed to update route: ${routeError.message}`)
    }

    return routeData[0]
  } catch (err) {
    console.error('[MaestroRouteService] updateRoute error:', err)
    throw err
  }
}

/**
 * Delete a route and all its children (cascading)
 * @param {string} routeId - Route ID to delete
 * @returns {Promise<Object>} Deleted route info
 */
export async function deleteRoute(routeId) {
  try {
    const { data, error } = await supabase
      .from('maestro_routes')
      .delete()
      .eq('id', routeId)
      .select()

    if (error) {
      throw new Error(`Failed to delete route: ${error.message}`)
    }

    return data[0]
  } catch (err) {
    console.error('[MaestroRouteService] deleteRoute error:', err)
    throw err
  }
}

/**
 * Clone an existing route to a new class (or same class with new name)
 * @param {string} routeId - Route ID to clone
 * @param {string} newNombre - Name for cloned route
 * @param {string} targetClaseId - Target class ID (defaults to original)
 * @returns {Promise<Object>} Cloned route with full hierarchy
 */
export async function cloneRoute(routeId, newNombre, targetClaseId = null) {
  try {
    // Fetch original route
    const { data: originalRoute, error: fetchError } = await supabase
      .from('maestro_routes')
      .select('maestro_id, clase_id')
      .eq('id', routeId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch route: ${fetchError.message}`)
    }

    const claseId = targetClaseId || originalRoute.clase_id
    const maestroId = originalRoute.maestro_id

    // Fetch full hierarchy
    const routes = await getTeacherRoutes(maestroId, originalRoute.clase_id)
    const routeToClone = routes.find((r) => r.id === routeId)

    if (!routeToClone) {
      throw new Error('Route not found for cloning')
    }

    // Create new route with cloned hierarchy
    return createRoute(maestroId, claseId, newNombre, routeToClone.unidades)
  } catch (err) {
    console.error('[MaestroRouteService] cloneRoute error:', err)
    throw err
  }
}

/**
 * DAG Validation: Detect cycles in prerequisite graph using DFS
 * @param {Array} unidades - Hierarchy array to validate
 * @returns {string|null} Error message if cycle found, null otherwise
 */
export function validateDAG(unidades) {
  try {
    // Build adjacency list from all indicators and prerequisites
    const indicatorMap = new Map()
    const adjList = new Map()

    // First pass: collect all indicators
    for (const unidad of unidades) {
      if (!unidad.objetivos) continue
      for (const objetivo of unidad.objetivos) {
        if (!objetivo.indicadores) continue
        for (const indicador of objetivo.indicadores) {
          indicatorMap.set(indicador.id, indicador)
          if (!adjList.has(indicador.id)) {
            adjList.set(indicador.id, [])
          }
        }
      }
    }

    // Second pass: build edges
    for (const unidad of unidades) {
      if (!unidad.objetivos) continue
      for (const objetivo of unidad.objetivos) {
        if (!objetivo.indicadores) continue
        for (const indicador of objetivo.indicadores) {
          if (indicador.prerequisito_indicador_id) {
            if (!adjList.has(indicador.prerequisito_indicador_id)) {
              adjList.set(indicador.prerequisito_indicador_id, [])
            }
            adjList.get(indicador.prerequisito_indicador_id).push(indicador.id)
          }
        }
      }
    }

    // DFS cycle detection
    const visited = new Set()
    const recStack = new Set()

    for (const nodeId of adjList.keys()) {
      if (!visited.has(nodeId)) {
        const cycleError = _dfsCycleDetect(nodeId, adjList, visited, recStack, indicatorMap)
        if (cycleError) {
          return cycleError
        }
      }
    }

    return null
  } catch (err) {
    console.error('[MaestroRouteService] validateDAG error:', err)
    return `Error validating DAG: ${err.message}`
  }
}

/**
 * DFS helper for cycle detection
 * @private
 */
function _dfsCycleDetect(node, adjList, visited, recStack, indicatorMap) {
  visited.add(node)
  recStack.add(node)

  const neighbors = adjList.get(node) || []
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      const error = _dfsCycleDetect(neighbor, adjList, visited, recStack, indicatorMap)
      if (error) return error
    } else if (recStack.has(neighbor)) {
      // Cycle detected
      const nodeLabel = indicatorMap.get(node)?.nombre || node
      const neighborLabel = indicatorMap.get(neighbor)?.nombre || neighbor
      return `Prerequisito circular detectado entre indicadores "${nodeLabel}" e "${neighborLabel}"`
    }
  }

  recStack.delete(node)
  return null
}

/**
 * Get full prerequisite graph as adjacency list
 * @param {string} routeId - Route ID
 * @returns {Promise<Object>} Adjacency list: { indicador_id => [prerequisito_ids] }
 */
export async function getRoutePrerequisites(routeId) {
  try {
    const { data: prerequisites, error } = await supabase
      .from('indicador_prerequisito')
      .select('indicador_id, prerequisito_indicador_id')
      .in(
        'indicador_id',
        // Fetch all indicador IDs in this route
        (
          await supabase.rpc('get_route_indicador_ids', { route_id_param: routeId })
        ).data || []
      )

    if (error) {
      console.warn('[MaestroRouteService] Error fetching prerequisites:', error.message)
      return {}
    }

    // Build adjacency list
    const adjList = {}
    for (const prereq of prerequisites) {
      if (!adjList[prereq.indicador_id]) {
        adjList[prereq.indicador_id] = []
      }
      adjList[prereq.indicador_id].push(prereq.prerequisito_indicador_id)
    }

    return adjList
  } catch (err) {
    console.error('[MaestroRouteService] getRoutePrerequisites error:', err)
    return {}
  }
}

/**
 * Check if a prerequisite is satisfied for a student
 * Prerequisite is satisfied if student has a passing grade (>= 3) or "Recuperado" status
 * @param {string} indicadorId - Prerequisite indicator ID
 * @param {string} alumnoId - Student ID
 * @param {string} claseId - Class ID
 * @returns {Promise<boolean>} True if prerequisite satisfied
 */
export async function checkPrerequisiteSatisfied(indicadorId, alumnoId, claseId) {
  try {
    const { data: evaluaciones, error } = await supabase
      .from('evaluacion_indicador')
      .select('nota, recovery_status')
      .eq('indicator_id', indicadorId)
      .eq('alumno_id', alumnoId)
      .eq('clase_id', claseId)

    if (error) {
      console.warn('[MaestroRouteService] Error checking prerequisite:', error.message)
      return false
    }

    if (!evaluaciones || evaluaciones.length === 0) {
      return false
    }

    const evaluacion = evaluaciones[0]
    // Satisfied if: nota >= 3 OR recovery_status = 'recuperado'
    return (evaluacion.nota && evaluacion.nota >= 3) || evaluacion.recovery_status === 'recuperado'
  } catch (err) {
    console.error('[MaestroRouteService] checkPrerequisiteSatisfied error:', err)
    return false
  }
}

/**
 * Import ACM catalog as teacher route template
 * Maps: NIVEL → UNIDAD, OBJETIVO GENERAL → OBJETIVO, OBJETIVO ESPECÍFICO → INDICADOR
 * @param {string} maestroId - Teacher ID
 * @param {string} claseId - Class ID
 * @param {Array<string>} nivelesSeleccionados - Selected nivel IDs from ACM
 * @returns {Promise<Object>} Created route from ACM import
 */
export async function importACMAsRoute(maestroId, claseId, nivelesSeleccionados) {
  try {
    // Phase 1 stub: This function will be fully implemented in Phase 2
    // For now, return an error indicating ACM import is not yet available
    throw new Error(
      'ACM import functionality is not yet implemented. This will be available in Phase 2.'
    )

    // Future implementation pseudocode:
    // 1. Query plan_niveles WHERE id IN nivelesSeleccionados
    // 2. For each nivel, fetch plan_objetivos_generales
    // 3. For each objetivo general, fetch plan_objetivos_especificos (indicadores)
    // 4. Map to unidades/objetivos/indicadores structure
    // 5. Call createRoute with mapped structure
  } catch (err) {
    console.error('[MaestroRouteService] importACMAsRoute error:', err)
    throw err
  }
}

/**
 * Helper: Fetch all unidades with nested objetivos and indicadores for a route
 * @private
 */
async function _fetchUnidadesWithChildren(rutaId) {
  try {
    const { data: unidades, error: unidadesError } = await supabase
      .from('maestro_unidades')
      .select('id, orden, nombre, descripcion')
      .eq('ruta_id', rutaId)
      .order('orden', { ascending: true })

    if (unidadesError || !unidades) return []

    const enrichedUnidades = await Promise.all(
      unidades.map(async (unidad) => {
        const objetivos = await _fetchObjetivosWithChildren(unidad.id)
        return { ...unidad, objetivos }
      })
    )

    return enrichedUnidades
  } catch (err) {
    console.error('[MaestroRouteService] _fetchUnidadesWithChildren error:', err)
    return []
  }
}

/**
 * Helper: Fetch all objetivos with nested indicadores for a unidad
 * @private
 */
async function _fetchObjetivosWithChildren(unidadId) {
  try {
    const { data: objetivos, error: objetivosError } = await supabase
      .from('maestro_objetivos')
      .select('id, orden, nombre, descripcion')
      .eq('unidad_id', unidadId)
      .order('orden', { ascending: true })

    if (objetivosError || !objetivos) return []

    const enrichedObjetivos = await Promise.all(
      objetivos.map(async (objetivo) => {
        const indicadores = await _fetchIndicadoresWithPrerequisites(objetivo.id)
        return { ...objetivo, indicadores }
      })
    )

    return enrichedObjetivos
  } catch (err) {
    console.error('[MaestroRouteService] _fetchObjetivosWithChildren error:', err)
    return []
  }
}

/**
 * Helper: Fetch all indicadores with prerequisites for an objetivo
 * @private
 */
async function _fetchIndicadoresWithPrerequisites(objetivoId) {
  try {
    const { data: indicadores, error: indicadoresError } = await supabase
      .from('maestro_indicadores')
      .select('id, orden, nombre, criterios_json')
      .eq('objetivo_id', objetivoId)
      .order('orden', { ascending: true })

    if (indicadoresError || !indicadores) return []

    const enrichedIndicadores = await Promise.all(
      indicadores.map(async (indicador) => {
        const { data: prerequisites, error: prereqError } = await supabase
          .from('indicador_prerequisito')
          .select('prerequisito_indicador_id')
          .eq('indicador_id', indicador.id)

        if (prereqError || !prerequisites || prerequisites.length === 0) {
          return { ...indicador, prerequisito_indicador_id: null }
        }

        return {
          ...indicador,
          prerequisito_indicador_id: prerequisites[0].prerequisito_indicador_id,
        }
      })
    )

    return enrichedIndicadores
  } catch (err) {
    console.error('[MaestroRouteService] _fetchIndicadoresWithPrerequisites error:', err)
    return []
  }
}

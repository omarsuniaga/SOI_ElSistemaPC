/**
 * planningService.js
 * Responsabilidad: Lógica de negocio para Planificación Académica
 * - Observaciones de indicadores
 * - Estado visual (Verde/Naranja/Gris)
 * - Historial acumulativo
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene todos los indicadores de una ruta con su estado actual
 * @param {string} routeVersionId - ID de la versión de ruta
 * @param {string} maestroId - ID del maestro
 * @param {string} claseId - ID de la clase (opcional, para filtrar alumnos)
 * @returns {Promise<Array>} Indicadores con estado visual
 */
export async function getIndicatorsWithStatus(routeVersionId, maestroId, claseId = null) {
  try {
    // 1. Obtener todos los nodos de la ruta
    const { data: nodes, error: nodesErr } = await supabase
      .from('nodes')
      .select('id, name, type, objective')
      .eq('route_version_id', routeVersionId)
      .order('order_index', { ascending: true })

    if (nodesErr) throw nodesErr

    // 2. Obtener total de alumnos en la clase
    let totalAlumnos = 0
    if (claseId) {
      const { data: inscripciones, error: inscErr } = await supabase
        .from('alumnos_clases')
        .select('alumno_id')
        .eq('clase_id', claseId)
        .eq('activo', true)

      if (!inscErr) totalAlumnos = inscripciones?.length || 0
    } else {
      // Sin clase, asumir 12 como default (valor típico)
      totalAlumnos = 12
    }

    // 3. Para cada nodo, contar cuántos alumnos tienen observaciones
    const indicatorsWithStatus = await Promise.all(
      nodes.map(async (node) => {
        const { data: sessions, error: sessErr } = await supabase
          .from('indicator_sessions')
          .select('id', { count: 'exact' })
          .eq('node_id', node.id)
          .eq('maestro_id', maestroId)
          .eq('route_version_id', routeVersionId)

        if (sessErr) {
          console.error('Error fetching sessions for node:', node.id, sessErr)
          return null
        }

        // Contar estudiantes únicos que vieron este indicador
        const sessionIds = sessions?.map((s) => s.id) || []
        let estudiantesVieron = 0
        if (sessionIds.length > 0) {
          const { data: studentLinks } = await supabase
            .from('indicator_session_students')
            .select('alumno_id')
            .in('indicator_session_id', sessionIds)

          estudiantesVieron = new Set(studentLinks?.map((s) => s.alumno_id) || []).size
        }

        return {
          node_id: node.id,
          nombre: node.name,
          tipo: node.type,
          descripcion: node.objective,
          estado: _getEstado(estudiantesVieron, totalAlumnos),
          estudiantes_vieron: estudiantesVieron,
          estudiantes_totales: totalAlumnos,
          progreso_porcentaje:
            totalAlumnos > 0 ? Math.round((estudiantesVieron / totalAlumnos) * 100) : 0,
          observaciones_count: sessions?.length || 0,
        }
      })
    )

    return indicatorsWithStatus.filter(Boolean)
  } catch (err) {
    console.error('[planningService] Error getIndicatorsWithStatus:', err)
    throw err
  }
}

/**
 * Registra una observación para un indicador
 * @param {object} payload - { maestroId, routeVersionId, nodeId, claseId, fecha, descripcion, calificacion, estudianteIds, notasIndividuales }
 * @returns {Promise<string>} ID de la sesión creada
 */
export async function createIndicatorObservation(payload) {
  const {
    maestroId,
    routeVersionId,
    nodeId,
    claseId,
    fecha,
    descripcion,
    calificacion,
    estudianteIds,
    notasIndividuales = {},
  } = payload

  try {
    // 1. Crear sesión de indicador
    const { data: session, error: sessErr } = await supabase
      .from('indicator_sessions')
      .insert([
        {
          maestro_id: maestroId,
          route_version_id: routeVersionId,
          node_id: nodeId,
          clase_id: claseId,
          fecha,
          descripcion,
          calificacion,
        },
      ])
      .select('id')
      .single()

    if (sessErr) throw sessErr

    const sessionId = session.id

    // 2. Crear registros de estudiantes
    const studentRecords = estudianteIds.map((alumnoId) => ({
      indicator_session_id: sessionId,
      alumno_id: alumnoId,
      nota_cualitativa: notasIndividuales[alumnoId]?.nota || calificacion,
      observaciones_individuales: notasIndividuales[alumnoId]?.observacion || null,
    }))

    const { error: studErr } = await supabase.from('indicator_session_students').insert(studentRecords)

    if (studErr) throw studErr

    return sessionId
  } catch (err) {
    console.error('[planningService] Error createIndicatorObservation:', err)
    throw err
  }
}

/**
 * Obtiene el historial completo de un indicador con todas sus observaciones
 * @param {string} nodeId - ID del indicador
 * @param {string} routeVersionId - ID de la versión de ruta
 * @param {string} maestroId - ID del maestro
 * @param {string} claseId - ID de la clase (para contar totales)
 * @returns {Promise<object>} Historial con observaciones apiladas + resumen por estudiante
 */
export async function getIndicatorHistory(nodeId, routeVersionId, maestroId, claseId = null) {
  try {
    // 1. Obtener info del nodo
    const { data: node, error: nodeErr } = await supabase
      .from('nodes')
      .select('id, name, objective, type')
      .eq('id', nodeId)
      .single()

    if (nodeErr) throw nodeErr

    // 2. Obtener todas las sesiones en orden cronológico inverso (más reciente primero)
    const { data: sessions, error: sessErr } = await supabase
      .from('indicator_sessions')
      .select(
        `
        id,
        fecha,
        descripcion,
        calificacion,
        created_at
      `
      )
      .eq('node_id', nodeId)
      .eq('maestro_id', maestroId)
      .eq('route_version_id', routeVersionId)
      .order('fecha', { ascending: false })

    if (sessErr) throw sessErr

    // 3. Para cada sesión, obtener estudiantes
    const observaciones = await Promise.all(
      (sessions || []).map(async (sess) => {
        const { data: studentLinks } = await supabase
          .from('indicator_session_students')
          .select('alumno_id, nota_cualitativa, observaciones_individuales')
          .eq('indicator_session_id', sess.id)

        // Obtener datos de alumnos
        const alumnoIds = studentLinks?.map((s) => s.alumno_id) || []
        const { data: alumnos } = alumnoIds.length
          ? await supabase.from('alumnos').select('id, nombre_completo').in('id', alumnoIds)
          : { data: [] }

        const alumnosMap = Object.fromEntries(alumnos?.map((a) => [a.id, a]) || [])

        return {
          session_id: sess.id,
          fecha: sess.fecha,
          calificacion: sess.calificacion,
          descripcion: sess.descripcion,
          estudiantes: studentLinks?.map((link) => ({
            alumno_id: link.alumno_id,
            nombre: alumnosMap[link.alumno_id]?.nombre_completo || 'Desconocido',
            nota: link.nota_cualitativa,
            observacion: link.observaciones_individuales,
          })),
        }
      })
    )

    // 4. Calcular total de alumnos y estado
    const totalAlumnos = claseId ? await _getTotalAlumnosPorClase(claseId) : 12

    // Obtener todos los alumnos únicos que han visto este indicador
    const todosLosAlumnos = await _getTodosLosAlumnosPorClase(claseId)
    const alumnosQueVieron = new Set()

    observaciones.forEach((obs) => {
      obs.estudiantes.forEach((est) => {
        alumnosQueVieron.add(est.alumno_id)
      })
    })

    // 5. Construir resumen por estudiante
    const resumenEstudiantes = (todosLosAlumnos || []).map((alumno) => {
      const vio = alumnosQueVieron.has(alumno.id)
      let calificacion = null
      let fecha = null

      if (vio) {
        // Buscar última observación para este estudiante
        for (const obs of observaciones) {
          const found = obs.estudiantes.find((e) => e.alumno_id === alumno.id)
          if (found) {
            calificacion = found.nota
            fecha = obs.fecha
            break
          }
        }
      }

      return {
        alumno_id: alumno.id,
        nombre: alumno.nombre_completo,
        vio,
        calificacion,
        fecha,
      }
    })

    const estadoGeneralActual = _getEstado(alumnosQueVieron.size, totalAlumnos)

    return {
      node_id: nodeId,
      nombre: node.name,
      tipo: node.type,
      descripcion: node.objective,
      estado: estadoGeneralActual,
      estudiantes_vieron: alumnosQueVieron.size,
      estudiantes_totales: totalAlumnos,
      progreso_porcentaje: totalAlumnos > 0 ? Math.round((alumnosQueVieron.size / totalAlumnos) * 100) : 0,
      observaciones,
      resumen_estudiantes: resumenEstudiantes,
    }
  } catch (err) {
    console.error('[planningService] Error getIndicatorHistory:', err)
    throw err
  }
}

/**
 * Obtiene la jerarquía completa de una versión de ruta:
 * blocks → levels → nodes → indicators (solo indicadores activos).
 * Ordenado por order_index en cada nivel.
 * @param {string} routeVersionId
 * @returns {Promise<Array>} bloques con su árbol anidado
 */
export async function getRouteVersionHierarchy(routeVersionId) {
  // 1. Blocks de la versión
  const { data: blocks, error: blocksErr } = await supabase
    .from('blocks')
    .select('id, name, objective, description, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })
  if (blocksErr) throw blocksErr

  // 2. Levels de la versión
  const { data: levels, error: levelsErr } = await supabase
    .from('levels')
    .select('id, block_id, name, level_number, main_objective, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })
  if (levelsErr) throw levelsErr

  // 3. Nodes de la versión
  const { data: nodes, error: nodesErr } = await supabase
    .from('nodes')
    .select('id, level_id, name, type, is_critical, objective, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })
  if (nodesErr) throw nodesErr

  // 4. Indicators activos de esos nodos
  const nodeIds = (nodes || []).map((n) => n.id)
  let indicators = []
  if (nodeIds.length > 0) {
    const { data: inds, error: indsErr } = await supabase
      .from('indicators')
      .select('id, node_id, description, nombre, is_required, order_index, activo')
      .in('node_id', nodeIds)
      .eq('activo', true)
      .order('order_index', { ascending: true })
    if (indsErr) throw indsErr
    indicators = inds || []
  }

  // 5. Ensamblar el árbol en JS
  const indsByNode = _groupBy(indicators, 'node_id')
  const nodesByLevel = _groupBy(
    (nodes || []).map((n) => ({ ...n, indicators: indsByNode[n.id] || [] })),
    'level_id',
  )
  const levelsByBlock = _groupBy(
    (levels || []).map((l) => ({ ...l, nodes: nodesByLevel[l.id] || [] })),
    'block_id',
  )

  return (blocks || []).map((b) => ({ ...b, levels: levelsByBlock[b.id] || [] }))
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function _groupBy(arr, key) {
  return (arr || []).reduce((acc, item) => {
    const k = item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

function _getEstado(estudiantes_vieron, estudiantes_totales) {
  if (estudiantes_vieron === 0) {
    return {
      estado: 'no_iniciado',
      color: 'gray',
      icono: '○',
      label: 'No trabajado',
    }
  }

  if (estudiantes_vieron === estudiantes_totales) {
    return {
      estado: 'completado',
      color: 'green',
      icono: '✓',
      label: 'Completado',
    }
  }

  return {
    estado: 'parcial',
    color: 'amber',
    icono: '◐',
    label: `Parcial (${Math.round((estudiantes_vieron / estudiantes_totales) * 100)}%)`,
  }
}

async function _getTotalAlumnosPorClase(claseId) {
  if (!claseId) return 12

  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('alumno_id', { count: 'exact' })
    .eq('clase_id', claseId)
    .eq('activo', true)

  return error ? 12 : data?.length || 12
}

async function _getTodosLosAlumnosPorClase(claseId) {
  if (!claseId) return []

  const { data: inscripciones } = await supabase
    .from('alumnos_clases')
    .select('alumno_id')
    .eq('clase_id', claseId)
    .eq('activo', true)

  const alumnoIds = inscripciones?.map((i) => i.alumno_id) || []

  if (alumnoIds.length === 0) return []

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .in('id', alumnoIds)

  return alumnos || []
}

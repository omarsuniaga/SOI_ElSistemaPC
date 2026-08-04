import { supabase } from '../../../lib/supabaseClient.js'

/**
 * PlantillasPlanificacionSupabase — Adaptador de Supabase para plantillas_planificacion.
 * Reemplaza el arreglo PLANTILLAS_PLANIFICACION hardcodeado en planificacionModal.js.
 */

/**
 * Obtiene todas las plantillas de planificación activas.
 * @returns {Promise<Array<{id: string, nombre: string, objetivos: string, contenido: string, recursos: string, evaluacion_metodo: string}>>}
 */
export async function obtenerPlantillasPlanificacion() {
  const { data, error } = await supabase
    .from('plantillas_planificacion')
    .select('id, clase_id, nombre, objetivos, contenido, recursos, evaluacion_metodo')
    .eq('activo', true)
    .order('nombre')

  if (error) {
    console.error('Error cargando plantillas de planificación:', error.message)
    throw new Error('No se pudieron cargar las plantillas de planificación')
  }

  return data || []
}

/**
 * Obtiene una plantilla de planificación por ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function obtenerPlantillaPlanificacion(id) {
  const { data, error } = await supabase
    .from('plantillas_planificacion')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando plantilla de planificación:', error.message)
    throw new Error('Plantilla de planificación no encontrada')
  }

  return data
}

/**
 * Crea una nueva plantilla de planificación.
 * @param {{ id: string, nombre: string, objetivos?: string, contenido?: string, recursos?: string, evaluacion_metodo?: string }} plantilla
 * @returns {Promise<object>}
 */
export async function crearPlantillaPlanificacion(plantilla) {
  const { data, error } = await supabase
    .from('plantillas_planificacion')
    .insert({
      id: plantilla.id.trim(),
      nombre: plantilla.nombre.trim(),
      objetivos: plantilla.objetivos?.trim() || '',
      contenido: plantilla.contenido?.trim() || '',
      recursos: plantilla.recursos?.trim() || '',
      evaluacion_metodo: plantilla.evaluacion_metodo?.trim() || '',
      ...(plantilla.clase_id && { clase_id: plantilla.clase_id }),
    })
    .select()

  if (error) {
    console.error('Error creando plantilla de planificación:', error.message)
    throw new Error('No se pudo crear la plantilla de planificación')
  }

  return data[0]
}

/**
 * Actualiza una plantilla de planificación existente.
 * @param {string} id
 * @param {{ nombre?: string, objetivos?: string, contenido?: string, recursos?: string, evaluacion_metodo?: string, activo?: boolean }} cambios
 * @returns {Promise<object>}
 */
export async function actualizarPlantillaPlanificacion(id, cambios) {
  const { data, error } = await supabase
    .from('plantillas_planificacion')
    .update(cambios)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando plantilla de planificación:', error.message)
    throw new Error('No se pudo actualizar la plantilla de planificación')
  }

  return data[0]
}

/**
 * Elimina (desactiva) una plantilla de planificación.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function eliminarPlantillaPlanificacion(id) {
  const { error } = await supabase
    .from('plantillas_planificacion')
    .update({ activo: false })
    .eq('id', id)

  if (error) {
    console.error('Error eliminando plantilla de planificación:', error.message)
    throw new Error('No se pudo eliminar la plantilla de planificación')
  }
}

/**
 * Guarda el árbol curricular completo en Supabase.
 *
 * Delega en la RPC SECURITY DEFINER `fn_sincronizar_arbol_curricular`
 * (20260804000000) porque el RLS de `public.indicators` impide que el cliente
 * escriba indicadores con node_id NULL (sólo permite draft routes propias).
 * La RPC valida que el maestro pertenece a la clase y persiste la plantilla +
 * los indicadores de forma atómica, garantizando que la FK de
 * `evaluacion_indicador.indicator_id` sea válida.
 *
 * @param {{ plantillaId?: string|null, claseId?: string|null, nombre?: string, unidades: Array }} params
 * @returns {Promise<{ plantillaId: string, unidades: Array }>}
 */
export async function guardarArbolCurricular({ plantillaId = null, claseId = null, nombre = 'Plan Curricular Institucional', unidades = [] }) {
  if (!claseId) {
    throw new Error('claseId es requerido para guardar el árbol curricular')
  }

  try {
    const { data: plantillaPersistida, error } = await supabase.rpc(
      'fn_sincronizar_arbol_curricular',
      {
        p_clase_id: claseId,
        p_nombre: nombre.trim(),
        p_objetivos: unidades,
        p_plantilla_id: plantillaId || null,
      },
    )

    if (error) throw error

    return {
      plantillaId: plantillaPersistida,
      unidades: _marcarPersistidos(unidades),
    }
  } catch (error) {
    if (_esFuncionNoDisponibile(error)) {
      console.warn(
        '[planificacion] RPC fn_sincronizar_arbol_curricular no disponible; usando persistencia directa de respaldo.',
      )
      return _guardarArbolCurricularSinRpc({ plantillaId, claseId, nombre, unidades })
    }

    console.error('Error sincronizando el árbol curricular en Supabase:', error.message)
    throw new Error('No se pudo guardar el plan curricular en la base de datos')
  }
}

async function _guardarArbolCurricularSinRpc({ plantillaId = null, claseId, nombre, unidades = [] }) {
  const targetId = plantillaId || null
  const payload = {
    nombre: nombre.trim(),
    objetivos: JSON.stringify(unidades),
    contenido: '',
    recursos: '',
    evaluacion_metodo: '',
    clase_id: claseId,
    activo: true,
    updated_at: new Date().toISOString(),
  }

  const plantillaBase = targetId ? { id: targetId, ...payload } : payload
  const plantillaQuery = targetId
    ? supabase
        .from('plantillas_planificacion')
        .upsert(plantillaBase, { onConflict: 'id' })
        .select('id')
        .single()
    : supabase
        .from('plantillas_planificacion')
        .insert(plantillaBase)
        .select('id')
        .single()

  const { data: plantillaPersistida, error: plantillaError } = await plantillaQuery
  if (plantillaError) {
    console.error('Error guardando plantilla de respaldo:', plantillaError.message)
    throw new Error('No se pudo guardar el plan curricular en la base de datos')
  }

  await _sincronizarIndicadoresDeRespaldo(unidades).catch((err) => {
    console.warn('[planificacion] No se pudieron sincronizar todos los indicadores de respaldo:', err.message)
  })

  return {
    plantillaId: plantillaPersistida?.id || targetId,
    unidades: _marcarPersistidos(unidades),
  }
}

async function _sincronizarIndicadoresDeRespaldo(unidades = []) {
  const indicadores = _flattenIndicadores(unidades)
  if (indicadores.length === 0) return []

  const { error } = await supabase
    .from('indicators')
    .upsert(indicadores, { onConflict: 'id' })
    .select('id')

  if (error) throw error
  return indicadores
}

function _flattenIndicadores(unidades = []) {
  const rows = []
  let orderIndex = 1

  for (const unidad of unidades || []) {
    for (const objetivo of unidad.objetivos || []) {
      for (const indicador of objetivo.indicadores || []) {
        const id = String(indicador?.id || '').trim()
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
          continue
        }

        const titulo = String(indicador.titulo || indicador.nombre || '').trim()
        const descripcion = String(indicador.descripcion || titulo).trim()

        rows.push({
          id,
          node_id: null,
          nombre: titulo,
          description: descripcion,
          is_required: true,
          activo: true,
          order_index: orderIndex++,
        })
      }
    }
  }

  return rows
}

function _marcarPersistidos(unidades = []) {
  return unidades.map((u) => ({
    ...u,
    persistido: true,
    objetivos: (u.objetivos || []).map((o) => ({
      ...o,
      persistido: true,
      indicadores: (o.indicadores || []).map((ind) => ({
        ...ind,
        persistido: true,
      })),
    })),
  }))
}

function _esFuncionNoDisponibile(error) {
  return Boolean(
    error &&
    (
      error.code === 'PGRST202' ||
      error.code === 'PGRST205' ||
      /schema cache|Could not find the function|function public\.fn_sincronizar_arbol_curricular/i.test(
        String(error.message || ''),
      )
    ),
  )
}


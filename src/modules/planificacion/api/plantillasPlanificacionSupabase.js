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
    .select('id, nombre, objetivos, contenido, recursos, evaluacion_metodo')
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

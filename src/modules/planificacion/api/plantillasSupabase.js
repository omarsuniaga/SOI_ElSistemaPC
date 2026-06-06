import { supabase } from '../../../lib/supabaseClient.js'

/**
 * PlantillasSupabase — Adaptador de Supabase para plantillas_dsl.
 * Reemplaza el arreglo DSL_TEMPLATES hardcodeado en planificacionView.js.
 */

/**
 * Obtiene todas las plantillas DSL activas.
 * @returns {Promise<Array<{id: string, nombre: string, instrumento: string, descripcion: string, contenido: string}>>}
 */
export async function obtenerPlantillas() {
  const { data, error } = await supabase
    .from('plantillas_dsl')
    .select('id, nombre, instrumento, descripcion, contenido')
    .eq('activo', true)
    .order('nombre')

  if (error) {
    console.error('Error cargando plantillas DSL:', error.message)
    throw new Error('No se pudieron cargar las plantillas')
  }

  return data || []
}

/**
 * Obtiene una plantilla por ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function obtenerPlantilla(id) {
  const { data, error } = await supabase.from('plantillas_dsl').select('*').eq('id', id).single()

  if (error) {
    console.error('Error cargando plantilla:', error.message)
    throw new Error('Plantilla no encontrada')
  }

  return data
}

/**
 * Crea una nueva plantilla DSL.
 * @param {{ nombre: string, instrumento?: string, descripcion?: string, contenido: string }} plantilla
 * @returns {Promise<object>}
 */
export async function crearPlantilla(plantilla) {
  const { data, error } = await supabase
    .from('plantillas_dsl')
    .insert({
      nombre: plantilla.nombre.trim(),
      instrumento: plantilla.instrumento?.trim() || 'General',
      descripcion: plantilla.descripcion?.trim() || '',
      contenido: plantilla.contenido.trim(),
    })
    .select()

  if (error) {
    console.error('Error creando plantilla:', error.message)
    throw new Error('No se pudo crear la plantilla')
  }

  return data[0]
}

/**
 * Actualiza una plantilla existente.
 * @param {string} id
 * @param {{ nombre?: string, instrumento?: string, descripcion?: string, contenido?: string, activo?: boolean }} cambios
 * @returns {Promise<object>}
 */
export async function actualizarPlantilla(id, cambios) {
  const { data, error } = await supabase
    .from('plantillas_dsl')
    .update(cambios)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando plantilla:', error.message)
    throw new Error('No se pudo actualizar la plantilla')
  }

  return data[0]
}

/**
 * Elimina (desactiva) una plantilla.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function eliminarPlantilla(id) {
  // Soft-delete: desactivar en vez de borrar
  const { error } = await supabase.from('plantillas_dsl').update({ activo: false }).eq('id', id)

  if (error) {
    console.error('Error eliminando plantilla:', error.message)
    throw new Error('No se pudo eliminar la plantilla')
  }
}

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene todos los períodos académicos, ordenados por fecha de inicio descendente.
 */
export async function getPeriodos() {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .order('fecha_inicio', { ascending: false })

  if (error) throw new Error('No se pudieron cargar los períodos')
  return data
}

/**
 * Obtiene el período académico marcado como activo.
 */
export async function getPeriodoActivo() {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .eq('activo', true)
    .single()

  if (error) return null
  return data
}

/**
 * Crea un nuevo período académico.
 */
export async function crearPeriodo(periodo) {
  if (!periodo.nombre) throw new Error('El nombre es obligatorio')
  if (!periodo.fecha_inicio) throw new Error('La fecha de inicio es obligatoria')
  if (!periodo.fecha_fin) throw new Error('La fecha de fin es obligatoria')

  const { data, error } = await supabase
    .from('periodos')
    .insert([{
      nombre:       periodo.nombre.trim(),
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin:    periodo.fecha_fin,
      activo:       periodo.activo ?? false,
    }])
    .select()

  if (error) throw new Error('No se pudo crear el período')
  return data[0]
}

/**
 * Actualiza los datos de un período existente.
 */
export async function actualizarPeriodo(id, datos) {
  const { data, error } = await supabase
    .from('periodos')
    .update(datos)
    .eq('id', id)
    .select()

  if (error) throw new Error('No se pudo actualizar el período')
  return data[0]
}

/**
 * Activa un período y desactiva todos los demás.
 */
export async function activarPeriodo(periodoId) {
  // Desactivar todos primero
  await supabase.from('periodos').update({ activo: false }).neq('id', periodoId)

  // Activar el seleccionado
  const { data, error } = await supabase
    .from('periodos')
    .update({ activo: true })
    .eq('id', periodoId)
    .select()

  if (error) throw new Error('No se pudo activar el período')
  return data[0]
}

/**
 * Elimina un período académico.
 */
export async function eliminarPeriodo(id) {
  const { error } = await supabase
    .from('periodos')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      throw new Error('No se puede eliminar el período porque tiene datos asociados (asistencias, notas, etc.)')
    }
    throw new Error('No se pudo eliminar el período')
  }
  return true
}

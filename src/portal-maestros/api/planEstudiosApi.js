import { supabase } from '../../lib/supabaseClient.js'

const TABLE = 'alumno_plan_entradas'

/**
 * Fetch all plan entries for a student, ordered newest first.
 * @param {string} alumnoId
 * @returns {Promise<Array>}
 */
export async function fetchPlanEntradas(alumnoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, tipo, titulo, descripcion, nivel_referencia, objetivo_id, sesion_id, created_at, maestro_id')
    .eq('alumno_id', alumnoId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Insert a new plan entry.
 * @param {{ alumno_id, maestro_id, tipo, titulo, descripcion?, nivel_referencia?, objetivo_id?, sesion_id? }} entrada
 * @returns {Promise<Object>} The inserted row
 */
export async function insertPlanEntrada(entrada) {
  if (!entrada.titulo?.trim()) throw new Error('titulo requerido')

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      alumno_id:        entrada.alumno_id,
      maestro_id:       entrada.maestro_id,
      tipo:             entrada.tipo,
      titulo:           entrada.titulo.trim(),
      descripcion:      entrada.descripcion?.trim() || null,
      nivel_referencia: entrada.nivel_referencia || null,
      objetivo_id:      entrada.objetivo_id || null,
      sesion_id:        entrada.sesion_id || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Update an existing entry (titulo, descripcion, nivel_referencia).
 * @param {string} id
 * @param {{ titulo?, descripcion?, nivel_referencia? }} changes
 * @returns {Promise<Object>}
 */
export async function updatePlanEntrada(id, changes) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Delete a plan entry by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deletePlanEntrada(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

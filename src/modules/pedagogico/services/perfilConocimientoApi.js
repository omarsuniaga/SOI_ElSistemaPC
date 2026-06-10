import { supabase } from '../../../lib/supabaseClient.js'

const TABLE = 'perfil_conocimiento'

/**
 * Get the knowledge profile for a student.
 * Returns assertions grouped by dimension, excluding estado='descartado'.
 *
 * @param {string} alumnoId
 * @returns {Promise<{ data: Array, grouped: object }>}
 */
export async function getPerfil(alumnoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      id,
      alumno_id,
      dimension,
      item,
      indicator_id,
      madurez,
      confianza,
      estado,
      origen_obs_id,
      evidencia_texto,
      creado_por,
      created_at,
      updated_at
    `,
    )
    .eq('alumno_id', alumnoId)
    .neq('estado', 'descartado')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Group by dimension
  const grouped = {}
  for (const a of data || []) {
    const dim = a.dimension
    if (!grouped[dim]) grouped[dim] = []
    grouped[dim].push(a)
  }

  return { data: data || [], grouped }
}

/**
 * Confirm a proposed assertion.
 * Sets estado='confirmado' for the given assertion id.
 *
 * @param {string} id — perfil_conocimiento.id
 * @returns {Promise<object>}
 */
export async function confirmarPropuesta(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      estado: 'confirmado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Discard a proposed assertion.
 * Sets estado='descartado' for the given assertion id.
 *
 * @param {string} id — perfil_conocimiento.id
 * @returns {Promise<object>}
 */
export async function descartarPropuesta(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      estado: 'descartado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get the profile summary stats for a student (used in cockpit cards).
 *
 * @param {string} alumnoId
 * @returns {Promise<{ total: number, confirmados: number, propuestos: number, dimensiones: string[] }>}
 */
export async function getPerfilSummary(alumnoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('dimension, estado, confianza')
    .eq('alumno_id', alumnoId)
    .neq('estado', 'descartado')

  if (error) throw error

  const rows = data || []
  return {
    total: rows.length,
    confirmados: rows.filter((r) => r.estado === 'confirmado').length,
    propuestos: rows.filter((r) => r.estado === 'propuesto').length,
    dimensiones: [...new Set(rows.map((r) => r.dimension))],
  }
}

/**
 * Get the historial (trayectoria de madurez) for a specific profile assertion.
 *
 * @param {string} perfilId — perfil_conocimiento.id
 * @returns {Promise<Array>}
 */
export async function getPerfilHistorial(perfilId) {
  const { data, error } = await supabase
    .from('perfil_conocimiento_historial')
    .select('*')
    .eq('perfil_id', perfilId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

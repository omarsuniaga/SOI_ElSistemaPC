import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Get the active curriculum for a given instrumento + nivel pair.
 * Returns null if none found.
 */
export async function obtenerCurriculo(instrumento, nivel) {
  let query = supabase
    .from('curriculos')
    .select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `)
    .eq('activo', true)

  if (instrumento) query = query.eq('instrumento', instrumento)
  if (nivel) query = query.eq('nivel', nivel)

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data || null
}

/**
 * List all curricula (for admin table view).
 */
export async function listarCurriculos() {
  const { data, error } = await supabase
    .from('curriculos')
    .select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `)
    .order('instrumento')
  if (error) throw error
  return (data || []).map(c => ({
    ...c,
    total_objetivos: c.curriculo_pilares?.reduce(
      (sum, p) => sum + (p.curriculo_objetivos?.length || 0), 0
    ) ?? 0
  }))
}

export async function crearCurriculo({ instrumento, nivel, descripcion }) {
  const { data, error } = await supabase
    .from('curriculos')
    .insert({ instrumento, nivel, descripcion })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarCurriculo(id, fields) {
  const { data, error } = await supabase
    .from('curriculos')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleActivoCurriculo(id, activo) {
  return actualizarCurriculo(id, { activo })
}

// ── Pillars ──────────────────────────────────────────────────────────────────

export async function crearPilar(curriculo_id, nombre, orden = 0) {
  const { data, error } = await supabase
    .from('curriculo_pilares')
    .insert({ curriculo_id, nombre, orden })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarPilar(id, fields) {
  const { data, error } = await supabase
    .from('curriculo_pilares')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarPilar(id) {
  const { error } = await supabase.from('curriculo_pilares').delete().eq('id', id)
  if (error) throw error
}

// ── Objectives ───────────────────────────────────────────────────────────────

export async function crearObjetivo(pilar_id, descripcion, orden = 0) {
  const { data, error } = await supabase
    .from('curriculo_objetivos')
    .insert({ pilar_id, descripcion, orden })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarObjetivo(id, fields) {
  const { data, error } = await supabase
    .from('curriculo_objetivos')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarObjetivo(id) {
  const { error } = await supabase.from('curriculo_objetivos').delete().eq('id', id)
  if (error) throw error
}

// ── Adopt AI Proposal ────────────────────────────────────────────────────────

/**
 * Creates a complete curriculum from an AI proposal in a single transaction.
 * Calls crearCurriculo → crearPilar (per pilar) → crearObjetivo (per objetivo).
 * Throws on any step failure — no rollback (partial curriculo can be deleted via editor).
 *
 * @param {object} opts
 * @param {string} opts.instrumento
 * @param {string} opts.nivel
 * @param {string} opts.descripcion - AI-generated summary used as curriculo description
 * @param {Array}  opts.pilares - [{ nombre, tipo, objetivos: [{ descripcion }] }]
 * @returns {Promise<{ id: string }>} - the created curriculo
 */
export async function adoptarPropuesta({ instrumento, nivel, descripcion, pilares }) {
  if (!instrumento || instrumento.trim() === '') {
    throw new Error('El instrumento es obligatorio para crear el plan.')
  }
  if (!pilares || pilares.length === 0) {
    throw new Error('La propuesta debe tener al menos un pilar.')
  }

  // Step 1: create curriculo
  const curriculo = await crearCurriculo({
    instrumento: instrumento.trim(),
    nivel: nivel?.trim() || '',
    descripcion: descripcion?.trim() || 'Plan generado por IA',
  })

  // Step 2: create pilares and their objetivos in order
  for (let i = 0; i < pilares.length; i++) {
    const pilarData = pilares[i]
    const pilar = await crearPilar(curriculo.id, pilarData.nombre || `Pilar ${i + 1}`, i)

    const objetivos = pilarData.objetivos || []
    for (let j = 0; j < objetivos.length; j++) {
      await crearObjetivo(pilar.id, objetivos[j].descripcion || `Objetivo ${j + 1}`, j)
    }
  }

  return curriculo
}


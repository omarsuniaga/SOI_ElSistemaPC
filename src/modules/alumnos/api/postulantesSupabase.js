import { supabase } from '../../../lib/supabaseClient.js'

function normalize(str) {
  return (str ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

export async function buscarPostulante(query) {
  const q = normalize(query)
  if (!q || q.length < 2) return []

  const { data, error } = await supabase
    .from('postulantes')
    .select('*')
    .or(
      `nombre_completo.ilike.*${q}*,telefono_alumno.ilike.*${q}*,madre_tlf_whatsapp.ilike.*${q}*,padre_tlf_whatsapp.ilike.*${q}*`,
    )
    .limit(20)

  if (error) {
    console.error('[postulantesSupabase] Error searching:', error)
    throw error
  }

  // Deduplicate: same nombre + correo = same submission
  const seen = new Set()
  return (data ?? []).filter((r) => {
    const key = `${r.nombre_completo || ''}|${r.correo || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function obtenerPostulante(id) {
  const { data, error } = await supabase.from('postulantes').select('*').eq('id', id).maybeSingle()

  if (error) {
    console.error('[postulantesSupabase] Error fetching:', error)
    throw error
  }

  return data
}

export async function sincronizarPostulantes() {
  const { data, error } = await supabase.functions.invoke('sync-postulantes', {
    method: 'POST',
  })

  if (error) {
    console.error('[postulantesSupabase] Error syncing:', error)
    const status = error.context?.status ?? 0
    const body = error.context?.body ?? {}
    const apiError = new Error(body?.error || error.message || 'Error al sincronizar')
    apiError.status = status
    throw apiError
  }

  return data
}

export async function listarPostulantes() {
  const { data, error } = await supabase
    .from('postulantes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[postulantesSupabase] Error listing:', error)
    throw error
  }

  return data ?? []
}

/**
 * Backfill: llena campos vacíos/nulos en alumnos con datos de postulantes.
 * Matching: primero por correo, fallback por nombre normalizado.
 * @param {boolean} dryRun - Si true, solo previsualiza sin escribir.
 * @returns {Promise<{success: boolean, data: Array, dry_run: boolean}>}
 */
export async function backfillDesdePostulantes(dryRun = false) {
  const { data, error } = await supabase.rpc('backfill_alumnos_desde_postulantes', {
    dry_run: dryRun,
  })

  if (error) {
    console.error('[postulantesSupabase] Error backfilling:', error.message)
    throw new Error(`Error al backfillear: ${error.message}`)
  }

  return {
    success: true,
    data: data ?? [],
    dry_run: dryRun,
  }
}

export * from './postuladosSupabase.js'


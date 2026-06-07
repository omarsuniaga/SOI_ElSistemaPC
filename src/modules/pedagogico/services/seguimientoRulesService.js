import { supabase } from '../../../lib/supabaseClient.js'

const TABLE = 'seguimiento_reglas'

export async function listSeguimientoRules({ tipo, activo } = {}) {
  let q = supabase.from(TABLE).select('*').order('prioridad').order('nombre')
  if (tipo !== undefined)   q = q.eq('tipo', tipo)
  if (activo !== undefined) q = q.eq('activo', activo)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getSeguimientoRuleById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createSeguimientoRule(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, updated_at: new Date().toISOString() })
    .select().single()
  if (error) throw error
  return data
}

export async function updateSeguimientoRule(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select().single()
  if (error) throw error
  return data
}

export async function toggleSeguimientoRule(id, activo) {
  return updateSeguimientoRule(id, { activo })
}

const DEFAULT_RULES = [
  { nombre: 'Asistencia irregular mensual',           tipo: 'asistencia_irregular',
    descripcion: 'Detecta alumnos con ausencias injustificadas dentro del mes.',
    config: { periodo: 'mensual', leve: 2, medio: 3, alto: 4, critico: 5, contar_justificadas: false },
    activo: true, prioridad: 1 },
  { nombre: 'Tardanzas recurrentes',                  tipo: 'tardanzas_recurrentes',
    descripcion: 'Detecta alumnos con múltiples tardanzas dentro del mes.',
    config: { periodo: 'mensual', leve: 3, medio: 5, alto: 7, critico: 10 },
    activo: true, prioridad: 2 },
  { nombre: 'Observaciones marcadas para seguimiento', tipo: 'observacion_requiere_seguimiento',
    descripcion: 'Detecta observaciones de maestros que requieren seguimiento institucional.',
    config: { prioridades: ['alta','urgente'], solo_pendientes: true },
    activo: true, prioridad: 3 },
  { nombre: 'Justificaciones pendientes de revisión', tipo: 'justificaciones_pendientes',
    descripcion: 'Detecta justificaciones sin revisar o acumuladas.',
    config: { max_pendientes: 2, nivel: 'medio' },
    activo: true, prioridad: 4 },
]

/** Seed default rules — idempotent: only inserts rules whose tipo doesn't exist */
export async function seedDefaultSeguimientoRules() {
  const existing = await listSeguimientoRules({})
  const existingTipos = new Set(existing.map(r => r.tipo))
  const toInsert = DEFAULT_RULES.filter(r => !existingTipos.has(r.tipo))
  if (toInsert.length === 0) return { inserted: 0 }
  const { error } = await supabase.from(TABLE).insert(toInsert)
  if (error) throw error
  return { inserted: toInsert.length }
}

/** Get the rule of a given tipo if active, else null */
export async function getActiveRuleByTipo(tipo) {
  const rules = await listSeguimientoRules({ tipo, activo: true })
  return rules[0] || null
}

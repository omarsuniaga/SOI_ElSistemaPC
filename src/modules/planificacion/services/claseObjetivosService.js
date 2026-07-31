/**
 * claseObjetivosService.js — Service layer for clase_mapa_objetivos CRUD
 *
 * ⚠️ REWRITE (Decisión 8, design.md — mapa-gamificado-planificacion): this file
 * previously pointed to `clase_objetivos` / `class_curriculum_plan`, tables that
 * never existed in production (`to_regclass` = NULL, migration `20260722000001`
 * archived by RLS permisivo). It was failing on every call.
 *
 * It now targets `clase_mapa_objetivos`, the real class-owned objectives table
 * from REQ-14/Decisión 1 — objetivos belong directly to a `clase_id` (+ a
 * `level_id` classification reference), there is no `planificacion_id` bridge
 * in the new model.
 *
 * The five exported function NAMES are preserved from the old file on purpose
 * (`agregarObjetivos`, `obtenerObjetivosPorPlanificacion`, `actualizarObjetivo`,
 * `eliminarObjetivos`, `reordenarObjetivos`) so existing imports
 * (`useClasePlanificacion.js`, `curriculumLinkerPanel.js`) keep resolving real
 * exports instead of `undefined` — but their first argument now scopes by
 * `clase_id`, not `planificacion_id`. This is a disclosed, unavoidable
 * behavioral break for those two legacy callers (the "Class Planification"
 * Portal ACM flow, `clasePlanificacionView.js`): the old model they assume has
 * no equivalent anymore under REQ-14's clase-owned tree. See apply-progress.md
 * batch 4 for the full writeup — that flow was already 100% non-functional in
 * production (relation-does-not-exist on every call), so this rewrite cannot
 * regress a working feature, only change *how* the (already broken) call
 * fails or behaves.
 *
 * Pattern: pure service functions using the Supabase client directly (same
 * style as before).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const OBJETIVO_UPDATE_WHITELIST = ['nombre', 'descripcion', 'order_index']

/**
 * Bulk insert objetivos into clase_mapa_objetivos.
 *
 * @param {Array<object>} objetivos - Array of { clase_id, level_id, nombre, descripcion?, orden_objetivo?, origen_node_id?, origen_objetivo_id?, created_by? }
 * @returns {Promise<Array<object>>} Inserted records
 */
export async function agregarObjetivos(objetivos) {
  if (!Array.isArray(objetivos) || objetivos.length === 0) {
    throw new Error('Se requiere al menos un objetivo')
  }

  const rows = objetivos.map((o) => ({
    clase_id: o.clase_id,
    level_id: o.level_id,
    nombre: o.nombre,
    descripcion: o.descripcion || null,
    orden_objetivo: o.orden_objetivo ?? null,
    origen_node_id: o.origen_node_id || null,
    origen_objetivo_id: o.origen_objetivo_id || null,
    created_by: o.created_by || null,
  }))

  const { data, error } = await supabase
    .from('clase_mapa_objetivos')
    .insert(rows)
    .select()

  if (error) throw error
  return data
}

/**
 * Get all non-archived objetivos for a class, ordered by their visual position.
 *
 * NOTE: despite the name (kept for backwards import-compatibility), this now
 * scopes by `claseId`, not a `planificacion_id` — see file header.
 *
 * @param {string} claseId - ID of the class
 * @returns {Promise<Array<object>>} Objetivos for the class
 */
export async function obtenerObjetivosPorPlanificacion(claseId) {
  const { data, error } = await supabase
    .from('clase_mapa_objetivos')
    .select('*')
    .eq('clase_id', claseId)
    .is('archived_at', null)
    .order('order_index')

  if (error) throw error
  return data || []
}

/**
 * Update an objetivo's editable fields.
 *
 * `orden_objetivo` (the hierarchical-ID segment) and `level_id` are immutable
 * once the objetivo has descendant evaluations — enforced at the DB trigger
 * level (`fn_bloquear_objetivo_jerarquico`, Decisión 3). This whitelist adds a
 * defense-in-depth layer: it never even attempts to send those fields.
 *
 * @param {string} objetivoId - ID of the clase_mapa_objetivos record
 * @param {object} updates - Fields to update (nombre, descripcion, order_index)
 * @returns {Promise<object>} Updated record
 */
export async function actualizarObjetivo(objetivoId, updates) {
  const sanitized = {}
  for (const key of OBJETIVO_UPDATE_WHITELIST) {
    if (updates[key] !== undefined) sanitized[key] = updates[key]
  }

  if (Object.keys(sanitized).length === 0) {
    throw new Error(
      'No hay campos válidos para actualizar (permitidos: nombre, descripcion, order_index)',
    )
  }

  const { data, error } = await supabase
    .from('clase_mapa_objetivos')
    .update(sanitized)
    .eq('id', objetivoId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Hard-delete all objetivos for a class.
 *
 * If any objetivo has descendant indicadores with evaluations, the
 * `ON DELETE RESTRICT` FK on `clase_mapa_indicadores.objetivo_id` makes the
 * underlying DELETE fail with Postgres `23503` — the archive-instead flow
 * (REQ-09) lives in `mapaClaseService.js` (Tarea 2.2); this bulk helper only
 * propagates the raw error.
 *
 * @param {string} claseId - ID of the class
 * @returns {Promise<void>}
 */
export async function eliminarObjetivos(claseId) {
  const { error } = await supabase
    .from('clase_mapa_objetivos')
    .delete()
    .eq('clase_id', claseId)

  if (error) throw error
}

/**
 * Reorder objetivos by updating their `order_index` (visual position) only.
 * `orden_objetivo` (the hierarchical-ID segment, REQ-04) is never written
 * here — reordering MUST NOT renumber.
 *
 * @param {string} claseId - ID of the class
 * @param {Array<{id: string, orderIndex: number}>} orden - New ordering
 * @returns {Promise<boolean>} true on success
 */
export async function reordenarObjetivos(claseId, orden) {
  if (!Array.isArray(orden)) return false

  for (const item of orden) {
    const { error } = await supabase
      .from('clase_mapa_objetivos')
      .update({ order_index: item.orderIndex })
      .eq('id', item.id)
      .eq('clase_id', claseId)

    if (error) throw error
  }

  return true
}

/**
 * mapaClaseService.js — Service layer for the class-owned map tree
 * (clase_mapa_objetivos / clase_mapa_indicadores) + template cloning.
 *
 * Tarea 2.2 (openspec/changes/mapa-gamificado-planificacion): CRUD del árbol
 * de clase + invocación del RPC `clonar_plantilla_a_clase` (REQ-10) +
 * manejo del path "borrar falla con 23503 → ofrecer archivar" (REQ-09,
 * Decisión 4 de design.md).
 *
 * Decisión 4 (design.md): con evaluaciones asociadas, el `DELETE` falla en
 * la base con SQLSTATE `23503` (FK `ON DELETE RESTRICT` en
 * `evaluacion_indicador.clase_indicador_id` / `clase_mapa_indicadores.objetivo_id`).
 * Este servicio captura ese código y lo traduce a `RequiereArchivarError`,
 * para que la capa de UI (objetivoEditorModal.js, Tarea 3.3) pueda ofrecer
 * archivar en su lugar en vez de mostrar un error de Postgres crudo.
 *
 * Pattern: pure service functions using the Supabase client directly.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const POSTGRES_FK_VIOLATION = '23503'

const OBJETIVO_UPDATE_WHITELIST = ['nombre', 'descripcion', 'order_index']
const INDICADOR_UPDATE_WHITELIST = ['descripcion', 'order_index', 'es_requerido']

/**
 * Thrown when a hard DELETE fails because the row (or a descendant) has
 * evaluations referencing it (Postgres 23503 / FK RESTRICT). Callers should
 * catch this and offer "archivar" instead of surfacing a raw DB error.
 */
export class RequiereArchivarError extends Error {
  constructor(entidad, causa) {
    super(`No se puede borrar: tiene evaluaciones asociadas. Archivar en su lugar (${entidad}).`)
    this.name = 'RequiereArchivarError'
    this.code = 'REQUIERE_ARCHIVAR'
    this.entidad = entidad
    this.cause = causa
  }
}

function _sanitizar(updates, whitelist) {
  const sanitized = {}
  for (const key of whitelist) {
    if (updates[key] !== undefined) sanitized[key] = updates[key]
  }
  return sanitized
}

// ── Objetivos ────────────────────────────────────────────────────────────

/**
 * Create a single objetivo in clase_mapa_objetivos.
 *
 * @param {object} datos - { clase_id, level_id, nombre, descripcion?, orden_objetivo?, origen_node_id?, origen_objetivo_id?, created_by? }
 * @returns {Promise<object>} Created record
 */
export async function crearObjetivo(datos) {
  const { data, error } = await supabase
    .from('clase_mapa_objetivos')
    .insert({
      clase_id: datos.clase_id,
      level_id: datos.level_id,
      nombre: datos.nombre,
      descripcion: datos.descripcion || null,
      orden_objetivo: datos.orden_objetivo ?? null,
      origen_node_id: datos.origen_node_id || null,
      origen_objetivo_id: datos.origen_objetivo_id || null,
      created_by: datos.created_by || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all non-archived objetivos for a class, ordered by their visual position.
 *
 * @param {string} claseId
 * @returns {Promise<Array<object>>}
 */
export async function obtenerObjetivosPorClase(claseId) {
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
 * Update an objetivo's editable fields (nombre, descripcion, order_index).
 * `orden_objetivo` and `level_id` are immutable once evaluations exist,
 * enforced at the DB trigger level (Decisión 3) — never even attempted here.
 *
 * @param {string} objetivoId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function actualizarObjetivo(objetivoId, updates) {
  const sanitized = _sanitizar(updates, OBJETIVO_UPDATE_WHITELIST)

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
 * Archive an objetivo (soft delete) — hidden from the active map, preserved
 * in history and in calculations already made (REQ-09).
 *
 * @param {string} objetivoId
 * @returns {Promise<object>}
 */
export async function archivarObjetivo(objetivoId) {
  const { data, error } = await supabase
    .from('clase_mapa_objetivos')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', objetivoId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Hard-delete an objetivo. If it (or a descendant indicador) has
 * evaluations, Postgres rejects the DELETE with 23503 — translated here to
 * `RequiereArchivarError` so the UI can offer archiving instead (REQ-09).
 *
 * @param {string} objetivoId
 * @returns {Promise<void>}
 */
export async function eliminarObjetivo(objetivoId) {
  const { error } = await supabase.from('clase_mapa_objetivos').delete().eq('id', objetivoId)

  if (error) {
    if (error.code === POSTGRES_FK_VIOLATION) {
      throw new RequiereArchivarError('objetivo', error)
    }
    throw error
  }
}

// ── Indicadores ──────────────────────────────────────────────────────────

/**
 * Create a single indicador in clase_mapa_indicadores.
 *
 * @param {object} datos - { objetivo_id, clase_id, descripcion, orden_indicador?, es_requerido?, origen_indicator_id? }
 * @returns {Promise<object>}
 */
export async function crearIndicador(datos) {
  const { data, error } = await supabase
    .from('clase_mapa_indicadores')
    .insert({
      objetivo_id: datos.objetivo_id,
      clase_id: datos.clase_id,
      descripcion: datos.descripcion,
      orden_indicador: datos.orden_indicador ?? null,
      es_requerido: datos.es_requerido ?? true,
      origen_indicator_id: datos.origen_indicator_id || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all non-archived indicadores for an objetivo, ordered by their visual position.
 *
 * @param {string} objetivoId
 * @returns {Promise<Array<object>>}
 */
export async function obtenerIndicadoresPorObjetivo(objetivoId) {
  const { data, error } = await supabase
    .from('clase_mapa_indicadores')
    .select('*')
    .eq('objetivo_id', objetivoId)
    .is('archived_at', null)
    .order('order_index')

  if (error) throw error
  return data || []
}

/**
 * Todos los indicadores de una clase (todos sus objetivos), en una sola
 * consulta — usado por la exportación a PDF de la ruta completa (evita N+1
 * llamadas a obtenerIndicadoresPorObjetivo, una por cada objetivo).
 *
 * @param {string} claseId
 * @returns {Promise<Array<object>>}
 */
export async function obtenerIndicadoresPorClase(claseId) {
  const { data, error } = await supabase
    .from('clase_mapa_indicadores')
    .select('*')
    .eq('clase_id', claseId)
    .is('archived_at', null)
    .order('order_index')

  if (error) throw error
  return data || []
}

/**
 * Update an indicador's editable fields (descripcion, order_index, es_requerido).
 * `orden_indicador` (the hierarchical-ID segment) is immutable once
 * evaluations exist, enforced at the DB trigger level (Decisión 3).
 *
 * @param {string} indicadorId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function actualizarIndicador(indicadorId, updates) {
  const sanitized = _sanitizar(updates, INDICADOR_UPDATE_WHITELIST)

  const { data, error } = await supabase
    .from('clase_mapa_indicadores')
    .update(sanitized)
    .eq('id', indicadorId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Archive an indicador (soft delete) — same semantics as archivarObjetivo.
 *
 * @param {string} indicadorId
 * @returns {Promise<object>}
 */
export async function archivarIndicador(indicadorId) {
  const { data, error } = await supabase
    .from('clase_mapa_indicadores')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', indicadorId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Hard-delete an indicador. If it has evaluations, Postgres rejects the
 * DELETE with 23503 — translated to `RequiereArchivarError` (REQ-09).
 *
 * @param {string} indicadorId
 * @returns {Promise<void>}
 */
export async function eliminarIndicador(indicadorId) {
  const { error } = await supabase.from('clase_mapa_indicadores').delete().eq('id', indicadorId)

  if (error) {
    if (error.code === POSTGRES_FK_VIOLATION) {
      throw new RequiereArchivarError('indicador', error)
    }
    throw error
  }
}

// ── Plantillas (clonado) ────────────────────────────────────────────────

/**
 * Invoke the `clonar_plantilla_a_clase` RPC (Decisión 6, REQ-10).
 * SECURITY DEFINER on the DB side — validates `es_maestro_de_clase` and that
 * the plantilla's level is assigned to the class via `acm_active_routes`
 * before copying `objetivos`/`indicators` into the class-owned tables.
 *
 * @param {string} claseId
 * @param {string} plantillaId
 * @param {Array<string>|null} [nodeIds] - optional filter, clone only these nodes
 * @returns {Promise<Array<{objetivo_id, origen_objetivo_id, indicador_id, origen_indicator_id}>>}
 */
export async function clonarPlantillaAClase(claseId, plantillaId, nodeIds = null) {
  const { data, error } = await supabase.rpc('clonar_plantilla_a_clase', {
    p_clase_id: claseId,
    p_plantilla_id: plantillaId,
    p_node_ids: nodeIds,
  })

  if (error) throw new Error(error.message || 'Error al clonar la plantilla')
  return data || []
}

/**
 * List the active seed templates (`mapa_plantillas`, Decisión 6, REQ-10),
 * optionally scoped to a single `level_id`. Used by
 * `DisenadorCurricularView.js` (Tarea 3.6) to offer "Clonar desde plantilla"
 * only for the levels actually assigned to the class.
 *
 * @param {string|null} [levelId]
 * @returns {Promise<Array<object>>}
 */
export async function obtenerPlantillasDisponibles(levelId = null) {
  let query = supabase.from('mapa_plantillas').select('*').eq('activo', true).order('nombre')
  if (levelId) query = query.eq('level_id', levelId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ── Catálogo propio (Nivel → Objetivo General → Objetivo Específico) ─────
// Reemplaza al árbol viejo (routes/route_versions/levels/nodes/objetivos/
// indicators, compartido por 50+ archivos de otros módulos — no se toca).
// Este catálogo es propio del mapa gamificado, scoped por `clases.instrumento`.

/**
 * Niveles del catálogo para el instrumento de una clase (REQ-01: el selector
 * de Nivel del builder MUST ofrecer únicamente estos). Array vacío = todavía
 * no hay catálogo cargado para ese instrumento, la UI MUST bloquear la
 * creación de nodos y sugerir clonar/crear desde cero.
 *
 * @param {string} claseId
 * @returns {Promise<Array<{id: string, nombre: string}>>}
 */
export async function obtenerNivelesAsignadosClase(claseId) {
  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('instrumento')
    .eq('id', claseId)
    .single()

  if (claseError || !clase?.instrumento) return []

  const { data, error } = await supabase
    .from('catalogo_niveles')
    .select('id, nombre')
    .eq('instrumento', clase.instrumento)
    .eq('activo', true)
    .order('orden')

  if (error) throw error
  return (data || []).map((l) => ({ id: l.id, nombre: l.nombre }))
}

/**
 * Niveles del catálogo para un instrumento dado (uso directo por la vista de
 * curación ACM, sin pasar por una clase).
 *
 * @param {string} instrumento
 * @returns {Promise<Array<object>>}
 */
export async function obtenerCatalogoNiveles(instrumento) {
  let query = supabase.from('catalogo_niveles').select('*').order('orden')
  if (instrumento) query = query.eq('instrumento', instrumento)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/** @returns {Promise<object>} */
export async function crearNivelCatalogo({ nombre, instrumento, orden, createdBy }) {
  const { data, error } = await supabase
    .from('catalogo_niveles')
    .insert({ nombre, instrumento, orden, created_by: createdBy || null })
    .select()
    .single()

  if (error) throw error
  return data
}

/** @returns {Promise<Array<object>>} */
export async function obtenerObjetivosGeneralesCatalogo(nivelId) {
  const { data, error } = await supabase
    .from('catalogo_objetivos_generales')
    .select('*')
    .eq('nivel_id', nivelId)
    .eq('activo', true)
    .order('orden')

  if (error) throw error
  return data || []
}

/** @returns {Promise<object>} */
export async function crearObjetivoGeneralCatalogo({ nivelId, nombre, descripcion, orden }) {
  const { data, error } = await supabase
    .from('catalogo_objetivos_generales')
    .insert({ nivel_id: nivelId, nombre, descripcion: descripcion || null, orden })
    .select()
    .single()

  if (error) throw error
  return data
}

/** @returns {Promise<Array<object>>} */
export async function obtenerObjetivosEspecificosCatalogo(objetivoGeneralId) {
  const { data, error } = await supabase
    .from('catalogo_objetivos_especificos')
    .select('*')
    .eq('objetivo_general_id', objetivoGeneralId)
    .eq('activo', true)
    .order('orden')

  if (error) throw error
  return data || []
}

/** @returns {Promise<object>} */
export async function crearObjetivoEspecificoCatalogo({ objetivoGeneralId, nombre, orden }) {
  const { data, error } = await supabase
    .from('catalogo_objetivos_especificos')
    .insert({ objetivo_general_id: objetivoGeneralId, nombre, orden })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Invoke the `clonar_catalogo_a_clase` RPC — copia objetivos generales +
 * indicadores de un nivel del catálogo propio hacia clase_mapa_objetivos /
 * clase_mapa_indicadores. Reemplaza a `clonarPlantillaAClase` (árbol viejo).
 *
 * @param {string} claseId
 * @param {string} nivelId
 * @param {Array<string>|null} [objetivoGeneralIds] - filtro opcional
 * @returns {Promise<Array<object>>}
 */
export async function clonarCatalogoAClase(claseId, nivelId, objetivoGeneralIds = null) {
  const { data, error } = await supabase.rpc('clonar_catalogo_a_clase', {
    p_clase_id: claseId,
    p_nivel_id: nivelId,
    p_objetivo_general_ids: objetivoGeneralIds,
  })

  if (error) throw new Error(error.message || 'Error al clonar el catálogo')
  return data || []
}

// ── Estrellas del nodo (Tarea 3.2 — MapaClaseView) ─────────────────────

/**
 * Get the derived stars/progress for every objetivo of a class from
 * `vw_clase_objetivo_estrellas` (Decisión 5: las estrellas nunca se
 * escriben, se derivan en SQL — REQ-06/07/08). Rows are mapped to camelCase
 * to match the `{estrellas, pctAvance, estadoVisual}` shape MapaContenidoSVG
 * expects per node (Tarea 3.1).
 *
 * @param {string} claseId
 * @returns {Promise<Array<{objetivoId, claseId, totalIndicadores, indicadoresEvaluados, pctAvance, alumnosSuperadores, promedioSuperadores, estrellas, estadoVisual}>>}
 */
export async function obtenerEstrellasPorClase(claseId) {
  const { data, error } = await supabase
    .from('vw_clase_objetivo_estrellas')
    .select('*')
    .eq('clase_id', claseId)

  if (error) throw error
  return (data || []).map((row) => ({
    objetivoId: row.objetivo_id,
    claseId: row.clase_id,
    totalIndicadores: row.total_indicadores,
    indicadoresEvaluados: row.indicadores_evaluados,
    pctAvance: row.pct_avance,
    alumnosSuperadores: row.alumnos_superadores,
    promedioSuperadores: row.promedio_superadores,
    estrellas: row.estrellas,
    estadoVisual: row.estado_visual,
  }))
}

/**
 * Nombre de la clase y del maestro titular — usado únicamente para el
 * encabezado del PDF de la ruta de contenido (generarPdfRutaClase.js). No
 * trae el resto de columnas de `clases`/`maestros`: este servicio es del
 * árbol de planificación, no el dueño de esos datos.
 *
 * @param {string} claseId
 * @returns {Promise<{nombreClase: string, nombreMaestro: string}>}
 */
export async function obtenerClaseYMaestroParaExport(claseId) {
  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('nombre, maestro_principal_id')
    .eq('id', claseId)
    .single()

  if (claseError || !clase) return { nombreClase: '', nombreMaestro: '' }

  if (!clase.maestro_principal_id) return { nombreClase: clase.nombre || '', nombreMaestro: '' }

  const { data: maestro } = await supabase
    .from('maestros')
    .select('nombre_completo')
    .eq('id', clase.maestro_principal_id)
    .single()

  return { nombreClase: clase.nombre || '', nombreMaestro: maestro?.nombre_completo || '' }
}

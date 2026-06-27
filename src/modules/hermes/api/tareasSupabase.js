/**
 * tareasSupabase.js — Adaptador real contra la tabla `tareas_institucionales`.
 * Esquema verificado en vivo (2026-06-25, SP-0 ampliado 2026-06-26):
 *   id uuid, titulo text, descripcion text,
 *   departamento soi_departamento (DIR|ACM|ADM|FIN|LOG|COM|TECNICO),
 *   estado tarea_institucional_estado
 *     (pendiente|en_progreso|completada|bloqueada|cancelada|observada),
 *   prioridad tarea_institucional_prioridad (baja|media|alta|critica),
 *   fecha_vencimiento date, asignado_a text,
 *   checklist jsonb [{ item, completado }],
 *   feedback text, documentos_adjuntos jsonb,
 *   event_id uuid (→ calendario_institucional), minuta_id uuid (→ minutas),
 *   created_at, updated_at,
 *   -- SP-0 new columns:
 *   entidad_tipo text, entidad_id uuid, entidad_label text,
 *   correlation_id uuid, updated_by uuid, updated_by_nombre text
 *
 * Las tareas se generan automáticamente por el trigger fn_hermes_auto_delegar_tareas
 * cuando se inserta un evento en calendario_institucional. Este portal las LEE y
 * permite al staff actualizarlas (estado, checklist, feedback).
 *
 * SP-0 agrega: comentarios, historial, entidad asociada, adjuntos con storage_path,
 * estado observada (vía RPC fn_observar_tarea).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'tareas_institucionales'
const COLUMNAS =
  'id, titulo, descripcion, departamento, estado, prioridad, fecha_vencimiento, asignado_a, checklist, feedback, documentos_adjuntos, event_id, minuta_id, created_at, updated_at, entidad_tipo, entidad_id, entidad_label, correlation_id, updated_by, updated_by_nombre'

const STORAGE_BUCKET = 'tareas'
const SIGNED_URL_EXPIRES = 3600 // 1 hour

const ENTIDAD_TIPOS_VALIDOS = [
  'alumno', 'maestro', 'postulante', 'representante', 'instrumento', 'evento', 'otro',
]

export async function getTareas() {
  const { data, error } = await supabase
    .from(TABLA)
    .select(COLUMNAS)
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data || []
}

export async function getTareaById(tareaId) {
  const { data, error } = await supabase
    .from(TABLA)
    .select(COLUMNAS)
    .eq('id', tareaId)
    .single()

  if (error) throw error
  return data
}

export async function getTareasByDepartamento(departamento) {
  const { data, error } = await supabase
    .from(TABLA)
    .select(COLUMNAS)
    .eq('departamento', departamento)
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data || []
}

// SP-3: vista consolidada de procedimientos (agrupados por correlation_id) para el Director.
export async function getProcedimientos() {
  const { data, error } = await supabase.rpc('fn_procedimientos_resumen')
  if (error) throw error
  return data || []
}

export async function getTareasByEvento(eventId) {
  const { data, error } = await supabase
    .from(TABLA)
    .select(COLUMNAS)
    .eq('event_id', eventId)
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data || []
}

export async function updateTareaEstado(tareaId, nuevoEstado) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
    .eq('id', tareaId)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

export async function updateChecklistItem(tareaId, indice, completado) {
  // El checklist es jsonb [{ item, completado }]. Leemos, mutamos por índice, guardamos.
  const { data: tarea, error: fetchError } = await supabase
    .from(TABLA)
    .select('checklist')
    .eq('id', tareaId)
    .single()

  if (fetchError) throw fetchError

  const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : []
  if (indice < 0 || indice >= checklist.length) {
    throw new Error('Índice de checklist fuera de rango')
  }
  checklist[indice] = { ...checklist[indice], completado }

  const { data, error } = await supabase
    .from(TABLA)
    .update({ checklist, updated_at: new Date().toISOString() })
    .eq('id', tareaId)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * Completa la tarea y persiste el feedback (TEXT, no objeto).
 * @param {string} tareaId
 * @param {string} feedbackTexto — comentario de cierre del responsable
 */
export async function completarTarea(tareaId, feedbackTexto = null) {
  const updates = { estado: 'completada', updated_at: new Date().toISOString() }
  if (feedbackTexto != null) updates.feedback = feedbackTexto

  const { data, error } = await supabase
    .from(TABLA)
    .update(updates)
    .eq('id', tareaId)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

export async function guardarFeedback(tareaId, feedbackTexto) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ feedback: feedbackTexto, updated_at: new Date().toISOString() })
    .eq('id', tareaId)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * Crea un evento institucional. El INSERT dispara el trigger
 * fn_hermes_auto_delegar_tareas (cascada Hermes), que genera las tareas
 * departamentales según el protocolo de la categoría del evento.
 *
 * Esquema verificado de calendario_institucional:
 *   titulo (NOT NULL), descripcion, categoria (event_categoria:
 *   concierto|ensayo|reunion|patrocinio|pago|corte|inscripcion|auditoria|otro),
 *   fecha_inicio (NOT NULL tstz), fecha_fin (NOT NULL tstz), ubicacion,
 *   departamento_responsable (soi_departamento, default DIR), metadata, estado.
 *
 * @param {object} evento
 * @returns {Promise<{evento: object, tareasGeneradas: object[]}>}
 */
export async function crearEventoInstitucional(evento) {
  const payload = {
    titulo: evento.titulo,
    descripcion: evento.descripcion || null,
    categoria: evento.categoria || 'otro',
    fecha_inicio: evento.fecha_inicio,
    fecha_fin: evento.fecha_fin || evento.fecha_inicio,
    ubicacion: evento.ubicacion || null,
    departamento_responsable: evento.departamento_responsable || 'DIR',
  }

  const { data, error } = await supabase
    .from('calendario_institucional')
    .insert(payload)
    .select('id, titulo, categoria, fecha_inicio, fecha_fin, departamento_responsable')
    .single()

  if (error) throw error

  // El trigger corre en la misma transacción: al volver el INSERT, las tareas ya existen.
  let tareasGeneradas = []
  try {
    tareasGeneradas = await getTareasByEvento(data.id)
  } catch (_e) {
    // No bloquear la creación si la lectura posterior falla
  }

  return { evento: data, tareasGeneradas }
}

/**
 * Crea una tarea institucional directamente (sin pasar por la cascada de calendario).
 * El INSERT dispara el trigger fn_trigger_hermes_task_wa_alert, que encola un aviso
 * de WhatsApp si la prioridad es alta o critica.
 */
export async function crearTareaInstitucional(payload) {
  const row = {
    titulo: payload.titulo,
    descripcion: payload.descripcion || null,
    departamento: payload.departamento,
    estado: payload.estado || 'pendiente',
    prioridad: payload.prioridad || 'media',
    fecha_vencimiento: payload.fecha_vencimiento || null,
    asignado_a: payload.asignado_a || null,
    checklist: payload.checklist || [],
  }
  const { data, error } = await supabase.from(TABLA).insert(row).select(COLUMNAS).single()
  if (error) throw error
  return data
}

export async function getTareasFiltradas(filtros = {}) {
  let query = supabase.from(TABLA).select(COLUMNAS)

  if (filtros.departamento) query = query.eq('departamento', filtros.departamento)
  if (filtros.estado) query = query.eq('estado', filtros.estado)
  if (filtros.prioridad) query = query.eq('prioridad', filtros.prioridad)
  if (filtros.asignado_a) query = query.eq('asignado_a', filtros.asignado_a)
  if (filtros.event_id) query = query.eq('event_id', filtros.event_id)
  if (filtros.buscar) {
    query = query.or(`titulo.ilike.%${filtros.buscar}%,descripcion.ilike.%${filtros.buscar}%`)
  }

  const { data, error } = await query.order('fecha_vencimiento', {
    ascending: true,
    nullsFirst: false,
  })

  if (error) throw error
  return data || []
}

// ─── SP-0: Comentarios ────────────────────────────────────────────────────────

/**
 * Lista los comentarios de una tarea ordenados por created_at ASC.
 * @param {string} tareaId
 * @returns {Promise<object[]>}
 */
export async function listarComentarios(tareaId) {
  const { data, error } = await supabase
    .from('tarea_comentarios')
    .select('id, tarea_id, autor_id, autor_nombre, cuerpo, created_at')
    .eq('tarea_id', tareaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Inserta un comentario en tarea_comentarios con la identidad real del actor.
 * @param {string} tareaId
 * @param {string} cuerpo
 * @param {{ id: string, nombre: string }} actor — usuario en sesión
 * @returns {Promise<object>}
 */
export async function agregarComentario(tareaId, cuerpo, actor) {
  if (!cuerpo || cuerpo.trim().length === 0) {
    throw new Error('El comentario no puede estar vacío (comentario vacío)')
  }

  const { data, error } = await supabase
    .from('tarea_comentarios')
    .insert({
      tarea_id: tareaId,
      autor_id: actor?.id ?? null,
      autor_nombre: actor?.nombre ?? null,
      cuerpo: cuerpo.trim(),
    })
    .select('id, tarea_id, autor_id, autor_nombre, cuerpo, created_at')
    .single()

  if (error) throw error
  return data
}

// ─── SP-0: Historial ──────────────────────────────────────────────────────────

/**
 * Lista el historial de cambios de una tarea ordenado por created_at ASC.
 * El historial es de sólo lectura (tarea_historial es inmutable para usuarios).
 * @param {string} tareaId
 * @returns {Promise<object[]>}
 */
export async function listarHistorial(tareaId) {
  const { data, error } = await supabase
    .from('tarea_historial')
    .select('id, tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre, actor_rol, actor_departamento, created_at')
    .eq('tarea_id', tareaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ─── SP-0: Entidad asociada ───────────────────────────────────────────────────

/**
 * Actualiza la entidad polimórfica asociada a la tarea.
 * Registra el actor real (no asignado_a) para el trigger de historial.
 * @param {string} tareaId
 * @param {{ tipo: string, id: string, label: string }} entidad
 * @param {{ id: string, nombre: string }} actor — usuario en sesión
 * @returns {Promise<object>}
 */
export async function actualizarEntidadAsociada(tareaId, entidad, actor) {
  if (!ENTIDAD_TIPOS_VALIDOS.includes(entidad.tipo)) {
    throw new Error(`tipo inválido: "${entidad.tipo}". Debe ser uno de: ${ENTIDAD_TIPOS_VALIDOS.join(', ')}`)
  }

  const { data, error } = await supabase
    .from(TABLA)
    .update({
      entidad_tipo: entidad.tipo,
      entidad_id: entidad.id,
      entidad_label: entidad.label,
      updated_by: actor?.id ?? null,
      updated_by_nombre: actor?.nombre ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tareaId)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

// ─── SP-0: Adjuntos ───────────────────────────────────────────────────────────

/**
 * Anexa un adjunto al jsonb documentos_adjuntos de la tarea.
 * El adjunto debe tener storage_path (no URL) según la forma estándar SP-0.
 * @param {string} tareaId
 * @param {{ id, nombre, storage_path, mime_type, size_bytes, subido_por, subido_por_nombre, created_at }} adjunto
 * @returns {Promise<object>} tarea actualizada
 */
export async function agregarAdjunto(tareaId, adjunto) {
  if (!adjunto?.storage_path) {
    throw new Error('storage_path requerido en el adjunto (required)')
  }

  const { data: tarea, error: fetchError } = await supabase
    .from(TABLA)
    .select('documentos_adjuntos')
    .eq('id', tareaId)
    .single()

  if (fetchError) throw fetchError

  const adjuntos = Array.isArray(tarea.documentos_adjuntos) ? tarea.documentos_adjuntos : []
  adjuntos.push(adjunto)

  const { data, error } = await supabase
    .from(TABLA)
    .update({ documentos_adjuntos: adjuntos, updated_at: new Date().toISOString() })
    .eq('id', tareaId)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * Genera una URL firmada desde Supabase Storage para un storage_path dado.
 * La URL NO se persiste — se genera al vuelo cada vez que se necesita.
 * @param {string} storagePath — ej. "tareas/<tarea_id>/<uuid>.jpg"
 * @returns {Promise<string>} URL firmada
 */
export async function urlFirmada(storagePath) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRES)

  if (error) throw error
  return data.signedUrl
}

// ─── SP-0: observarTarea (RPC atómico) ────────────────────────────────────────

/**
 * Transiciona la tarea al estado "observada" de forma atómica mediante
 * el RPC fn_observar_tarea. El comentario es OBLIGATORIO.
 * NUNCA usar updateTareaEstado para pasar a "observada" — debe ser este método.
 *
 * @param {string} tareaId
 * @param {string} comentario — contexto de la observación (no puede estar vacío)
 * @param {{ id: string, nombre: string }} actor — usuario en sesión
 * @returns {Promise<void>}
 */
export async function observarTarea(tareaId, comentario, actor) {
  if (!comentario || comentario.trim().length === 0) {
    throw new Error('El comentario es requerido para observar una tarea (comentario vacío requerido)')
  }

  const { error } = await supabase.rpc('fn_observar_tarea', {
    p_tarea_id: tareaId,
    p_comentario: comentario.trim(),
    p_actor_id: actor?.id ?? null,
    p_actor_nombre: actor?.nombre ?? null,
  })

  if (error) throw error
}

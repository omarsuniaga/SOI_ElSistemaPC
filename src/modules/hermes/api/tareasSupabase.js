/**
 * tareasSupabase.js — Adaptador real contra la tabla `tareas_institucionales`.
 * Esquema verificado en vivo (2026-06-25):
 *   id uuid, titulo text, descripcion text,
 *   departamento soi_departamento (DIR|ACM|ADM|FIN|LOG|COM|TECNICO),
 *   estado tarea_institucional_estado (pendiente|en_progreso|completada|bloqueada|cancelada),
 *   prioridad tarea_institucional_prioridad (baja|media|alta|critica),
 *   fecha_vencimiento date, asignado_a text,
 *   checklist jsonb [{ item, completado }],
 *   feedback text, documentos_adjuntos jsonb,
 *   event_id uuid (→ calendario_institucional), minuta_id uuid (→ minutas),
 *   created_at, updated_at
 *
 * Las tareas se generan automáticamente por el trigger fn_hermes_auto_delegar_tareas
 * cuando se inserta un evento en calendario_institucional. Este portal las LEE y
 * permite al staff actualizarlas (estado, checklist, feedback).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'tareas_institucionales'
const COLUMNAS =
  'id, titulo, descripcion, departamento, estado, prioridad, fecha_vencimiento, asignado_a, checklist, feedback, documentos_adjuntos, event_id, minuta_id, created_at, updated_at'

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

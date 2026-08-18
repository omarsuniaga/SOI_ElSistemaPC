/**
 * hermesOrchestrationApi.js — API para la orquestación activa de eventos/conciertos.
 * Conecta el frontend con las funciones PL/pgSQL y tablas de Hermes (SOP-SOI-CON-001).
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Dispara la orquestación de un nuevo concierto en Hermes.
 * Crea el evento en G0, inicializa hitos G0-G10, genera las 7 tareas departamentales
 * y detecta inconsistencias iniciales, transicionando a G1.
 *
 * @param {object} params
 * @param {string} params.nombre - Nombre o título del concierto
 * @param {string} params.lugar - Locación del evento
 * @param {string} params.fecha - Fecha en formato YYYY-MM-DD
 * @param {string} [params.hora] - Hora en formato HH:MM:SS
 * @param {string} [params.institucion] - Institución convocante/contratante
 * @param {string} [params.mensajeOriginal] - Mensaje del cual se extrajo la solicitud
 * @returns {Promise<object>} Resultado de la orquestación con evento_id, tareas_creadas, etc.
 */
export async function orquestarConcierto(params) {
  const { data, error } = await supabase.rpc('fn_hermes_orquestar_concierto', {
    p_nombre: params.nombre,
    p_lugar: params.lugar,
    p_fecha: params.fecha,
    p_hora: params.hora || null,
    p_institucion: params.institucion || null,
    p_mensaje_original: params.mensajeOriginal || null,
  })

  if (error) {
    console.error('Error in orquestarConcierto:', error)
    throw error
  }
  return data
}

/**
 * Confirma el tiempo de traslado (dato crítico D) y calcula la línea temporal operativa.
 *
 * @param {string} eventoId - UUID del evento_concierto
 * @param {number} minutos - Duración estimada de viaje en minutos
 * @returns {Promise<object>} Horarios calculados (convocatoria, salida, regreso, etc.)
 */
export async function confirmarTiempoTraslado(eventoId, minutos) {
  const { data, error } = await supabase.rpc('fn_hermes_calcular_tiempos_concierto', {
    p_evento_id: eventoId,
    p_tiempo_traslado_minutos: parseInt(minutos, 10),
  })

  if (error) {
    console.error('Error in confirmarTiempoTraslado:', error)
    throw error
  }
  return data
}

/**
 * Obtiene el detalle completo de un evento de concierto.
 *
 * @param {string} eventoId
 * @returns {Promise<object>}
 */
export async function getEventoConcierto(eventoId) {
  const { data, error } = await supabase
    .from('eventos_conciertos')
    .select('*')
    .eq('id', eventoId)
    .single()

  if (error) {
    console.error('Error in getEventoConcierto:', error)
    throw error
  }
  return data
}

/**
 * Obtiene las tareas generadas para un concierto específico.
 *
 * @param {string} eventoId
 * @returns {Promise<Array>}
 */
export async function getTareasConcierto(eventoId) {
  const { data, error } = await supabase
    .from('tareas_concierto')
    .select('*')
    .eq('evento_id', eventoId)
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error in getTareasConcierto:', error)
    throw error
  }
  return data || []
}

/**
 * Registra feedback o cambio de estado en una tarea de concierto.
 * Desbloquea tareas dependientes y escala alertas en caso de bloqueo.
 *
 * @param {string} tareaId - UUID de la tarea_concierto
 * @param {string} nuevoEstado - 'pendiente' | 'en_proceso' | 'bloqueada' | 'completada' | 'no_aplica'
 * @param {object} [feedback] - { respuesta, observaciones, por_quien, timestamp }
 * @returns {Promise<object>}
 */
export async function procesarFeedbackTarea(tareaId, nuevoEstado, feedback = null) {
  const { data, error } = await supabase.rpc('fn_hermes_procesar_feedback_tarea', {
    p_tarea_id: tareaId,
    p_estado_nuevo: nuevoEstado,
    p_feedback: feedback ? feedback : null,
  })

  if (error) {
    console.error('Error in procesarFeedbackTarea:', error)
    throw error
  }
  return data
}

/**
 * Obtiene las alertas operativas detectadas para un concierto.
 *
 * @param {string} eventoId
 * @returns {Promise<Array>}
 */
export async function getAlertasConcierto(eventoId) {
  const { data, error } = await supabase
    .from('alertas_operativas')
    .select('*')
    .eq('evento_id', eventoId)
    .order('severidad', { ascending: false })

  if (error) {
    console.error('Error in getAlertasConcierto:', error)
    throw error
  }
  return data || []
}

/**
 * Obtiene el estado de los hitos G0 a G10 de un concierto.
 *
 * @param {string} eventoId
 * @returns {Promise<Array>}
 */
export async function getHitosConcierto(eventoId) {
  const { data, error } = await supabase
    .from('hitos_concierto')
    .select('*')
    .eq('evento_id', eventoId)
    .order('numero', { ascending: true })

  if (error) {
    console.error('Error in getHitosConcierto:', error)
    throw error
  }
  return data || []
}

/**
 * Inserta un mensaje entrante en el inbox de Telegram para procesamiento reactivo por Hermes.
 *
 * @param {object} msg - { chatId, userId, userName, texto }
 * @returns {Promise<object>}
 */
export async function enviarMensajeTelegram(msg) {
  const { data, error } = await supabase
    .from('hermes_inbox_telegram')
    .insert({
      chat_id: msg.chatId,
      user_id: msg.userId,
      user_name: msg.userName,
      mensaje: msg.texto,
      mensaje_timestamp: Math.floor(Date.now() / 1000),
      procesado: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error in enviarMensajeTelegram:', error)
    throw error
  }
  return data
}

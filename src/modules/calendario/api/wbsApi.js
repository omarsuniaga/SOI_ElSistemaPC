/**
 * wbsApi.js — Operaciones WBS del Motor de Orquestación contra Supabase.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { construirArcosDag } from '../domain/dagResolutionEngine.js'

/**
 * Activa el Plan WBS de un evento:
 *   1. Inserta los hitos como tareas_institucionales (con estado resuelto por DAG).
 *   2. Enlaza las dependencias (depende_de_tarea_id) entre las tareas insertadas.
 *   3. Marca el evento como es_macro_evento = true en calendario_institucional.
 *
 * @param {string} eventId         UUID del evento en calendario_institucional
 * @param {string} eventoTitulo    Título del evento (para descripción de tareas)
 * @param {Date}   fechaEvento     Fecha del evento (para calcular fecha_vencimiento)
 * @param {Array}  hitos           Array de hitos con estadoInicial ya resuelto
 * @returns {{ count: number }}
 */
export async function activarPlanWBS(eventId, eventoTitulo, fechaEvento, hitos) {
  const filas = hitos.map(hito => {
    const fechaVenc = new Date(fechaEvento.getTime() - hito.tMinusDias * 86_400_000)
    return {
      titulo:            hito.titulo,
      descripcion:       `Plan WBS «${eventoTitulo}» — Motor de Orquestación Institucional.`,
      departamento:      hito.departamento,
      estado:            hito.estadoInicial,
      prioridad:         hito.prioridad,
      fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
      t_minus_dias:      hito.tMinusDias,
      checklist:         hito.checklist.map(item => ({ item, completado: false })),
      event_id:          eventId,
      entidad_tipo:      'evento',
      entidad_id:        eventId,
      entidad_label:     eventoTitulo,
      correlation_id:    eventId,
    }
  })

  const { data: insertadas, error: errInsert } = await supabase
    .from('tareas_institucionales')
    .insert(filas)
    .select('id, t_minus_dias')

  if (errInsert) throw errInsert

  const arcos = construirArcosDag(hitos, insertadas)
  for (const arco of arcos) {
    const { error: errArco } = await supabase
      .from('tareas_institucionales')
      .update({ depende_de_tarea_id: arco.dependeDeTareaId })
      .eq('id', arco.tareaId)

    if (errArco) throw errArco
  }

  const { error: errEvento } = await supabase
    .from('calendario_institucional')
    .update({ es_macro_evento: true })
    .eq('id', eventId)

  if (errEvento) throw errEvento

  return { count: insertadas.length }
}

/**
 * Desplaza el cronograma de un evento delta_dias días hacia el futuro (positivo)
 * o hacia el pasado (negativo). No afecta tareas completadas ni canceladas.
 *
 * @param {string} eventId    UUID del evento
 * @param {number} deltaDias  Días a desplazar
 * @returns {{ updatedCount: number }}
 */
export async function desplazarCronograma(eventId, deltaDias) {
  const { data, error } = await supabase.rpc('fn_desplazar_cronograma_evento', {
    p_event_id:   eventId,
    p_delta_dias: deltaDias,
  })
  if (error) throw error
  return { updatedCount: data }
}

/**
 * Persiste el estado de salud del proyecto en el evento del calendario.
 *
 * @param {string} eventId
 * @param {'en_orden'|'en_riesgo'|'critico'|'completado'} saludEstado
 */
export async function persistirSaludEvento(eventId, saludEstado) {
  const { error } = await supabase
    .from('calendario_institucional')
    .update({ salud_proyecto: saludEstado })
    .eq('id', eventId)
  if (error) throw error
}
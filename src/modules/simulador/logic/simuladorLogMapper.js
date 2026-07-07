/**
 * simuladorLogMapper.js — Traduce una fila de `sim_log` (o el payload de un
 * evento Realtime `postgres_changes`) a un evento de animación consumible
 * por `escritorioMaquinaEstados.encolarEvento()`.
 *
 * Extraído del wiring Realtime/Canvas para poder testear el mapeo sin
 * montar canvas ni mockear supabase-js — pura, sin I/O.
 *
 * Design ref: sdd/portal-simulador/design (obs #2723) — Data Flow
 * "Supabase Realtime (postgres_changes sim_log) → Frontend: anima
 * escritorio del depto, globo de diálogo".
 */

import { DEPARTAMENTOS_SALA } from './escritorioLayout.js'

const DEPARTAMENTO_FALLBACK = 'DIR'
const TEXTO_FALLBACK = 'Procesando…'

/**
 * @param {{id:string, departamento?:string, agente?:string, accion?:string}} fila
 * @returns {{ departamento: string, agente: string|undefined, texto: string, logId: string }}
 */
export function mapLogAEventoAnimacion(fila) {
  if (!fila) throw new Error('mapLogAEventoAnimacion requiere una fila de sim_log')

  const departamento = DEPARTAMENTOS_SALA.includes(fila.departamento) ? fila.departamento : DEPARTAMENTO_FALLBACK

  const texto = fila.accion && fila.accion.length > 0 ? fila.accion : TEXTO_FALLBACK

  return {
    departamento,
    agente: fila.agente,
    texto,
    logId: fila.id,
    ...(fila.departamento_origen ? { departamento_origen: fila.departamento_origen } : {}),
  }
}

/**
 * Determina si el evento de animación requiere que el avatar del
 * departamento_origen camine al departamento destino.
 *
 * @param {{ departamento?: string, departamento_origen?: string }} evento
 * @returns {boolean}
 */
export function requiereCaminata(evento) {
  if (!evento) throw new Error('requiereCaminata requiere un evento')
  return Boolean(evento.departamento_origen) && evento.departamento_origen !== evento.departamento
}

/**
 * Filtra eventos Realtime de `postgres_changes` para quedarse solo con
 * los que pertenecen a la corrida (`run_id`) activa en la vista.
 * @param {{new?: {run_id?: string}}} payload
 * @param {string} runIdActivo
 * @returns {boolean}
 */
export function esFilaDeRunActiva(payload, runIdActivo) {
  return Boolean(payload?.new?.run_id) && payload.new.run_id === runIdActivo
}

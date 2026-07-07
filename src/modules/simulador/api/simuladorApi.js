/**
 * simuladorApi.js — CRUD/lectura sobre las tablas `sim_*` (Slice 3).
 * Esquema real: supabase/migrations/20260707_simulador_core.sql.
 *
 * Estilo/manejo de errores siguiendo el patrón de
 * src/modules/hermes/api/tareasSupabase.js: cada función arma la query
 * contra `supabase`, lanza `error` de Supabase tal cual (sin envolver) y
 * devuelve `data || []` para listados o `data` para lecturas/escrituras
 * puntuales.
 *
 * La invocación de la edge function `simulador-tick` (orquestador LLM +
 * generación de tareas/log/outbox) vive aquí como capa de transporte;
 * la lógica de negocio (parser, prompt, whitelist) está en
 * `src/modules/simulador/logic/*.js` (Slice 2) y se ejecuta server-side.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const RUN_ESTADOS_VALIDOS = ['creado', 'corriendo', 'pausado', 'finalizado', 'error']

// ─── sim_runs ──────────────────────────────────────────────────────────────

export async function getRuns() {
  const { data, error } = await supabase
    .from('sim_runs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getRunById(runId) {
  const { data, error } = await supabase.from('sim_runs').select('*').eq('id', runId).single()

  if (error) throw error
  return data
}

/**
 * Crea una corrida de simulación nueva ("Sala de Trabajo" desde cero o
 * desde el seed demo). `velocidad` = segundos reales por día simulado.
 */
export async function crearRun({ nombre, velocidad = 10, fecha_inicio_virtual, metadata = {} } = {}) {
  if (!fecha_inicio_virtual) {
    throw new Error('fecha_inicio_virtual es requerida para crear una corrida')
  }
  if (!(velocidad > 0)) {
    throw new Error('velocidad debe ser mayor que 0')
  }

  const payload = {
    nombre: nombre || 'Simulación sin nombre',
    estado: 'creado',
    velocidad,
    fecha_inicio_virtual,
    fecha_actual_virtual: fecha_inicio_virtual,
    metadata,
  }

  const { data, error } = await supabase.from('sim_runs').insert(payload).select('*').single()
  if (error) throw error
  return data
}

export async function actualizarEstadoRun(runId, nuevoEstado) {
  if (!RUN_ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new Error(`estado inválido: "${nuevoEstado}". Debe ser uno de: ${RUN_ESTADOS_VALIDOS.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('sim_runs')
    .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
    .eq('id', runId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function actualizarVelocidadRun(runId, nuevaVelocidad) {
  if (!(nuevaVelocidad > 0)) {
    throw new Error('nuevaVelocidad debe ser mayor que 0')
  }

  const { data, error } = await supabase
    .from('sim_runs')
    .update({ velocidad: nuevaVelocidad, updated_at: new Date().toISOString() })
    .eq('id', runId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function actualizarFechaActualRun(runId, fechaActualVirtual) {
  const { data, error } = await supabase
    .from('sim_runs')
    .update({ fecha_actual_virtual: fechaActualVirtual, updated_at: new Date().toISOString() })
    .eq('id', runId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

// ─── sim_calendario ──────────────────────────────────────────────────────────

export async function getCalendarioPorRun(runId) {
  const { data, error } = await supabase
    .from('sim_calendario')
    .select('*')
    .eq('run_id', runId)
    .order('fecha_inicio', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Batch de eventos concurrentes de UN día simulado (eventos cuya fecha_inicio
 * caiga dentro del mismo día calendario que fechaSimulada, no solo timestamp exacta).
 * Insumo para `simuladorPromptBuilder.construirPromptTick` y `invocarTick`.
 *
 * Manejo: las seeds tienen timestamps con hora específica (ej 2026-01-15T08:00:00-04:00)
 * pero el frontend envía medianoche UTC (2026-01-15T00:00:00.000Z). Usamos
 * un rango de 24 horas para capturar todos los eventos del mismo día calendario.
 */
export async function getEventosDelDia(runId, fechaSimulada) {
  const fecha = new Date(fechaSimulada)
  const inicioDelDia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), 0, 0, 0))
  const finDelDia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), 23, 59, 59, 999))

  const { data, error } = await supabase
    .from('sim_calendario')
    .select('*')
    .eq('run_id', runId)
    .gte('fecha_inicio', inicioDelDia.toISOString())
    .lte('fecha_inicio', finDelDia.toISOString())
    .order('fecha_inicio', { ascending: true })

  if (error) throw error
  return data || []
}

// ─── sim_tareas ──────────────────────────────────────────────────────────────

export async function getTareasPorRun(runId) {
  const { data, error } = await supabase
    .from('sim_tareas')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── sim_log ─────────────────────────────────────────────────────────────────

export async function getLogPorRun(runId, { departamento = null } = {}) {
  let query = supabase.from('sim_log').select('*').eq('run_id', runId)
  if (departamento) query = query.eq('departamento', departamento)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ─── sim_outbox ──────────────────────────────────────────────────────────────

export async function getOutboxPorRun(runId) {
  const { data, error } = await supabase
    .from('sim_outbox')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── sim_config ──────────────────────────────────────────────────────────────

export async function getConfig() {
  const { data, error } = await supabase.from('sim_config').select('*')
  if (error) throw error
  return data || []
}

// ─── sim_actores ─────────────────────────────────────────────────────────────

export async function getActoresPorRun(runId) {
  const { data, error } = await supabase.from('sim_actores').select('*').eq('run_id', runId)
  if (error) throw error
  return data || []
}

// ─── Orquestación (edge function) ────────────────────────────────────────────

/**
 * Invoca la edge function `simulador-tick` con el batch de eventos del día
 * simulado. La función server-side clasifica vía LLM, genera sim_tareas/
 * sim_log/sim_outbox y despacha los envíos seguros (whitelist).
 *
 * @param {{ run_id: string, fecha_simulada: string, eventos: object[] }} payload
 */
export async function invocarTick({ run_id, fecha_simulada, eventos } = {}) {
  if (!run_id) throw new Error('run_id es requerido para invocar simulador-tick')
  if (!fecha_simulada) throw new Error('fecha_simulada es requerida para invocar simulador-tick')

  const { data, error } = await supabase.functions.invoke('simulador-tick', {
    body: { run_id, fecha_simulada, eventos: eventos || [] },
  })

  if (error) throw new Error(error.message || 'Error al invocar simulador-tick')
  if (data?.error) throw new Error(data.error)
  return data
}

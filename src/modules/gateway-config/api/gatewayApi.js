/**
 * gatewayApi.js — Adaptador de datos para el Gateway de WhatsApp (Baileys) — Subsistema 4
 *
 * Sigue el patrón DataAdapter (Mock First + Supabase) con capacidades completas de:
 * - Telemetría de consumo y blindaje Anti-Ban
 * - Monitor de cola de salida
 * - Consola de pruebas y auto-inicialización
 *
 * SDD whatsapp-gateway-multidepto · F1: la cola y la config ahora son por
 * departamento. Este panel legacy queda fijado al departamento ADM. F7 lo
 * reemplaza por `whatsapp-envios/estadoGatewayView` con selector de departamento.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'

// Departamento que atiende este panel legacy (F7 lo hace dinámico).
const DEPTO = 'ADM'

const DEFAULT_CONFIG = {
  // Sin `id` fijo: la DB lo genera. Un id hardcodeado colisiona con la fila real
  // y con el índice único parcial `uq_wa_config_depto_activa`.
  gateway_url: 'https://gateway.elsistema.local/api',
  api_key: '***REDACTED-ROTATED***',
  instance_name: 'adm-gateway',
  departamento: DEPTO,
  numero_wid: '+1 (829) 555-0188',
  numero_nombre: 'El Sistema Punta Cana (Oficial)',
  cap_diario: 200,
  cap_horario: 40,
  jitter_min_seg: 8,
  jitter_max_seg: 20,
  batch_size: 10,
  batch_cooldown_seg: 60,
  warmup_inicio: 20,
  warmup_dias: 7,
  warmup_desde: new Date(Date.now() - (3 * 86400000)).toISOString().slice(0, 10),
  ventana_inicio: '10:00',
  ventana_fin: '19:00',
  solo_dias_habiles: true,
  consentimiento_registrado: true,
  activo: true,
}

let mockConfig = { ...DEFAULT_CONFIG, id: '00000000-0000-0000-0000-000000000001' }
const mockQueue = [
  {
    id: 'q-1',
    jid: '+1 (829) 555-0101',
    mensaje: 'Estimado representante, le recordamos la clase magistral de violín hoy a las 4:00 PM.',
    estado: 'enviado',
    intentos: 1,
    error_msg: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    procesado_at: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'q-2',
    jid: '+1 (829) 555-0102',
    mensaje: 'Su hijo Carlos ha acumulado 2 inasistencias en la cátedra de percusión.',
    estado: 'enviado',
    intentos: 1,
    error_msg: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    procesado_at: new Date(Date.now() - 7100000).toISOString(),
  },
  {
    id: 'q-3',
    jid: '+1 (829) 555-0103',
    mensaje: 'Aviso administrativo: El período de reinscripción 2026-II cierra este viernes.',
    estado: 'pendiente',
    intentos: 0,
    error_msg: null,
    created_at: new Date(Date.now() - 600000).toISOString(),
    procesado_at: null,
  },
]

export async function obtenerGatewayConfig() {
  if (config.isDemoMode || !supabase) return { ...mockConfig }

  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .select('*')
    .eq('activo', true)
    .eq('departamento', DEPTO)
    .single()

  // PGRST116 = 0 filas -> aún no hay config (no es un error).
  if (error && error.code === 'PGRST116') return null
  if (error) throw error
  return data || null
}

export async function actualizarGatewayConfig(updates = {}) {
  if (config.isDemoMode || !supabase) {
    mockConfig = { ...mockConfig, ...updates, updated_at: new Date().toISOString() }
    return { ...mockConfig }
  }

  // Un error de escritura NO se traga: la vista muestra AppToast.error. Antes
  // el fallback a mock hacía que un guardado fallido pareciera exitoso.
  const cfg = await obtenerGatewayConfig()
  if (!cfg || !cfg.id) {
    return await crearGatewayConfig(updates)
  }

  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', cfg.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function crearGatewayConfig(payload = {}) {
  // Sin `id`: lo genera la DB (evita colisión con la fila real y con el índice
  // único parcial por departamento).
  const merged = { ...DEFAULT_CONFIG, ...payload, departamento: DEPTO }
  delete merged.id

  if (config.isDemoMode || !supabase) {
    mockConfig = { ...merged, id: `gw-${Date.now()}` }
    return { ...mockConfig }
  }

  // No crear una segunda config activa para el departamento: si ya hay una,
  // actualizarla.
  const existente = await obtenerGatewayConfig()
  if (existente && existente.id) {
    return await actualizarGatewayConfig(payload)
  }

  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .insert([merged])
    .select()
    .single()

  // Carrera (dos "inicializar" concurrentes): el índice único parcial
  // uq_wa_config_depto_activa rechaza el 2º INSERT. Re-leemos la fila ganadora.
  if (error?.code === '23505') {
    const ganadora = await obtenerGatewayConfig()
    if (ganadora) return ganadora
  }
  if (error) throw error
  return data
}

export async function inicializarGatewayDefault() {
  const payload = { ...DEFAULT_CONFIG, warmup_desde: new Date().toISOString().slice(0, 10) }

  if (config.isDemoMode || !supabase) {
    mockConfig = { ...payload, id: mockConfig.id || `gw-${Date.now()}` }
    return { ...mockConfig }
  }

  // Si ya hay una config activa para el departamento, no se duplica (el índice
  // único parcial rechazaría una segunda): se re-aplican los defaults sobre ella.
  const existente = await obtenerGatewayConfig()
  if (existente && existente.id) {
    return await actualizarGatewayConfig(payload)
  }
  return await crearGatewayConfig(payload)
}

export async function obtenerGatewayStats() {
  // Telemetría: si la lectura de config falla (blip transitorio), el panel
  // degrada a defaults en vez de romper. Los guardados sí surfacean el error.
  let gwConfig
  try {
    gwConfig = (await obtenerGatewayConfig()) || DEFAULT_CONFIG
  } catch {
    gwConfig = DEFAULT_CONFIG
  }

  // Calcular días de warmup y límite dinámico
  let capHoy = gwConfig.cap_diario || 200
  let diaWarmup = 1
  if (gwConfig.warmup_desde) {
    const diasTranscurridos = Math.max(0, Math.floor((Date.now() - new Date(gwConfig.warmup_desde).getTime()) / 86400000))
    diaWarmup = Math.min(gwConfig.warmup_dias || 7, diasTranscurridos + 1)
    if (diasTranscurridos < (gwConfig.warmup_dias || 7)) {
      const inicio = gwConfig.warmup_inicio || 20
      const total = gwConfig.cap_diario || 200
      capHoy = Math.round(inicio + ((total - inicio) * (diasTranscurridos / (gwConfig.warmup_dias || 7))))
    }
  }

  if (!config.isDemoMode && supabase) {
    try {
      const hoyInicio = new Date().toISOString().slice(0, 10)

      const [enviadosRes, pendientesRes, fallidosRes, liveStatusRes] = await Promise.all([
        // `enviadosHoy` alimenta el % de consumo del cap: excluye origen=test,
        // igual que fn_whatsapp_enviados_hoy (si no, el panel se desalinea del cap).
        supabase
          .from('hermes_whatsapp_queue')
          .select('*', { count: 'exact', head: true })
          .eq('departamento', DEPTO)
          .eq('estado', 'enviado')
          .neq('origen', 'test')
          .gte('procesado_at', `${hoyInicio}T00:00:00Z`),
        supabase
          .from('hermes_whatsapp_queue')
          .select('*', { count: 'exact', head: true })
          .eq('departamento', DEPTO)
          .eq('estado', 'pendiente'),
        supabase
          .from('hermes_whatsapp_queue')
          .select('*', { count: 'exact', head: true })
          .eq('departamento', DEPTO)
          .eq('estado', 'fallido'),
        supabase
          .rpc('fn_hermes_gateway_get_live_status', { p_instance_name: gwConfig.instance_name || 'adm-gateway' })
          .maybeSingle(),
      ])

      const live = liveStatusRes?.data || null
      const isAlive = live ? Boolean(live.is_alive) : false

      return {
        enviadosHoy: enviadosRes.count ?? 0,
        capHoy,
        capDiarioTope: gwConfig.cap_diario || 200,
        pendientes: pendientesRes.count ?? 0,
        fallidos: fallidosRes.count ?? 0,
        diaWarmup,
        totalDiasWarmup: gwConfig.warmup_dias || 7,
        status: gwConfig.activo && isAlive ? 'online' : 'offline',
        secondsSinceHeartbeat: live?.seconds_since_heartbeat ?? null,
        lastHeartbeat: live?.last_heartbeat ?? null,
        jitterText: `${gwConfig.jitter_min_seg || 8}s – ${gwConfig.jitter_max_seg || 20}s`,
        rateLimitHora: gwConfig.cap_horario || 40,
      }
    } catch {
      // Fallback a mock stats
    }
  }

  return {
    enviadosHoy: 42,
    capHoy,
    capDiarioTope: gwConfig.cap_diario || 200,
    pendientes: mockQueue.filter((q) => q.estado === 'pendiente').length,
    fallidos: mockQueue.filter((q) => q.estado === 'fallido').length,
    diaWarmup,
    totalDiasWarmup: gwConfig.warmup_dias || 7,
    status: gwConfig.activo ? 'online' : 'offline',
    jitterText: `${gwConfig.jitter_min_seg || 8}s – ${gwConfig.jitter_max_seg || 20}s`,
    rateLimitHora: gwConfig.cap_horario || 40,
  }
}

/**
 * Ventana anti-spam "un mensaje por número cada X horas" — configurable desde
 * el portal en vez de estar fija en el código (system_config.whatsapp_dedup_jid_horas).
 * Bajarla solo para pruebas controladas; producción debe quedar en 24.
 */
export async function obtenerDedupHoras() {
  if (config.isDemoMode || !supabase) return 24

  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'whatsapp_dedup_jid_horas')
      .maybeSingle()

    if (error) return 24
    return Number(data?.value) || 24
  } catch {
    return 24
  }
}

export async function actualizarDedupHoras(horas) {
  const valor = String(Math.max(0, Number(horas) || 24))

  if (config.isDemoMode || !supabase) return valor

  const { error } = await supabase
    .from('system_config')
    .update({ value: valor, updated_at: new Date().toISOString() })
    .eq('key', 'whatsapp_dedup_jid_horas')

  if (error) throw error
  return valor
}

export async function obtenerColaMensajes(limite = 20) {
  if (!config.isDemoMode && supabase) {
    try {
      const { data, error } = await supabase
        .from('hermes_whatsapp_queue')
        .select('*')
        .eq('departamento', DEPTO)
        .order('created_at', { ascending: false })
        .limit(limite)

      if (!error && Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch {
      // Fallback a mock queue
    }
  }

  return [...mockQueue].slice(0, limite)
}

export async function enviarMensajePrueba(jid, mensaje) {
  if (!jid || !mensaje) throw new Error('Número de teléfono y mensaje son requeridos')

  const nuevoItem = {
    id: `q-test-${Date.now()}`,
    jid: String(jid).trim(),
    mensaje: String(mensaje).trim(),
    estado: 'enviado',
    intentos: 1,
    error_msg: null,
    created_at: new Date().toISOString(),
    procesado_at: new Date().toISOString(),
  }

  if (!config.isDemoMode && supabase) {
    try {
      const { data, error } = await supabase
        .from('hermes_whatsapp_queue')
        .insert([{
          jid: nuevoItem.jid,
          mensaje: nuevoItem.mensaje,
          departamento: DEPTO,
          origen: 'test',
          estado: 'enviado',
          intentos: 1,
          procesado_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (!error && data) return data
    } catch {
      // Continuar con mock
    }
  }

  mockQueue.unshift(nuevoItem)
  return nuevoItem
}

export async function reintentarMensajeCola(id) {
  if (!config.isDemoMode && supabase) {
    try {
      const { data, error } = await supabase
        .from('hermes_whatsapp_queue')
        .update({ estado: 'pendiente', intentos: 0, error_msg: null })
        .eq('id', id)
        .eq('departamento', DEPTO)
        .select()
        .single()

      if (!error && data) return data
    } catch {
      // Fallback
    }
  }

  const item = mockQueue.find((q) => q.id === id)
  if (item) {
    item.estado = 'enviado'
    item.error_msg = null
    item.procesado_at = new Date().toISOString()
  }
  return item
}

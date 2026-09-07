/**
 * gatewayApi.js — Adaptador de datos para el Gateway de WhatsApp (Baileys) — Subsistema 4
 *
 * Sigue el patrón DataAdapter (Mock First + Supabase) con capacidades completas de:
 * - Telemetría de consumo y blindaje Anti-Ban
 * - Monitor de cola de salida
 * - Consola de pruebas y auto-inicialización
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'
import { getSession as getPortalSession } from '../../../core/auth/sessionStorage.js'

const DEFAULT_CONFIG = {
  id: '00000000-0000-0000-0000-000000000001',
  // Local runner default. Production/Raspberry deployments must replace this
  // with the private gateway address from the ADM configuration screen.
  gateway_url: 'http://127.0.0.1:8787',
  instance_name: 'soi-main',
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
  consentimiento_registrado: true,
  activo: true,
}

// Never select or return api_key to the browser. Gateway credentials belong to
// the server-side dispatcher, not to the ADM renderer.
const SAFE_CONFIG_COLUMNS = [
  'id', 'gateway_url', 'instance_name', 'numero_wid', 'numero_nombre',
  'cap_diario', 'cap_horario', 'jitter_min_seg', 'jitter_max_seg',
  'batch_size', 'batch_cooldown_seg', 'warmup_inicio', 'warmup_dias',
  'warmup_desde', 'consentimiento_registrado', 'activo', 'created_at', 'updated_at',
].join(', ')

let mockConfig = { ...DEFAULT_CONFIG }
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

export function obtenerGatewayConfigInicial() {
  return { ...DEFAULT_CONFIG }
}

export async function obtenerGatewayConfig() {
  if (config.isDemoMode || !supabase) return { ...mockConfig }

  try {
    const { data, error } = await supabase
      .from('hermes_whatsapp_config')
      .select(SAFE_CONFIG_COLUMNS)
      .eq('activo', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    throw new Error(`No se pudo cargar la configuración de WhatsApp: ${error.message}`)
  }
}

export async function obtenerGatewayAccessToken() {
  if (supabase) {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (data.session?.access_token) return data.session.access_token
  }

  // The portal authentication layer stores the same Supabase token under
  // auth-session. The runner validates it server-side, including admin role.
  return getPortalSession()?.access_token || null
}

export async function cerrarSesionGateway(gatewayUrl) {
  const token = await obtenerGatewayAccessToken()
  if (!gatewayUrl) throw new Error('Configura la URL del servidor Baileys antes de vincular WhatsApp')
  if (!token) throw new Error('Inicia sesión en el portal ADM con una cuenta administradora para vincular WhatsApp')
  const baseUrl = new URL(gatewayUrl).origin
  const response = await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `Error HTTP ${response.status}`)
  return body
}

export async function obtenerEstadoGateway(gatewayUrl) {
  const token = await obtenerGatewayAccessToken()
  if (!gatewayUrl) throw new Error('Configura la URL del servidor Baileys antes de vincular WhatsApp')
  if (!token) throw new Error('Inicia sesión en el portal ADM con una cuenta administradora para vincular WhatsApp')

  const baseUrl = new URL(gatewayUrl).origin
  const response = await fetch(`${baseUrl}/health`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `Error HTTP ${response.status}`)
  return body
}

export async function actualizarGatewayConfig(updates = {}) {
  if (config.isDemoMode || !supabase) {
    mockConfig = { ...mockConfig, ...updates, updated_at: new Date().toISOString() }
    return { ...mockConfig }
  }

  try {
    const cfg = await obtenerGatewayConfig()
    if (!cfg) {
      return await crearGatewayConfig(updates)
    }

    const { data, error } = await supabase
      .from('hermes_whatsapp_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cfg.id)
      .select(SAFE_CONFIG_COLUMNS)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(`No se pudo actualizar la configuración de WhatsApp: ${error.message}`)
  }
}

export async function crearGatewayConfig(payload = {}) {
  const merged = { ...DEFAULT_CONFIG, ...payload }

  if (config.isDemoMode || !supabase) {
    mockConfig = { ...merged, id: `gw-${Date.now()}` }
    return { ...mockConfig }
  }

  try {
    const { data, error } = await supabase
      .from('hermes_whatsapp_config')
      .insert([merged])
      .select(SAFE_CONFIG_COLUMNS)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(`No se pudo crear la configuración de WhatsApp: ${error.message}`)
  }
}

export async function inicializarGatewayDefault() {
  return await crearGatewayConfig({
    ...DEFAULT_CONFIG,
    warmup_desde: new Date().toISOString().slice(0, 10),
  })
}

export async function obtenerGatewayStats() {
  const gwConfig = (await obtenerGatewayConfig()) || DEFAULT_CONFIG

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
        supabase
          .from('hermes_whatsapp_queue')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'enviado')
          .gte('procesado_at', `${hoyInicio}T00:00:00Z`),
        supabase
          .from('hermes_whatsapp_queue')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'pendiente'),
        supabase
          .from('hermes_whatsapp_queue')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'fallido'),
        supabase
          .rpc('fn_hermes_gateway_get_live_status', { p_instance_name: gwConfig.instance_name || 'soi-main' })
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
    } catch (error) {
      throw new Error(`No se pudieron cargar las métricas de WhatsApp: ${error.message}`)
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
        .order('created_at', { ascending: false })
        .limit(limite)

      if (error) throw error
      return Array.isArray(data) ? data : []
    } catch (error) {
      throw new Error(`No se pudo cargar la cola de WhatsApp: ${error.message}`)
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
    estado: 'pendiente',
    intentos: 0,
    error_msg: null,
    created_at: new Date().toISOString(),
    procesado_at: null,
  }

  if (!config.isDemoMode && supabase) {
    try {
      const { data, error } = await supabase.rpc('fn_hermes_queue_whatsapp', {
        p_jid: nuevoItem.jid,
        p_mensaje: nuevoItem.mensaje,
      })

      if (error) throw error
      return { ...nuevoItem, id: data, created_at: new Date().toISOString() }
    } catch (error) {
      throw new Error(`No se pudo encolar el mensaje de prueba: ${error.message}`)
    }
  }

  mockQueue.unshift(nuevoItem)
  return nuevoItem
}

export async function reintentarMensajeCola(id) {
  if (!config.isDemoMode && supabase) {
    try {
      const { data, error } = await supabase.rpc('fn_hermes_reintentar_mensaje', { p_id: id })

      if (error) throw error
      return data || null
    } catch (error) {
      throw new Error(`No se pudo reintentar el mensaje: ${error.message}`)
    }
  }

  const item = mockQueue.find((q) => q.id === id)
  if (item) {
    item.estado = 'pendiente'
    item.error_msg = null
    item.procesado_at = null
  }
  return item
}

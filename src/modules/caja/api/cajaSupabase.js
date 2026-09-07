/**
 * cajaSupabase.js — Real Supabase implementations for all Caja API operations.
 * All functions return { data, error } plain JS objects — no Supabase types leaked to views.
 *
 * HERMES Contract (external WhatsApp automation system):
 * - HERMES polls: notificaciones_caja WHERE canal IN ('whatsapp','ambos')
 *   AND estado_whatsapp = 'pendiente' AND (fecha_programada IS NULL OR fecha_programada <= now())
 * - HERMES reads: id, tipo, titulo, cuerpo, datos_extra, representantes.telefono_whatsapp (JOIN)
 * - HERMES writes ONLY via fn_hermes_update_notif(id, estado, respuesta, fecha):
 *   estado_whatsapp, respuesta_padre, fecha_respuesta
 * - HERMES uses a restricted service role; caja.js NEVER writes WhatsApp directly.
 * - Caja reads: estado_whatsapp (read-only), respuesta_padre (surfaced in notificacionesView)
 */

import { supabase } from '../../../lib/supabaseClient.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function handleResult({ data, error }) {
  return { data: data ?? null, error: error ?? null }
}

// ---------------------------------------------------------------------------
// Familias
// ---------------------------------------------------------------------------

/**
 * Returns all active families from vw_estado_familiar view.
 */
export async function getFamilias() {
  const result = await supabase.from('vw_estado_familiar').select('*').order('nombre_familia')
  return handleResult(result)
}

/**
 * Returns a single family with representante, cuotas, pagos, and wallet.
 */
export async function getFamiliaById(id) {
  const [familiaRes, repRes, cuotasRes, pagosRes, walletRes] = await Promise.all([
    supabase.from('familias').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('representantes')
      .select('*')
      .eq('familia_id', id)
      .eq('es_pagador', true)
      .maybeSingle(),
    supabase.from('cuotas').select('*').eq('familia_id', id).order('fecha_vencimiento'),
    supabase
      .from('pagos')
      .select('*')
      .eq('familia_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('wallet_movimientos')
      .select('*')
      .eq('familia_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (familiaRes.error) return handleResult(familiaRes)

  const movimientos = walletRes.data ?? []
  const saldo = movimientos.length > 0 ? movimientos[0].saldo_resultante_centavos : 0

  const walletConfigRes = await supabase
    .from('wallet_config')
    .select('*')
    .eq('familia_id', id)
    .maybeSingle()

  return {
    data: {
      ...familiaRes.data,
      representante: repRes.data ?? null,
      cuotas: cuotasRes.data ?? [],
      pagos: pagosRes.data ?? [],
      wallet: {
        movimientos,
        config: walletConfigRes.data ?? null,
        saldo,
      },
    },
    error: null,
  }
}

export async function getRepresentanteByFamiliaId(familia_id) {
  const result = await supabase
    .from('representantes')
    .select('*')
    .eq('familia_id', familia_id)
    .eq('es_pagador', true)
    .maybeSingle()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Cuotas
// ---------------------------------------------------------------------------

export async function getCuotasByFamilia(familia_id) {
  const result = await supabase
    .from('cuotas')
    .select('*')
    .eq('familia_id', familia_id)
    .order('fecha_vencimiento')
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Ventanilla — cobro por alumno
// Lee vw_alumno_estado_pago (contacto en cascada + saldo + estado_pago:
// 'inactivo' | 'exento' | 'mora' | 'debe' | 'al_dia').
// ---------------------------------------------------------------------------

const ESTADOS_CUOTA_ABIERTA = ['pendiente', 'vencida', 'en_mora']

/**
 * Búsqueda de ventanilla: por nombre de alumno, de representante o de familia.
 * @param {string} q  término (mínimo 2 caracteres)
 * @param {{ incluirRetirados?: boolean, limit?: number }} [opts]
 */
export async function buscarAlumnos(q, { incluirRetirados = false, limit = 30 } = {}) {
  // Sin comas/paréntesis/wildcards: rompen el filtro .or() de PostgREST.
  const term = String(q || '').trim().replace(/[,()%_]/g, ' ').trim()
  if (term.length < 2) return { data: [], error: null }
  const like = `%${term}%`

  let query = supabase
    .from('vw_alumno_estado_pago')
    .select('*')
    .or(`alumno_nombre.ilike.${like},contacto_nombre.ilike.${like},nombre_familia.ilike.${like}`)
    .order('alumno_nombre')
    .limit(limit)
  if (!incluirRetirados) query = query.neq('estado_pago', 'inactivo')

  return handleResult(await query)
}

/**
 * Cuotas de un alumno. Por defecto solo las liquidables (pendiente/vencida/en_mora),
 * más viejas primero.
 */
export async function getCuotasByAlumno(alumnoId, { soloLiquidables = true } = {}) {
  let query = supabase
    .from('cuotas')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_vencimiento')
  if (soloLiquidables) query = query.in('estado', ESTADOS_CUOTA_ABIERTA)
  return handleResult(await query)
}

/**
 * Lista alumnos por estado del semáforo de pago.
 * @param {string|string[]} estado  'al_dia' | 'debe' | 'mora' | 'exento' | 'inactivo'
 * @param {{ soloActivos?: boolean, soloConSaldo?: boolean, limit?: number }} [opts]
 *        soloConSaldo: útil para "deudas de retirados" (estado 'inactivo' + saldo > 0).
 */
export async function listarAlumnosPorEstado(estado, { soloActivos = false, soloConSaldo = false, limit = 500 } = {}) {
  const estados = Array.isArray(estado) ? estado : [estado]
  let query = supabase
    .from('vw_alumno_estado_pago')
    .select('*')
    .in('estado_pago', estados)
    .order('alumno_nombre')
    .limit(limit)
  if (soloActivos) query = query.eq('alumno_activo', true)
  if (soloConSaldo) query = query.gt('saldo_pendiente_centavos', 0)
  return handleResult(await query)
}

// ---------------------------------------------------------------------------
// Pagos
// ---------------------------------------------------------------------------

export async function getPagosByFamilia(familia_id) {
  const result = await supabase
    .from('pagos')
    .select('*')
    .eq('familia_id', familia_id)
    .order('created_at', { ascending: false })
  return handleResult(result)
}

/**
 * Registers a payment atomically via fn_registrar_pago_transaccional: locks
 * the familia row (FOR UPDATE), imputes the payment oldest-first (first the
 * cuotas the cajero selected, then the rest of the familia's open cuotas),
 * tracks partial payments via monto_pagado_centavos, audits each application
 * in aplicaciones_pago, and — if the amount still exceeds the familia's total
 * debt — rejects the whole payment (no orphan surplus, no wallet). All inside
 * one DB transaction (G-01: two cajeros paying the same familia concurrently).
 *
 * `pagoData.fecha_pago` (optional, YYYY-MM-DD) is the accounting date used for
 * mora calculation — pass it for retroactive bank transfers; defaults to today.
 */
export async function registrarPago(pagoData, cuotaIds) {
  const { familia_id, monto_centavos, metodo_pago, referencia, notas, fecha_pago } = pagoData

  const params = {
    p_familia_id: familia_id,
    p_monto_centavos: monto_centavos,
    p_metodo_pago: metodo_pago,
    p_referencia: referencia ?? null,
    p_notas: notas ?? null,
    p_cuota_ids: cuotaIds,
  }
  if (fecha_pago) params.p_fecha_pago = fecha_pago

  const result = await supabase.rpc('fn_registrar_pago_transaccional', params)

  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export async function getWalletByFamilia(familia_id) {
  const [movsRes, configRes] = await Promise.all([
    supabase
      .from('wallet_movimientos')
      .select('*')
      .eq('familia_id', familia_id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('wallet_config').select('*').eq('familia_id', familia_id).maybeSingle(),
  ])
  const movimientos = movsRes.data ?? []
  const saldo = movimientos.length > 0 ? movimientos[0].saldo_resultante_centavos : 0
  return {
    data: { movimientos, config: configRes.data ?? null, saldo },
    error: movsRes.error ?? configRes.error ?? null,
  }
}

export async function registrarMovimientoWallet(movData) {
  const result = await supabase.from('wallet_movimientos').insert(movData).select().single()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Accesorios
// ---------------------------------------------------------------------------

export async function getAccesorios() {
  const result = await supabase.from('accesorios').select('*').eq('activo', true).order('nombre')
  return handleResult(result)
}

export async function getAccesorioById(id) {
  const result = await supabase.from('accesorios').select('*').eq('id', id).maybeSingle()
  return handleResult(result)
}

/**
 * Assigns an accessory: inserts assignment, decrements stock, and optionally
 * creates an approval notification for the representante.
 */
export async function asignarAccesorio(asignacionData) {
  const asigRes = await supabase
    .from('accesorio_asignaciones')
    .insert(asignacionData)
    .select()
    .single()

  if (asigRes.error) return handleResult(asigRes)

  // Descuento atómico de stock vía fn_decrementar_stock (no baja de 0).
  const { error: stockError } = await supabase.rpc('fn_decrementar_stock', {
    p_accesorio_id: asignacionData.accesorio_id,
    p_cantidad: asignacionData.cantidad,
  })
  if (stockError) {
    // Fallback read-modify-write: la RPC resuelve con { error }, no rechaza, así
    // que hay que comprobar .error en vez de .catch(). supabase-js v2 no tiene
    // .raw(), por eso se lee el valor actual y se reescribe.
    const { data: accActual } = await supabase
      .from('accesorios')
      .select('stock_actual')
      .eq('id', asignacionData.accesorio_id)
      .single()
    if (accActual) {
      await supabase
        .from('accesorios')
        .update({ stock_actual: Math.max(0, (accActual.stock_actual || 0) - asignacionData.cantidad) })
        .eq('id', asignacionData.accesorio_id)
    }
  }

  // Notify representante if approval required
  if (asignacionData.aprobacion_requerida && asignacionData.familia_id) {
    await supabase.from('notificaciones_caja').insert({
      familia_id: asignacionData.familia_id,
      tipo: 'accesorio_aprobacion',
      canal: 'ambos',
      prioridad: 'normal',
      titulo: 'Solicitud de accesorio pendiente de aprobación',
      cuerpo: 'Se requiere su aprobación para asignar el accesorio a su familiar.',
      datos_extra: { asignacion_id: asigRes.data.id },
      estado_whatsapp: 'pendiente',
      estado_portal: 'no_leida',
    })
  }

  return handleResult(asigRes)
}

export async function updateStockAccesorio(accesorio_id, stock_actual) {
  const result = await supabase
    .from('accesorios')
    .update({ stock_actual })
    .eq('id', accesorio_id)
    .select()
    .single()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

/**
 * Fetches notifications. Sets up Supabase Realtime subscription on first call.
 * @param {{ familia_id?, tipo?, prioridad? }} options
 */
export async function getNotificaciones(options = {}) {
  let query = supabase
    .from('notificaciones_caja')
    .select('*')
    .order('created_at', { ascending: false })

  if (options.familia_id) query = query.eq('familia_id', options.familia_id)
  if (options.tipo) query = query.eq('tipo', options.tipo)
  if (options.prioridad) query = query.eq('prioridad', options.prioridad)

  return handleResult(await query)
}

export async function marcarNotificacionLeida(id) {
  const result = await supabase
    .from('notificaciones_caja')
    .update({ estado_portal: 'leida' })
    .eq('id', id)
    .select()
    .single()
  return handleResult(result)
}

// El shell FIN y la bandeja de notificaciones necesitan escuchar el mismo
// evento. Supabase no acepta añadir callbacks a un canal después de subscribe,
// por lo que se mantiene un único canal y se distribuye su payload a listeners
// locales. El canal se cierra cuando el último consumidor se desuscribe.
let notificacionesChannel = null
const notificacionesListeners = new Set()

/**
 * Subscribes to new notificaciones_caja rows via a shared Supabase Realtime channel.
 * @param {Function} callback - called with the new notification row
 * @returns {Function} unsubscribe function
 */
export function subscribeNotificaciones(callback) {
  if (typeof callback !== 'function') return () => {}

  notificacionesListeners.add(callback)

  if (!notificacionesChannel) {
    notificacionesChannel = supabase
      .channel('caja-notificaciones-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones_caja' },
        (payload) => {
          for (const listener of notificacionesListeners) {
            try {
              listener(payload.new)
            } catch (error) {
              console.warn('[Caja] Error en listener de notificaciones:', error)
            }
          }
        },
      )
      .subscribe()
  }

  let unsubscribed = false
  return () => {
    if (unsubscribed) return
    unsubscribed = true
    notificacionesListeners.delete(callback)

    if (notificacionesListeners.size === 0 && notificacionesChannel) {
      supabase.removeChannel(notificacionesChannel)
      notificacionesChannel = null
    }
  }
}

// ---------------------------------------------------------------------------
// Tareas
// ---------------------------------------------------------------------------

export async function getTareas(cajero_id) {
  const result = await supabase
    .from('tareas_caja')
    .select('*')
    .or(`asignado_a.eq.${cajero_id},asignado_a.is.null`)
    .order('fecha_vencimiento')
  return handleResult(result)
}

export async function createTarea(tareaData) {
  const result = await supabase.from('tareas_caja').insert(tareaData).select().single()
  return handleResult(result)
}

export async function updateTareaEstado(id, newEstado) {
  const result = await supabase
    .from('tareas_caja')
    .update({ estado: newEstado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Minutas
// ---------------------------------------------------------------------------

export async function getMinutas() {
  const result = await supabase
    .from('minutas')
    .select('*')
    .order('fecha_reunion', { ascending: false })
  return handleResult(result)
}

export async function createMinuta(minutaData) {
  const result = await supabase.from('minutas').insert(minutaData).select().single()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Mensajes internos / Hilos
// ---------------------------------------------------------------------------

export async function getHilos() {
  const result = await supabase
    .from('hilos_mensajes')
    .select('*')
    .order('updated_at', { ascending: false })
  return handleResult(result)
}

export async function getMensajesByHilo(hilo_id) {
  const result = await supabase
    .from('mensajes_internos')
    .select('*')
    .eq('hilo_id', hilo_id)
    .order('created_at')
  return handleResult(result)
}

export async function sendMensaje(mensajeData) {
  const result = await supabase.from('mensajes_internos').insert(mensajeData).select().single()
  if (!result.error) {
    // Update hilo updated_at
    await supabase
      .from('hilos_mensajes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', mensajeData.hilo_id)
  }
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Campanas
// ---------------------------------------------------------------------------

export async function getCampanas() {
  const result = await supabase
    .from('campanas_pago')
    .select('*')
    .eq('activa', true)
    .order('fecha_inicio')
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

export async function getScoreByRepresentante(representante_id) {
  const result = await supabase
    .from('score_compromiso')
    .select('*')
    .eq('representante_id', representante_id)
    .order('ciclo_anio', { ascending: false })
    .order('ciclo_mes', { ascending: false })
    .limit(1)
    .maybeSingle()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Cierre de caja
// ---------------------------------------------------------------------------

export async function getCierreCajaHoy() {
  const result = await supabase.from('vw_ingresos_diarios').select('*')
  if (result.error) return handleResult(result)
  // Aggregate the view rows into cierre shape. Money values are centavos.
  const rows = result.data ?? []
  const porMetodo = {}
  let totalGeneral = 0
  for (const row of rows) {
    totalGeneral += Number(row.total_centavos ?? 0)
    porMetodo[row.metodo_pago] = {
      count: Number(row.count ?? 0),
      total: Number(row.total_centavos ?? 0),
    }
  }
  return {
    data: {
      fecha: new Date().toISOString().slice(0, 10),
      totalGeneral,
      porMetodo,
      cantidadTransacciones: rows.reduce((s, r) => s + Number(r.count ?? 0), 0),
    },
    error: null,
  }
}

export async function registrarCierreCaja(cierreData) {
  const result = await supabase
    .from('cierres_caja')
    .insert({
      fecha: cierreData.fecha ?? new Date().toISOString().slice(0, 10),
      cajero_id: cierreData.cajero_id ?? null,
      total_general_centavos: cierreData.totalGeneral ?? 0,
      por_metodo: cierreData.porMetodo ?? {},
      cantidad_transacciones: cierreData.cantidadTransacciones ?? 0,
      notas: cierreData.notas ?? null,
    })
    .select()
    .single()
  return handleResult(result)
}

export async function getCierresByFecha(fecha) {
  const result = await supabase.from('cierres_caja').select('*').eq('fecha', fecha).maybeSingle()
  return handleResult(result)
}

export async function createHilo(hiloData) {
  const result = await supabase.from('hilos_mensajes').insert(hiloData).select().single()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Push subscriptions
// ---------------------------------------------------------------------------

/**
 * Upserts a push subscription for the given profile.
 * Schema: push_subscriptions(profile_id, endpoint, p256dh, auth, user_agent, activo, updated_at)
 * profile_id = session.user.id (Supabase auth UUID — same as profiles.id)
 */
export async function savePushSubscription({ profile_id, endpoint, p256dh, auth, user_agent }) {
  const result = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        profile_id,
        endpoint,
        p256dh,
        auth,
        user_agent,
        activo: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    )
    .select()
    .single()
  return handleResult(result)
}

/**
 * Soft-deletes a push subscription by marking it inactive.
 */
export async function deletePushSubscription(endpoint) {
  const result = await supabase
    .from('push_subscriptions')
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq('endpoint', endpoint)
    .select()
    .single()
  return handleResult(result)
}

// ---------------------------------------------------------------------------
// Campanas
// ---------------------------------------------------------------------------

export async function createCampana(campanaData) {
  const result = await supabase.from('campanas_pago').insert(campanaData).select().single()
  return handleResult(result)
}

export async function getCampanaParticipaciones(campana_id) {
  const result = await supabase
    .from('campana_participaciones')
    .select('*, familias(nombre_familia)')
    .eq('campana_id', campana_id)
  return handleResult(result)
}

export async function registrarParticipacion(campana_id, familia_id) {
  const result = await supabase
    .from('campana_participaciones')
    .upsert(
      { campana_id, familia_id, aceptada: true, fecha_aceptacion: new Date().toISOString() },
      { onConflict: 'campana_id,familia_id' },
    )
    .select()
    .single()
  return handleResult(result)
}

export async function updateWalletStatus(familia_id, status, timestamp = new Date().toISOString()) {
  const updates = { status }
  if (status === 'congelada') updates.congelada_en = timestamp
  if (status === 'devuelta') updates.devuelta_en = timestamp
  const result = await supabase
    .from('wallet_config')
    .update(updates)
    .eq('familia_id', familia_id)
    .select()
    .single()
  return handleResult(result)
}

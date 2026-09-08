/**
 * whatsapp-gateway · handlers
 *
 * Lógica de la Edge Function del gateway multi departamento. Separada de
 * `index.ts` (el wrapper Deno.serve) para poder testearla con un cliente
 * Supabase mockeado (patrón de event-spine-logger/handlers).
 *
 * Contrato: toda request llega con `Authorization: Bearer <device_token>`. El
 * token se valida contra `fn_whatsapp_device_validate` y el `departamento` sale
 * SIEMPRE del device — un `departamento` en el body se ignora.
 */

// Solo tipo: esbuild lo elide, no hay import real de red en runtime de tests.
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type Ruta = 'claim' | 'report' | 'heartbeat'

export interface DeviceAuth {
  deviceId: string
  departamento: string
}

/** Error de request con status HTTP (para que index.ts lo mapee sin filtrar detalle). */
export class RequestError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

/** Extrae el token de un header `Authorization: Bearer <token>`. */
export function extractBearerToken(authHeader: string | null | undefined): string {
  if (!authHeader) return ''
  const m = String(authHeader).match(/^Bearer\s+(.+)$/i)
  return m ? m[1].trim() : ''
}

/** Resuelve la ruta por el último segmento del path (`/whatsapp-gateway/claim`). */
export function routeFromPath(pathname: string): Ruta | null {
  const seg = String(pathname || '').replace(/\/+$/, '').split('/').pop() || ''
  return seg === 'claim' || seg === 'report' || seg === 'heartbeat' ? seg : null
}

/** Valida el device token. Devuelve null si es inválido / revocado / inactivo. */
export async function authDevice(
  supabase: SupabaseClient,
  token: string,
): Promise<DeviceAuth | null> {
  if (!token) return null
  const { data, error } = await supabase.rpc('fn_whatsapp_device_validate', { p_token: token })
  if (error || !Array.isArray(data) || data.length === 0) return null
  const row = data[0] as { device_id: string; departamento: string }
  if (!row?.device_id || !row?.departamento) return null
  return { deviceId: row.device_id, departamento: row.departamento }
}

/**
 * POST /claim -> reclama la cola del departamento del device.
 * `{ mensajes, ventana_ok, cap_restante }`
 *
 * El claim (que muta estado a 'procesando') corre primero y solo. Las 3
 * consultas de telemetría van después y degradan a valores por defecto si
 * fallan — nunca convierten un claim exitoso en un 500 que dejaría filas
 * huérfanas en 'procesando'.
 */
export async function handleClaim(
  supabase: SupabaseClient,
  departamento: string,
  body: Record<string, unknown> | null,
): Promise<{ mensajes: Array<{ id: string; jid: string; mensaje: string }>; ventana_ok: boolean; cap_restante: number }> {
  const rawLimite = Number(body?.['limite'])
  const limite = Number.isFinite(rawLimite) && rawLimite > 0 ? Math.min(rawLimite, 50) : null

  const { data: filas, error } = await supabase.rpc('fn_whatsapp_reclamar_pendientes', {
    p_departamento: departamento,
    p_limite: limite,
  })
  if (error) throw new Error(`claim rpc: ${error.message}`)

  const mensajes = (Array.isArray(filas) ? filas : []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    jid: String(r.jid),
    mensaje: String(r.mensaje),
  }))

  const safe = async (fn: () => Promise<{ data: unknown; error: unknown }>, def: number): Promise<number> => {
    try {
      const { data, error: e } = await fn()
      return e ? def : Number(data) || def
    } catch {
      return def
    }
  }
  const ventanaOk = async (): Promise<boolean> => {
    try {
      const { data, error: e } = await supabase.rpc('fn_whatsapp_ventana_abierta', { p_departamento: departamento })
      return e ? mensajes.length > 0 : data === true
    } catch {
      return mensajes.length > 0
    }
  }

  const [cap, env, ventana] = await Promise.all([
    safe(() => supabase.rpc('fn_whatsapp_cap_hoy', { p_departamento: departamento }), 0),
    safe(() => supabase.rpc('fn_whatsapp_enviados_hoy', { p_departamento: departamento }), 0),
    ventanaOk(),
  ])

  return { mensajes, ventana_ok: ventana, cap_restante: Math.max(cap - env, 0) }
}

/**
 * POST /report -> aplica los resultados de envío. Idempotente: solo transiciona
 * filas `estado='procesando'` del departamento del device.
 * `{ aplicados, ignorados }`
 *
 * `procesado_at` lo pone SIEMPRE el servidor (`now()`): las cuentas anti-ban
 * (cap diario/horario, ventana de dedup) se apoyan en esa columna y no pueden
 * depender de la hora que reporte el cliente.
 *
 * `terminal: true` fuerza `estado='fallido'` sin importar `intentos` (el
 * dispatchLoop lo usa cuando envió pero no pudo confirmar el ACK: reintentar
 * podría duplicar).
 */
export async function handleReport(
  supabase: SupabaseClient,
  departamento: string,
  body: Record<string, unknown> | null,
): Promise<{ aplicados: number; ignorados: number; procesados: string[] }> {
  const resultados = Array.isArray(body?.['resultados']) ? (body!['resultados'] as Array<Record<string, unknown>>) : []
  // De-duplicar por id (nos quedamos con el primero) y descartar entradas inválidas.
  const vistos = new Set<string>()
  const validos = resultados.filter((r) => {
    const id = r?.['id'] ? String(r['id']) : ''
    if (!id || (r['estado'] !== 'enviado' && r['estado'] !== 'fallido')) return false
    if (vistos.has(id)) return false
    vistos.add(id)
    return true
  })
  const ignoradosBase = resultados.length - validos.length
  if (validos.length === 0) return { aplicados: 0, ignorados: resultados.length, procesados: [] }

  const ids = validos.map((r) => String(r['id']))
  const { data: filas } = await supabase
    .from('hermes_whatsapp_queue')
    .select('id, intentos, estado, departamento')
    .in('id', ids)
    .eq('departamento', departamento)

  const porId = new Map((Array.isArray(filas) ? filas : []).map((f) => [String(f.id), f]))
  const ahora = new Date().toISOString()
  const procesados: string[] = []   // ids que el cliente puede sacar de su buffer
  let aplicados = 0
  let ignorados = ignoradosBase

  for (const r of validos) {
    const id = String(r['id'])
    const row = porId.get(id)
    if (!row) {
      ignorados++
      procesados.push(id)   // no existe / otro depto: el cliente no puede hacer nada
      continue
    }

    // 'enviado' del cliente vale sobre lo que diga la DB (salvo estados finales):
    // si el reaper devolvió la fila a 'pendiente' por un corte de /report, la
    // marcamos 'enviado' igual -> no se re-envía. Idempotente: un 2º report la
    // encuentra ya en 'enviado' y no la toca.
    // 'fallido' solo transiciona desde 'procesando' (no resucitamos una fila que
    // el reaper devolvió a 'pendiente' hacia 'fallido'; que reintente).
    let patch: Record<string, unknown>
    let estadosPermitidos: string[]
    if (r['estado'] === 'enviado') {
      patch = { estado: 'enviado', procesado_at: ahora, error_msg: null }
      // 'enviado' del cliente pisa una fila que el reaper devolvió a 'pendiente'.
      estadosPermitidos = ['procesando', 'pendiente']
    } else {
      const intentos = Number(row.intentos) || 0
      const esTerminal = r['terminal'] === true || intentos >= 3
      patch = esTerminal
        ? { estado: 'fallido', error_msg: r['error_msg'] ? String(r['error_msg']) : 'error desconocido' }
        : { estado: 'pendiente', error_msg: r['error_msg'] ? String(r['error_msg']) : null }
      // Un fallido TERMINAL también debe aterrizar aunque el reaper haya movido
      // la fila a 'pendiente' (si no, se re-encola y se re-envía). Un fallido
      // NO terminal solo transiciona desde 'procesando' (ya está por reintentar).
      estadosPermitidos = esTerminal ? ['procesando', 'pendiente'] : ['procesando']
    }

    if (!estadosPermitidos.includes(String(row.estado))) {
      ignorados++
      procesados.push(id)   // ya resuelta (enviado/fallido/cancelado): nada que hacer
      continue
    }

    const { error } = await supabase
      .from('hermes_whatsapp_queue')
      .update(patch)
      .eq('id', id)
      .eq('departamento', departamento)
      .in('estado', estadosPermitidos)

    if (error) {
      ignorados++
    } else {
      aplicados++
      procesados.push(id)
    }
  }

  return { aplicados, ignorados, procesados }
}

/**
 * POST /heartbeat -> registra el latido del gateway del departamento.
 *
 * Instancia única cruzada: la decisión (¿esta PC toma la titularidad o va a
 * standby?) la hace `fn_hermes_gateway_reclamar_instancia` de forma ATÓMICA
 * (UPDATE condicional en la DB), no un read-then-write acá — dos PCs arrancando
 * juntas no pueden quedar ambas activas.
 */
export async function handleHeartbeat(
  supabase: SupabaseClient,
  departamento: string,
  body: Record<string, unknown> | null,
): Promise<{
  ok: boolean
  standby: boolean
  instance_name: string
  owner_equipo: string | null
  seconds_since_heartbeat: number
}> {
  const instance = `${departamento.toLowerCase()}-gateway`
  const nombreEquipo = String(body?.['nombre_equipo'] || '').trim().slice(0, 120)
  if (!nombreEquipo) {
    throw new RequestError('nombre_equipo es obligatorio', 400)
  }

  const { data, error } = await supabase.rpc('fn_hermes_gateway_reclamar_instancia', {
    p_instance_name: instance,
    p_nombre_equipo: nombreEquipo,
    p_status: body?.['status'] || 'connected',
    p_phone: body?.['phone'] || null,
    p_battery: body?.['battery'] ?? null,
    p_qr: body?.['qr'] || null,
  })
  if (error) {
    throw new Error(`heartbeat rpc: ${error.message}`)
  }

  const row = Array.isArray(data) ? data[0] : data
  const gano = row?.gano === true
  return {
    ok: gano,
    standby: !gano,
    instance_name: instance,
    owner_equipo: row?.owner_equipo ?? (gano ? nombreEquipo : null),
    seconds_since_heartbeat: Math.round((Number(row?.seconds_since_heartbeat) || 0) * 10) / 10,
  }
}

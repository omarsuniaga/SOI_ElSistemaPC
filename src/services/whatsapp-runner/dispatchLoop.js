/**
 * dispatchLoop — un ciclo de despacho: claim -> enviar -> esperar ACK -> report.
 *
 * SDD whatsapp-gateway-multidepto · F3.
 *
 * Todo inyectado (edgeClient, sendMessage, ackWaiter, guard, businessHours,
 * sleep, now) para poder testear `tick()` sin red, sin timers reales y sin
 * Baileys.
 */

/**
 * "+1 (829) 555-0101" -> "18295550101@s.whatsapp.net".
 * Si ya viene como jid (contiene "@"), se respeta tal cual: los jid de grupo
 * ("...-...@g.us") y los device-suffixed ("...:12@s.whatsapp.net") se romperían
 * si les sacáramos los no-dígitos.
 */
export function normalizarJid(jid) {
  const raw = String(jid || '').trim()
  if (raw.includes('@')) return raw
  return `${raw.replace(/\D/g, '')}@s.whatsapp.net`
}

function aleatorioEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function createDispatchLoop({
  edgeClient,
  sendMessage,
  ackWaiter,
  guard,
  businessHours,
  config = {},
  logger = console,
  now = () => new Date(),
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  /** Se llama con ({ tipo, ... }) para eventos que el operador debe ver. */
  onEvento = () => {},
}) {
  const claimLimit = Number(config.claimLimit) > 0 ? Number(config.claimLimit) : 5
  const ackTimeoutMs = Number(config.ackTimeoutMs) > 0 ? Number(config.ackTimeoutMs) : 30000
  const jitterMinMs = Number(config.jitterMinMs) >= 0 ? Number(config.jitterMinMs) : 8000
  const jitterMaxMs = Number(config.jitterMaxMs) >= jitterMinMs ? Number(config.jitterMaxMs) : jitterMinMs + 12000
  const reporteMaxIntentos = Number(config.reporteMaxIntentos) > 0 ? Number(config.reporteMaxIntentos) : 3
  // Cuántos ticks seguidos toleramos con el buffer atascado antes de soltarlo
  // (y dejar que el reaper se encargue de esas filas). Evita la parada
  // indefinida si el servidor nunca confirma un id.
  const maxTicksAtascado = Number(config.maxTicksAtascado) > 0 ? Number(config.maxTicksAtascado) : 10

  // Resultados de una tanda cuyo /report no se pudo confirmar: se re-envían al
  // inicio del próximo tick, ANTES de reclamar más. Sobreviven entre ticks, no
  // entre reinicios del proceso (esa durabilidad llega con Electron, F4).
  let pendientesDeReporte = []
  let atascadoNotificado = false
  let ticksAtascado = 0
  let corriendo = false   // guarda de re-entrancia: los ticks NO se solapan

  /**
   * Reintenta /report con backoff. Devuelve `{ ok, procesados }`:
   *  - ok: true si el servidor respondió (aunque no haya podido aplicar todo)
   *  - procesados: array de ids que el servidor dio de baja, o `null` si la
   *    respuesta no trae ese detalle (servidor viejo -> asumimos "todos").
   */
  async function reportarConReintento(resultados) {
    if (resultados.length === 0) return { ok: true, procesados: [] }
    for (let intento = 1; intento <= reporteMaxIntentos; intento++) {
      try {
        const resp = await edgeClient.report(resultados)
        return { ok: true, procesados: Array.isArray(resp?.procesados) ? resp.procesados.map(String) : null }
      } catch (err) {
        logger.warn?.(`[dispatchLoop] report intento ${intento}/${reporteMaxIntentos} falló: ${err?.message}`)
        if (intento < reporteMaxIntentos) await sleep(1000 * intento)
      }
    }
    return { ok: false, procesados: [] }
  }

  /**
   * Descuenta de `pendientesDeReporte` los ids que el servidor ya dio de baja.
   * `procesados === null` (respuesta sin detalle) -> se asume que aplicó todo.
   */
  function resolverPendientes(procesados) {
    if (procesados === null) { pendientesDeReporte = []; return }
    const baja = new Set(procesados)
    pendientesDeReporte = pendientesDeReporte.filter((r) => !baja.has(String(r.id)))
  }

  async function tickInterno() {
    // 1. Reenviar resultados de una tanda anterior cuyo /report no se confirmó.
    if (pendientesDeReporte.length > 0) {
      const { ok, procesados } = await reportarConReintento(pendientesDeReporte)
      if (ok) resolverPendientes(procesados)
      if (ok && pendientesDeReporte.length === 0) {
        logger.info?.('[dispatchLoop] resultados atrasados reportados')
        atascadoNotificado = false
        ticksAtascado = 0
      } else {
        ticksAtascado++
        if (ticksAtascado >= maxTicksAtascado) {
          // Se rinde: suelta el buffer y deja que el reaper recupere las filas.
          logger.error?.(`[dispatchLoop] ${pendientesDeReporte.length} resultados sin confirmar tras ${ticksAtascado} ticks; se abandonan al reaper`)
          onEvento({ tipo: 'report_abandonado', cantidad: pendientesDeReporte.length })
          pendientesDeReporte = []
          atascadoNotificado = false
          ticksAtascado = 0
        } else {
          // Sigue atascado: NO reclamamos más (evita acumular 'procesando').
          if (!atascadoNotificado) {
            onEvento({ tipo: 'report_atascado', cantidad: pendientesDeReporte.length })
            atascadoNotificado = true
          }
          return { skipped: 'report_atascado', pendientes: pendientesDeReporte.length, enviados: 0, fallidos: 0 }
        }
      }
    }

    if (typeof businessHours === 'function' && !businessHours(now())) {
      return { skipped: 'fuera_de_ventana', enviados: 0, fallidos: 0 }
    }

    let claim
    try {
      claim = await edgeClient.claim(claimLimit)
    } catch (err) {
      logger.warn?.(`[dispatchLoop] claim falló: ${err?.message}`)
      return { skipped: 'claim_error', error: err?.message, enviados: 0, fallidos: 0 }
    }

    if (!claim || claim.ventana_ok === false) {
      return { skipped: 'ventana_cerrada', enviados: 0, fallidos: 0 }
    }

    const mensajes = Array.isArray(claim.mensajes) ? claim.mensajes : []
    if (mensajes.length === 0) {
      return { enviados: 0, fallidos: 0, cap_restante: claim.cap_restante }
    }

    const resultados = []
    for (let i = 0; i < mensajes.length; i++) {
      const m = mensajes[i]
      try {
        const texto = guard?.clampMessageText ? guard.clampMessageText(m.mensaje) : String(m.mensaje ?? '')
        const jid = normalizarJid(m.jid)
        const sent = await sendMessage(jid, { text: texto })
        const messageId = sent?.key?.id

        if (!messageId) {
          logger.warn?.(`[dispatchLoop] sin messageId para ${jid}; se marca fallido terminal`)
          onEvento({ tipo: 'sin_ack', id: m.id, jid: m.jid, motivo: 'sin messageId' })
          resultados.push({ id: m.id, estado: 'fallido', terminal: true, error_msg: 'envío sin confirmación (sin messageId)' })
        } else {
          try {
            await ackWaiter.waitFor(messageId, ackTimeoutMs)
            resultados.push({ id: m.id, estado: 'enviado', procesado_at: now().toISOString() })
          } catch (ackErr) {
            // Timeout / cancelación del ACK: el mensaje PUDO haber llegado.
            // Fallido TERMINAL (no reintento automático -> evita el doble envío);
            // el operador lo reconcilia desde el outbox.
            logger.warn?.(`[dispatchLoop] sin ACK para ${m.id}: ${ackErr?.message}. Fallido terminal.`)
            onEvento({ tipo: 'sin_ack', id: m.id, jid: m.jid, motivo: ackErr?.message })
            resultados.push({ id: m.id, estado: 'fallido', terminal: true, error_msg: ackErr?.message || 'sin ACK del servidor' })
          }
        }
      } catch (err) {
        // Falla del propio envío (socket caído, etc.): reintento normal.
        resultados.push({ id: m.id, estado: 'fallido', error_msg: err?.message || 'error de envío' })
      }

      if (i < mensajes.length - 1 && jitterMaxMs > 0) {
        await sleep(aleatorioEntre(jitterMinMs, jitterMaxMs))
      }
    }

    const { ok, procesados } = await reportarConReintento(resultados)
    const noConfirmados = !ok
      ? resultados
      : procesados === null
        ? []
        : resultados.filter((r) => !procesados.includes(String(r.id)))
    if (noConfirmados.length > 0) {
      pendientesDeReporte = noConfirmados
      logger.error?.(`[dispatchLoop] ${noConfirmados.length} resultados sin confirmar; se reintentan el próximo tick`)
      if (!atascadoNotificado) {
        onEvento({ tipo: 'report_atascado', cantidad: noConfirmados.length })
        atascadoNotificado = true
      }
    }

    return {
      enviados: resultados.filter((r) => r.estado === 'enviado').length,
      fallidos: resultados.filter((r) => r.estado === 'fallido').length,
      reportado: ok && noConfirmados.length === 0,
      cap_restante: claim.cap_restante,
    }
  }

  async function tick() {
    if (corriendo) return { skipped: 'tick_en_curso', enviados: 0, fallidos: 0 }
    corriendo = true
    try {
      return await tickInterno()
    } finally {
      corriendo = false
    }
  }

  return { tick }
}

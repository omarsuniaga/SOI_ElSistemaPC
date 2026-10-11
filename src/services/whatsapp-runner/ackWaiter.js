/**
 * ackWaiter — espera la confirmación REAL de entrega del servidor de WhatsApp.
 *
 * SDD whatsapp-gateway-multidepto · F3.
 *
 * `sock.sendMessage()` de Baileys resuelve en cuanto el mensaje se encola
 * localmente, NO cuando el servidor lo confirma. Si el socket se cae justo
 * después (visto en producción: "Conexión cerrada (428)"), la promesa igual
 * resuelve aunque la trama nunca haya llegado -> falso 'enviado'. Por eso
 * esperamos el evento `messages.update` con `status >= 2` (SERVER_ACK) antes de
 * reportar la fila como enviada.
 *
 * Timers inyectables para testear sin esperas reales.
 *
 * Carrera resuelta: el ACK puede llegar ANTES de que `waitFor` se registre
 * (Baileys emite `messages.update` en su propio tiempo). `onUpdate` guarda los
 * ids ya confirmados en un buffer con TTL; `waitFor` los consulta primero y
 * resuelve de inmediato si el ACK ya pasó.
 */

const WA_STATUS_SERVER_ACK = 2
const ACK_BUFFER_TTL_MS = 60000

export function createAckWaiter({
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
  now = () => Date.now(),
} = {}) {
  /** @type {Map<string, { resolve: () => void, reject: (e: Error) => void, timer: unknown }>} */
  const pendientes = new Map()
  /** @type {Map<string, number>} messageId -> timestamp del ACK ya visto */
  const yaConfirmados = new Map()

  function purgarBuffer() {
    const limite = now() - ACK_BUFFER_TTL_MS
    for (const [id, ts] of yaConfirmados) {
      if (ts < limite) yaConfirmados.delete(id)
    }
  }

  /**
   * Devuelve una promesa que resuelve cuando llega el ACK del servidor para
   * `messageId`, o rechaza si pasa `timeoutMs` sin confirmación.
   */
  function waitFor(messageId, timeoutMs = 30000) {
    if (!messageId) return Promise.reject(new Error('messageId requerido'))

    // ¿El ACK ya llegó antes de que llamáramos a waitFor?
    if (yaConfirmados.has(messageId)) {
      yaConfirmados.delete(messageId)
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeoutImpl(() => {
        pendientes.delete(messageId)
        reject(new Error('Timeout esperando confirmación del servidor de WhatsApp'))
      }, timeoutMs)

      pendientes.set(messageId, {
        resolve: () => {
          clearTimeoutImpl(timer)
          pendientes.delete(messageId)
          resolve()
        },
        reject: (err) => {
          clearTimeoutImpl(timer)
          pendientes.delete(messageId)
          reject(err)
        },
        timer,
      })
    })
  }

  /** Alimentar con el payload del evento `messages.update` de Baileys. */
  function onUpdate(updates) {
    for (const u of updates || []) {
      const messageId = u?.key?.id
      const status = typeof u?.update?.status === 'number' ? u.update.status : u?.status
      if (!messageId || typeof status !== 'number' || status < WA_STATUS_SERVER_ACK) continue

      const p = pendientes.get(messageId)
      if (p) {
        p.resolve()
      } else {
        // ACK adelantado: lo guardamos para el waitFor que todavía no llegó.
        yaConfirmados.set(messageId, now())
      }
    }
    purgarBuffer()
  }

  /**
   * Rechaza todas las esperas pendientes (p.ej. al caerse la conexión). El
   * dispatchLoop marca esos mensajes como fallidos terminales — no se re-encolan
   * porque no sabemos si llegaron.
   */
  function cancelAll(motivo = 'conexión cerrada') {
    const err = new Error(`ACK cancelado: ${motivo}`)
    err.code = 'ACK_CANCELADO'
    for (const p of [...pendientes.values()]) {
      p.reject(err)
    }
    pendientes.clear()
  }

  return {
    waitFor,
    onUpdate,
    cancelAll,
    get size() { return pendientes.size },
  }
}

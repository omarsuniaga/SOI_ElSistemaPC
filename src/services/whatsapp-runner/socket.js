/**
 * socket — ciclo de vida del socket Baileys con reconexión.
 *
 * SDD whatsapp-gateway-multidepto · F3.
 *
 * La librería NO importa `@whiskeysockets/baileys` (no es dependencia de este
 * repo). La app Electron (F4) inyecta `makeWASocket`, `useMultiFileAuthState` y
 * `fetchLatestBaileysVersion`. Así el runner queda testeable con mocks.
 */

// Baileys.DisconnectReason.loggedOut === 401
const LOGGED_OUT = 401
const RECONNECT_MS = 4000

export function createSocket({
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  authDir,
  logger = console,
  onQR,
  onConnection,
  onMessagesUpdate,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
}) {
  if (typeof makeWASocket !== 'function') throw new Error('socket: makeWASocket requerido')
  if (typeof useMultiFileAuthState !== 'function') throw new Error('socket: useMultiFileAuthState requerido')

  let sock = null
  let detenido = false
  let arrancando = false
  let abierto = false
  let reconnectTimer = null

  function cerrarSocketActual() {
    if (reconnectTimer) {
      clearTimeoutImpl(reconnectTimer)
      reconnectTimer = null
    }
    if (sock) {
      try { sock.ev?.removeAllListeners?.() } catch { /* noop */ }
      try { sock.end?.(undefined) } catch { /* noop */ }
      sock = null
    }
  }

  // Reprograma la reconexión aunque el propio start() tire (si no, un error
  // transitorio en makeWASocket / useMultiFileAuthState dejaba el runner muerto:
  // no se crea socket -> no llega 'close' -> nadie re-arma el timer).
  function agendarReconexion() {
    if (detenido || reconnectTimer) return
    reconnectTimer = setTimeoutImpl(() => {
      reconnectTimer = null
      start().catch((e) => {
        logger.error?.(`[socket] reconexión falló: ${e?.message}. Reintento en ${RECONNECT_MS}ms.`)
        agendarReconexion()
      })
    }, RECONNECT_MS)
  }

  async function start() {
    // Re-entrancy: un reconnect timer y un start() manual no deben crear 2 sockets.
    if (arrancando) {
      logger.warn?.('[socket] start() ya en curso; se ignora la llamada duplicada')
      return sock
    }
    arrancando = true
    detenido = false
    cerrarSocketActual()

    try {
      return await arrancarSocket()
    } finally {
      arrancando = false
    }
  }

  async function arrancarSocket() {
    const { state, saveCreds } = await useMultiFileAuthState(authDir)
    if (detenido) { cerrarSocketActual(); return null }

    let version
    try {
      version = (await fetchLatestBaileysVersion?.())?.version
    } catch {
      version = undefined
    }
    if (detenido) { cerrarSocketActual(); return null }

    sock = makeWASocket({
      ...(version ? { version } : {}),
      logger,
      auth: state,
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      syncFullHistory: false,
      retryRequestDelayMs: 500,
    })

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.update', (updates) => onMessagesUpdate?.(updates))
    sock.ev.on('connection.update', (update) => {
      if (update?.qr) onQR?.(update.qr)
      if (update?.connection === 'open') abierto = true
      if (update?.connection === 'close') abierto = false
      if (update?.connection) onConnection?.(update.connection, update.lastDisconnect)

      if (update?.connection === 'close' && !detenido && !reconnectTimer) {
        const code =
          update?.lastDisconnect?.error?.output?.statusCode ??
          update?.lastDisconnect?.error?.output?.payload?.statusCode
        if (code !== LOGGED_OUT) {
          agendarReconexion()
        } else {
          logger.warn?.('[socket] sesión cerrada (loggedOut). Hay que re-vincular el QR.')
        }
      }
    })

    return sock
  }

  function stop() {
    detenido = true
    abierto = false
    cerrarSocketActual()
  }

  function sendMessage(jid, content) {
    if (!sock) throw new Error('socket no conectado')
    return sock.sendMessage(jid, content)
  }

  return {
    start,
    stop,
    sendMessage,
    get raw() { return sock },
    /** true solo cuando la conexión está realmente abierta (no durante 'connecting'). */
    get conectado() { return abierto },
  }
}

/**
 * whatsapp-runner — librería reutilizable del gateway de WhatsApp por departamento.
 *
 * SDD whatsapp-gateway-multidepto · F3.
 *
 * Compone socket + ackWaiter + edgeClient + dispatchLoop + businessHours. NO lee
 * `process.env`: toda la config llega en `runnerConfig`. La app Electron (F4) es
 * el único lugar que arma ese objeto (device token del `safeStorage`, primitivas
 * de Baileys como dependencia propia).
 */

import { createAckWaiter } from './ackWaiter.js'
import { createEdgeClient } from './edgeClient.js'
import { createDispatchLoop } from './dispatchLoop.js'
import { createSocket } from './socket.js'
import { dentroDeVentana } from './businessHours.js'
import * as contentGuard from './contentGuard.js'

/**
 * @typedef {Object} RunnerConfig
 * @property {string} edgeFnUrl        URL base de la Edge Function whatsapp-gateway
 * @property {string} deviceToken      token del device (desde safeStorage)
 * @property {string} departamento     'ADM' | 'FIN' | ...
 * @property {string} nombreEquipo     identifica esta PC en el heartbeat
 * @property {string} authDir          carpeta de credenciales Baileys (userData)
 * @property {{makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion}} baileys
 * @property {{inicio,fin,soloDiasHabiles,tz}} [ventana]
 * @property {number} [pollMs=6000]
 * @property {number} [heartbeatMs=25000]
 * @property {number} [claimLimit=5]
 * @property {number} [jitterMinMs=8000]
 * @property {number} [jitterMaxMs=20000]
 * @property {number} [ackTimeoutMs=12000]
 * @property {Console} [logger=console]
 */

function crearEmisor(logger = console) {
  const oyentes = new Map()
  return {
    on(evento, fn) {
      if (!oyentes.has(evento)) oyentes.set(evento, new Set())
      oyentes.get(evento).add(fn)
      return () => oyentes.get(evento)?.delete(fn)
    },
    emit(evento, ...args) {
      for (const fn of oyentes.get(evento) || []) {
        try {
          fn(...args)
        } catch (err) {
          // Un oyente no debe tumbar el runner, pero no lo tragamos en silencio.
          logger.error?.(`[runner] oyente de "${evento}" tiró: ${err?.message}`)
        }
      }
    },
  }
}

export function createRunner(runnerConfig) {
  const cfg = {
    pollMs: 6000,
    heartbeatMs: 25000,
    claimLimit: 5,
    ackTimeoutMs: 30000,
    jitterMinMs: 8000,
    jitterMaxMs: 20000,
    logger: console,
    ...runnerConfig,
  }
  const logger = cfg.logger
  const emisor = crearEmisor(logger)

  if (!cfg.edgeFnUrl || !cfg.deviceToken || !cfg.departamento) {
    throw new Error('createRunner: edgeFnUrl, deviceToken y departamento son obligatorios')
  }
  if (!cfg.nombreEquipo || !String(cfg.nombreEquipo).trim()) {
    // Sin nombre de equipo, la detección de instancia única no funciona
    // (un heartbeat sin nombre siempre "gana" la titularidad).
    throw new Error('createRunner: nombreEquipo es obligatorio')
  }

  const ackWaiter = createAckWaiter()
  const edgeClient = createEdgeClient({ baseUrl: cfg.edgeFnUrl, deviceToken: cfg.deviceToken })

  const socket = createSocket({
    makeWASocket: cfg.baileys?.makeWASocket,
    useMultiFileAuthState: cfg.baileys?.useMultiFileAuthState,
    fetchLatestBaileysVersion: cfg.baileys?.fetchLatestBaileysVersion,
    authDir: cfg.authDir,
    logger,
    onQR: (qr) => emisor.emit('qr', qr),
    onMessagesUpdate: (u) => ackWaiter.onUpdate(u),
    onConnection: (estado, lastDisconnect) => {
      emisor.emit('connection', estado, lastDisconnect)
      if (estado === 'open') iniciarCiclos()
      if (estado === 'close') { detenerCiclos(); ackWaiter.cancelAll('conexión cerrada') }
    },
  })

  const businessHours = (fecha) => dentroDeVentana(fecha, cfg.ventana)
  const dispatchLoop = createDispatchLoop({
    edgeClient,
    sendMessage: (jid, content) => socket.sendMessage(jid, content),
    ackWaiter,
    guard: contentGuard,
    businessHours,
    config: cfg,
    logger,
    onEvento: (ev) => emisor.emit(ev?.tipo || 'evento', ev),
  })

  let pollTimer = null
  let hbTimer = null
  let standby = false

  async function latido() {
    try {
      const r = await edgeClient.heartbeat({
        status: socket.conectado ? 'connected' : 'connecting',
        nombre_equipo: cfg.nombreEquipo,
        phone: cfg.numeroWid || null,
      })
      const enStandby = r?.standby === true
      if (enStandby !== standby) {
        standby = enStandby
        emisor.emit('standby', standby, r?.owner_equipo || null)
        if (standby) logger.warn?.(`[runner] otra PC (${r?.owner_equipo}) tiene el gateway de ${cfg.departamento}. Modo standby.`)
      }
    } catch (err) {
      emisor.emit('error', err)
    }
  }

  /**
   * Un ciclo de despacho. `dispatchLoop.tick()` ya tiene guarda de re-entrancia
   * (devuelve `{ skipped: 'tick_en_curso' }` si ya hay uno corriendo), así que
   * el interval y el botón "enviar ahora" no se pisan.
   */
  async function correrTick() {
    if (standby) return { skipped: 'standby' }
    try {
      const r = await dispatchLoop.tick()
      emisor.emit('tick', r)
      return r
    } catch (err) {
      emisor.emit('error', err)
      return { skipped: 'error', error: err?.message }
    }
  }

  function iniciarCiclos() {
    detenerCiclos()
    pollTimer = setInterval(correrTick, cfg.pollMs)
    hbTimer = setInterval(latido, cfg.heartbeatMs)
    void latido()
  }

  function detenerCiclos() {
    if (pollTimer) clearInterval(pollTimer)
    if (hbTimer) clearInterval(hbTimer)
    pollTimer = null
    hbTimer = null
  }

  async function start() {
    await socket.start()
  }

  function stop() {
    detenerCiclos()
    ackWaiter.cancelAll('stop')
    socket.stop()
  }

  return {
    start,
    stop,
    on: emisor.on,
    /**
     * Ejecuta un ciclo de despacho a mano (botón "enviar ahora"). Respeta el
     * modo standby y la guarda de re-entrancia del dispatchLoop.
     */
    tick: correrTick,
    /** @returns {boolean} */
    get standby() { return standby },
    get conectado() { return socket.conectado },
  }
}

export { createDispatchLoop, createAckWaiter, createEdgeClient, createSocket, dentroDeVentana }

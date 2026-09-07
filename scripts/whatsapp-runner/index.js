import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { randomUUID } from 'crypto'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'
import { createGatewaySnapshot } from './gatewayProtocol.js'
import { createGatewayServer } from './gatewayServer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const INSTANCE_NAME = process.env.WHATSAPP_INSTANCE_NAME || 'soi-main'
const GATEWAY_PORT = Number(process.env.WHATSAPP_GATEWAY_PORT || 8787)
const GATEWAY_HOST = process.env.WHATSAPP_GATEWAY_HOST || '127.0.0.1'
const GATEWAY_KEY = process.env.WHATSAPP_GATEWAY_INTERNAL_KEY || ''
const ALLOWED_ORIGINS = (process.env.WHATSAPP_ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean)
const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR || path.join(os.homedir(), '.soi', 'whatsapp', INSTANCE_NAME)
const LOCK_FILE = process.env.WHATSAPP_LOCK_FILE || path.join(AUTH_DIR, '.runner.lock')
const BACKUP_DIR = process.env.WHATSAPP_SESSION_BACKUP_DIR || path.join(os.homedir(), '.soi', 'whatsapp-backups', INSTANCE_NAME)
const BACKUP_FILE = path.join(BACKUP_DIR, 'session.enc')
const BACKUP_KEY = process.env.WHATSAPP_SESSION_BACKUP_KEY || ''
const WORKER_ID = `${os.hostname()}-${process.pid}-${randomUUID()}`
// Debe coincidir con el secret WHATSAPP_WEBHOOK_SECRET configurado en la función
// whatsapp-webhook de Supabase — sin esto, este runner no puede reenviar mensajes
// entrantes al pipeline real (análisis de intención, kill switch, opt-out, etc.).
const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || ''
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`

if (!WEBHOOK_SECRET) {
  console.warn('⚠️  WHATSAPP_WEBHOOK_SECRET no está definido — los mensajes entrantes NO se reenviarán al pipeline real.')
}
if (!SUPABASE_URL) throw new Error('SUPABASE_URL es obligatorio para ejecutar el gateway WhatsApp.')
if (!SUPABASE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY es obligatorio para ejecutar el gateway WhatsApp.')
if (!GATEWAY_KEY) throw new Error('WHATSAPP_GATEWAY_INTERNAL_KEY es obligatorio para proteger el gateway.')

console.log('🔗 Conectando a Supabase:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

const logger = pino({ level: 'silent' })
let currentSock = null
let queueInterval = null
let queueCycleRunning = false
let workerLeaseHeld = false
let reconnectTimer = null
let reconnectAttempt = 0
let currentQr = null
let qrExpiresAt = null
let gatewayPhase = 'disconnected'
let runnerLock = null
let manualSessionOperation = false

function getBackupKey() {
  if (!/^[a-f0-9]{64}$/i.test(BACKUP_KEY)) {
    throw new Error('WHATSAPP_SESSION_BACKUP_KEY debe ser una clave hexadecimal de 64 caracteres')
  }
  return Buffer.from(BACKUP_KEY, 'hex')
}

async function listSessionFiles(directory, prefix = '') {
  const result = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.runner.lock') continue
    const relative = path.join(prefix, entry.name)
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await listSessionFiles(fullPath, relative))
    else if (entry.isFile()) result.push({ name: relative.replaceAll(path.sep, '/'), data: (await fs.readFile(fullPath)).toString('base64') })
  }
  return result
}

async function clearSessionFiles() {
  await fs.mkdir(AUTH_DIR, { recursive: true, mode: 0o700 })
  for (const entry of await fs.readdir(AUTH_DIR, { withFileTypes: true })) {
    if (entry.name === '.runner.lock') continue
    await fs.rm(path.join(AUTH_DIR, entry.name), { recursive: true, force: true })
  }
}

async function backupSession() {
  const key = getBackupKey()
  const files = await listSessionFiles(AUTH_DIR)
  if (!files.length) throw new Error('No hay credenciales Baileys para respaldar')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({ instance: INSTANCE_NAME, createdAt: new Date().toISOString(), files })), cipher.final()])
  await fs.mkdir(BACKUP_DIR, { recursive: true, mode: 0o700 })
  await fs.writeFile(BACKUP_FILE, JSON.stringify({ algorithm: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), payload: encrypted.toString('base64') }), { mode: 0o600 })
  return { ok: true, instance: INSTANCE_NAME, fileCount: files.length, createdAt: new Date().toISOString() }
}

async function restoreSession() {
  if (currentSock) throw new Error('Desconecta WhatsApp antes de restaurar una sesión')
  const key = getBackupKey()
  const backup = JSON.parse(await fs.readFile(BACKUP_FILE, 'utf8'))
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(backup.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(backup.tag, 'base64'))
  const decoded = JSON.parse(Buffer.concat([decipher.update(Buffer.from(backup.payload, 'base64')), decipher.final()]).toString('utf8'))
  if (decoded.instance !== INSTANCE_NAME || !Array.isArray(decoded.files)) throw new Error('El respaldo no corresponde a esta instancia')
  await clearSessionFiles()
  for (const file of decoded.files) {
    const target = path.resolve(AUTH_DIR, file.name)
    if (!target.startsWith(`${path.resolve(AUTH_DIR)}${path.sep}`)) throw new Error('Ruta inválida en respaldo de sesión')
    await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 })
    await fs.writeFile(target, Buffer.from(file.data, 'base64'), { mode: 0o600 })
  }
  return { ok: true, instance: INSTANCE_NAME, fileCount: decoded.files.length }
}

async function deleteSession() {
  manualSessionOperation = true
  if (currentSock) await currentSock.logout().catch(() => {})
  currentSock = null
  currentQr = null
  qrExpiresAt = null
  await clearSessionFiles()
  await updateHeartbeat('disconnected', { reason: 'session_deleted' })
  gatewayServer?.broadcast(gatewaySnapshot())
  return { ok: true, instance: INSTANCE_NAME }
}
let heartbeatTimer = null

// process.kill(pid, 0) no mata: solo prueba existencia. ESRCH -> muerto;
// EPERM -> vivo pero de otro usuario. Cualquier otra cosa la tratamos como vivo.
function isPidAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error.code === 'EPERM'
  }
}

async function acquireRunnerLock() {
  await fs.mkdir(path.dirname(LOCK_FILE), { recursive: true })
  try {
    runnerLock = await fs.open(LOCK_FILE, 'wx')
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
    // El lock ya existe: puede ser un runner vivo o un lock huérfano de un crash.
    let owner = null
    try {
      owner = JSON.parse(await fs.readFile(LOCK_FILE, 'utf8'))
    } catch {
      owner = null
    }
    let alive
    if (!owner) {
      alive = false // lock corrupto/vacío -> reclamar
    } else if (owner.hostname === os.hostname() && Number.isInteger(owner.pid)) {
      alive = isPidAlive(owner.pid)
    } else {
      alive = true // otro host o pid inválido: no podemos verificar, no reclamamos
    }
    if (alive) {
      throw new Error(`Ya existe un runner activo para la instancia ${INSTANCE_NAME} (pid ${owner?.pid ?? '?'}, ${LOCK_FILE}).`)
    }
    console.warn(`⚠️ Lock huérfano detectado (${owner?.pid ? `pid ${owner.pid} sin proceso` : 'lock corrupto'}); reclamando ${LOCK_FILE}.`)
    await fs.unlink(LOCK_FILE).catch(() => {})
    runnerLock = await fs.open(LOCK_FILE, 'wx')
  }
  await runnerLock.writeFile(JSON.stringify({ pid: process.pid, hostname: os.hostname(), startedAt: new Date().toISOString() }))
}

async function releaseRunnerLock() {
  if (!runnerLock) return
  await runnerLock.close().catch(() => {})
  await fs.unlink(LOCK_FILE).catch(() => {})
  runnerLock = null
}

function gatewaySnapshot() {
  return createGatewaySnapshot({ instanceName: INSTANCE_NAME, qr: currentQr, qrExpiresAt, connected: currentSock?.user, status: gatewayPhase })
}

async function updateHeartbeat(status, metadata = {}) {
  const { error } = await supabase.rpc('fn_hermes_gateway_heartbeat', {
    p_instance_name: INSTANCE_NAME,
    p_status: status,
    p_phone: currentSock?.user?.id || null,
    p_metadata: metadata,
  })
  if (error) console.error('❌ Error actualizando heartbeat:', error.message)
}

// fn_hermes_gateway_get_live_status marca 'disconnected' si el último latido
// tiene más de 60s. Sin un latido periódico, un runner estable conectado se
// vería como caído en la vista ADM al minuto de conectarse.
function startHeartbeatLoop() {
  stopHeartbeatLoop()
  heartbeatTimer = setInterval(() => {
    if (!currentSock?.user) return
    updateHeartbeat('connected').catch(() => {})
    gatewayServer?.broadcast(gatewaySnapshot())
  }, 20000)
}

function stopHeartbeatLoop() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

async function acquireWorkerLease() {
  const { data, error } = await supabase.rpc('fn_hermes_gateway_acquire_lease', {
    p_instance_name: INSTANCE_NAME,
    p_owner_id: WORKER_ID,
    p_duration_seconds: 30,
  })
  if (error) {
    console.error('❌ No se pudo adquirir el lease del worker:', error.message)
    workerLeaseHeld = false
    return false
  }
  workerLeaseHeld = data === true
  if (!workerLeaseHeld) console.warn('⚠️ Otra instancia posee el lease; este worker no despachará mensajes.')
  return workerLeaseHeld
}

async function releaseWorkerLease() {
  if (!workerLeaseHeld) return
  await supabase.rpc('fn_hermes_gateway_release_lease', {
    p_instance_name: INSTANCE_NAME,
    p_owner_id: WORKER_ID,
  }).catch((error) => console.error('❌ No se pudo liberar el lease:', error.message))
  workerLeaseHeld = false
}

async function isAuthorizedToken(token) {
  if (!token || !SUPABASE_ANON_KEY) return false
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  if (userError || !userData?.user) return false
  const { data: isAdmin, error: adminError } = await userClient.rpc('es_admin')
  return !adminError && isAdmin === true
}

let gatewayServer = null

function startGatewayServer() {
  gatewayServer = createGatewayServer({
    port: GATEWAY_PORT,
    host: GATEWAY_HOST,
    key: GATEWAY_KEY,
    allowedOrigins: ALLOWED_ORIGINS,
    authorizeToken: isAuthorizedToken,
    snapshot: gatewaySnapshot,
    onLogout: async () => {
      if (!currentSock) throw new Error('WhatsApp no está conectado')
      await currentSock.logout()
      currentQr = null
      qrExpiresAt = null
      return { ok: true }
    },
    onSessionBackup: backupSession,
    onSessionRestore: restoreSession,
    onSessionDelete: deleteSession,
  })
  gatewayServer.listen(() => {
    console.log(`🌐 Gateway API/WebSocket escuchando en ${GATEWAY_HOST}:${GATEWAY_PORT}`)
  })
}

function scheduleReconnect() {
  if (reconnectTimer) return
  const delay = Math.min(30_000, 1_000 * (2 ** Math.min(reconnectAttempt, 5)) + Math.floor(Math.random() * 500))
  reconnectAttempt += 1
  console.log(`🔁 Reintentando conexión en ${Math.ceil(delay / 1000)}s (intento ${reconnectAttempt})`)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    startWhatsApp().catch((error) => {
      console.error('❌ Error al reintentar WhatsApp:', error.message)
      scheduleReconnect()
    })
  }, delay)
}

// sendMessage() de Baileys resuelve en cuanto el mensaje se encola localmente,
// NO cuando el servidor de WhatsApp lo confirma. Si el socket se cae justo
// después (visto en producción: "Conexión cerrada (428)" tras un envío), la
// promesa igual resuelve aunque la trama nunca haya llegado — falso 'enviado'.
// Por eso esperamos el evento messages.update con status >= SERVER_ACK (2)
// antes de marcar la fila como enviada en la cola.
const WA_STATUS_SERVER_ACK = 2
const pendingAcks = new Map() // messageId -> { resolve }

function esperarConfirmacionServidor(messageId, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingAcks.delete(messageId)
      reject(new Error('Timeout esperando confirmación de entrega del servidor de WhatsApp (posible caída de conexión)'))
    }, timeoutMs)

    pendingAcks.set(messageId, {
      resolve: () => {
        clearTimeout(timer)
        pendingAcks.delete(messageId)
        resolve()
      },
    })
  })
}

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  let version = [2, 3000, 1015901307]
  try {
    const vInfo = await fetchLatestBaileysVersion()
    version = vInfo.version
  } catch (e) {}

  console.log(`🚀 Iniciando Gateway WhatsApp HERMES (Baileys v${version.join('.')})...`)

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
    syncFullHistory: false,
    retryRequestDelayMs: 500,
  })

  currentSock = sock

  sock.ev.on('creds.update', saveCreds)

  // Confirmación real de entrega: resuelve las promesas pendientes en
  // pendingAcks cuando WhatsApp confirma recepción server-side (status >= 2).
  sock.ev.on('messages.update', (updates) => {
    for (const { key, update } of updates) {
      const messageId = key?.id
      const status = update?.status
      if (!messageId || typeof status !== 'number' || status < WA_STATUS_SERVER_ACK) continue

      const pending = pendingAcks.get(messageId)
      if (pending) pending.resolve()
    }
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      gatewayPhase = 'qr_ready'
      currentQr = await QRCode.toDataURL(qr, { width: 360, margin: 2 })
      qrExpiresAt = Date.now() + 90000
      await updateHeartbeat('qr_ready', { qr_expires_at: new Date(qrExpiresAt).toISOString() })
      gatewayServer?.broadcast(gatewaySnapshot())
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output?.statusCode : 500
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && !manualSessionOperation
      gatewayPhase = statusCode === DisconnectReason.loggedOut ? 'session_expired' : 'disconnected'
      console.log(`⚠️ Conexión cerrada (${statusCode}). Reconectando en 4s: ${shouldReconnect}`)

      if (queueInterval) {
        clearInterval(queueInterval)
        queueInterval = null
      }
      stopHeartbeatLoop()
      await releaseWorkerLease()
      currentSock = null
      currentQr = null
      qrExpiresAt = null
      await updateHeartbeat('disconnected', { status_code: statusCode })
      gatewayServer?.broadcast(gatewaySnapshot())

      if (shouldReconnect) {
        scheduleReconnect()
      }
    } else if (connection === 'open') {
      manualSessionOperation = false
      gatewayPhase = 'connected'
      reconnectAttempt = 0
      currentQr = null
      qrExpiresAt = null
      await updateHeartbeat('connected')
      gatewayServer?.broadcast(gatewaySnapshot())
      startHeartbeatLoop()
      console.log('\n✅ [CONEXIÓN ESTABLECIDA] ¡WhatsApp Institucional conectado exitosamente!')
      iniciarDespachadorCola()
    }
  })

  // Escuchar mensajes entrantes (Inbound) — SOLO reenvía al pipeline real
  // (whatsapp-webhook). Nunca decide ni responde por su cuenta: ese análisis
  // (reconocimiento de alumno, clasificación de intención con Groq, kill
  // switch, opt-out, plantillas de R6) vive únicamente en esa función.
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    if (!WEBHOOK_SECRET) return

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue

      const jid = msg.key.remoteJid
      if (!jid || jid.endsWith('@g.us') || jid.includes('status')) continue

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': WEBHOOK_SECRET,
          },
          body: JSON.stringify({
            event: 'messages.upsert',
            instance: INSTANCE_NAME,
            data: {
              key: msg.key,
              pushName: msg.pushName,
              message: msg.message,
            },
          }),
        })
        if (!res.ok) {
          console.error(`❌ whatsapp-webhook respondió ${res.status} para mensaje de ${jid}`)
        } else {
          console.log(`📩 [MENSAJE de ${jid}] reenviado a whatsapp-webhook para análisis`)
        }
      } catch (err) {
        console.error('❌ Error reenviando mensaje a whatsapp-webhook:', err.message)
      }
    }
  })
}

// Despacha únicamente lo que fn_whatsapp_reclamar_pendientes autoriza — la
// misma función que usa la Edge Function whatsapp-dispatcher. Así este
// runner hereda automáticamente kill switch (whatsapp_ingest_enabled),
// ventana horaria, opt-out, consentimiento de campaña y caps anti-ban, sin
// duplicar esa lógica aquí.
function iniciarDespachadorCola() {
  if (queueInterval) {
    clearInterval(queueInterval)
  }

  console.log('🔄 Despachador de cola HERMES activado (sondeo cada 6 segundos, vía fn_whatsapp_reclamar_pendientes)...')

  queueInterval = setInterval(async () => {
    if (!currentSock || queueCycleRunning) return
    queueCycleRunning = true

    try {
      if (!await acquireWorkerLease()) return
      const { data: mensajes, error } = await supabase.rpc('fn_whatsapp_reclamar_pendientes', { p_limite: 3 })

      if (error) {
        console.error('❌ Error reclamando mensajes pendientes:', error.message)
        return
      }
      if (!mensajes || mensajes.length === 0) return

      for (const item of mensajes) {
        let cleanJid = item.jid.replace(/\D/g, '')

        if (!cleanJid.endsWith('@s.whatsapp.net')) {
          cleanJid = `${cleanJid}@s.whatsapp.net`
        }

        console.log(`\n📤 [DESPACHANDO ALERTA ID ${item.id}] Destino: ${cleanJid}`)

        try {
          const sentMsg = await currentSock.sendMessage(cleanJid, { text: item.mensaje })
          const messageId = sentMsg?.key?.id

          if (messageId) {
            await esperarConfirmacionServidor(messageId)
          } else {
            console.warn(`   ⚠️ No se pudo obtener el ID del mensaje enviado a ${cleanJid}; no se verificará confirmación de entrega.`)
          }

          console.log(`   ✅ Mensaje confirmado por WhatsApp para ${cleanJid}`)

          await supabase
            .from('hermes_whatsapp_queue')
            .update({ estado: 'enviado', procesado_at: new Date().toISOString() })
            .eq('id', item.id)
        } catch (sendErr) {
          console.error(`   ❌ Error al enviar mensaje:`, sendErr.message)
          await supabase
            .from('hermes_whatsapp_queue')
            .update({ estado: 'fallido', error_msg: sendErr.message })
            .eq('id', item.id)
        }
      }
    } catch (err) {
      console.error('❌ Error en el ciclo del despachador:', err.message)
    } finally {
      queueCycleRunning = false
    }
  }, 6000)
}

process.on('uncaughtException', (err) => {
  console.error('⚠️ Excepción capturada:', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Promesa rechazada:', reason)
})

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, async () => {
    stopHeartbeatLoop()
    await releaseWorkerLease()
    await releaseRunnerLock()
    process.exit(0)
  })
}

acquireRunnerLock().then(() => {
  startGatewayServer()
  return startWhatsApp()
}).catch((err) => {
  console.error('❌ Error fatal:', err)
  releaseRunnerLock().finally(() => { process.exitCode = 1 })
})

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'
// Debe coincidir con el secret WHATSAPP_WEBHOOK_SECRET configurado en la función
// whatsapp-webhook de Supabase — sin esto, este runner no puede reenviar mensajes
// entrantes al pipeline real (análisis de intención, kill switch, opt-out, etc.).
const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || ''
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`

if (!WEBHOOK_SECRET) {
  console.warn('⚠️  WHATSAPP_WEBHOOK_SECRET no está definido — los mensajes entrantes NO se reenviarán al pipeline real.')
}

console.log('🔗 Conectando a Supabase:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

const logger = pino({ level: 'silent' })
let currentSock = null
let queueInterval = null

async function startWhatsApp() {
  const authDir = path.join(__dirname, 'auth_info_baileys')
  const { state, saveCreds } = await useMultiFileAuthState(authDir)
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

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output?.statusCode : 500
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log(`⚠️ Conexión cerrada (${statusCode}). Reconectando en 4s: ${shouldReconnect}`)

      if (queueInterval) {
        clearInterval(queueInterval)
        queueInterval = null
      }
      currentSock = null

      if (shouldReconnect) {
        setTimeout(startWhatsApp, 4000)
      }
    } else if (connection === 'open') {
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
            instance: 'whatsapp-runner',
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
    if (!currentSock) return

    try {
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
          await currentSock.sendMessage(cleanJid, { text: item.mensaje })
          console.log(`   ✅ Mensaje entregado con éxito a ${cleanJid}`)

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
    }
  }, 6000)
}

process.on('uncaughtException', (err) => {
  console.error('⚠️ Excepción capturada:', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Promesa rechazada:', reason)
})

startWhatsApp().catch((err) => {
  console.error('❌ Error fatal:', err)
})

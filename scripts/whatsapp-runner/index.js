import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

console.log('🔗 Conectando a Supabase:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

const logger = pino({ level: 'silent' })

async function startWhatsApp() {
  const authDir = path.join(__dirname, 'auth_info_baileys')
  const { state, saveCreds } = await useMultiFileAuthState(authDir)
  let version = [2, 3000, 1015901307]
  try {
    const vInfo = await fetchLatestBaileysVersion()
    version = vInfo.version
  } catch (e) {
    // fallback
  }

  console.log(`🚀 Iniciando Gateway WhatsApp HERMES (Baileys v${version.join('.')})...`)

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n============================================================')
      console.log('📱 ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP INSTITUCIONAL (+18096714156)')
      console.log('============================================================\n')
      qrcode.generate(qr, { small: true })
      console.log('\n============================================================\n')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output?.statusCode : 500
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log(`⚠️ Conexión cerrada (${statusCode}). Reconectando: ${shouldReconnect}`)
      if (shouldReconnect) {
        setTimeout(startWhatsApp, 3000)
      }
    } else if (connection === 'open') {
      console.log('\n✅ [CONEXIÓN ESTABLECIDA] ¡WhatsApp Institucional conectado exitosamente!')
      iniciarDespachadorCola(sock)
    }
  })

  // Escuchar mensajes entrantes (Inbound)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue

      const jid = msg.key.remoteJid
      if (!jid || jid.endsWith('@g.us')) continue

      const texto =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        ''

      if (!texto.trim()) continue

      console.log(`\n📩 [MENSAJE RECIBIDO de ${jid.split('@')[0]}]: "${texto}"`)

      try {
        const payload = {
          event: 'messages.upsert',
          data: {
            key: {
              remoteJid: jid,
              fromMe: false,
              id: msg.key.id,
            },
            pushName: msg.pushName || 'Representante',
            message: {
              conversation: texto,
            },
          },
        }

        const resp = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const result = await resp.json()
        console.log(`⚡ [WEBHOOK PROCESADO POR HERMES]:`, result)
      } catch (err) {
        console.error('❌ Error enviando webhook a Supabase:', err.message)
      }
    }
  })
}

let despachadorActivo = false
function iniciarDespachadorCola(sock) {
  if (despachadorActivo) return
  despachadorActivo = true

  console.log('🔄 Despachador de cola HERMES activado (sondeo cada 5 segundos)...')

  setInterval(async () => {
    try {
      const { data: mensajes, error } = await supabase
        .from('hermes_whatsapp_queue')
        .select('*')
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true })
        .limit(5)

      if (error) {
        console.error('❌ Error consultando cola:', error.message)
        return
      }

      if (!mensajes || mensajes.length === 0) return

      for (const item of mensajes) {
        let cleanJid = item.jid.replace(/\D/g, '')
        if (!cleanJid.endsWith('@s.whatsapp.net')) {
          cleanJid = `${cleanJid}@s.whatsapp.net`
        }

        console.log(`\n📤 [ENVIANDO MENSAJE ID ${item.id}] Destino: ${cleanJid}`)
        console.log(`   Texto: "${item.mensaje}"`)

        await supabase
          .from('hermes_whatsapp_queue')
          .update({ estado: 'procesando', intentos: (item.intentos || 0) + 1 })
          .eq('id', item.id)

        try {
          await sock.sendMessage(cleanJid, { text: item.mensaje })
          console.log(`   ✅ Mensaje entregado con éxito a ${cleanJid}`)

          await supabase
            .from('hermes_whatsapp_queue')
            .update({
              estado: 'enviado',
              enviado_at: new Date().toISOString(),
            })
            .eq('id', item.id)
        } catch (sendErr) {
          console.error(`   ❌ Error al enviar mensaje:`, sendErr.message)
          await supabase
            .from('hermes_whatsapp_queue')
            .update({
              estado: 'error',
              error_msg: sendErr.message,
            })
            .eq('id', item.id)
        }
      }
    } catch (err) {
      console.error('❌ Error en el ciclo del despachador:', err.message)
    }
  }, 5000)
}

startWhatsApp().catch((err) => {
  console.error('❌ Error fatal iniciando WhatsApp:', err)
})

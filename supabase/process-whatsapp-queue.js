import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  clampMessageText,
  estimateTokenBudget,
  shouldBlockSensitiveMessage,
  WHATSAPP_SECURITY_DEFAULTS,
} from '../src/modules/hermes/api/whatsappSecurityGuard.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY not found.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Anti-ban: pausa con jitter entre envíos (mimetiza ritmo humano)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const MAX_TOKENS_PER_MESSAGE = Number(process.env.WHATSAPP_MAX_TOKENS_PER_MESSAGE || WHATSAPP_SECURITY_DEFAULTS.maxTokensPerTurn)
const MAX_CHARS_PER_MESSAGE = Number(process.env.WHATSAPP_MAX_CHARS_PER_MESSAGE || WHATSAPP_SECURITY_DEFAULTS.maxCharsPerMessage)

async function processQueue() {
  console.log('⏰ [Hermes Outbox] Iniciando procesamiento de la cola de WhatsApp...')

  // 1. Fetch active WhatsApp configuration
  const { data: config, error: configError } = await supabase
    .from('hermes_whatsapp_config')
    .select('*')
    .eq('activo', true)
    .maybeSingle()

  if (configError) {
    console.error('❌ Error cargando configuración de WhatsApp:', configError.message)
    process.exit(1)
  }

  if (!config) {
    console.log('⚠️ Gateway de WhatsApp inactivo o sin configurar. Saltando envíos.')
    process.exit(0)
  }

  // 2. Claim eligible messages atomically. The database is the policy authority
  // for caps, consent, opt-out, quiet hours and duplicate-worker protection.
  const { data: pendingMessages, error: queueError } = await supabase
    .rpc('fn_whatsapp_reclamar_pendientes', { p_limite: config.batch_size ?? 10 })

  if (queueError) {
    console.error('❌ Error consultando la cola de mensajes:', queueError.message)
    process.exit(1)
  }

  if (!pendingMessages || pendingMessages.length === 0) {
    console.log('✅ No hay mensajes pendientes de envío.')
    process.exit(0)
  }

  console.log(`✉️ Procesando ${pendingMessages.length} mensaje(s) pendiente(s)...`)

  const jitterMin = config.jitter_min_seg ?? 8
  const jitterMax = config.jitter_max_seg ?? 20

  for (let i = 0; i < pendingMessages.length; i++) {
    const message = pendingMessages[i]
    console.log(`🔹 Enviando mensaje ID ${message.id} a ${message.jid.split('@')[0]}...`)

    if (shouldBlockSensitiveMessage(message.mensaje)) {
      console.warn(`   ⛔ Mensaje bloqueado por patrón sensible. ID ${message.id}`)
      await supabase
        .from('hermes_whatsapp_queue')
        .update({
          estado: 'cancelado',
          error_msg: 'Bloqueado por política de seguridad WhatsApp + HERMES',
          procesado_at: new Date().toISOString(),
        })
        .eq('id', message.id)
      continue
    }

    // Nota: fn_whatsapp_reclamar_pendientes ya marcó estado='procesando' e incrementó intentos.
    try {
      const url = `${config.gateway_url.replace(/\/$/, '')}/message/sendText`
      const headers = {
        'Content-Type': 'application/json'
      }

      if (config.api_key) {
        headers['Authorization'] = `Bearer ${config.api_key}`
        headers['apikey'] = config.api_key
      }

      const jid = message.jid.includes('@') ? message.jid : `${message.jid}@s.whatsapp.net`
      const body = {
        jid,
        text: clampMessageText(message.mensaje, MAX_CHARS_PER_MESSAGE)
      }

      const tokenEstimate = estimateTokenBudget(body.text)
      if (tokenEstimate > MAX_TOKENS_PER_MESSAGE) {
        throw new Error(`Mensaje excede el presupuesto de tokens permitido (${tokenEstimate} > ${MAX_TOKENS_PER_MESSAGE})`)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Servidor Gateway retornó ${response.status}: ${errorText}`)
      }

      await supabase
        .from('hermes_whatsapp_queue')
        .update({
          estado: 'enviado',
          procesado_at: new Date().toISOString(),
          error_msg: null
        })
        .eq('id', message.id)

      console.log(`   ✅ Mensaje enviado con éxito.`)

    } catch (err) {
      console.error(`   ❌ Fallo al despachar mensaje ${message.id}:`, err.message)
      
      const isFinalFail = message.intentos >= 3
      const newStatus = isFinalFail ? 'fallido' : 'pendiente'

      await supabase
        .from('hermes_whatsapp_queue')
        .update({
          estado: newStatus,
          error_msg: err.message
        })
        .eq('id', message.id)
    }

    // Anti-ban: pausa con jitter antes del próximo envío (no tras el último)
    if (i < pendingMessages.length - 1) {
      const espera = randInt(jitterMin, jitterMax)
      console.log(`   ⏳ Esperando ${espera}s antes del próximo envío...`)
      await sleep(espera * 1000)
    }
  }

  console.log('🏁 [Hermes Outbox] Procesamiento finalizado.')
}

processQueue()

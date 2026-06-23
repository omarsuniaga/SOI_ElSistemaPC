import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

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

// Helper to check if current time is inside quiet hours
function isQuietHours(startStr, endStr) {
  if (!startStr || !endStr) return false

  const now = new Date()
  
  // Format current time as HH:MM:SS in Dominican Republic timezone (America/Santo_Domingo)
  const options = {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  try {
    const timeParts = new Intl.DateTimeFormat('en-US', options).format(now).split(':')
    const currentMinutes = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10)
    
    const startParts = startStr.split(':')
    const startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10)
    
    const endParts = endStr.split(':')
    const endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10)
    
    if (startMinutes < endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes
    }
  } catch (err) {
    console.error('[Queue Processor] Error checking quiet hours:', err)
    return false
  }
}

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

  // 2. Fetch Global config to check quiet hours
  const { data: globalConfig, error: globalError } = await supabase
    .from('hermes_config')
    .select('*')
    .maybeSingle()

  if (globalError) {
    console.warn('⚠️ No se pudo cargar hermes_config para validar horas silenciosas:', globalError.message)
  }

  if (globalConfig && globalConfig.enable_whatsapp === false) {
    console.log('⚠️ Alertas de WhatsApp desactivadas globalmente en las preferencias.')
    process.exit(0)
  }

  if (globalConfig && isQuietHours(globalConfig.quiet_hours_start, globalConfig.quiet_hours_end)) {
    console.log(`😴 [Horas Silenciosas] En período de descanso (${globalConfig.quiet_hours_start} - ${globalConfig.quiet_hours_end}). Mensajes retenidos.`)
    process.exit(0)
  }

  // 3. Fetch pending messages
  const { data: pendingMessages, error: queueError } = await supabase
    .from('hermes_whatsapp_queue')
    .select('*')
    .eq('estado', 'pendiente')
    .lt('intentos', 3)
    .order('created_at', { ascending: true })
    .limit(10)

  if (queueError) {
    console.error('❌ Error consultando la cola de mensajes:', queueError.message)
    process.exit(1)
  }

  if (!pendingMessages || pendingMessages.length === 0) {
    console.log('✅ No hay mensajes pendientes de envío.')
    process.exit(0)
  }

  console.log(`✉️ Procesando ${pendingMessages.length} mensaje(s) pendiente(s)...`)

  for (const message of pendingMessages) {
    console.log(`🔹 Enviando mensaje ID ${message.id} a ${message.jid.split('@')[0]}...`)

    await supabase
      .from('hermes_whatsapp_queue')
      .update({ estado: 'procesando', intentos: message.intentos + 1 })
      .eq('id', message.id)

    try {
      const url = `${config.gateway_url.replace(/\/$/, '')}/message/sendText`
      const headers = {
        'Content-Type': 'application/json'
      }

      if (config.api_key) {
        headers['Authorization'] = `Bearer ${config.api_key}`
        headers['apikey'] = config.api_key
      }

      const body = {
        jid: message.jid,
        text: message.mensaje
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
      
      const isFinalFail = message.intentos + 1 >= 3
      const newStatus = isFinalFail ? 'fallido' : 'pendiente'

      await supabase
        .from('hermes_whatsapp_queue')
        .update({
          estado: newStatus,
          error_msg: err.message
        })
        .eq('id', message.id)
    }
  }

  console.log('🏁 [Hermes Outbox] Procesamiento finalizado.')
}

processQueue()

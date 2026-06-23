import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Get the current WhatsApp API Gateway configuration.
 */
export async function getWhatsAppConfig() {
  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .select('*')
    .maybeSingle()
  return { data, error }
}

/**
 * Save or update the WhatsApp API Gateway configuration.
 */
export async function saveWhatsAppConfig(configFields) {
  const { data: existing, error: checkError } = await getWhatsAppConfig()
  
  if (checkError) {
    return { data: null, error: checkError }
  }

  let result
  if (existing) {
    result = await supabase
      .from('hermes_whatsapp_config')
      .update(configFields)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('hermes_whatsapp_config')
      .insert([configFields])
      .select()
      .single()
  }
  return result
}

/**
 * Fetch the latest 50 messages from the WhatsApp outbox queue.
 */
export async function getWhatsAppQueue() {
  const { data, error } = await supabase
    .from('hermes_whatsapp_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return { data, error }
}

/**
 * Enqueue a new WhatsApp message via RPC function.
 */
export async function queueWhatsAppMessage(jid, mensaje) {
  const { data, error } = await supabase
    .rpc('fn_hermes_queue_whatsapp', { p_jid: jid, p_mensaje: mensaje })
  return { data, error }
}

/**
 * Sends a message directly to the WhatsApp Gateway REST API.
 * This is used for test connection messages and immediate dispatches.
 */
export async function sendWhatsAppDirect(config, jid, message) {
  if (!config?.gateway_url) {
    return { success: false, error: 'La URL del gateway no está configurada.' }
  }

  try {
    const url = `${config.gateway_url.replace(/\/$/, '')}/message/sendText`
    const body = {
      jid: jid,
      text: message
    }

    const headers = {
      'Content-Type': 'application/json'
    }

    if (config.api_key) {
      headers['Authorization'] = `Bearer ${config.api_key}`
      headers['apikey'] = config.api_key // Support both header variants
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Respuesta HTTP fallida (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err) {
    console.error('[whatsappService] sendWhatsAppDirect error:', err)
    return { success: false, error: err.message }
  }
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // 1. Obtener configuración activa del Gateway
    const { data: config, error: cfgError } = await supabase
      .from('hermes_whatsapp_config')
      .select('*')
      .eq('activo', true)
      .single()

    if (cfgError || !config) {
      return json({ status: 'skipped', reason: 'No hay configuración activa del Gateway WhatsApp' })
    }

    const gatewayUrl = config.gateway_url?.replace(/\/$/, '')
    const apiKey = config.api_key
    const instanceName = config.instance_name || 'soi-main'
    const batchSize = config.batch_size || 10
    const jitterMin = (config.jitter_min_seg || 8) * 1000
    const jitterMax = (config.jitter_max_seg || 20) * 1000

    // 2. Verificar estado de salud del Gateway (GET /instance/connectionState/<instance>)
    let isWorkerConnected = false
    try {
      const stateRes = await fetch(`${gatewayUrl}/instance/connectionState/${instanceName}`, {
        headers: { 'apikey': apiKey },
      })
      if (stateRes.ok) {
        const stateData = await stateRes.json()
        const stateStr = stateData?.instance?.state || stateData?.state || 'disconnected'
        isWorkerConnected = stateStr === 'open' || stateStr === 'connected'

        // Registrar Heartbeat en Base de Datos
        await supabase.rpc('fn_hermes_gateway_heartbeat', {
          p_instance_name: instanceName,
          p_status: isWorkerConnected ? 'connected' : 'disconnected',
          p_phone: config.numero_wid,
          p_metadata: stateData,
        })
      }
    } catch (healthErr) {
      console.warn('[WhatsApp Dispatcher] Error al chequear salud del worker:', healthErr)
    }

    if (!isWorkerConnected) {
      return json({
        status: 'worker_offline',
        message: 'El contenedor Baileys/Evolution API no se encuentra conectado a WhatsApp Web.',
      })
    }

    // 3. Obtener lote de mensajes pendientes de la cola (Outbox)
    const { data: pendingMessages, error: queueError } = await supabase
      .from('hermes_whatsapp_queue')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true })
      .limit(batchSize)

    if (queueError || !pendingMessages || pendingMessages.length === 0) {
      return json({ status: 'idle', message: 'No hay mensajes pendientes en la cola' })
    }

    const results: Array<{ id: string; jid: string; success: boolean; error?: string }> = []

    // 4. Despachar cada mensaje con Jitter para protección Anti-Ban
    for (let i = 0; i < pendingMessages.length; i++) {
      const msg = pendingMessages[i]

      // Limpiar formato del número telefónico (+1829... -> 1829...)
      const cleanNumber = String(msg.jid).replace(/\D/g, '')

      try {
        // Marcar como procesando
        await supabase
          .from('hermes_whatsapp_queue')
          .update({ estado: 'procesando', intentos: (msg.intentos || 0) + 1 })
          .eq('id', msg.id)

        // Enviar vía REST API a Evolution API
        const sendRes = await fetch(`${gatewayUrl}/message/sendText/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey,
          },
          body: JSON.stringify({
            number: cleanNumber,
            text: msg.mensaje,
          }),
        })

        if (!sendRes.ok) {
          const errBody = await sendRes.text()
          throw new Error(`HTTP ${sendRes.status}: ${errBody}`)
        }

        // Marcar como enviado
        await supabase
          .from('hermes_whatsapp_queue')
          .update({
            estado: 'enviado',
            procesado_at: new Date().toISOString(),
            error_msg: null,
          })
          .eq('id', msg.id)

        results.push({ id: msg.id, jid: msg.jid, success: true })
      } catch (sendErr: any) {
        await supabase
          .from('hermes_whatsapp_queue')
          .update({
            estado: 'fallido',
            error_msg: sendErr?.message || 'Error desconocido al enviar',
          })
          .eq('id', msg.id)

        results.push({ id: msg.id, jid: msg.jid, success: false, error: sendErr?.message })
      }

      // Jitter sleep si no es el último mensaje
      if (i < pendingMessages.length - 1) {
        const jitter = Math.floor(Math.random() * (jitterMax - jitterMin + 1)) + jitterMin
        await sleep(jitter)
      }
    }

    return json({
      status: 'processed',
      dispatched: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    })
  } catch (globalErr: any) {
    return json({ error: globalErr?.message || 'Error interno del despachador' }, 500)
  }
})

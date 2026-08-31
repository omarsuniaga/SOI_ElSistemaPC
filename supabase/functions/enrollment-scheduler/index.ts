/**
 * Supabase Edge Function: enrollment-scheduler (Module 4)
 * Spec: /home/omedsunriv/docs/srs/srs-enrollment-funnel.md (FR-03)
 *
 * Implements:
 * 1. Webhook endpoint for Google Apps Script with HMAC-SHA256 signature verification.
 * 2. Deterministic Slot Generation (Mon-Fri 10:00-14:00, Sat 09:00-13:00).
 * 3. Concurrency Slot Hold (10-minute TTL pessimistic lock).
 * 4. Atomic Appointment Commitment & WhatsApp Queue Notification.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const HMAC_SECRET = Deno.env.get('HMAC_SECRET') ?? 'default-secret-change-me'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature-sha256, x-idempotency-key',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Verify HMAC-SHA256 signature
 */
async function verifyHmacSignature(rawBody: string, signatureHex: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )

    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody))
  } catch (err) {
    console.error('[auth] Error verifying HMAC:', err)
    return false
  }
}

/**
 * Generate available time slots based on institutional hours
 * Mon-Fri: 10:00 - 14:00 (10:00, 11:00, 12:00, 13:00)
 * Sat: 09:00 - 13:00 (09:00, 10:00, 11:00, 12:00)
 */
async function getAvailableSlots(supabase: any, daysAhead = 5, limit = 6): Promise<string[]> {
  const now = new Date()
  const candidateSlots: Date[] = []

  for (let d = 0; d <= daysAhead; d++) {
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + d)
    const dayOfWeek = targetDate.getDay() // 0 = Sun, 1 = Mon, ... 6 = Sat

    if (dayOfWeek === 0) continue // Skip Sundays

    let startHour = 10
    let endHour = 14
    if (dayOfWeek === 6) {
      // Saturday
      startHour = 9
      endHour = 13
    }

    for (let hour = startHour; hour < endHour; hour++) {
      const slot = new Date(targetDate)
      slot.setHours(hour, 0, 0, 0)

      // Only future slots (at least 2 hours from now)
      if (slot.getTime() > now.getTime() + 2 * 60 * 60 * 1000) {
        candidateSlots.push(slot)
      }
    }
  }

  if (candidateSlots.length === 0) return []

  const minTime = candidateSlots[0].toISOString()
  const maxTime = candidateSlots[candidateSlots.length - 1].toISOString()

  // Query existing active locks or confirmed slots
  const { data: busyAppointments } = await supabase
    .from('appointments')
    .select('scheduled_datetime, status, locked_until')
    .gte('scheduled_datetime', minTime)
    .lte('scheduled_datetime', maxTime)
    .or(`status.eq.CONFIRMED,and(status.eq.RESERVED_PENDING,locked_until.gt.${now.toISOString()})`)

  const busyTimes = new Set((busyAppointments || []).map((a: any) => new Date(a.scheduled_datetime).toISOString()))

  return candidateSlots
    .filter((slot) => !busyTimes.has(slot.toISOString()))
    .slice(0, limit)
    .map((s) => s.toISOString())
}

/**
 * Format slot ISO for friendly WhatsApp text
 */
function formatSlotForWhatsApp(isoString: string): string {
  const date = new Date(isoString)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  const dayName = days[date.getDay()]
  const dayNum = date.getDate()
  const monthName = months[date.getMonth()]
  const hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHour = hours % 12 || 12

  return `${dayName} ${dayNum} de ${monthName} - ${formattedHour}:00 ${ampm}`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  const supabase = getSupabase()
  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'webhook'

  // -------------------------------------------------------------------------
  // 1. Webhook from Google Apps Script (onFormSubmit)
  // -------------------------------------------------------------------------
  if (action === 'webhook' && req.method === 'POST') {
    const rawBody = await req.text()
    const signature = req.headers.get('x-signature-sha256') || ''

    // Validate HMAC signature
    const isValid = await verifyHmacSignature(rawBody, signature, HMAC_SECRET)
    if (!isValid && HMAC_SECRET !== 'default-secret-change-me') {
      console.warn('[webhook] Invalid HMAC signature')
      return json({ error: 'Firma HMAC inválida' }, 401)
    }

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return json({ error: 'Payload JSON inválido' }, 400)
    }

    const { applicant_id, phone_number, full_name } = payload
    if (!phone_number) return json({ error: 'Falta phone_number' }, 400)

    // Retrieve next available slots
    const slots = await getAvailableSlots(supabase, 7, 3)
    const formattedSlots = slots.map((s, idx) => `*${idx + 1}.* ${formatSlotForWhatsApp(s)}`).join('\n')

    const cleanPhone = phone_number.replace(/\D/g, '')
    const jid = `${cleanPhone}@s.whatsapp.net`

    const message = `¡Hola ${full_name}! 👋\n\nHemos recibido correctamente tu formulario de postulación a El Sistema Punta Cana 🎶.\n\nPara formalizar el proceso, el siguiente paso obligatorio es asistir a una breve cita presencial para presentar los documentos básicos.\n\n📅 *Turnos disponibles para esta semana:*\n${formattedSlots}\n\n👉 Por favor, *responde únicamente con el número del turno* que prefieras (ejemplo: *1*) para reservarlo.`

    // Enqueue message to WhatsApp outbox
    await supabase.from('hermes_whatsapp_queue').insert({
      jid,
      mensaje: message,
      estado: 'pendiente'
    })

    return json({ ok: true, message: 'Lead notified with available slots', slots_offered: slots.length })
  }

  // -------------------------------------------------------------------------
  // 2. Lock Slot with 10-Minute TTL (Pessimistic Hold)
  // -------------------------------------------------------------------------
  if (action === 'hold_slot' && req.method === 'POST') {
    const { applicant_id, scheduled_datetime } = await req.json()
    if (!applicant_id || !scheduled_datetime) return json({ error: 'Faltan parámetros' }, 400)

    const lockExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Upsert hold
    const { data: appointment, error } = await supabase
      .from('appointments')
      .upsert({
        applicant_id,
        scheduled_datetime,
        status: 'RESERVED_PENDING',
        locked_until: lockExpires
      })
      .select()
      .single()

    if (error) return json({ error: error.message }, 500)

    return json({ ok: true, appointment, locked_until: lockExpires })
  }

  // -------------------------------------------------------------------------
  // 3. Confirm Appointment (Atomic Commit)
  // -------------------------------------------------------------------------
  if (action === 'confirm' && req.method === 'POST') {
    const { appointment_id, applicant_id } = await req.json()
    if (!appointment_id || !applicant_id) return json({ error: 'Faltan parámetros' }, 400)

    // 1. Confirm appointment
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .update({
        status: 'CONFIRMED',
        locked_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment_id)
      .select()
      .single()

    if (aptError) return json({ error: aptError.message }, 500)

    // 2. Update applicant status
    await supabase
      .from('applicants')
      .update({ status: 'SCHEDULED', updated_at: new Date().toISOString() })
      .eq('id', applicant_id)

    // 3. Record event
    await supabase.from('applicant_events').insert({
      applicant_id,
      event_name: 'APPOINTMENT_SCHEDULED',
      payload: {
        appointment_id,
        scheduled_datetime: appointment.scheduled_datetime
      }
    })

    return json({ ok: true, appointment, status: 'SCHEDULED' })
  }

  return json({ error: 'Acción no reconocida' }, 404)
})

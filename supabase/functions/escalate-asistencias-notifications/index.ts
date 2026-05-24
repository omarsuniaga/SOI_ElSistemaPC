import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

interface RegistroPendiente {
  id: string
  maestro_id: string
  clase_id: string
  sesion_clase_id: string
  created_at: string
  last_notified_at: string | null
  notif_count: number
  notification_state: 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO'
}

interface NotificationPayload {
  title: string
  body: string
  deepLink: string
  icon: string
}

// Calculate days since session creation
function getDiasAtraso(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  return Math.ceil((now - created) / (1000 * 60 * 60 * 24))
}

// Determine escalation state based on days overdue
function getEscalationState(diasAtraso: number): {
  state: 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO'
  intervalMs: number
  escalationLevel: number
} {
  if (diasAtraso >= 7) {
    return { state: 'ROJO', intervalMs: 30 * 60 * 1000, escalationLevel: 3 } // 30 min
  } else if (diasAtraso >= 3) {
    return { state: 'NARANJA', intervalMs: 4 * 60 * 60 * 1000, escalationLevel: 2 } // 4 hours
  } else if (diasAtraso >= 1) {
    return { state: 'AMARILLO', intervalMs: 24 * 60 * 60 * 1000, escalationLevel: 1 } // 24 hours
  }
  return { state: 'VERDE', intervalMs: 2 * 60 * 60 * 1000, escalationLevel: 0 } // 2 hours
}

// Build notification payload
function buildNotificationPayload(
  maestroNombre: string,
  clasesNombres: string[],
  estado: string,
  notifCount: number,
  claseId?: string,
  fecha?: string
): NotificationPayload {
  const stateEmoji = {
    VERDE: '🟢',
    AMARILLO: '🟡',
    NARANJA: '🟠',
    ROJO: '🔴'
  }[estado] || '🟡'

  const stateLabel = {
    VERDE: 'Registrado',
    AMARILLO: 'Recordatorio',
    NARANJA: 'Pendiente - Notificaciones cada 4 horas',
    ROJO: 'Urgente - Notificaciones cada 30 minutos'
  }[estado] || 'Pendiente'

  const clasesList = clasesNombres.slice(0, 3).join(', ')
  const clasesMore = clasesNombres.length > 3 ? ` y ${clasesNombres.length - 3} más` : ''

  // When there's a single class with known ID, deep-link directly to it
  const hoy = new Date().toISOString().split('T')[0]
  const deepLink = claseId
    ? `#/asistencia?clase=${claseId}&fecha=${fecha || hoy}`
    : '#/hoy'

  return {
    title: `Asistencias Pendientes - ${estado}`,
    body: `Saludos ${maestroNombre}, falta registrar asistencias y observaciones de ${clasesList}${clasesMore}.\n\n${stateLabel}`,
    deepLink,
    icon: stateEmoji
  }
}

// Send push notification via existing send-push function
async function sendPushNotification(
  maestroId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: {
        maestro_id: maestroId,
        title: payload.title,
        body: payload.body,
        deepLink: payload.deepLink
      }
    })

    if (error) {
      console.error(`[Push Error] ${maestroId}:`, error)
      return false
    }

    return true
  } catch (err) {
    console.error(`[Push Exception] ${maestroId}:`, err)
    return false
  }
}

// Main scheduler logic
async function escalateNotifications() {
  console.log('[Scheduler Start]', new Date().toISOString())

  try {
    // 1. Get all pending registros
    const { data: pendingRegistros, error: queryError } = await supabase
      .from('registros_pendientes')
      .select(
        `
        id,
        maestro_id,
        clase_id,
        sesion_clase_id,
        created_at,
        last_notified_at,
        notif_count,
        notification_state,
        clases(nombre),
        maestros(nombre_completo)
        `
      )
      .eq('estado', 'pendiente')
      .in('tipo', ['asistencia_pendiente', 'contenido_pendiente'])

    if (queryError) {
      console.error('[Query Error]', queryError)
      throw queryError
    }

    console.log(`[Pending Count] ${pendingRegistros?.length || 0} registros`)

    const now = new Date()
    let notificationsCreated = 0
    let registrosUpdated = 0

    // 2. Process each pending registro
    for (const reg of pendingRegistros || []) {
      const diasAtraso = getDiasAtraso(reg.created_at)
      const { state, intervalMs, escalationLevel } = getEscalationState(diasAtraso)

      // Check if notification is due
      const lastNotified = reg.last_notified_at ? new Date(reg.last_notified_at) : null
      const isDue =
        !lastNotified || now.getTime() - lastNotified.getTime() >= intervalMs

      if (isDue) {
        // Build notification
        const clasesNombres = Array.isArray(reg.clases)
          ? reg.clases.map((c: any) => c.nombre)
          : [reg.clases?.nombre || 'Unknown']

        // Pass clase_id only when there's a single class — enables direct deep-link
        const singleClaseId = clasesNombres.length === 1 ? reg.clase_id : undefined
        const fechaHoy = new Date().toISOString().split('T')[0]
        const payload = buildNotificationPayload(
          reg.maestros?.nombre_completo || 'Maestro',
          clasesNombres,
          state,
          reg.notif_count,
          singleClaseId,
          fechaHoy
        )

        // Create notification record
        const { data: notifRecord, error: notifError } = await supabase
          .from('notificaciones')
          .insert({
            maestro_id: reg.maestro_id,
            registro_pendiente_id: reg.id,
            titulo: payload.title,
            contenido: payload.body,
            tipo: 'asistencia_pendiente_escalation',
            escalation_level: escalationLevel,
            scheduled_for: new Date(now.getTime() + intervalMs).toISOString(),
            created_at: now.toISOString()
          })
          .select()

        if (notifError) {
          console.error(`[Notification Insert Error] ${reg.id}:`, notifError)
          continue
        }

        // Send push
        const pushSent = await sendPushNotification(reg.maestro_id, payload)

        if (pushSent) {
          notificationsCreated++
        }

        // Update registro tracking
        const { error: updateError } = await supabase
          .from('registros_pendientes')
          .update({
            last_notified_at: now.toISOString(),
            notif_count: reg.notif_count + 1,
            notification_state: state
          })
          .eq('id', reg.id)

        if (updateError) {
          console.error(`[Update Error] ${reg.id}:`, updateError)
        } else {
          registrosUpdated++
        }

        console.log(
          `[Notified] ${reg.id} | State: ${state} | Count: ${reg.notif_count + 1} | Push: ${pushSent}`
        )
      }
    }

    console.log(
      `[Scheduler End] Notifications: ${notificationsCreated}, Registros Updated: ${registrosUpdated}`
    )

    return {
      status: 'success',
      notificationsCreated,
      registrosUpdated,
      timestamp: now.toISOString()
    }
  } catch (err) {
    console.error('[Fatal Error]', err)
    throw err
  }
}

// Serve as HTTP function (called via webhook or manual trigger)
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const result = await escalateNotifications()
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

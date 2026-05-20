import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

interface AdminAlert {
  maestroId: string
  maestroNombre: string
  estado: 'NARANJA' | 'ROJO'
  diasAtraso: number
  sesionesAnteriores: string // Previous states
  rojoCount?: number // Number of ROJO sessions in 30-day window
}

/**
 * Check for maestros in NARANJA state
 */
async function checkNaranjaTransitions() {
  const { data: naranjaRegistros, error } = await supabase
    .from('registros_pendientes')
    .select(
      `
      id,
      maestro_id,
      notification_state,
      created_at,
      maestros(nombre_completo),
      clases(nombre)
      `
    )
    .eq('notification_state', 'NARANJA')
    .eq('estado', 'pendiente')

  if (error) {
    console.error('[checkNaranjaTransitions] Error:', error)
    return []
  }

  const alerts: AdminAlert[] = []

  // Group by maestro and check if first NARANJA notification
  const byMaestro = naranjaRegistros.reduce((acc, reg) => {
    if (!acc[reg.maestro_id]) {
      acc[reg.maestro_id] = []
    }
    acc[reg.maestro_id].push(reg)
    return acc
  }, {} as Record<string, any[]>)

  for (const [maestroId, registros] of Object.entries(byMaestro)) {
    const maestro = registros[0]
    const diasAtraso = Math.ceil(
      (Date.now() - new Date(maestro.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Only alert on first NARANJA transition (notif_count == 1)
    if (registros.some((r) => r.notif_count === 1)) {
      alerts.push({
        maestroId,
        maestroNombre: maestro.maestros?.nombre_completo || 'Unknown',
        estado: 'NARANJA',
        diasAtraso,
        sesionesAnteriores: registros.map((r) => r.clases?.nombre).join(', ')
      })
    }
  }

  return alerts
}

/**
 * Check for maestros in ROJO state
 */
async function checkRojoTransitions() {
  const { data: rojoRegistros, error } = await supabase
    .from('registros_pendientes')
    .select(
      `
      id,
      maestro_id,
      notification_state,
      created_at,
      maestros(nombre_completo),
      clases(nombre)
      `
    )
    .eq('notification_state', 'ROJO')
    .eq('estado', 'pendiente')

  if (error) {
    console.error('[checkRojoTransitions] Error:', error)
    return []
  }

  const alerts: AdminAlert[] = []

  // Group by maestro
  const byMaestro = rojoRegistros.reduce((acc, reg) => {
    if (!acc[reg.maestro_id]) {
      acc[reg.maestro_id] = []
    }
    acc[reg.maestro_id].push(reg)
    return acc
  }, {} as Record<string, any[]>)

  for (const [maestroId, registros] of Object.entries(byMaestro)) {
    const maestro = registros[0]
    const diasAtraso = Math.ceil(
      (Date.now() - new Date(maestro.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Check for repeated ROJO (3+ sessions in 30 days)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const rojoIn30Days = registros.filter(
      (r) => new Date(r.created_at).getTime() > last30Days.getTime()
    ).length

    alerts.push({
      maestroId,
      maestroNombre: maestro.maestros?.nombre_completo || 'Unknown',
      estado: 'ROJO',
      diasAtraso,
      sesionesAnteriores: registros.map((r) => r.clases?.nombre).join(', '),
      rojoCount: rojoIn30Days
    })
  }

  return alerts
}

/**
 * Send alert to admin users
 */
async function sendAdminAlert(alert: AdminAlert, alertType: 'naranja' | 'rojo_first' | 'rojo_pattern') {
  const { data: adminUsers, error: adminError } = await supabase
    .from('auth.users')
    .select('id, email, raw_app_meta_data')
    .eq('raw_app_meta_data.role', 'admin')

  if (adminError || !adminUsers) {
    console.error('[sendAdminAlert] Error fetching admins:', adminError)
    return false
  }

  const titles = {
    naranja: `⚠️ Maestro en NARANJA: ${alert.maestroNombre}`,
    rojo_first: `🚨 ALERTA CRÍTICA: ${alert.maestroNombre} en ROJO`,
    rojo_pattern: `🚨 PATRÓN CRÍTICO: ${alert.maestroNombre} - ${alert.rojoCount} ROJO en 30 días`
  }

  const bodies = {
    naranja: `${alert.maestroNombre} ha alcanzado estado NARANJA (${alert.diasAtraso} días de atraso). Sesiones: ${alert.sesionesAnteriores}`,
    rojo_first: `${alert.maestroNombre} ha alcanzado ROJO (${alert.diasAtraso} días de atraso). Intervención requerida.`,
    rojo_pattern: `${alert.maestroNombre} tiene ${alert.rojoCount} sesiones ROJO en los últimos 30 días. Escalación a Director recomendada.`
  }

  for (const admin of adminUsers) {
    const { error } = await supabase.from('notificaciones').insert({
      maestro_id: alert.maestroId, // Store maestro context
      admin_user_id: admin.id, // Alert recipient
      titulo: titles[alertType],
      contenido: bodies[alertType],
      tipo: `admin_alert_${alertType}`,
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error(`[sendAdminAlert] Insert error for admin ${admin.id}:`, error)
    }

    // Optional: send email to admin
    console.log(`[Alert] ${admin.email}: ${titles[alertType]}`)
  }

  return true
}

/**
 * Main alert checker
 */
async function checkAndSendAdminAlerts() {
  console.log('[AdminAlerts] Starting check:', new Date().toISOString())

  try {
    // Check NARANJA transitions
    const naranjaAlerts = await checkNaranjaTransitions()
    for (const alert of naranjaAlerts) {
      console.log('[Alert] NARANJA detected:', alert.maestroNombre)
      await sendAdminAlert(alert, 'naranja')
    }

    // Check ROJO transitions
    const rojoAlerts = await checkRojoTransitions()
    for (const alert of rojoAlerts) {
      // Check for pattern (3+ ROJO in 30 days) → escalate to director
      if ((alert.rojoCount || 0) >= 3) {
        console.log('[Alert] ROJO PATTERN (director escalation):', alert.maestroNombre)
        await sendAdminAlert(alert, 'rojo_pattern')
      } else {
        console.log('[Alert] ROJO detected:', alert.maestroNombre)
        await sendAdminAlert(alert, 'rojo_first')
      }
    }

    console.log(
      '[AdminAlerts] Complete. NARANJA:',
      naranjaAlerts.length,
      ', ROJO:',
      rojoAlerts.length
    )

    return {
      status: 'success',
      naranja: naranjaAlerts.length,
      rojo: rojoAlerts.length,
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    console.error('[AdminAlerts] Fatal error:', err)
    throw err
  }
}

// Serve as HTTP function
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const result = await checkAndSendAdminAlerts()
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

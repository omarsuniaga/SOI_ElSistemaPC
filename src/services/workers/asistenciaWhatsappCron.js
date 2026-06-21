import cron from 'node-cron'
import { sendWhatsAppGroup } from '../../lib/hermesClient.js'

async function notificarFaltasDelDia(supabase) {
  const hoy = new Date()
  const fechaHoy = hoy.toISOString().split('T')[0]
  const fechaLegible = hoy.toLocaleDateString('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const { data: sesiones, error: sesErr } = await supabase
    .from('sesiones_clase')
    .select('id, clase_id, clases!inner(nombre, whatsapp_group_jid)')
    .gte('fecha', `${fechaHoy}T00:00:00`)
    .lte('fecha', `${fechaHoy}T23:59:59`)

  if (sesErr) throw sesErr
  if (!sesiones?.length) return { processed: 0, alerts: 0, errors: [] }

  let alerts = 0
  const errors = []

  for (const sesion of sesiones) {
    const clase = sesion.clases
    if (!clase.whatsapp_group_jid) continue

    const { data: faltas, error: faltasErr } = await supabase
      .from('asistencias')
      .select('estado, alumnos!inner(nombre_completo)')
      .eq('sesion_clase_id', sesion.id)
      .in('estado', ['ausente', 'A'])

    if (faltasErr) {
      errors.push({ sesion: sesion.id, error: faltasErr.message })
      continue
    }
    if (!faltas?.length) continue

    const listaNombres = faltas.map((f) => `• ${f.alumnos.nombre_completo}`).join('\n')

    const msg =
      `📊 *Asistencia del ${fechaLegible}*\n\n` +
      `Clase: *${clase.nombre}*\n\n` +
      `❌ *Ausentes (${faltas.length}):*\n${listaNombres}`

    const res = await sendWhatsAppGroup(clase.whatsapp_group_jid, msg)
    if (!res.sent && res.error) errors.push({ clase: clase.nombre, error: res.error })
    else alerts++
  }

  return { processed: sesiones.length, alerts, errors }
}

export function registerAsistenciaWhatsappCron(supabase, logger = console) {
  cron.schedule('30 21 * * 1-6', async () => {
    try {
      const result = await notificarFaltasDelDia(supabase)
      logger.info(
        `[AsistenciaAlert] processed=${result.processed}, alerts=${result.alerts}, errors=${result.errors.length}`
      )
      if (result.errors.length) logger.warn('[AsistenciaAlert] errors:', result.errors)
    } catch (err) {
      logger.error('[AsistenciaAlert] cron failed:', err)
    }
  })
  logger.info('[AsistenciaAlert] Cron registered (30 21 * * 1-6 UTC)')
}

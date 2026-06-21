import cron from 'node-cron'
import { sendWhatsAppGroup } from '../../lib/hermesClient.js'

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

async function detectarBitacorasFaltantes(supabase) {
  const hoy = new Date()
  const diaHoy = DIAS_ES[hoy.getDay()]
  const fechaHoy = hoy.toISOString().split('T')[0]

  const { data: slots, error: slotsErr } = await supabase
    .from('clase_horarios')
    .select('clase_id, hora_inicio, hora_fin, clases!inner(id, nombre, estado, whatsapp_group_jid)')
    .eq('dia', diaHoy)
    .eq('clases.estado', 'activa')

  if (slotsErr) throw slotsErr
  if (!slots?.length) return { processed: 0, alerts: 0, errors: [] }

  const { data: sesionesHoy, error: sesErr } = await supabase
    .from('indicator_sessions')
    .select('clase_id')
    .gte('fecha', `${fechaHoy}T00:00:00`)
    .lte('fecha', `${fechaHoy}T23:59:59`)

  if (sesErr) throw sesErr

  const conBitacora = new Set(sesionesHoy?.map((s) => s.clase_id) ?? [])
  const sinBitacora = slots.filter((s) => !conBitacora.has(s.clase_id))

  let alerts = 0
  const errors = []

  for (const slot of sinBitacora) {
    const clase = slot.clases
    const inicio = slot.hora_inicio?.slice(0, 5) ?? ''
    const fin = slot.hora_fin?.slice(0, 5) ?? ''

    const msg =
      `📋 *Bitácora pendiente*\n\n` +
      `La clase *${clase.nombre}* (${inicio}–${fin}) no tiene bitácora registrada hoy.\n\n` +
      `Por favor completala desde el portal académico antes de las 22:00.`

    if (clase.whatsapp_group_jid) {
      const res = await sendWhatsAppGroup(clase.whatsapp_group_jid, msg)
      if (!res.sent && res.error) errors.push({ clase: clase.nombre, error: res.error })
      else alerts++
    }
  }

  return { processed: sinBitacora.length, alerts, errors }
}

export function registerBitacoraAlertCron(supabase, logger = console) {
  cron.schedule('0 20 * * 1-6', async () => {
    try {
      const result = await detectarBitacorasFaltantes(supabase)
      logger.info(
        `[BitacoraAlert] processed=${result.processed}, alerts=${result.alerts}, errors=${result.errors.length}`
      )
      if (result.errors.length) logger.warn('[BitacoraAlert] errors:', result.errors)
    } catch (err) {
      logger.error('[BitacoraAlert] cron failed:', err)
    }
  })
  logger.info('[BitacoraAlert] Cron registered (0 20 * * 1-6 UTC)')
}

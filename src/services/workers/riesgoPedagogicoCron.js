import cron from 'node-cron'
import { sendWhatsAppGroup } from '../../lib/hermesClient.js'

const NIVEL_EMOJI = { bajo: '🟡', medio: '🟠', alto: '🔴', critico: '🚨' }

async function escanearRiesgoPedagogico(supabase) {
  const hoy = new Date()
  const hasta = hoy.toISOString().split('T')[0]
  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: estudiantes, error } = await supabase.rpc('analizar_seguimiento_alumnos', {
    p_desde: desde,
    p_hasta: hasta,
    p_limit: 500,
    p_offset: 0,
    p_busqueda: '',
  })

  if (error) throw error

  const enRiesgo = (estudiantes ?? []).filter(
    (e) => e.nivel_riesgo === 'alto' || e.nivel_riesgo === 'critico'
  )

  if (!enRiesgo.length) return { scanned: estudiantes?.length ?? 0, alerts: 0, errors: [] }

  const semanaDesde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  let alertsInserted = 0
  const errors = []

  for (const est of enRiesgo) {
    const { data: existing } = await supabase
      .from('student_case_alerts')
      .select('id')
      .eq('alumno_id', est.alumno_id)
      .eq('estado', 'pendiente')
      .gte('detectada_en', semanaDesde)
      .limit(1)

    if (existing?.length) continue

    const { error: insertErr } = await supabase.from('student_case_alerts').insert({
      alumno_id: est.alumno_id,
      alumno_nombre: est.nombre_completo,
      tipo: 'riesgo_automatico',
      nivel_riesgo: est.nivel_riesgo,
      titulo: `Riesgo ${est.nivel_riesgo} detectado automáticamente`,
      descripcion: (est.risk_reasons ?? []).join(' · '),
      evidencia: {
        asistencia_rate: est.asistencia_rate,
        risk_score: est.risk_score,
        risk_reasons: est.risk_reasons,
        periodo: { desde, hasta },
      },
      estado: 'pendiente',
      detectada_en: new Date().toISOString(),
    })

    if (insertErr) {
      errors.push({ alumno: est.nombre_completo, error: insertErr.message })
      continue
    }

    alertsInserted++

    const { data: clasesAlumno } = await supabase
      .from('alumnos_clases')
      .select('clases!inner(nombre, whatsapp_group_jid)')
      .eq('alumno_id', est.alumno_id)
      .eq('activo', true)

    for (const ac of clasesAlumno ?? []) {
      const jid = ac.clases.whatsapp_group_jid
      if (!jid) continue

      const emoji = NIVEL_EMOJI[est.nivel_riesgo] ?? '⚠️'
      const razones = (est.risk_reasons ?? []).map((r) => `• ${r}`).join('\n')

      const msg =
        `${emoji} *Alerta pedagógica — Riesgo ${est.nivel_riesgo.toUpperCase()}*\n\n` +
        `Alumno: *${est.nombre_completo}*\n` +
        `Clase: *${ac.clases.nombre}*\n\n` +
        `*Indicadores detectados:*\n${razones}\n\n` +
        `Revisá el expediente del alumno en el portal académico.`

      await sendWhatsAppGroup(jid, msg)
    }
  }

  return { scanned: estudiantes?.length ?? 0, alerts: alertsInserted, errors }
}

export function registerRiesgoPedagogicoCron(supabase, logger = console) {
  cron.schedule('0 7 * * 1', async () => {
    try {
      const result = await escanearRiesgoPedagogico(supabase)
      logger.info(
        `[RiesgoPedagogico] scanned=${result.scanned}, alerts=${result.alerts}, errors=${result.errors.length}`
      )
      if (result.errors.length) logger.warn('[RiesgoPedagogico] errors:', result.errors)
    } catch (err) {
      logger.error('[RiesgoPedagogico] cron failed:', err)
    }
  })
  logger.info('[RiesgoPedagogico] Cron registered (0 7 * * 1 UTC — lunes)')
}

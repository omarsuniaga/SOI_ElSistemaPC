#!/usr/bin/env node
/**
 * Verifica qué maestros NO completaron la asistencia de la semana anterior.
 * Retorna JSON con maestro, clase/grupo, fecha y horario.
 *
 * Usa la RPC fn_estado_asistencia_maestro (misma fuente de verdad que
 * Portal Maestros y Admin) en vez de reconstruir la lógica de "completo"
 * a mano, para no desalinearse si el criterio cambia en la DB.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function getLastWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=domingo ... 6=sábado

  // Días desde el lunes de ESTA semana (lunes=0, domingo=6)
  const daysSinceMonday = (dayOfWeek + 6) % 7
  const thisMonday = new Date(today)
  thisMonday.setDate(thisMonday.getDate() - daysSinceMonday)

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(lastMonday.getDate() - 7)

  const lastFriday = new Date(lastMonday)
  lastFriday.setDate(lastFriday.getDate() + 4)

  const toISODate = (d) => d.toISOString().slice(0, 10)
  return { start: toISODate(lastMonday), end: toISODate(lastFriday) }
}

function buildMessage(teacher) {
  const nombre = (teacher.nombre_completo || 'Maestro/a').split(' ')[0]
  const primera = teacher.clases_incompletas[0]
  return (
    `Buenos días, estimado Prof. ${nombre}. Vemos que aún falta registrar la asistencia de ` +
    `${primera.grupo} del ${primera.fecha} en el portal. Cuando tenga tiempo, por favor complétalo. ¡Gracias! 🎵`
  )
}

async function enqueueReminders(incompleteTeachers) {
  const { data: killSwitch } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'whatsapp_ingest_enabled')
    .maybeSingle()

  if (killSwitch?.value === 'false') {
    console.log('🛑 whatsapp_ingest_enabled=false: no se encola ningún recordatorio.')
    return { queued: [], skipped: incompleteTeachers.map((t) => ({ nombre: t.nombre_completo, reason: 'whatsapp_ingest_disabled' })) }
  }

  const queued = []
  const skipped = []

  for (const teacher of incompleteTeachers) {
    const rawPhone = teacher.whatsapp
    if (!rawPhone || !String(rawPhone).trim()) {
      skipped.push({ nombre: teacher.nombre_completo, reason: 'no_phone' })
      continue
    }

    const cleanPhone = String(rawPhone).replace(/\D/g, '')
    if (cleanPhone.length < 8) {
      skipped.push({ nombre: teacher.nombre_completo, reason: 'invalid_phone' })
      continue
    }

    const last8 = cleanPhone.slice(-8)
    const { data: optOutRow } = await supabase
      .from('whatsapp_optout')
      .select('jid')
      .ilike('jid', `%${last8}%`)
      .maybeSingle()

    if (optOutRow) {
      skipped.push({ nombre: teacher.nombre_completo, reason: 'optout' })
      continue
    }

    const mensaje = buildMessage(teacher)
    const { error: queueError } = await supabase
      .from('hermes_whatsapp_queue')
      .insert({ jid: cleanPhone, mensaje, estado: 'pendiente' })

    if (queueError) {
      skipped.push({ nombre: teacher.nombre_completo, reason: `queue_error: ${queueError.message}` })
      continue
    }

    queued.push({ nombre: teacher.nombre_completo, telefono: cleanPhone, mensaje })
  }

  return { queued, skipped }
}

async function checkIncompleteAttendance() {
  try {
    const { start, end } = getLastWeekDates()
    console.log(`📅 Verificando asistencias de ${start} a ${end}`)

    const { data: maestros, error: maestrosError } = await supabase
      .from('maestros')
      .select('id, nombre_completo, correo, tlf')
      .eq('activo', true)

    if (maestrosError) throw maestrosError

    const incompleteTeachers = []

    for (const maestro of maestros || []) {
      const { data: estados, error: estadoError } = await supabase.rpc(
        'fn_estado_asistencia_maestro',
        { p_maestro_id: maestro.id, p_desde: start, p_hasta: end },
      )

      if (estadoError) {
        console.warn(`⚠️ No se pudo evaluar a ${maestro.nombre_completo}: ${estadoError.message}`)
        continue
      }

      const incompletas = (estados || []).filter((e) => e.estado === 'pendiente' || e.estado === 'vencida')
      if (incompletas.length === 0) continue

      incompleteTeachers.push({
        maestro_id: maestro.id,
        nombre_completo: maestro.nombre_completo,
        correo: maestro.correo,
        whatsapp: maestro.tlf,
        clases_incompletas: incompletas.map((e) => ({
          grupo: e.clase_nombre,
          fecha: e.fecha,
          horario: e.hora_inicio || 'Sin especificar',
        })),
      })
    }

    if (incompleteTeachers.length === 0) {
      console.log('✅ Todos los maestros completaron la asistencia de la semana anterior.')
      return { incomplete: [], message: 'Todas las asistencias completas' }
    }

    console.log(`\n⚠️  ${incompleteTeachers.length} maestro(s) con asistencia incompleta:\n`)
    incompleteTeachers.forEach((t) => {
      console.log(`📌 ${t.nombre_completo}`)
      t.clases_incompletas.forEach((c) => {
        console.log(`   - ${c.grupo} (${c.fecha} a las ${c.horario})`)
      })
      console.log()
    })

    let enqueueResult = null
    if (process.argv.includes('--enqueue')) {
      enqueueResult = await enqueueReminders(incompleteTeachers)
      console.log(`\n📨 Encolados: ${enqueueResult.queued.length}, omitidos: ${enqueueResult.skipped.length}`)
    }

    return { incomplete: incompleteTeachers, lastWeek: { start, end }, enqueueResult }
  } catch (err) {
    console.error('💥 Error:', err.message)
    process.exit(1)
  }
}

checkIncompleteAttendance().then((result) => {
  console.log('\n' + JSON.stringify(result, null, 2))
  process.exit(0)
})

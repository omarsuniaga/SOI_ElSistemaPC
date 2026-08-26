#!/usr/bin/env node
/**
 * Verifica qué maestros NO completaron la asistencia de la semana anterior.
 * Retorna JSON con maestro, clase/grupo, fecha y horario.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function getLastWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay()

  // Obtener lunes de la semana anterior
  const daysToMonday = dayOfWeek === 0 ? 8 : dayOfWeek + 1
  const lastMonday = new Date(today)
  lastMonday.setDate(lastMonday.getDate() - daysToMonday)
  lastMonday.setHours(0, 0, 0, 0)

  // Obtener viernes de la semana anterior
  const lastFriday = new Date(lastMonday)
  lastFriday.setDate(lastFriday.getDate() + 4)
  lastFriday.setHours(23, 59, 59, 999)

  return { start: lastMonday, end: lastFriday }
}

async function checkIncompleteAttendance() {
  try {
    const { start, end } = await getLastWeekDates()

    console.log(`📅 Verificando asistencias de ${start.toLocaleDateString('es-ES')} a ${end.toLocaleDateString('es-ES')}`)

    // Obtener todas las sesiones de la semana anterior
    const { data: sessions, error: sessionsError } = await supabase
      .from('class_sessions')
      .select(`
        id,
        fecha_sesion,
        maestro_id,
        grupo_nombre,
        hora_inicio,
        maestros(id, nombre_completo, email, phone, whatsapp)
      `)
      .gte('fecha_sesion', start.toISOString())
      .lte('fecha_sesion', end.toISOString())

    if (sessionsError) throw sessionsError
    if (!sessions || sessions.length === 0) {
      console.log('No hay sesiones de clase en la semana anterior.')
      return { incomplete: [], message: 'Sin sesiones de clase' }
    }

    // Para cada sesión, verificar si tiene registros de asistencia
    const incompleteTeachers = new Map()

    for (const session of sessions) {
      const { count: attendanceCount, error: countError } = await supabase
        .from('attendance_records')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)

      // Si no hay registros de asistencia, la clase no fue marcada
      if (!countError && attendanceCount === 0) {
        const maestroKey = `${session.maestro_id}`

        if (!incompleteTeachers.has(maestroKey)) {
          const maestro = session.maestros?.[0]
          incompleteTeachers.set(maestroKey, {
            maestro_id: session.maestro_id,
            nombre_completo: maestro?.nombre_completo || 'Desconocido',
            email: maestro?.email,
            phone: maestro?.phone || maestro?.whatsapp,
            whatsapp: maestro?.whatsapp || maestro?.phone,
            clases_incompletas: []
          })
        }

        incompleteTeachers.get(maestroKey).clases_incompletas.push({
          grupo: session.grupo_nombre,
          fecha: new Date(session.fecha_sesion).toLocaleDateString('es-ES'),
          horario: session.hora_inicio || 'Sin especificar'
        })
      }
    }

    const incomplete = Array.from(incompleteTeachers.values())

    if (incomplete.length === 0) {
      console.log('✅ Todos los maestros completaron la asistencia de la semana anterior.')
      return { incomplete: [], message: 'Todas las asistencias completas' }
    }

    console.log(`\n⚠️  ${incomplete.length} maestro(s) con asistencia incompleta:\n`)
    incomplete.forEach(t => {
      console.log(`📌 ${t.nombre_completo}`)
      t.clases_incompletas.forEach(c => {
        console.log(`   - ${c.grupo} (${c.fecha} a las ${c.horario})`)
      })
      console.log()
    })

    return { incomplete, lastWeek: { start: start.toLocaleDateString('es-ES'), end: end.toLocaleDateString('es-ES') } }

  } catch (err) {
    console.error('💥 Error:', err.message)
    process.exit(1)
  }
}

// Ejecutar y retornar JSON
checkIncompleteAttendance().then(result => {
  console.log('\n' + JSON.stringify(result, null, 2))
  process.exit(0)
})

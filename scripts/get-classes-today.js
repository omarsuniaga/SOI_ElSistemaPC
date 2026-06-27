/**
 * get-classes-today.js — Versión corregida
 * Uso: node get-classes-today.js
 * 
 * Requiere variables de entorno (cargar desde .env.local):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const dayNames = {
  0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
  4: 'jueves', 5: 'viernes', 6: 'sabado'
}
const dayOfWeek = dayNames[new Date().getDay()]
const today = new Date().toISOString().split('T')[0]

console.log(`=== RECORDATORIOS DE CLASES — ${today} (${dayOfWeek.toUpperCase()}) ===\n`)

// Obtener clase_horarios de hoy con joins correctos
// Schema real: clase_horarios tiene maestro_id (no maestro_principal_id)
// maestro está en tabla maestros, no embebido en clase
const { data: horarios, error } = await supabase
  .from('clase_horarios')
  .select(`
    id, dia, hora_inicio, hora_fin,
    clase:clase_id (id, nombre, instrumento, tipo_clase, activo),
    salon:salon_id (id, nombre),
    maestro:maestro_id (id, nombre_completo)
  `)
  .eq('dia', dayOfWeek)
  .order('hora_inicio')

if (error) {
  console.error('Error al obtener horarios:', JSON.stringify(error))
  process.exit(1)
}

if (!horarios || horarios.length === 0) {
  console.log('No hay clases programadas para hoy.\n')
  process.exit(0)
}

// Obtener alumnos matriculados usando la tabla correcta: alumnos_clases
const claseIds = [...new Set(horarios.map(h => h.clase_id))]
const { data: matriculas } = await supabase
  .from('alumnos_clases')
  .select(`
    id, clase_id, estado,
    alumno:alumno_id (id, nombre_completo, tlf_whatsapp,
      representante_id,
      representantes_whpp:representante_id (nombre_completo, telefono)
    )
  `)
  .in('clase_id', claseIds)
  .eq('estado', 'activa')

console.log(`Clases programadas para hoy (${dayOfWeek}): ${horarios.length}\n`)

const reminders = []

for (const h of horarios) {
  const cls = h.clase
  if (!cls || !cls.activo) continue

  const maestro = h.maestro?.nombre_completo || cls.maestro_principal?.nombre_completo || 'Sin asignar'
  const salon = h.salon?.nombre || 'Por definir'
  const horaInicio = h.hora_inicio?.slice(0, 5)
  const horaFin = h.hora_fin?.slice(0, 5)

  // Alumnos de esta clase
  const alumnos = (matriculas || [])
    .filter(m => m.clase_id === cls.id && m.alumno)
    .map(m => {
      // Intentar obtener teléfono del alumno o del representante
      let telefono = m.alumno.tlf_whatsapp
      let representanteNombre = null

      if (!telefono && m.alumno.representantes_whpp) {
        telefono = m.alumno.representantes_whpp.telefono
        representanteNombre = m.alumno.representantes_whpp.nombre_completo
      }

      return {
        id: m.alumno.id,
        nombre: m.alumno.nombre_completo,
        telefono: telefono,
        representante: representanteNombre
      }
    })

  console.log(`🎵 ${cls.nombre}`)
  console.log(`   Instrumento: ${cls.instrumento || 'N/A'}`)
  console.log(`   Maestro: ${maestro}`)
  console.log(`   Horario: ${horaInicio} - ${horaFin}`)
  console.log(`   Salon: ${salon}`)
  console.log(`   Alumnos activos: ${alumnos.length}`)

  // Redactar mensaje de recordatorio
  const mensaje = `🎻 *¡Hola!* Te recuerdo que hoy ${dayOfWeek} ${today} tienes clase de *${cls.instrumento || cls.nombre}*.\n\n📅 *Horario:* ${horaInicio} - ${horaFin}\n📍 *Salón:* ${salon}\n👨‍🏫 *Maestro:* ${maestro}\n\n¡Nos vemos pronto! 🎶`

  // Solo alumnos con representante y teléfono válido
  const conTelefono = alumnos.filter(a => a.telefono && a.telefono.length >= 10)

  if (conTelefono.length > 0) {
    reminders.push({
      clase: cls.nombre,
      instrumento: cls.instrumento,
      hora: `${horaInicio} - ${horaFin}`,
      salon,
      maestro,
      mensaje,
      destinatarios: conTelefono
    })
    console.log(`   📱 Con teléfono válido: ${conTelefono.length}`)
  }

  console.log('')
}

// Resumen de recordatorios
console.log('=== RESUMEN DE RECORDATORIOS ===')
console.log(`Clases con alumnos: ${reminders.length}`)
let totalDest = 0
for (const r of reminders) {
  console.log(`\n📢 ${r.clase} (${r.hora})`)
  console.log(`   Mensaje:\n   ${r.mensaje}`)
  console.log(`   Destinatarios (${r.destinatarios.length}):`)
  for (const d of r.destinatarios) {
    console.log(`   - ${d.nombre} → ${d.telefono} (rep: ${d.representante})`)
    totalDest++
  }
}

console.log(`\n✅ Total: ${reminders.length} clases, ${totalDest} mensajes a enviar`)

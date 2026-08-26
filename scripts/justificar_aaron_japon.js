/**
 * scripts/justificar_aaron_japon.js
 * Actualiza las asistencias de Aaron Di Lorenzo al estado 'justificado'
 * con motivo "De viaje tocando en Japón en representación del país."
 * para el período del 10 al 27 de agosto de 2026.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaG1kdm15ZXlzd3VudXJjeW93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMzMjcyMSwiZXhwIjoyMDkyOTA4NzIxfQ.c3gZxUIblr8droaOVgw-8S-9vG7lO6WaHhLQQuTP484'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const AARON_ID = '11a7b718-971a-4e1e-8fa8-7755bd257fb7'
const MOTIVO = 'De viaje tocando en Japón en representación del país.'
const FECHA_INICIO = '2026-08-10'
const FECHA_FIN = '2026-08-27'

async function main() {
  console.log('🚀 Iniciando justificación de asistencias para Aaron Di Lorenzo...')
  console.log(`📅 Rango: ${FECHA_INICIO} al ${FECHA_FIN}`)
  console.log(`📝 Motivo: "${MOTIVO}"\n`)

  // 1. Actualizar registros existentes en asistencias
  const { data: updatedAsist, error: errUpAsist } = await supabase
    .from('asistencias')
    .update({
      estado: 'justificado',
      justificacion_texto: MOTIVO,
      observaciones: MOTIVO,
      updated_at: new Date().toISOString()
    })
    .eq('alumno_id', AARON_ID)
    .gte('fecha', FECHA_INICIO)
    .lte('fecha', FECHA_FIN)
    .select('id, fecha, clase_id, sesion_clase_id, estado')

  if (errUpAsist) {
    console.error('❌ Error actualizando asistencias:', errUpAsist)
  } else {
    console.log(`✅ ${updatedAsist.length} registros de asistencia actualizados a 'justificado':`)
    updatedAsist.forEach(a => console.log(`   - Fecha ${a.fecha} (Clase: ${a.clase_id})`))
  }

  // 2. Registrar en la tabla de justificaciones
  const { data: asistenciasAaron } = await supabase
    .from('asistencias')
    .select('id, fecha, clase_id, sesion_clase_id')
    .eq('alumno_id', AARON_ID)
    .gte('fecha', FECHA_INICIO)
    .lte('fecha', FECHA_FIN)

  for (const asis of asistenciasAaron || []) {
    // Verificar si ya existe justificación
    const { data: existingJust } = await supabase
      .from('justificaciones')
      .select('id')
      .eq('alumno_id', AARON_ID)
      .eq('fecha', asis.fecha)
      .maybeSingle()

    if (existingJust) {
      await supabase
        .from('justificaciones')
        .update({
          motivo: MOTIVO,
          descripcion: MOTIVO,
          clase_id: asis.clase_id,
          sesion_id: asis.sesion_clase_id || null,
        })
        .eq('id', existingJust.id)
    } else {
      await supabase
        .from('justificaciones')
        .insert({
          alumno_id: AARON_ID,
          clase_id: asis.clase_id,
          sesion_id: asis.sesion_clase_id || null,
          fecha: asis.fecha,
          motivo: MOTIVO,
          descripcion: MOTIVO,
        })
    }
  }

  console.log('\n🎉 Justificaciones procesadas y sincronizadas con éxito en la base de datos.')
}

main().catch(console.error)

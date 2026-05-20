import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Copiado de clasesApi.js para simular
async function verificarSolapamiento({ salonId, maestroId, dia, horaInicio, horaFin, excludeClaseId = null }) {
  if (!dia || !horaInicio || !horaFin) return null

  const start = horaInicio.slice(0, 5)
  const end = horaFin.slice(0, 5)

  console.log(`verificarSolapamiento: start="${start}", end="${end}", dia="${dia}", salonId="${salonId}", maestroId="${maestroId}"`)

  // 1. Verificar solapamiento por SALÓN
  if (salonId) {
    const { data: conflictosSalon, error: errorSalon } = await supabase
      .from('clase_horarios')
      .select('*, clases(nombre)')
      .eq('salon_id', salonId)
      .eq('dia', dia)

    if (errorSalon) {
      console.error('Error querying salon conflicts:', errorSalon)
      return null
    }

    if (conflictosSalon) {
      for (const h of conflictosSalon) {
        if (excludeClaseId && h.clase_id === excludeClaseId) continue
        const hStart = h.hora_inicio.slice(0, 5)
        const hEnd = h.hora_fin.slice(0, 5)
        console.log(`Checking salon: hStart="${hStart}", hEnd="${hEnd}", class="${h.clases?.nombre}"`)
        if (start < hEnd && hStart < end) {
          console.log(`CONFLICT FOUND IN SALON! ${start} < ${hEnd} and ${hStart} < ${end}`)
          return {
            tipo: 'salón',
            clase_nombre: h.clases?.nombre || 'Otra clase',
            detalle: `El salón ya está ocupado por "${h.clases?.nombre}"`,
            horario: `${h.dia} de ${hStart} a ${hEnd}`
          }
        }
      }
    }
  }

  // 2. Verificar solapamiento por MAESTRO
  if (maestroId) {
    const { data: conflictosMaestro, error: errorMaestro } = await supabase
      .from('clase_horarios')
      .select('*, clases!inner(nombre, maestro_principal_id)')
      .eq('clases.maestro_principal_id', maestroId)
      .eq('dia', dia)

    if (errorMaestro) {
      console.error('Error querying maestro conflicts:', errorMaestro)
      return null
    }

    if (conflictosMaestro) {
      for (const h of conflictosMaestro) {
        if (excludeClaseId && h.clase_id === excludeClaseId) continue
        const hStart = h.hora_inicio.slice(0, 5)
        const hEnd = h.hora_fin.slice(0, 5)
        console.log(`Checking maestro: hStart="${hStart}", hEnd="${hEnd}", class="${h.clases?.nombre}"`)
        if (start < hEnd && hStart < end) {
          console.log(`CONFLICT FOUND FOR MAESTRO! ${start} < ${hEnd} and ${hStart} < ${end}`)
          return {
            tipo: 'maestro',
            clase_nombre: h.clases?.nombre || 'Otra clase',
            detalle: `El maestro ya tiene otra clase asignada ("${h.clases?.nombre}")`,
            horario: `${h.dia} de ${hStart} a ${hEnd}`
          }
        }
      }
    }
  }

  return null
}

async function test() {
  // Vamos a buscar un salon e id de maestro real de la base de datos que termine a las 17:00:00
  const { data: realHorarios } = await supabase
    .from('clase_horarios')
    .select('*, clases(*)')
    .eq('dia', 'miércoles')
    .eq('hora_fin', '17:00:00')
    .limit(1)

  if (!realHorarios || realHorarios.length === 0) {
    console.log('No miércoles schedules found to run the simulator.')
    return
  }

  const existingSchedule = realHorarios[0]
  const salonId = existingSchedule.salon_id
  const maestroId = existingSchedule.clases?.maestro_principal_id

  console.log(`Simulating overlap check with:`)
  console.log(`Existing class: "${existingSchedule.clases?.nombre}" on Wednesday, from "${existingSchedule.hora_inicio}" to "${existingSchedule.hora_fin}"`)
  console.log(`New class: Wednesday, from "17:00" to "18:00"`)

  const res = await verificarSolapamiento({
    salonId,
    maestroId,
    dia: 'miércoles',
    horaInicio: '17:00',
    horaFin: '18:00'
  })

  console.log('Simulation result:', res)
}

test()

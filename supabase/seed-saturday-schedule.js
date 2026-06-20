import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

async function seed() {
  console.log('🌱 Seeding Saturday, June 20, 2026 schedule...')

  // 0. Clean up invalid classes/teachers/schedules from the previous run
  console.log('🧹 Cleaning up previous test records...')
  const { data: badClasses } = await supabase
    .from('clases')
    .select('id')
    .or('maestro_principal_id.is.null')
  
  if (badClasses && badClasses.length > 0) {
    const badIds = badClasses.map(c => c.id)
    await supabase.from('clase_horarios').delete().in('clase_id', badIds)
    await supabase.from('clases').delete().in('id', badIds)
    console.log(`Removed ${badIds.length} invalid classes from failed run.`)
  }

  // 1. Ensure Teachers exist
  const teachersToEnsure = [
    { nombre_completo: 'Camilo Lico', especialidad: 'Violín', correo: 'camilo.lico@musica.org' },
    { nombre_completo: 'Isabella Minozzi', especialidad: 'Flauta/Madera', correo: 'isabella.minozzi@musica.org' },
    { nombre_completo: 'Lina cavanzo', especialidad: 'Violín', correo: 'lina.cavanzo@musica.org' },
    { nombre_completo: 'Hellenne Alvarez', especialidad: 'Piano', correo: 'hellenne.alvarez@musica.org' },
    { nombre_completo: 'Kalani Paredes', especialidad: 'Metales', correo: 'kalani.paredes@musica.org' },
    { nombre_completo: 'Manuel Marcano', especialidad: 'Coro', correo: 'manuel.marcano@musica.org' }
  ]

  const teacherMap = {}
  for (const t of teachersToEnsure) {
    const { data: existing } = await supabase
      .from('maestros')
      .select('id, nombre_completo')
      .eq('nombre_completo', t.nombre_completo)
      .maybeSingle()

    if (existing) {
      teacherMap[t.nombre_completo] = existing.id
      console.log(`👤 Teacher already exists: ${t.nombre_completo} (${existing.id})`)
    } else {
      const { data: inserted, error } = await supabase
        .from('maestros')
        .insert({ nombre_completo: t.nombre_completo, especialidad: t.especialidad, correo: t.correo })
        .select()
        .single()
      
      if (error) {
        console.error(`❌ Error inserting teacher ${t.nombre_completo}:`, error.message)
      } else {
        teacherMap[t.nombre_completo] = inserted.id
        console.log(`👤 Created teacher: ${t.nombre_completo} (${inserted.id})`)
      }
    }
  }

  // 2. Ensure Classrooms (Salones) exist
  const salonsToEnsure = [
    { nombre: 'Salón Vivaldi' },
    { nombre: 'Salón Martínez' },
    { nombre: 'Salón Bustamante' },
    { nombre: 'Jardín Juan Luis Guerra' },
    { nombre: 'Salón Sin Nombre' }
  ]

  const salonMap = {}
  for (const s of salonsToEnsure) {
    const { data: existing } = await supabase
      .from('salones')
      .select('id, nombre')
      .eq('nombre', s.nombre)
      .maybeSingle()

    if (existing) {
      salonMap[s.nombre] = existing.id
      console.log(`🏫 Classroom already exists: ${s.nombre} (${existing.id})`)
    } else {
      const { data: inserted, error } = await supabase
        .from('salones')
        .insert({ nombre: s.nombre })
        .select()
        .single()
      
      if (error) {
        console.error(`❌ Error inserting classroom ${s.nombre}:`, error.message)
      } else {
        salonMap[s.nombre] = inserted.id
        console.log(`🏫 Created classroom: ${s.nombre} (${inserted.id})`)
      }
    }
  }

  // 3. Clear existing Saturday schedules to make it clean
  console.log('🧹 Clearing existing Saturday schedules...')
  const { error: clearErr } = await supabase
    .from('clase_horarios')
    .delete()
    .eq('dia', 'sábado')
  if (clearErr) {
    console.error('❌ Error clearing schedules:', clearErr.message)
  }

  // 4. Create Classes
  const classesToEnsure = [
    {
      nombre: 'Clases de Violín',
      estado: 'activa',
      maestro_principal_id: teacherMap['Camilo Lico'],
      instrumento: 'Violín',
      tipo_clase: 'grupal'
    },
    {
      nombre: 'Seccional de Madera',
      estado: 'activa',
      maestro_principal_id: teacherMap['Isabella Minozzi'],
      instrumento: 'Madera',
      tipo_clase: 'grupal'
    },
    {
      nombre: 'Seccional de Metales',
      estado: 'activa',
      maestro_principal_id: teacherMap['Kalani Paredes'],
      instrumento: 'Metales',
      tipo_clase: 'grupal'
    },
    {
      nombre: 'Seccional de Cuerdas',
      estado: 'activa',
      maestro_principal_id: teacherMap['Kalani Paredes'],
      instrumento: 'Cuerdas',
      tipo_clase: 'grupal'
    },
    {
      nombre: 'Clases de Violín',
      estado: 'suspendida',
      maestro_principal_id: teacherMap['Lina cavanzo'],
      instrumento: 'Violín',
      tipo_clase: 'grupal'
    },
    {
      nombre: 'Taller de Piano',
      estado: 'activa',
      maestro_principal_id: teacherMap['Hellenne Alvarez'],
      instrumento: 'Piano',
      tipo_clase: 'grupal'
    },
    {
      nombre: 'Coro Sinfónico',
      estado: 'activa',
      maestro_principal_id: teacherMap['Manuel Marcano'],
      instrumento: 'Coro',
      tipo_clase: 'grupal'
    }
  ]

  const classMap = {}
  for (const c of classesToEnsure) {
    if (!c.maestro_principal_id) {
      console.error(`⚠️ Skipping class ${c.nombre} due to missing teacher ID`)
      continue
    }

    const { data: existing } = await supabase
      .from('clases')
      .select('id, nombre')
      .eq('nombre', c.nombre)
      .eq('maestro_principal_id', c.maestro_principal_id)
      .maybeSingle()

    if (existing) {
      classMap[`${c.nombre}_${c.maestro_principal_id}`] = existing.id
      // Update its status just in case (e.g. Lina's class needs to be 'suspendida')
      await supabase.from('clases').update({ estado: c.estado }).eq('id', existing.id)
      console.log(`🎵 Class already exists: ${c.nombre} with teacher ID ${c.maestro_principal_id} (${existing.id})`)
    } else {
      const { data: inserted, error } = await supabase
        .from('clases')
        .insert(c)
        .select()
        .single()
      
      if (error) {
        console.error(`❌ Error inserting class ${c.nombre}:`, error.message)
      } else {
        classMap[`${c.nombre}_${c.maestro_principal_id}`] = inserted.id
        console.log(`🎵 Created class: ${c.nombre} with teacher ID ${c.maestro_principal_id} (${inserted.id})`)
      }
    }
  }

  // 5. Create Schedules (Clase Horarios) for Saturday
  const schedulesToCreate = [
    {
      clase_id: classMap[`Clases de Violín_${teacherMap['Camilo Lico']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '23:00:00',
      salon_id: salonMap['Salón Vivaldi']
    },
    {
      clase_id: classMap[`Seccional de Madera_${teacherMap['Isabella Minozzi']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '11:00:00',
      salon_id: salonMap['Salón Martínez']
    },
    {
      clase_id: classMap[`Seccional de Metales_${teacherMap['Kalani Paredes']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '11:00:00',
      salon_id: salonMap['Salón Bustamante']
    },
    {
      clase_id: classMap[`Seccional de Cuerdas_${teacherMap['Kalani Paredes']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '11:00:00',
      salon_id: salonMap['Jardín Juan Luis Guerra']
    },
    {
      clase_id: classMap[`Clases de Violín_${teacherMap['Lina cavanzo']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '11:00:00',
      salon_id: salonMap['Salón Vivaldi']
    },
    {
      clase_id: classMap[`Taller de Piano_${teacherMap['Hellenne Alvarez']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '13:00:00',
      salon_id: salonMap['Salón Sin Nombre']
    },
    {
      clase_id: classMap[`Coro Sinfónico_${teacherMap['Manuel Marcano']}`],
      dia: 'sábado',
      hora_inicio: '09:00:00',
      hora_fin: '11:00:00',
      salon_id: salonMap['Salón Sin Nombre']
    }
  ]

  for (const s of schedulesToCreate) {
    if (!s.clase_id) {
      console.error(`⚠️ Skipping schedule insert due to missing class_id for ${JSON.stringify(s)}`)
      continue
    }
    const { error } = await supabase.from('clase_horarios').insert(s)
    if (error) {
      console.error(`❌ Error inserting schedule for class ID ${s.clase_id}:`, error.message)
    } else {
      console.log(`📅 Created Saturday schedule for class ID ${s.clase_id}`)
    }
  }

  // 6. Ensure Teacher Absence for Manuel Marcano on June 20, 2026
  const dateStr = '2026-06-20'
  console.log(`🧹 Clearing any existing absence for Manuel Marcano on ${dateStr}...`)
  await supabase
    .from('solicitudes_ausencia')
    .delete()
    .eq('maestro_id', teacherMap['Manuel Marcano'])
    .eq('fecha_ausencia', dateStr)

  const { data: insertedAbsence, error: absError } = await supabase
    .from('solicitudes_ausencia')
    .insert({
      maestro_id: teacherMap['Manuel Marcano'],
      fecha_ausencia: dateStr,
      estado: 'aprobada',
      motivo: 'Manuel está enfermo',
      suplente_id: null
    })
    .select()
    .single()

  if (absError) {
    console.error('❌ Error inserting teacher absence:', absError.message)
  } else {
    console.log(`🛌 Created approved absence for Manuel Marcano on ${dateStr} (motivo: Manuel está enfermo)`)
  }

  console.log('✅ Seeding complete!')
}

seed()

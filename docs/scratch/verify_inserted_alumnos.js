import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function verify() {
  console.log('=== VERIFICANDO ALUMNOS INSERTADOS EN SUPABASE ===')
  const { data, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, instrumento_principal, fecha_nacimiento, activo')

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Total alumnos encontrados en DB: ${data.length}`)
    data.forEach((a, i) => {
      console.log(` ${i + 1}. [${a.id}] ${a.nombre_completo} (${a.instrumento_principal})`)
    })
  }

  console.log('\n=== VERIFICANDO INSCRIPCIONES EN CLASES ===')
  const { data: insc, error: iErr } = await supabase
    .from('alumnos_clases')
    .select('alumno_id, clase_id, clases(nombre)')

  if (iErr) {
    console.error('Error inscripciones:', iErr.message)
  } else {
    console.log(`Total inscripciones en DB: ${insc.length}`)
    insc.forEach(item => {
      console.log(` - Alumno [${item.alumno_id}] -> Clase: ${item.clases?.nombre}`)
    })
  }
}

verify().catch(console.error)

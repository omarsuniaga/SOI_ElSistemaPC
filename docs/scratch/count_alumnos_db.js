import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function countAlumnos() {
  console.log('=== CONTANDO ALUMNOS EN SUPABASE ===')
  const { data, count, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Total de alumnos en Supabase: ${count}`)
    console.log(`Alumnos retornados en query simple sin range: ${data.length}`)
    console.log('Últimos 5 alumnos creados:')
    data.slice(0, 5).forEach(a => {
      console.log(` - ID: ${a.id} | Nombre: "${a.nombre_completo}" | Creado: ${a.created_at}`)
    })
  }
}

countAlumnos().catch(console.error)

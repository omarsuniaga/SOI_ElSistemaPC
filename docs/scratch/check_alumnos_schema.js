import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkAlumnosColumns() {
  console.log('=== VERIFICANDO COLUMNAS REALES DE TABLA ALUMNOS EN SUPABASE ===')

  // Probar seleccionar 1 registro sin auth para ver la estructura si PostgREST nos responde o probar RPC / metadata
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .limit(1)

  if (error) {
    console.log(`Respuesta error: [${error.code}] ${error.message}`)
  } else {
    console.log('Columnas encontradas:', Object.keys(data[0] || {}))
  }
}

checkAlumnosColumns().catch(console.error)

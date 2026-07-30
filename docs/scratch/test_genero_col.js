import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function testGenero() {
  console.log('=== PROBANDO COLUMNA GENERO EN SUPABASE ===')

  // Probar hacer update a un ID inexistente con la columna genero para ver si PostgREST se queja de la columna
  const { error } = await supabase
    .from('alumnos')
    .update({ genero: 'M' })
    .eq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.log(`❌ Error probando update con genero: [${error.code}] ${error.message}`)
  } else {
    console.log('✅ Supabase reconoce la columna genero!')
  }
}

testGenero().catch(console.error)

import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function testUpdateWithoutGenero() {
  console.log('=== PROBANDO UPDATE DE ALUMNO SIN CAMPO GENERO EN PAYLOAD ===')

  // Intentar update a un id ficticio pero con campos válidos de la BD
  const payload = {
    nombre_completo: 'Test Persona Update',
    familiar_telefono: '04121234567',
    instrumento_principal: 'Violín'
  }

  const { error } = await supabase
    .from('alumnos')
    .update(payload)
    .eq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.log(`Resultado update: [${error.code}] ${error.message}`)
  } else {
    console.log('✅ Update ejecutado perfectamente sin errores de columnas!')
  }
}

testUpdateWithoutGenero().catch(console.error)

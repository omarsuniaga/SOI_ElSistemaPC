import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function testCols() {
  console.log('=== VERIFICANDO NOMBRES DE COLUMNAS EN SUPABASE ===')

  for (const col of ['sexo', 'genero', 'gender', 'fecha_nacimiento', 'instrumento_principal', 'familiar_telefono', 'correo_representante']) {
    const { error } = await supabase
      .from('alumnos')
      .update({ [col]: null })
      .eq('id', '00000000-0000-0000-0000-000000000000')

    if (error && error.message.includes('Could not find the')) {
      console.log(`❌ Columna NO existe: "${col}"`)
    } else if (error) {
      console.log(`✅ Columna EXISTE: "${col}" (Error de RLS u otro: ${error.code})`)
    } else {
      console.log(`✅ Columna EXISTE: "${col}"`)
    }
  }
}

testCols().catch(console.error)

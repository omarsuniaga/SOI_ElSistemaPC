import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testUpdate() {
  const id = '9d78e29e-46e3-4533-ac41-b1b488f637f1'
  const datosActualizacion = {
    nombre_completo: 'Test Alumno Update',
    instrumento_principal: 'Violín',
    activo: true
  }

  console.log('Sending PATCH to /alumnos for ID:', id)
  const { data, error } = await supabase
    .from('alumnos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('❌ Update failed:', error)
  } else {
    console.log('✅ Update succeeded:', data)
  }
}

testUpdate()

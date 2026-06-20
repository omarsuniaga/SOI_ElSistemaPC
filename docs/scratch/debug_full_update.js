import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testFullUpdate() {
  const id = '9d78e29e-46e3-4533-ac41-b1b488f637f1'
  
  // This matches all keys checked by actualizarAlumno
  const datosActualizacion = {
    nombre_completo: 'Test Alumno Update Full',
    correo_representante: 'test@representante.com',
    instrumento_principal: 'Violín',
    representante_cedula: '001-0000000-1',
    activo: true,
    familiar_telefono: '8095551234',
    familiar_nombre: 'Familiar Nombre',
    familiar_parentesco: 'madre',
    contacto_emergencia_nombre: 'Emergencia Nombre',
    contacto_emergencia_telefono: '8095559999',
    contacto_emergencia_parentesco: 'tia',
    condiciones_medicas: 'Ninguna',
    alergias: 'Ninguna',
    medicamentos: 'Ninguno'
  }

  console.log('Sending full PATCH to /alumnos for ID:', id)
  const { data, error } = await supabase
    .from('alumnos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('❌ Full Update failed:', error)
  } else {
    console.log('✅ Full Update succeeded:', data)
  }
}

testFullUpdate()

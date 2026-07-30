import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkFamilia() {
  console.log('=== VERIFICANDO ESTRUCTURA DE ALUMNOS Y FAMILIAS ===')

  // 1. Probar si familias existe
  try {
    const { data, error, count } = await supabase
      .from('familias')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`❌ Tabla [familias]: Error - ${error.message} (${error.code})`)
    } else {
      console.log(`✅ Tabla [familias]: EXISTE (Filas: ${count})`)
    }
  } catch (err) {
    console.log(`❌ Tabla [familias]: Excepción - ${err.message}`)
  }

  // 2. Intentar un insert de prueba o ver error exacto
  console.log('\n--- PRUEBA DE ALUMNO CON familia_id NULL ---')
  const { data: testAlu, error: testErr } = await supabase
    .from('alumnos')
    .insert([{
      nombre_completo: 'Test Alumno Check',
      familia_id: null,
      activo: false
    }])
    .select()

  if (testErr) {
    console.log(`❌ Insert con familia_id NULL falló: [${testErr.code}] ${testErr.message}`)
  } else {
    console.log(`✅ Insert con familia_id NULL EXITOSO! ID: ${testAlu[0]?.id}`)
    // Limpiar el registro de prueba
    await supabase.from('alumnos').delete().eq('id', testAlu[0].id)
  }
}

checkFamilia().catch(console.error)

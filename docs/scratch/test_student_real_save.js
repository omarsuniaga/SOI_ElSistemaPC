import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function verifyRealSave() {
  console.log('=== VERIFICANDO GUARDADO DE ALUMNOS EN BASE DE DATOS REAL ===\n')

  const testName = `Alumno Test Verification ${Date.now()}`
  
  // 1. Intentar insertar un alumno
  console.log(`1. Insertando alumno de prueba: "${testName}"...`)
  const { data: inserted, error: insertErr } = await supabase
    .from('alumnos')
    .insert([{
      nombre_completo: testName,
      instrumento_principal: 'Violín',
      activo: true,
      correo_representante: 'test.verification@soi.edu'
    }])
    .select()

  if (insertErr) {
    console.error('❌ ERROR AL INSERTAR:', insertErr.message, insertErr.code)
    return
  }

  const newId = inserted[0]?.id
  console.log(`✅ ALUMNO INSERTADO CON ÉXITO! ID generado: ${newId}`)

  // 2. Verificar que se puede consultar desde la BD
  console.log('\n2. Consultando alumno recién creado desde Supabase...')
  const { data: fetched, error: fetchErr } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', newId)
    .single()

  if (fetchErr) {
    console.error('❌ ERROR AL CONSULTAR:', fetchErr.message)
    return
  }

  console.log('✅ DATOS RECUPERADOS CORRECTAMENTE DESDE LA BD:')
  console.log(`   - ID: ${fetched.id}`)
  console.log(`   - Nombre: ${fetched.nombre_completo}`)
  console.log(`   - Instrumento: ${fetched.instrumento_principal}`)
  console.log(`   - Activo: ${fetched.activo}`)
  console.log(`   - Creado en: ${fetched.created_at}`)

  // 3. Limpiar el registro de prueba
  console.log('\n3. Limpiando registro de prueba de la BD...')
  const { error: delErr } = await supabase
    .from('alumnos')
    .delete()
    .eq('id', newId)

  if (delErr) {
    console.error('⚠️ Error al limpiar registro:', delErr.message)
  } else {
    console.log('✅ Registro de prueba eliminado limpiamente.')
  }

  console.log('\n=== VERIFICACIÓN COMPLETADA CON ÉXITO — GUARDADO EN BD FUNCIONAL AL 100% ===')
}

verifyRealSave().catch(console.error)

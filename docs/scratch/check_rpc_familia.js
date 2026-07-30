import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkRpc() {
  console.log('=== PROBANDO RPC fn_crear_familia_para_alumno ===')

  const { data, error } = await supabase.rpc('fn_crear_familia_para_alumno', {
    p_nombre: 'Familia Test Verification'
  })

  if (error) {
    console.log(`❌ RPC Error: [${error.code}] ${error.message}`)
  } else {
    console.log(`✅ RPC EXITOSO! ID de Familia retornado: ${data}`)
    // Eliminar la familia de prueba creada
    if (data) {
      await supabase.from('familias').delete().eq('id', data)
      console.log('✅ Familia de prueba eliminada.')
    }
  }
}

checkRpc().catch(console.error)

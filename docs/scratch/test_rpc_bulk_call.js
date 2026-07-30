import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function testRpcCall() {
  console.log('=== LLAMANDO RPC fn_bulk_insert_nuevos_alumnos ===')
  const { data, error } = await supabase.rpc('fn_bulk_insert_nuevos_alumnos')
  if (error) {
    console.log(`RPC no ejecutable remotamente todavía: [${error.code}] ${error.message}`)
  } else {
    console.log('✅ RPC EJECUTADO CON ÉXITO EN SUPABASE!', data)
  }
}

testRpcCall().catch(console.error)

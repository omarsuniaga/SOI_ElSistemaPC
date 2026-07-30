import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkLedger() {
  console.log('--- AUDITORÍA DE TABLA DE MIGRACIONES (LEDGER) ---')
  
  // Intentar consultar schema_migrations
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('*')
    .order('version', { ascending: true })

  if (error) {
    console.log(`⚠️ No se pudo consultar schema_migrations vía API (esperado por RLS/schema): ${error.message}`)
  } else {
    console.log(`✅ Registros en schema_migrations (${data?.length || 0}):`)
    console.log(data)
  }
}

checkLedger().catch(console.error)

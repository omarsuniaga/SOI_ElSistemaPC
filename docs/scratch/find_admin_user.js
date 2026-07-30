import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function findMaestros() {
  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombre_completo')

  console.log('Maestros:', maestros)
}

findMaestros().catch(console.error)

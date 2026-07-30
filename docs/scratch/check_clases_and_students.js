import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkClases() {
  console.log('=== CONSULTANDO CLASES EN BASE DE DATOS ===')
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, maestro_id')

  if (error) {
    console.error('Error consultando clases:', error.message)
  } else {
    console.log(`Se encontraron ${data.length} clases:`)
    data.forEach(c => console.log(` - [${c.id}] ${c.nombre}`))
  }
}

checkClases().catch(console.error)

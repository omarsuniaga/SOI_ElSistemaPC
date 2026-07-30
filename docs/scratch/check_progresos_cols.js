import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkProgresos() {
  console.log('=== VERIFICANDO COLUMNAS DE TABLA PROGRESOS ===')

  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .limit(1)

  if (error) {
    console.log(`❌ Error consultando progresos: [${error.code}] ${error.message}`)
  } else {
    console.log(`✅ Consulta exitosa en progresos!`)
    if (data && data.length > 0) {
      console.log('Columnas disponibles:', Object.keys(data[0]))
    } else {
      console.log('Tabla vacía (0 filas)')
    }
  }
}

checkProgresos().catch(console.error)

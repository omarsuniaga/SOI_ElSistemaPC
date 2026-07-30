import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function checkNullable() {
  console.log('=== VERIFICANDO COLUMNA familia_id EN ALUMNOS ===')

  // Intentar consultar una fila para ver los nombres de columnas
  const { data, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, familia_id')
    .limit(1)

  if (error) {
    console.log(`⚠️ Error consultando alumnos: ${error.message}`)
  } else {
    console.log(`✅ Consulta exitosa en alumnos. Filas obtenidas: ${data?.length}`)
    if (data?.length > 0) {
      console.log('Ejemplo de registro:', data[0])
    }
  }
}

checkNullable().catch(console.error)

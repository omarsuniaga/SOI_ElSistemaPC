import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

// Obtener clases de hoy
const today = new Date().toISOString().split('T')[0]
const { data: clases, error } = await supabase
  .from('clases')
  .select(`
    id, nombre, fecha, hora_inicio, hora_fin,
    maestros:maestro_id (id, nombre, apellido),
    instrumentos:instrumento_id (id, nombre)
  `)
  .eq('fecha', today)
  .order('hora_inicio')

if (error) {
  console.error('Error:', error)
  process.exit(1)
}

console.log(`=== RECORDATORIOS DE CLASES — ${today} ===`)
console.log(`Total de clases hoy: ${clases.length}\n`)

for (const cls of clases) {
  const maestro = cls.maestros ? `${cls.maestros.nombre} ${cls.maestros.apellido}` : 'Sin maestro'
  const instrumento = cls.instrumentos?.nombre || 'N/A'
  console.log(`🎵 ${cls.nombre}`)
  console.log(`   Instrumento: ${instrumento}`)
  console.log(`   Maestro: ${maestro}`)
  console.log(`   Horario: ${cls.hora_inicio?.slice(0,5)} - ${cls.hora_fin?.slice(0,5)}`)
  console.log('')
}

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Buscar tablas relacionadas con horarios/clases
const { data: tables } = await supabase.from('clases').select('*').limit(1)
console.log('clases columns:', Object.keys(tables?.[0] || {}))

// Buscar schedule o horario
const tableNames = ['horarios', 'schedules', 'clase_horarios', 'programaciones', 'agenda']
for (const name of tableNames) {
  const { data, error } = await supabase.from(name).select('*').limit(1)
  if (!error && data) {
    console.log(`\n${name}:`, Object.keys(data[0] || {}))
  }
}

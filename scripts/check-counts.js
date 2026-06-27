import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Contar todas las tablas para ver qué tiene datos
const tables = ['matriculas', 'alumnos', 'representantes', 'clases', 'maestros', 'clase_horarios']
for (const t of tables) {
  const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
  console.log(`${t}: count=${count}, error=${JSON.stringify(error)}`)
}

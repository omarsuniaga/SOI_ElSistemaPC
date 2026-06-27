import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Listar tablas disponibles
const { data: tables, error } = await supabase.rpc('exec_sql', { query: `
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name
` })
console.log('Tables error:', JSON.stringify(error))
console.log('Tables:', JSON.stringify(tables, null, 2)?.slice(0, 3000))

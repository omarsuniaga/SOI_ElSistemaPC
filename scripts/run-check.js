import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan credenciales')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
const today = new Date().toISOString().split('T')[0]

// Primero ver estructura de la tabla clases
const { data: sample, error: e1 } = await supabase.from('clases').select('*').limit(2)
console.log('Schema check:', JSON.stringify(e1, null, 2))
console.log('Sample:', JSON.stringify(sample, null, 2)?.slice(0, 2000))

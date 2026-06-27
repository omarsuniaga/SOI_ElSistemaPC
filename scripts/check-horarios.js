import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Ver todos los días en clase_horarios
const { data: allHorarios } = await supabase
  .from('clase_horarios')
  .select('dia, hora_inicio, hora_fin, clase_id')

console.log('Todos los horarios:', JSON.stringify(allHorarios, null, 2))
console.log('\nDías únicos:', [...new Set((allHorarios||[]).map(h=>h.dia))])
console.log('Total rows:', allHorarios?.length)

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '../../.env.local' })
dotenv.config({ path: '../../.env' })

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('service_role key presente:', Boolean(key))
console.log('webhook secret presente:', Boolean(process.env.WHATSAPP_WEBHOOK_SECRET))

if (!url || !key) throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorios')
const supabase = createClient(url, key, { auth: { persistSession: false } })

supabase.rpc('fn_whatsapp_reclamar_pendientes', { p_limite: 1 }).then((result) => {
  if (result.error) console.log('RPC fallo:', result.error.message)
  else console.log('RPC funciono, mensajes reclamados:', result.data ? result.data.length : 0)
})

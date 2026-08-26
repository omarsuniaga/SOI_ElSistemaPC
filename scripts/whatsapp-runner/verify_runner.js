import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '../../.env.local' })
dotenv.config({ path: '../../.env' })

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('service_role key presente:', Boolean(key), key ? key.slice(0,8)+'...' : '(vacia)')
console.log('webhook secret presente:', Boolean(process.env.WHATSAPP_WEBHOOK_SECRET))

const supabase = createClient(url, key, { auth: { persistSession: false } })

supabase.rpc('fn_whatsapp_reclamar_pendientes', { p_limite: 1 }).then((result) => {
  if (result.error) console.log('RPC fallo:', result.error.message)
  else console.log('RPC funciono, mensajes reclamados:', result.data ? result.data.length : 0)
})

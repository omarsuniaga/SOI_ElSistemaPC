import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Debug: ver estructura de matriculas
const { data: mSample } = await supabase.from('matriculas').select('*').limit(3)
console.log('matriculas columns:', Object.keys(mSample?.[0] || {}))

// Buscar una clase específica
const claseId = '0b2b9c63-e9ad-4a26-bbfe-d91af14e9efd' // Ensayo General - 2
const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single()
console.log('\nClase:', JSON.stringify(clase, null, 2))

// Matriculas por clase
const { data: mat } = await supabase.from('matriculas').select('*').eq('clase_id', claseId)
console.log('\nMatriculas para clase:', JSON.stringify(mat, null, 2))

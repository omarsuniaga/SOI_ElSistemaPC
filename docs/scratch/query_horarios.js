import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Querying current clase_horarios in database...')
  const { data, error } = await supabase
    .from('clase_horarios')
    .select('*, clases(nombre)')
    .limit(50)

  if (error) {
    console.error('Error querying clase_horarios:', error)
    return
  }

  console.log('Total schedules:', data.length)
  data.forEach(h => {
    console.log(`ID: ${h.id}, Class: "${h.clases?.nombre}", Day: "${h.dia}", Start: "${h.hora_inicio}", End: "${h.hora_fin}"`)
  })
}

test()

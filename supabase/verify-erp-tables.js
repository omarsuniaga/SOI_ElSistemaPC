import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkTables() {
  const tables = ['pagos_alumnos', 'inventario_activos', 'comodatos_activos', 'hermes_inbox']
  console.log('🔍 Checking database tables...')
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
        
      if (error) {
        console.log(`❌ Table "${table}": error ->`, error.message)
      } else {
        console.log(`✅ Table "${table}": exists (query successful)`)
      }
    } catch (err) {
      console.log(`❌ Table "${table}": exception ->`, err.message)
    }
  }
  
  // Also check the column exento_mensualidad on alumnos
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('exento_mensualidad')
      .limit(1)
      
    if (error) {
      console.log(`❌ Column "alumnos.exento_mensualidad": error ->`, error.message)
    } else {
      console.log(`✅ Column "alumnos.exento_mensualidad": exists`)
    }
  } catch (err) {
    console.log(`❌ Column "alumnos.exento_mensualidad": exception ->`, err.message)
  }
}

checkTables()

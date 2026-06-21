import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const tables = ['alumnos', 'maestros', 'clases', 'salones', 'clase_horarios', 'solicitudes_ausencia']
  const schema = {}

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.error(`Error fetching table ${table}:`, error.message)
    } else if (data && data.length > 0) {
      schema[table] = Object.keys(data[0])
    } else {
      schema[table] = []
      console.log(`Table ${table} is empty.`)
    }
  }

  console.log('SCHEMA_JSON_START')
  console.log(JSON.stringify(schema, null, 2))
  console.log('SCHEMA_JSON_END')
}

run()

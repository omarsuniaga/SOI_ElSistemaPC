import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(URL, KEY)

async function test() {
  console.log('Testing RPCs to execute SQL or inspect functions...')
  
  // Try common exec sql RPCs
  const rpcs = ['exec_sql', 'execute_sql', 'run_sql', 'exec', 'sql']
  for (const rpc of rpcs) {
    try {
      const { data, error } = await supabase.rpc(rpc, { sql: 'SELECT 1 as val' })
      if (!error) {
        console.log(`✅ RPC ${rpc} works! Result:`, data)
        return
      } else {
        console.log(`❌ RPC ${rpc} failed:`, error.message)
      }
    } catch (e) {
      console.log(`❌ RPC ${rpc} threw error:`, e.message)
    }
  }

  // Check if we can query pg_proc or pg_namespace through some views or get_table_list
  console.log('\nTrying get_table_list...')
  try {
    const { data, error } = await supabase.rpc('get_table_list')
    console.log('get_table_list result:', { data, error })
  } catch (e) {
    console.error('get_table_list error:', e.message)
  }
}

test()

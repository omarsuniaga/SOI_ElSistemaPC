// Run migration SQL directly against Supabase using service_role key
// Usage: node scripts/run-migration.js <path-to-sql-file>
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sqlPath = process.argv[2]
if (!sqlPath) {
  console.error('Usage: node scripts/run-migration.js <path-to-sql-file>')
  process.exit(1)
}

const sql = readFileSync(resolve(sqlPath), 'utf-8')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

async function main() {
  console.log('Running migration...')
  const { data, error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    // If exec_sql RPC doesn't exist, try direct query with REST
    console.log('exec_sql RPC not available, trying REST endpoint...')

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql }),
    })

    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${await response.text()}`)
      process.exit(1)
    }

    console.log('Migration completed via REST')
    return
  }

  console.log('Migration completed:', data)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})

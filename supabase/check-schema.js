#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

;(async () => {
  try {
    console.log('🔍 Checking database schema...\n')

    // List all tables in the public schema
    const { data, error } = await supabase.rpc('get_table_list')

    if (error && error.code !== 'PGRST116') {
      // Try alternative method
      console.log('📋 Checking with direct query...')

      // Try to query information_schema directly
      const { data: tables, error: tablesError } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public')

      if (tablesError) {
        console.log('Cannot access information_schema directly with anon key')
        console.log('\n📚 Checking key tables...')

        // Check for key tables
        const tablesToCheck = ['routes', 'route_versions', 'levels', 'nodes', 'indicators', 'academic_plans', 'student_level_progress', 'student_node_progress', 'maestros', 'alumnos']

        for (const table of tablesToCheck) {
          const { count, error: tableError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

          if (tableError) {
            console.log(`  ❌ ${table}: ${tableError.message}`)
          } else {
            console.log(`  ✅ ${table}: ${count} rows`)
          }
        }
        process.exit(0)
      }
    }

    console.log('📋 Tables found:')
    if (data && data.length > 0) {
      data.forEach(row => {
        console.log(`  - ${row.table_name}`)
      })
    }

    process.exit(0)
  } catch (err) {
    console.error('💥 Fatal error:', err.message)
    process.exit(1)
  }
})()

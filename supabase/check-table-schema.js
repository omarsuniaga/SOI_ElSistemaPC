#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

;(async () => {
  try {
    console.log('🔍 Checking route_versions schema...\n')

    // Try to insert a test row to see what columns are required
    const { error: insertError, data } = await supabase
      .from('route_versions')
      .insert({
        route_id: '00000000-0000-0000-0000-000000000000',
        version: 1,
        status: 'published',
      })
      .select()

    if (insertError) {
      console.log('❌ Insert error (expected):', insertError.message)
      console.log('\nLikely because:')
      console.log('- route_id references a non-existent route')
      console.log('- OR there are NOT NULL constraints on required columns\n')
    }

    // Now let's check the actual table structure via information_schema
    console.log('Trying to get table info...\n')

    // Query the information_schema
    const { data: columns, error: schemaError } = await supabase.rpc('get_columns', {
      table_name: 'route_versions'
    }).catch(() => null)

    if (schemaError || !columns) {
      console.log('⚠️ Cannot query information_schema with anon key')
      console.log('Trying alternative: insert and check error messages...\n')

      // Try with minimal fields
      const tests = [
        { route_id: '00000000-0000-0000-0000-000000000000', version: 1 },
        { route_id: '00000000-0000-0000-0000-000000000000', version: 1, status: 'draft' },
        { route_id: '00000000-0000-0000-0000-000000000000', version: 1, status: 'draft', name: 'test' },
      ]

      for (const test of tests) {
        const { error } = await supabase.from('route_versions').insert(test)
        if (error && error.message.includes('column')) {
          console.log('Test:', JSON.stringify(test))
          console.log('Error:', error.message, '\n')
        }
      }
    }

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

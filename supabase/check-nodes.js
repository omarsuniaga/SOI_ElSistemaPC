#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

;(async () => {
  try {
    console.log('🔍 Checking nodes table...')
    const { data, error, count } = await supabase
      .from('nodes')
      .select('*', { count: 'exact', head: false })

    if (error) {
      console.error('❌ Error:', error)
      process.exit(1)
    }

    console.log(`📊 Found ${count} nodes`)
    if (data && data.length > 0) {
      console.log(`\nFirst 5 nodes:`)
      data.slice(0, 5).forEach(node => {
        console.log(`  - ${node.id}: ${node.name} (type: ${node.type}, level_id: ${node.level_id})`)
      })
    }

    // Also check level types
    console.log('\n📚 Checking levels...')
    const { data: levels, error: levelsError, count: levelsCount } = await supabase
      .from('levels')
      .select('*', { count: 'exact', head: false })

    if (levelsError) {
      console.error('❌ Error:', levelsError)
      process.exit(1)
    }

    console.log(`📊 Found ${levelsCount} levels`)
    if (levels && levels.length > 0) {
      console.log(`\nFirst 5 levels:`)
      levels.slice(0, 5).forEach(level => {
        console.log(`  - ${level.id}: Nivel ${level.level_number} - ${level.name}`)
      })
    }

    process.exit(0)
  } catch (err) {
    console.error('💥 Fatal error:', err.message)
    process.exit(1)
  }
})()

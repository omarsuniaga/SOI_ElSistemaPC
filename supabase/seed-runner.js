#!/usr/bin/env node

/**
 * Seed Runner: Node.js runner for seed-indicators.js
 * Usage: node supabase/seed-runner.js
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log(`🌍 Supabase URL: ${SUPABASE_URL}`)
console.log(`🔑 Using anon key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`)
console.log()

// Run seeding
;(async () => {
  try {
    // Dynamic import to handle CommonJS exports
    const seedModule = await import('./seed-indicators.js')
    const { seedIndicators } = seedModule

    const result = await seedIndicators(supabase)

    console.log()
    console.log('═══════════════════════════════════════')
    console.log('🎉 SEEDING COMPLETE')
    console.log('═══════════════════════════════════════')
    console.log(`✅ Indicators inserted: ${result.inserted}`)
    console.log(`📊 Total indicators prepared: ${result.total}`)

    if (result.errors.length > 0) {
      console.log(`⚠️  Failed batches: ${result.errors.length}`)
      result.errors.forEach(e => {
        console.log(`   - Batch ${e.batch}: ${e.error}`)
      })
    } else {
      console.log(`✨ No errors!`)
    }

    process.exit(result.errors.length > 0 ? 1 : 0)
  } catch (err) {
    console.error('💥 Fatal error:', err.message)
    console.error(err)
    process.exit(1)
  }
})()

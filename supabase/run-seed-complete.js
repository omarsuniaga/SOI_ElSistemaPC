#!/usr/bin/env node

/**
 * Runner for complete route seeding
 * Creates Routes → Levels → Nodes → Indicators in one go
 */

import { createClient } from '@supabase/supabase-js'
import { seedCompleteRoute } from './seed-complete-route.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log(`🌍 Supabase URL: ${SUPABASE_URL}`)
console.log()

;(async () => {
  try {
    const result = await seedCompleteRoute(supabase)
    process.exit(result.success ? 0 : 1)
  } catch (err) {
    console.error('\n💥 Fatal error:', err.message)
    process.exit(1)
  }
})()

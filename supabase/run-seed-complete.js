#!/usr/bin/env node

/**
 * Runner for complete route seeding
 * Creates Routes → Levels → Nodes → Indicators in one go
 */

import { createClient } from '@supabase/supabase-js'
import { seedCompleteRoute } from './seed-complete-route.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar .env.local explícitamente
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config() // Fallback a .env

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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

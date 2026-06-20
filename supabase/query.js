#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY not found in .env.local or .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const args = process.argv.slice(2)

// Basic CLI parsing
const params = {}
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2)
    const val = args[i+1]
    if (val && !val.startsWith('--')) {
      params[key] = val
      i++
    } else {
      params[key] = true
    }
  }
}

if (params.help || args.length === 0) {
  console.log(`
Supabase CLI Query Tool for SOI
Usage:
  node supabase/query.js --table <table_name> [options]

Options:
  --table <name>       Table to query (e.g. alumnos, maestros, asistencias)
  --select <cols>      Columns to select (default: *)
  --limit <num>        Limit results (default: 50)
  --eq <col>=<val>     Filter where col equals val
  --insert <json>      JSON string of row(s) to insert
  --update <json>      JSON string of fields to update (requires --eq to target)
  --delete             Delete row(s) (requires --eq to target)

Examples:
  node supabase/query.js --table maestros
  node supabase/query.js --table alumnos --limit 5
  node supabase/query.js --table alumnos --eq email=test@student.com --insert '{"nombre": "Test", "email": "test@student.com"}'
  `)
  process.exit(0)
}

async function run() {
  const table = params.table
  if (!table) {
    console.error('Error: --table parameter is required')
    process.exit(1)
  }

  let query = supabase.from(table)

  // 1. Actions: Insert / Update / Delete
  if (params.insert) {
    try {
      const data = JSON.parse(params.insert)
      console.log(`📥 Inserting into ${table}...`)
      const { data: result, error } = await query.insert(data).select()
      if (error) throw error
      console.log('✅ Success:\n', JSON.stringify(result, null, 2))
    } catch (e) {
      console.error('❌ Insert failed:', e.message)
    }
    process.exit(0)
  }

  if (params.update) {
    if (!params.eq) {
      console.error('Error: --update requires --eq <col>=<val> to target specific row(s)')
      process.exit(1)
    }
    try {
      const data = JSON.parse(params.update)
      const [col, val] = params.eq.split('=')
      console.log(`🔄 Updating ${table} where ${col} = ${val}...`)
      const { data: result, error } = await query.update(data).eq(col, val).select()
      if (error) throw error
      console.log('✅ Success:\n', JSON.stringify(result, null, 2))
    } catch (e) {
      console.error('❌ Update failed:', e.message)
    }
    process.exit(0)
  }

  if (params.delete) {
    if (!params.eq) {
      console.error('Error: --delete requires --eq <col>=<val> to target specific row(s)')
      process.exit(1)
    }
    try {
      const [col, val] = params.eq.split('=')
      console.log(`🗑️ Deleting from ${table} where ${col} = ${val}...`)
      const { data: result, error } = await query.delete().eq(col, val).select()
      if (error) throw error
      console.log('✅ Success:\n', JSON.stringify(result, null, 2))
    } catch (e) {
      console.error('❌ Delete failed:', e.message)
    }
    process.exit(0)
  }

  // 2. Default Action: Select/Query
  const selectCols = params.select || '*'
  let selectQuery = query.select(selectCols)

  // Apply --eq filter if present
  if (params.eq) {
    const parts = params.eq.split('=')
    if (parts.length === 2) {
      selectQuery = selectQuery.eq(parts[0], parts[1])
    }
  }

  // Apply --limit
  const limit = parseInt(params.limit || '50')
  selectQuery = selectQuery.limit(limit)

  console.log(`🔍 Querying ${table} (select: ${selectCols}, limit: ${limit})...`)
  const { data, error } = await selectQuery
  if (error) {
    console.error('❌ Query failed:', error.message)
    process.exit(1)
  }

  console.log(`\n📋 Results (${data.length} row(s) found):`)
  console.log(JSON.stringify(data, null, 2))
}

run()

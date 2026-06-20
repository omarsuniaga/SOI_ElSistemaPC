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
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY not found')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const args = process.argv.slice(2)
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

async function run() {
  const limit = parseInt(params.limit || '20')
  const search = params.search || null
  const days = parseInt(params.days || '28')

  const hasta = new Date().toISOString().split('T')[0]
  const desdeDate = new Date()
  desdeDate.setDate(desdeDate.getDate() - days)
  const desde = desdeDate.toISOString().split('T')[0]

  console.log(`🔍 Analizando seguimiento de alumnos (últimos ${days} días, límite: ${limit})...`)

  const { data, error } = await supabase.rpc('analizar_seguimiento_alumnos', {
    p_desde: desde,
    p_hasta: hasta,
    p_limit: limit,
    p_busqueda: search
  })

  if (error) {
    console.error('❌ Error ejecutando análisis:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('✅ No se encontraron alumnos en riesgo bajo los parámetros actuales.')
    process.exit(0)
  }

  console.log(`\n📋 Alumnos en Riesgo/Seguimiento (${data.length} encontrados):`)
  console.log(JSON.stringify(data, null, 2))
}

run()

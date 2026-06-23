#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

async function runTest() {
  console.log('🧪 Starting Event Trigger & Hermes integration test...')

  // 1. Find an active student who is not exempt
  const { data: students, error: studentError } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .eq('exento_mensualidad', false)
    .limit(1)

  if (studentError || !students || students.length === 0) {
    console.error('❌ Error finding test student:', studentError ? studentError.message : 'No students found')
    process.exit(1)
  }

  const student = students[0]
  console.log(`👤 Using test student: ${student.nombre_completo} (ID: ${student.id})`)

  // 2. Clear previous payments and inbox entries for this student to ensure clean state
  console.log('🧹 Cleaning up previous test data for this student...')
  await supabase.from('pagos_alumnos').delete().eq('alumno_id', student.id)
  await supabase.from('hermes_inbox').delete().eq('raw_ref', student.id)

  // 3. Insert a payment from 45 days ago to trigger the morosidad rule
  const date45DaysAgo = new Date()
  date45DaysAgo.setDate(date45DaysAgo.getDate() - 45)
  const periodStr = date45DaysAgo.toISOString().split('T')[0]

  console.log(`📥 Inserting a mock past payment for period: ${periodStr}...`)
  const { data: payment, error: paymentError } = await supabase
    .from('pagos_alumnos')
    .insert({
      alumno_id: student.id,
      monto: 600.00,
      concepto: 'mensualidad',
      periodo_mes: periodStr,
      fecha_pago: periodStr,
      metodo_pago: 'efectivo',
      referencia_transaccion: 'TEST-TRIGGER-MOCK'
    })
    .select()
    .single()

  if (paymentError) {
    console.error('❌ Error inserting mock payment:', paymentError.message)
    process.exit(1)
  }

  console.log('✅ Mock payment inserted successfully.')

  // 4. Verify trigger successfully inserted a row in hermes_inbox
  console.log('⏳ Checking if trigger inserted a row in hermes_inbox...')
  
  // Wait a small moment to let Postgres trigger complete
  await new Promise(resolve => setTimeout(resolve, 1000))

  const { data: inboxEntries, error: inboxError } = await supabase
    .from('hermes_inbox')
    .select('*')
    .eq('raw_ref', student.id)
    .eq('processed', false)

  if (inboxError) {
    console.error('❌ Error querying hermes_inbox:', inboxError.message)
    process.exit(1)
  }

  if (!inboxEntries || inboxEntries.length === 0) {
    console.error('❌ FAIL: Trigger did not insert any unprocessed row in hermes_inbox.')
    process.exit(1)
  }

  const entry = inboxEntries[0]
  console.log('✅ SUCCESS: Trigger fired and inserted event in hermes_inbox!')
  console.log(JSON.stringify(entry, null, 2))

  // 5. Run check-inbox.js to process the event and send Task Contract to Telegram
  console.log('\n🚀 Running check-inbox.js to process events and send Task Contract...')
  try {
    const output = execSync('node supabase/check-inbox.js', { encoding: 'utf8' })
    console.log(output)
    console.log('🎉 Test completed successfully!')
  } catch (err) {
    console.error('❌ Error executing check-inbox.js:', err.message)
    process.exit(1)
  }
}

runTest()

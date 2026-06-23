#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load PWA env variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

function escapeHTML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Load Telegram credentials from Hermes config or fallback
let telegramToken = process.env.TELEGRAM_BOT_TOKEN
let telegramChatId = process.env.TELEGRAM_HOME_CHANNEL

// Try to parse ~/.hermes/.env to load credentials
try {
  const hermesEnvPath = path.join('/home/omedsunriv/.hermes/.env')
  if (fs.existsSync(hermesEnvPath)) {
    const hermesEnvContent = fs.readFileSync(hermesEnvPath, 'utf8')
    const tokenMatch = hermesEnvContent.match(/^TELEGRAM_BOT_TOKEN\s*=\s*(.+)$/m)
    const chatMatch = hermesEnvContent.match(/^TELEGRAM_HOME_CHANNEL\s*=\s*(.+)$/m)
    
    if (tokenMatch && tokenMatch[1]) {
      telegramToken = tokenMatch[1].trim()
    }
    if (chatMatch && chatMatch[1]) {
      telegramChatId = chatMatch[1].trim()
    }
  }
} catch (e) {
  console.warn('⚠️ Warning: Could not read ~/.hermes/.env file:', e.message)
}

// Fallback defaults if not resolved
if (!telegramToken) {
  telegramToken = '8671455159:AAFuNURtZoH1O2bExnvuGhE34fXf2bTf81Q'
}
if (!telegramChatId) {
  telegramChatId = '917540647'
}

async function sendTelegramMessage(text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: text,
        parse_mode: 'HTML'
      })
    })
    
    const resData = await response.json()
    if (!response.ok || !resData.ok) {
      console.error('❌ Telegram Send Error:', resData)
      return false;
    }
    return true;
  } catch (err) {
    console.error('❌ Telegram Send Exception:', err.message)
    return false;
  }
}

async function checkInbox() {
  console.log('🔍 Checking hermes_inbox for unprocessed events...')
  
  const { data: events, error: eventsError } = await supabase
    .from('hermes_inbox')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    
  if (eventsError) {
    console.error('❌ Error fetching from hermes_inbox:', eventsError.message)
    process.exit(1)
  }
  
  if (!events || events.length === 0) {
    console.log('✅ No unprocessed events found in hermes_inbox.')
    process.exit(0)
  }
  
  console.log(`📊 Found ${events.length} unprocessed event(s).`)
  
  for (const event of events) {
    console.log(`\n⚙️ Processing Event ID ${event.id} (Category: ${event.categoria})`)
    
    if (event.categoria !== 'mora_pago') {
      console.log(`⚠️ Skipping event category: ${event.categoria}`)
      continue
    }
    
    const studentId = event.raw_ref
    if (!studentId) {
      console.log(`❌ Error: Event raw_ref (student_id) is missing. Marking as processed.`)
      await supabase.from('hermes_inbox').update({ processed: true }).eq('id', event.id)
      continue
    }
    
    // 1. Fetch student details
    const { data: student, error: studentError } = await supabase
      .from('alumnos')
      .select('nombre_completo, familiar_nombre, familiar_telefono, familiar_parentesco, exento_mensualidad')
      .eq('id', studentId)
      .single()
      
    if (studentError || !student) {
      console.error(`❌ Error fetching student ${studentId}:`, studentError ? studentError.message : 'Not found')
      // Mark as processed to prevent infinite loops on broken records
      await supabase.from('hermes_inbox').update({ processed: true }).eq('id', event.id)
      continue
    }
    
    // 2. Check if student is exempt (FIN-P13 prerequisite)
    if (student.exento_mensualidad) {
      console.log(`ℹ️ Student "${student.nombre_completo}" is exempt from fees (exento_mensualidad = true). Skipping Task Contract.`)
      const { error: markError } = await supabase
        .from('hermes_inbox')
        .update({ processed: true })
        .eq('id', event.id)
        
      if (markError) {
        console.error('❌ Error updating event status:', markError.message)
      } else {
        console.log(`✅ Event ${event.id} marked as processed (exempt student).`)
      }
      continue
    }
    
    // 3. Resolve assignee to Katherine Sánchez (FIN-ENC) and generate Task Contract HTML text
    const todayStr = new Date().toISOString().split('T')[0]
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + 180)
    const nextReviewStr = nextReview.toISOString().split('T')[0]
    
    const taskContractText = `<pre><code class="language-yaml">---
doc_id: FIN-P13-TC-${event.id}
doc_type: task_contract
version: V8
status: borrador
department: FIN
owner: Katherine Sánchez — Encargada de Finanzas
created_at: ${todayStr}
last_reviewed: ${todayStr}
next_review_due: ${nextReviewStr}
review_cycle_days: 180
soi_policy_ref: FIN-P13
---</code></pre>

📋 <b>CONTRATO DE TAREA (TASK CONTRACT)</b>
<i>Gestión de Mora y Cobranza de Mensualidades (Fase 1)</i>

• <b>Asignado a:</b> Katherine Sánchez — Encargada de Finanzas (FIN-ENC)
• <b>Origen:</b> Evento en hermes-inbox (ID: ${event.id})
• <b>Estado del Contrato:</b> ⚠️ <code>BORRADOR / PENDIENTE DE ACCIÓN</code>

───────────────────────────
👤 <b>DATOS DEL ALUMNO Y FAMILIAR</b>
• <b>Alumno:</b> <code>${escapeHTML(student.nombre_completo)}</code>
• <b>ID Alumno (UUID):</b> <code>${escapeHTML(studentId)}</code>
• <b>Representante:</b> ${student.familiar_nombre ? escapeHTML(student.familiar_nombre) : '<i>No registrado</i>'}
• <b>Parentesco:</b> ${student.familiar_parentesco ? escapeHTML(student.familiar_parentesco) : '<i>No registrado</i>'}
• <b>WhatsApp/Teléfono:</b> ${student.familiar_telefono ? escapeHTML(student.familiar_telefono) : '<i>No registrado</i>'}

───────────────────────────
🚨 <b>DETALLE DE MOROSIDAD DETECTADA</b>
• <b>Alerta:</b> <i>${escapeHTML(event.summary)}</i>
• <b>Fecha de Registro:</b> <code>${new Date(event.created_at).toLocaleString('es-ES', { timeZone: 'America/Santo_Domingo' })}</code>

───────────────────────────
📖 <b>PROTOCOLO OPERATIVO APLICABLE (FIN-P13)</b>
1. <b>Verificación Inicial:</b> Validar si existe justificación (ej. beca pendiente de carga en sistema).
2. <b>Acción de Cobranza (SLA: 48h desde recepción):</b>
   • <b>Mora 30-59 días (Amarillo):</b> Enviar recordatorio de cobro amistoso vía WhatsApp al número del representante.
   • <b>Mora &gt;= 60 días (Rojo):</b> Enviar notificación formal de suspensión y citación a reunión presencial.
3. <b>Gestión de Acuerdos:</b> Redactar acuerdo de pago flexible (FIN-R13) si aplica (requiere aprobación de Romina/Dirección).
4. <b>Escalamiento a Suspensión (Rojo Crítico):</b> Si tras 5 días del estado Rojo no hay pago ni acuerdo, solicitar ejecución de suspensión física de clases (<b>AGT-P07</b>).

<i>Criterio de Cierre: El alumno cancela la deuda, firma un acuerdo válido, o se ejecuta la suspensión con devolución del instrumento.</i>`;

    // 4. Send Telegram message
    console.log(`📤 Sending Task Contract to Telegram channel (${telegramChatId})...`)
    const sendOk = await sendTelegramMessage(taskContractText)
    
    if (sendOk) {
      // 5. Update processed status
      const { error: updateError } = await supabase
        .from('hermes_inbox')
        .update({ processed: true })
        .eq('id', event.id)
        
      if (updateError) {
        console.error('❌ Error updating event processed status in DB:', updateError.message)
      } else {
        console.log(`✅ Event ${event.id} successfully processed and marked in DB.`)
      }
    } else {
      console.error('❌ Skipping marking event as processed because Telegram delivery failed.')
    }
  }
  
  console.log('\n🏁 Inbox processing complete.')
}

checkInbox()

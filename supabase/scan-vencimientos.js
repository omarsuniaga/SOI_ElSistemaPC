#!/usr/bin/env node
/**
 * scan-vencimientos.js — Monitoreo proactivo de vencimientos institucionales.
 *
 * Escanea `tareas_institucionales` buscando tareas cuyo `fecha_vencimiento`
 * cae dentro de la ventana [hoy, hoy + N_DIAS] y que no estén completadas ni
 * canceladas. Por cada tarea en riesgo, crea o refresca un `hermes_process_case`
 * espejo. Ejecución directa (sin cola), pensado para invocarse desde un cron
 * externo (ver supabase/cron-jobs.sql) o manualmente:
 *   node supabase/scan-vencimientos.js [N_DIAS]
 *
 * Vocabulario verificado EN VIVO contra el proyecto Supabase real
 * (zmhmdvmyeyswunurcyow) antes de escribir este script — no asumido:
 *   - hermes_process_cases_status_check:
 *       CHECK status = ANY (open|in_progress|blocked|closed|cancelled)
 *       -> se usa 'open' en el INSERT de casos nuevos.
 *   - hermes_process_cases_source_check:
 *       CHECK source = ANY (manual|event|scheduled|data_driven|conversation)
 *       -> se usa 'scheduled' (proviene de un scan automático, no de un
 *       usuario ni de un evento puntual).
 *   - hermes_process_cases_entity_type_check:
 *       CHECK entity_type IS NULL OR entity_type = ANY
 *       (alumno|maestro|postulante|representante|instrumento|evento|otro)
 *       -> 'tarea' NO es un valor válido. Se usa 'otro'; el vínculo real con
 *       la tarea de origen vive en metadata->>'source_task_id' (además de
 *       entity_id, que sí apunta al id de la tarea).
 *   - hermes_process_cases_priority_check:
 *       CHECK priority = ANY (baja|media|alta|critica) — mismo vocabulario
 *       que tarea_institucional_prioridad, se mapea 1:1.
 *   - tarea_institucional_estado (enum real de tareas_institucionales.estado):
 *       pendiente|en_progreso|completada|bloqueada|cancelada|observada|
 *       bloqueada_por_dependencia. NOTA: no existe el valor 'completado'
 *       (masculino) — el valor real es 'completada'.
 *
 * Reglas duras:
 *   - Solo hace SELECT sobre `tareas_institucionales`. NUNCA UPDATE/INSERT/
 *     DELETE sobre esa tabla.
 *   - NUNCA llama a servicios externos (WhatsApp, email, Instagram, HTTP a
 *     terceros). Todo el trabajo es lectura/escritura directa a Supabase.
 *
 * Variables de entorno (mismo patrón que supabase/process-whatsapp-queue.js):
 *   VITE_SUPABASE_URL           URL del proyecto Supabase.
 *   SUPABASE_SERVICE_ROLE_KEY   Service role key (bypassa RLS; requerida).
 *     Fallback: VITE_SUPABASE_SERVICE_ROLE_KEY (nombre alternativo usado en
 *     otros scripts de este repo). Sin fallback a anon key: este script
 *     escribe en hermes_process_cases y necesita privilegios de service role.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: faltan VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

const DEFAULT_N_DIAS = 7
const N_DIAS = Number(process.argv[2] || process.env.SCAN_VENCIMIENTOS_N_DIAS || DEFAULT_N_DIAS)

// Estados de tareas_institucionales que NO representan riesgo de vencimiento.
const ESTADOS_EXCLUIDOS = ['completada', 'cancelada']

// Vocabulario compartido entre tarea_institucional_prioridad y
// hermes_process_cases_priority_check.
const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'critica']

function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

function mapPrioridad(prioridad) {
  return PRIORIDADES_VALIDAS.includes(prioridad) ? prioridad : 'media'
}

async function fetchTareasEnRiesgo() {
  const hoy = new Date()
  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + N_DIAS)

  const { data, error } = await supabase
    .from('tareas_institucionales')
    .select('id, titulo, departamento, estado, prioridad, fecha_vencimiento')
    .gte('fecha_vencimiento', toISODate(hoy))
    .lte('fecha_vencimiento', toISODate(limite))
    .not('estado', 'in', `(${ESTADOS_EXCLUIDOS.join(',')})`)

  if (error) {
    throw new Error(`Error escaneando tareas_institucionales: ${error.message}`)
  }
  return data || []
}

async function findCasoExistente(tareaId) {
  const { data, error } = await supabase
    .from('hermes_process_cases')
    .select('id, metadata')
    .eq('metadata->>source_task_id', tareaId)
    .maybeSingle()

  if (error) {
    throw new Error(`Error buscando caso existente para tarea ${tareaId}: ${error.message}`)
  }
  return data || null
}

async function crearCaso(tarea) {
  const payload = {
    title: `Vencimiento próximo: ${tarea.titulo}`,
    source: 'scheduled',
    status: 'open',
    priority: mapPrioridad(tarea.prioridad),
    owner_department: tarea.departamento,
    entity_type: 'otro',
    entity_id: tarea.id,
    entity_label: tarea.titulo,
    metadata: {
      source_task_id: tarea.id,
      fecha_vencimiento: tarea.fecha_vencimiento,
      estado_tarea: tarea.estado,
      scanned_at: new Date().toISOString(),
    },
  }

  const { error } = await supabase.from('hermes_process_cases').insert(payload)
  if (error) {
    throw new Error(`Error creando caso para tarea ${tarea.id}: ${error.message}`)
  }
}

async function actualizarCaso(caso, tarea) {
  const metadata = {
    ...(caso.metadata || {}),
    source_task_id: tarea.id,
    fecha_vencimiento: tarea.fecha_vencimiento,
    estado_tarea: tarea.estado,
    scanned_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('hermes_process_cases')
    .update({
      metadata,
      priority: mapPrioridad(tarea.prioridad),
      updated_at: new Date().toISOString(),
    })
    .eq('id', caso.id)

  if (error) {
    throw new Error(`Error actualizando caso ${caso.id} (tarea ${tarea.id}): ${error.message}`)
  }
}

async function main() {
  console.log(`🔍 Escaneando tareas_institucionales con vencimiento en los próximos ${N_DIAS} día(s)...`)

  const tareas = await fetchTareasEnRiesgo()
  let creados = 0
  let actualizados = 0

  for (const tarea of tareas) {
    const casoExistente = await findCasoExistente(tarea.id)
    if (casoExistente) {
      await actualizarCaso(casoExistente, tarea)
      actualizados += 1
    } else {
      await crearCaso(tarea)
      creados += 1
    }
  }

  console.log('✅ Resumen scan-vencimientos:')
  console.log(`   Tareas escaneadas:  ${tareas.length}`)
  console.log(`   Casos creados:      ${creados}`)
  console.log(`   Casos actualizados: ${actualizados}`)
}

main().catch((err) => {
  console.error('❌ scan-vencimientos falló:', err.message)
  process.exit(1)
})

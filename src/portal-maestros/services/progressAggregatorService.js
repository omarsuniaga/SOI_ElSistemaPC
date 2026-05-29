/**
 * progressAggregatorService.js
 *
 * Saves structured progress records to the `progresos` table.
 * Two entry points:
 *   saveProgressFromAI()  — from AI analysis preview (main flow)
 *   saveProgressFromDSL() — from manual !STATE tokens in DSL (power-user flow)
 */

import { supabase } from '../../lib/supabaseClient.js'
import { parseDSL } from '../utils/dslParser.js'

// ---------------------------------------------------------------------------
// Name resolution helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a string for fuzzy matching: lowercase, remove accents, trim.
 */
function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

/**
 * Resolves a name string to an alumno object from the class list.
 * Matches full name or first name (nombreCorto).
 * Returns null if no match found.
 */
function resolveAlumno(name, alumnos) {
  const n = normalize(name)
  return (
    alumnos.find(
      (a) =>
        normalize(a.nombre) === n ||
        normalize(a.nombreCorto || a.nombre.split(' ')[0]) === n ||
        // Substring checks guarded to avoid false positives on very short strings
        (n.length >= 3 && normalize(a.nombre).includes(n)) ||
        (n.length >= 3 && n.includes(normalize(a.nombreCorto || a.nombre.split(' ')[0]))),
    ) ?? null
  )
}

/**
 * Expands ["todos"] to all alumnos. Resolves all other names.
 * Returns { resolved: alumno[], errors: string[] }
 */
function resolveAlumnos(alumnoNames, alumnos) {
  const resolved = []
  const errors = []

  for (const name of alumnoNames) {
    if (normalize(name) === 'todos') {
      resolved.push(...alumnos)
      continue
    }
    const match = resolveAlumno(name, alumnos)
    if (match) {
      resolved.push(match)
    } else {
      errors.push(`No se encontró el alumno: "${name}"`)
    }
  }

  // Deduplicate by id
  const seen = new Set()
  const deduped = resolved.filter((a) => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  return { resolved: deduped, errors }
}

// ---------------------------------------------------------------------------
// DB upsert
// ---------------------------------------------------------------------------

async function upsertProgressRows(rows) {
  if (rows.length === 0) return { data: [], error: null }

  // Deduplicate by the conflict key — same (alumno, clase, sesion, contenido)
  // can appear twice when "todos" expands across two records with similar content.
  const seen = new Set()
  const deduped = rows.filter((row) => {
    const key = `${row.alumno_id}|${row.clase_id}|${row.sesion_clase_id}|${row.contenido_dsl}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const { data, error } = await supabase
    .from('progresos')
    .upsert(deduped, {
      onConflict: 'alumno_id,clase_id,sesion_clase_id,contenido_dsl',
      ignoreDuplicates: false,
    })
    .select('id, alumno_id, contenido_dsl, estado_cualitativo')

  return { data, error }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Saves progress records from AI analysis.
 * Called after teacher confirms the ProgressPreviewPanel.
 *
 * @param {object} opts
 * @param {string} opts.sesionId
 * @param {string} opts.claseId
 * @param {string} opts.maestroId
 * @param {string} opts.fechaHoy  — 'YYYY-MM-DD'
 * @param {Array}  opts.progressRecords — validated records from preview panel
 * @param {Array}  opts.alumnos — [{id, nombre, nombreCorto}] all class students
 * @returns {Promise<{saved: Array, errors: string[]}>}
 */
export async function saveProgressFromAI({
  sesionId,
  claseId,
  maestroId,
  fechaHoy,
  progressRecords,
  alumnos,
}) {
  if (!progressRecords || progressRecords.length === 0) return { saved: [], errors: [] }
  if (!claseId) {
    console.warn('[Progress] Skip saveProgressFromAI — emergente session sin clase_id')
    return { saved: [], errors: [] }
  }

  const rows = []
  const errors = []

  for (const record of progressRecords) {
    const { resolved, errors: nameErrors } = resolveAlumnos(record.alumnos || [], alumnos)
    errors.push(...nameErrors)

    for (const alumno of resolved) {
      rows.push({
        alumno_id: alumno.id,
        clase_id: claseId,
        sesion_clase_id: sesionId,
        maestro_id: maestroId,
        fecha_evaluacion: fechaHoy,
        evaluacion_tipo: 'observacion',
        estado_cualitativo: record.estado || 'EN_PROGRESO',
        calificacion: record.nota ?? null,
        contenido_dsl: record.contenido || '', // empty string sentinel — NULL breaks the upsert conflict key
        observaciones: record.observacion || null,
        indicadores: {
          tipo: record.tipo || 'otro',
          es_colectivo: record.es_colectivo ?? false,
          tarea: record.tarea || null,
        },
        objetivo_id: null,
      })
    }
  }

  try {
    const { data, error } = await upsertProgressRows(rows)
    if (error) throw error

    const saved = (data || []).map((r) => ({
      alumnoId: r.alumno_id,
      contenido: r.contenido_dsl,
      estado: r.estado_cualitativo,
    }))

    return { saved, errors }
  } catch (err) {
    console.warn('[Progress] Error al guardar progreso:', err.message)
    return { saved: [], errors: [...errors, err.message] }
  }
}

/**
 * Saves progress from manual !STATE tokens in DSL text.
 * Power-user shortcut — no AI needed.
 * Parses triplets: #Nombre [contenido] !ESTADO on the same line.
 *
 * @param {object} opts
 * @param {string} opts.sesionId
 * @param {string} opts.claseId
 * @param {string} opts.maestroId
 * @param {string} opts.fechaHoy
 * @param {string} opts.dslText
 * @param {Array}  opts.alumnos
 * @returns {Promise<{saved: Array, errors: string[]}>}
 */
export async function saveProgressFromDSL({
  sesionId,
  claseId,
  maestroId,
  fechaHoy,
  dslText,
  alumnos,
}) {
  if (!dslText || !dslText.trim()) return { saved: [], errors: [] }
  if (!claseId) {
    console.warn('[Progress] Skip saveProgressFromDSL — emergente session sin clase_id')
    return { saved: [], errors: [] }
  }

  const lines = dslText.split('\n')
  const records = []

  for (const line of lines) {
    const parsed = parseDSL(line)
    if (!parsed.estados || parsed.estados.length === 0) continue
    if (!parsed.contenido || parsed.contenido.length === 0) continue

    const estado = parsed.estados[0] // first !STATE on the line
    const contenido = parsed.contenido[0] // first [contenido] on the line
    const alumnoNames = parsed.alumnos.length > 0 ? parsed.alumnos : ['todos']
    const nota = parsed.calificacion?.valor ?? null

    records.push({
      alumnos: alumnoNames,
      contenido,
      tipo: 'tecnica',
      estado,
      nota,
      tarea: parsed.tareas[0] || null,
      observacion: parsed.sugerencias[0] || null,
      es_colectivo: alumnoNames.includes('todos'),
    })
  }

  if (records.length === 0) return { saved: [], errors: [] }

  return saveProgressFromAI({
    sesionId,
    claseId,
    maestroId,
    fechaHoy,
    progressRecords: records,
    alumnos,
  })
}

/**
 * Retroactively links progresos records (objetivo_id IS NULL) to curriculo_objetivos
 * using local fuzzy matching on contenido_dsl vs objetivo.descripcion.
 *
 * Matching rules (in priority order):
 *   1. Exact match after normalize()
 *   2. objetivo.descripcion contains contenido_dsl (both >= 5 chars)
 *   3. contenido_dsl contains objetivo.descripcion (both >= 5 chars)
 *
 * @param {object} opts
 * @param {string} opts.claseId
 * @param {Array<{id: string, descripcion: string}>} opts.objetivos - flat list from all pilares
 * @returns {Promise<{ linked: number }>}
 */
export async function linkProgresosToObjetivos({ claseId, objetivos }) {
  if (!claseId || !objetivos || objetivos.length === 0) return { linked: 0 }

  // 1. Fetch unlinked progresos for this class
  const { data: progresos, error: fetchError } = await supabase
    .from('progresos')
    .select('id, contenido_dsl')
    .eq('clase_id', claseId)
    .is('objetivo_id', null)
    .not('contenido_dsl', 'is', null)
    .neq('contenido_dsl', '')

  if (fetchError) {
    console.warn('[Progress] linkProgresosToObjetivos fetch error:', fetchError.message)
    return { linked: 0 }
  }
  if (!progresos || progresos.length === 0) return { linked: 0 }

  // 2. Normalize objetivos once
  const normObjetivos = objetivos.map((o) => ({
    id: o.id,
    norm: normalize(o.descripcion),
    raw: o.descripcion,
  }))

  // 3. Build map: objetivoId → matched progreso ids[]
  const matchMap = new Map() // objetivoId → string[]

  for (const progreso of progresos) {
    const normP = normalize(progreso.contenido_dsl)
    if (!normP) continue

    // Try exact match first, then substring
    let matched = normObjetivos.find((o) => o.norm === normP)
    if (!matched && normP.length >= 5) {
      matched = normObjetivos.find((o) => o.norm.length >= 5 && o.norm.includes(normP))
    }
    if (!matched && normP.length >= 5) {
      matched = normObjetivos.find((o) => o.norm.length >= 5 && normP.includes(o.norm))
    }

    if (matched) {
      const ids = matchMap.get(matched.id) || []
      ids.push(progreso.id)
      matchMap.set(matched.id, ids)
    }
  }

  if (matchMap.size === 0) return { linked: 0 }

  // 4. Batch update — one UPDATE per matched objetivo
  let linked = 0
  for (const [objetivoId, ids] of matchMap.entries()) {
    const { error: updateError } = await supabase
      .from('progresos')
      .update({ objetivo_id: objetivoId })
      .in('id', ids)

    if (updateError) {
      console.warn('[Progress] linkProgresosToObjetivos update error:', updateError.message)
    } else {
      linked += ids.length
    }
  }

  console.debug(`[Progress] linkProgresosToObjetivos: linked ${linked} records`)
  return { linked }
}

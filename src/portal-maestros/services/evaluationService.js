/**
 * evaluationService — DSL resolution and evaluation persistence
 *
 * Pure functions: parseToBlocks, expandTodos, resolveDSL, calculateSemaphore
 * Async (Supabase): saveEvaluaciones, getSemaphoreForNode
 */

import { parseDSL } from '../utils/dslParser.js'
import { supabase } from '../../lib/supabaseClient.js'

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse multi-line DSL text into evaluation blocks.
 * Each non-empty line becomes one block.
 *
 * @param {string} raw
 * @returns {{ alumnos: string[], nota: number|null, observacion: string|null, tarea: string|null }[]}
 */
export function parseToBlocks(raw) {
  if (!raw || typeof raw !== 'string') return []

  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parsed = parseDSL(line)
      return {
        alumnos: parsed.alumnos,
        nota: parsed.calificacion ? parsed.calificacion.valor : null,
        observacion: parsed.sugerencias.length > 0 ? parsed.sugerencias[0] : null,
        tarea: parsed.tareas.length > 0 ? parsed.tareas[0] : null,
      }
    })
    .filter(block => block.alumnos.length > 0)
}

/**
 * Expand #todos and resolve precedence.
 * - #todos sets base nota for ALL presentes
 * - Specific #Name mentions ALWAYS override #todos, regardless of order
 * - When a student is mentioned multiple times without #todos, last mention wins
 *
 * @param {{ alumnos: string[], nota: number|null, observacion: string|null, tarea: string|null }[]} blocks
 * @param {{ id: string, nombre_completo: string }[]} presentes
 * @returns {{ alumno_id: string, nota: number|null, observacion: string|null, tarea: string|null }[]}
 */
export function expandTodos(blocks, presentes) {
  // Separate #todos blocks from specific blocks
  const todosBlocks = blocks.filter(b => b.alumnos.includes('todos'))
  const specificBlocks = blocks.filter(b => !b.alumnos.includes('todos'))

  // Map: alumno_id -> evaluation (specific blocks take precedence over todos)
  const result = new Map()

  // 1. Apply #todos as base for all presentes
  if (todosBlocks.length > 0) {
    // Last #todos block wins if multiple
    const base = todosBlocks[todosBlocks.length - 1]
    for (const alumno of presentes) {
      result.set(alumno.id, {
        alumno_id: alumno.id,
        nota: base.nota,
        observacion: base.observacion,
        tarea: base.tarea,
      })
    }
  }

  // 2. Apply specific mentions — ALWAYS override todos
  for (const block of specificBlocks) {
    for (const mention of block.alumnos) {
      const lower = mention.toLowerCase()
      const matched = presentes.filter(p =>
        p.nombre_completo.toLowerCase().includes(lower)
      )
      for (const alumno of matched) {
        result.set(alumno.id, {
          alumno_id: alumno.id,
          nota: block.nota,
          observacion: block.observacion,
          tarea: block.tarea,
        })
      }
    }
  }

  return Array.from(result.values())
}

/**
 * Full pipeline: parse raw DSL → expand → detect missing students.
 *
 * @param {string} raw
 * @param {string} indicadorId
 * @param {{ id: string, nombre_completo: string }[]} presentes
 * @returns {{ indicador_id: string, evaluaciones: object[], missing: string[] }}
 */
export function resolveDSL(raw, indicadorId, presentes) {
  const blocks = parseToBlocks(raw)
  const evaluaciones = expandTodos(blocks, presentes)

  const evaluatedIds = new Set(evaluaciones.map(e => e.alumno_id))
  const missing = presentes
    .filter(p => !evaluatedIds.has(p.id))
    .map(p => p.nombre_completo)

  return {
    indicador_id: indicadorId,
    evaluaciones,
    missing,
  }
}

/**
 * Calculate semaphore color based on evaluation coverage and nota quality.
 *
 * @param {{ nota: number|null }[]} evaluaciones
 * @param {number} totalAlumnos
 * @returns {'green' | 'yellow' | 'gray'}
 */
export function calculateSemaphore(evaluaciones, totalAlumnos) {
  if (!evaluaciones || evaluaciones.length === 0) return 'gray'

  const allCovered = totalAlumnos > 0 && evaluaciones.length >= totalAlumnos
  const allGreen = evaluaciones.every(e => e.nota != null && e.nota >= 4)

  if (allCovered && allGreen) return 'green'
  return 'yellow'
}

// ─────────────────────────────────────────────────────────────────────────────
// Async — Supabase
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UPSERT evaluaciones to indicator_attempts.
 * Conflict target: (session_id, indicator_id, student_id)
 *
 * @param {string} sesionId
 * @param {string} indicadorId
 * @param {{ alumno_id: string, nota: number|null, observacion: string|null, tarea: string|null }[]} evaluaciones
 * @returns {Promise<{ data: object[]|null, error: object|null }>}
 */
export async function saveEvaluaciones(sesionId, indicadorId, evaluaciones) {
  const rows = evaluaciones.map(e => ({
    session_id: sesionId,
    indicator_id: indicadorId,
    student_id: e.alumno_id,
    nota: e.nota,
    observations: e.observacion,
    tarea: e.tarea,
  }))

  const { data, error } = await supabase
    .from('indicator_attempts')
    .upsert(rows, {
      onConflict: 'session_id,indicator_id,student_id',
      ignoreDuplicates: false,
    })

  return { data, error }
}

/**
 * Get aggregated semaphore for all indicators of a node.
 *
 * @param {string} nodoId
 * @param {string} claseId
 * @returns {Promise<{ semaphore: 'green'|'yellow'|'gray', indicators: object[] }>}
 */
export async function getSemaphoreForNode(nodoId, claseId) {
  // 1. Get active indicators for this node
  const { data: indicators, error: indError } = await supabase
    .from('indicators')
    .select('id')
    .eq('node_id', nodoId)
    .eq('activo', true)

  if (indError) throw indError
  if (!indicators || indicators.length === 0) {
    return { semaphore: 'gray', indicators: [] }
  }

  const indicatorIds = indicators.map(i => i.id)

  // 2. Get attempts for those indicators
  const { data: attempts, error: attError } = await supabase
    .from('indicator_attempts')
    .select('indicator_id, student_id, nota')
    .in('indicator_id', indicatorIds)

  if (attError) throw attError

  // 3. Count enrolled students
  const { data: enrolled, error: enrollError } = await supabase
    .from('alumnos_clases')
    .select('alumno_id')
    .eq('clase_id', claseId)
    .eq('activo', true)

  if (enrollError) throw enrollError

  const totalAlumnos = enrolled ? enrolled.length : 0
  const semaphore = calculateSemaphore(attempts ?? [], totalAlumnos)

  return { semaphore, indicators: indicators, totalAlumnos }
}

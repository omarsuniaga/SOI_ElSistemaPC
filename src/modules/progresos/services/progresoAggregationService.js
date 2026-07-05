/**
 * Aggregation service for student progress
 * Pure function: takes pre-fetched source data and student IDs, returns StudentProgress DTOs
 * No Supabase imports; services are testable with fixtures
 */

import { evaluate } from './riskRules.js'

export class InvalidWindowError extends Error {
  constructor(message = 'from date must be <= to date') {
    super(message)
    this.name = 'InvalidWindowError'
  }
}

/**
 * Validates the date window
 * @param {string} from - ISO date string (YYYY-MM-DD)
 * @param {string} to - ISO date string (YYYY-MM-DD)
 * @throws {InvalidWindowError} if from > to
 */
function validateWindow(from, to) {
  if (from > to) {
    throw new InvalidWindowError('Date window invalid: from must be <= to')
  }
}

/**
 * Partitions rows by alumnoId and returns a Map for O(1) lookup
 * @param {Array} rows - Supabase rows from any source
 * @returns {Map} Map<alumnoId, Array<row>>
 */
function buildAlumnoPartitions(rows) {
  const partitions = new Map()
  for (const row of rows) {
    const key = row.alumno_id
    if (!partitions.has(key)) {
      partitions.set(key, [])
    }
    partitions.get(key).push(row)
  }
  return partitions
}

/**
 * Reduces indicator_attempts into aggregate stats
 * @param {Array} attempts - Rows with { passed: boolean|null }
 * @returns {Object} { total, passed, pass_rate }
 */
function reduceIndicators(attempts) {
  if (!attempts || attempts.length === 0) {
    return { total: 0, passed: 0, pass_rate: null }
  }

  const total = attempts.length
  const passed = attempts.filter(a => a.passed === true).length

  return {
    total,
    passed,
    pass_rate: total > 0 ? passed / total : null,
  }
}

/**
 * Reduces progresos into grade stats
 * Excludes null calificaciones from both count and average
 * @param {Array} progresos - Rows with { calificacion: float|null }
 * @returns {Object} { count, promedio, calificaciones[] }
 */
function reduceGrades(progresos) {
  if (!progresos || progresos.length === 0) {
    return { count: 0, promedio: null, calificaciones: [] }
  }

  // Exclude nulls from computation
  const nonNull = progresos.filter(p => p.calificacion !== null && p.calificacion !== undefined)
  if (nonNull.length === 0) {
    return { count: 0, promedio: null, calificaciones: [] }
  }

  const sum = nonNull.reduce((acc, p) => acc + parseFloat(p.calificacion), 0)
  const promedio = sum / nonNull.length

  const calificaciones = nonNull
    .sort((a, b) => new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion))
    .map(p => ({
      evaluacion_id: p.evaluacion_id,
      calificacion: p.calificacion,
      fecha: p.fecha_evaluacion,
    }))

  return {
    count: nonNull.length,
    promedio,
    calificaciones,
  }
}

/**
 * Reduces asistencias into attendance stats
 * Rate = (presente + tarde + justificado) / total
 * @param {Array} asistencias - Rows with { estado: 'presente'|'ausente'|'tarde'|'justificado' }
 * @returns {Object} { total, presente, ausente, tarde, justificado, rate }
 */
function reduceAttendance(asistencias) {
  if (!asistencias || asistencias.length === 0) {
    return {
      total: 0,
      presente: 0,
      ausente: 0,
      tarde: 0,
      justificado: 0,
      rate: null,
    }
  }

  const total = asistencias.length
  const presente = asistencias.filter(a => a.estado === 'presente').length
  const ausente = asistencias.filter(a => a.estado === 'ausente').length
  const tarde = asistencias.filter(a => a.estado === 'tarde').length
  const justificado = asistencias.filter(a => a.estado === 'justificado').length

  const counted = presente + tarde + justificado
  const rate = total > 0 ? counted / total : null

  return {
    total,
    presente,
    ausente,
    tarde,
    justificado,
    rate,
  }
}

/**
 * Merges and filters observaciones for a student
 * @param {Array} obs - All observaciones (to be filtered by alumnoId)
 * @returns {Array} Sorted observaciones with source attribution
 */
function mergeObservaciones(obs) {
  if (!obs || obs.length === 0) {
    return []
  }

  // Map source field: 'sesion' -> 'sesion', 'alumno' -> 'alumno'
  // (tipo field in DB will be mapped to source)
  return obs
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(o => ({
      id: o.id,
      texto: o.texto,
      fecha: o.fecha,
      source: o.tipo === 'sesion' ? 'sesion' : 'alumno',
      sesion_id: o.sesion_id,
    }))
}

/**
 * Aggregates student progress from pre-fetched sources
 * @param {string} alumnoId
 * @param {Object} options - { from, to, sources: {asistencias, progresos, indicatorAttempts, observaciones}, clock }
 * @returns {Object} StudentProgress DTO
 * @throws {InvalidWindowError} if from > to
 */
export function aggregateStudentProgress(alumnoId, { from, to, sources, clock = Date }) {
  validateWindow(from, to)

  const { asistencias = [], progresos = [], indicatorAttempts = [], observaciones = [] } = sources

  // Pre-partition all sources by alumnoId for O(1) lookup
  const asisPart = buildAlumnoPartitions(asistencias).get(alumnoId) || []
  const progPart = buildAlumnoPartitions(progresos).get(alumnoId) || []
  const attPart = buildAlumnoPartitions(indicatorAttempts).get(alumnoId) || []
  const obsPart = buildAlumnoPartitions(observaciones).get(alumnoId) || []

  // Reduce each source
  const indicators = reduceIndicators(attPart)
  const grades = reduceGrades(progPart)
  const attendance = reduceAttendance(asisPart)
  const obs = mergeObservaciones(obsPart)

  // Assemble aggregate DTO (without risk initially)
  const progress = {
    alumnoId,
    from,
    to,
    indicators,
    grades,
    attendance,
    observaciones: obs,
  }

  // Evaluate risk on the aggregate
  const risk = evaluate(progress, clock)

  return {
    ...progress,
    risk,
  }
}

/**
 * Aggregates multiple students in a single pass
 * @param {Array<string>} alumnoIds - List of student IDs
 * @param {Object} options - { from, to, sources, clock }
 * @returns {Map<alumnoId, StudentProgress>}
 * @throws {InvalidWindowError} if from > to
 */
export function aggregateBatch(alumnoIds, { from, to, sources, clock = Date }) {
  validateWindow(from, to)

  const result = new Map()

  for (const alumnoId of alumnoIds) {
    const progress = aggregateStudentProgress(alumnoId, {
      from,
      to,
      sources,
      clock,
    })
    result.set(alumnoId, progress)
  }

  return result
}

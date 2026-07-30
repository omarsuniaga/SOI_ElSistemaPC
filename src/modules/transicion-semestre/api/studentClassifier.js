import { supabase } from '../../../lib/supabaseClient.js'
import { fuzzyMatch } from '../../../lib/fuzzyMatch.js'
import { normalizeText } from '../../../core/utils/normalizeText.js'

/**
 * Load all students enrolled in classes of a given period.
 * Returns de-duplicated student records with their enrollment info.
 *
 * @param {string} periodId - The academic period ID
 * @returns {Promise<Array>} Array of student objects
 */
export async function getSourceStudents(periodId) {
  // 1. Get all classes in the period
  const { data: classes, error: classError } = await supabase
    .from('clases')
    .select('id')
    .eq('periodo_id', periodId)

  if (classError) throw classError
  if (!classes || classes.length === 0) return []

  const classIds = classes.map(c => c.id)

  // 2. Get all enrollments for those classes
  const { data: enrollments, error: enrollError } = await supabase
    .from('alumnos_clases')
    .select('alumno_id, clase_id, activo')
    .in('clase_id', classIds)
    .eq('activo', true)

  if (enrollError) throw enrollError
  if (!enrollments || enrollments.length === 0) return []

  // 3. Get unique student IDs
  const studentIds = [...new Set(enrollments.map(e => e.alumno_id))]

  // 4. Fetch student details
  const { data: students, error: studentError } = await supabase
    .from('alumnos')
    .select('*')
    .in('id', studentIds)

  if (studentError) throw studentError

  return students || []
}

/**
 * Score a single field against the query using substring detection + Levenshtein fallback.
 * Substring match returns a high score because it indicates strong relevance.
 *
 * @param {string} normalizedQuery - Pre-normalized query
 * @param {string} fieldValue - Raw field value (will be normalized internally)
 * @returns {number} Score between 0 and 1
 */
function computeFieldScore(normalizedQuery, fieldValue) {
  const normalizedField = normalizeText(fieldValue || '')
  if (!normalizedField) return 0

  // Exact match
  if (normalizedQuery === normalizedField) return 1.0

  // Query is contained in the field (e.g., "juan" in "juan garcia")
  if (normalizedField.includes(normalizedQuery)) {
    return 0.8 + (normalizedQuery.length / normalizedField.length) * 0.2
  }

  // Field is contained in the query (e.g., short name in longer search)
  if (normalizedQuery.includes(normalizedField) && normalizedField.length > 2) {
    return 0.7 + (normalizedField.length / normalizedQuery.length) * 0.3
  }

  // Fallback: Levenshtein-based fuzzy match
  return fuzzyMatch(normalizedQuery, normalizedField)
}

/**
 * Multi-field fuzzy search across name, cedula, and phone.
 * If query is empty, returns all students unsorted.
 * Uses composite scoring (name × 0.5 + cedula × 0.3 + phone × 0.2).
 * A student is included if the composite score OR any individual field score
 * meets the threshold — this ensures "Juan" matches "Juan García" even though
 * the composite is diluted by zero scores on cedula/phone.
 *
 * @param {string} query - The search query (can be empty)
 * @param {Array} students - Array of student objects
 * @param {Object} [options] - Search options
 * @param {number} [options.threshold=0.6] - Minimum score to include
 * @param {Object} [options.filters] - Post-scoring filters
 * @param {string} [options.filters.instrumento] - Filter by instrument name
 * @param {string} [options.filters.enrollmentStatus] - Filter by enrollment status
 * @returns {Array} Filtered and scored students with _score property
 */
export function fuzzySearch(query, students, options = {}) {
  const { threshold = 0.6, filters = {} } = options

  // Empty query → return all students, apply filters only
  if (!query || query.trim() === '') {
    let results = [...students]
    if (filters.instrumento) {
      results = results.filter(s => s.instrumento_principal === filters.instrumento)
    }
    if (filters.enrollmentStatus) {
      results = results.filter(s => s.activo === (filters.enrollmentStatus === 'active'))
    }
    return results
  }

  const normalizedQuery = normalizeText(query)

  // Score each student across multiple fields
  const scored = students.map(student => {
    const nameScore = computeFieldScore(normalizedQuery, student.nombre_completo)
    const cedulaScore = computeFieldScore(normalizedQuery, student.cedula)
    const phoneScore = computeFieldScore(normalizedQuery, student.telefono)

    const compositeScore = nameScore * 0.5 + cedulaScore * 0.3 + phoneScore * 0.2
    const bestScore = Math.max(nameScore, cedulaScore, phoneScore)

    return { ...student, _score: compositeScore, _bestScore: bestScore }
  })

  // Include if composite OR best individual score meets threshold
  let results = scored.filter(s => s._score >= threshold || s._bestScore >= threshold)

  // Apply instrument filter
  if (filters.instrumento) {
    results = results.filter(s => s.instrumento_principal === filters.instrumento)
  }

  // Apply enrollment status filter
  if (filters.enrollmentStatus) {
    results = results.filter(s => s.activo === (filters.enrollmentStatus === 'active'))
  }

  // Sort by composite score descending
  results.sort((a, b) => b._score - a._score)

  return results
}

/**
 * Compute unique instrument facets with counts from a student array.
 *
 * @param {Array} students - Array of student objects
 * @returns {Array} Array of { instrumento, count } sorted by count descending
 */
export function getInstrumentFacets(students) {
  const counts = {}

  for (const student of students) {
    const inst = student.instrumento_principal
    if (inst) {
      counts[inst] = (counts[inst] || 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([instrumento, count]) => ({ instrumento, count }))
    .sort((a, b) => b.count - a.count)
}

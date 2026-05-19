import { createHash } from 'crypto'

/**
 * Compute SHA256 hash for dedup key
 * @param {string} input - Input string to hash
 * @returns {string} 256-bit hex hash
 */
function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Build promotion plan with dedup checks
 * Pure function: no DB calls, no async
 *
 * @param {string} sessionId - UUID of session
 * @param {string[]} alumnoIds - Array of alumno UUIDs to filter by
 * @param {Array} observacionesSessionRows - Observations from observaciones_sesion
 * @param {Array} existingAlumnoRows - Observations from observaciones_alumnos (for dedup check)
 * @returns {Object} Promotion result with counts and plan
 */
export function promoteSessionObservations(
  sessionId,
  alumnoIds,
  observacionesSessionRows,
  existingAlumnoRows
) {
  const result = {
    promoted: 0,
    skipped: 0,
    errors: [],
    promotionPlan: []
  }

  // Early exit if empty alumnoIds
  if (!alumnoIds || alumnoIds.length === 0) {
    return result
  }

  // Build set of existing dedup keys for O(1) lookup
  const existingDedup = new Set(
    existingAlumnoRows.map(row => row.dedup_key || sha256(
      `${row.sesion_id}|${row.alumno_id}|${JSON.stringify(row.contenido_parsed)}`
    ))
  )

  // Filter by alumno_ids and es_borrador
  const filteredRows = observacionesSessionRows.filter(row =>
    row.es_borrador === true && alumnoIds.includes(row.alumno_id)
  )

  // Process each row
  for (const row of filteredRows) {
    const { sesion_id, alumno_id, contenido_parsed } = row

    // Handle null content: skip, don't count as error
    if (contenido_parsed === null) {
      result.skipped++
      result.promotionPlan.push({
        alumno_id,
        sesion_id,
        action: 'SKIP',
        reason: 'NULL_CONTENT'
      })
      continue
    }

    // Compute dedup key
    const hashInput = `${sesion_id}|${alumno_id}|${JSON.stringify(contenido_parsed)}`
    const dedupKey = sha256(hashInput)

    // Check for existing (dedup)
    if (existingDedup.has(dedupKey)) {
      result.skipped++
      result.promotionPlan.push({
        alumno_id,
        sesion_id,
        action: 'SKIP',
        reason: 'ALREADY_EXISTS',
        dedup_key: dedupKey
      })
      continue
    }

    // Mark for promotion
    result.promoted++
    result.promotionPlan.push({
      alumno_id,
      sesion_id,
      action: 'PROMOTE',
      dedup_key: dedupKey,
      contenido_parsed
    })
  }

  return result
}

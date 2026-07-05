/**
 * Compute SHA256 hash for dedup key using the Web Crypto API.
 * @param {string} input - Input string to hash
 * @returns {Promise<string>} 256-bit hex hash
 */
async function sha256(input) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API is required to compute observation dedup keys.')
  }

  const msgUint8 = new TextEncoder().encode(input)
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgUint8)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Build promotion plan with dedup checks
 * Now async to support browser-native crypto
 *
 * @param {string} sessionId - UUID of session
 * @param {string[]} alumnoIds - Array of alumno UUIDs to filter by
 * @param {Array} observacionesSessionRows - Observations from observaciones_sesion
 * @param {Array} existingAlumnoRows - Observations from observaciones_alumnos (for dedup check)
 * @returns {Promise<Object>} Promotion result with counts and plan
 */
export async function promoteSessionObservations(
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

  const alumnoIdSet = new Set(alumnoIds)

  // Build set of existing dedup keys for O(1) lookup
  // We compute missing hashes in parallel if needed
  const existingDedupArray = await Promise.all(
    existingAlumnoRows.map(async row => row.dedup_key || await sha256(
      `${row.sesion_id}|${row.alumno_id}|${JSON.stringify(row.contenido_parsed)}`
    ))
  )
  const existingDedup = new Set(existingDedupArray)

  // Filter by alumno_ids and es_borrador
  const filteredRows = observacionesSessionRows.filter(row =>
    row.es_borrador === true && alumnoIdSet.has(row.alumno_id)
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
    const dedupKey = await sha256(hashInput)

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

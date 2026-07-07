/**
 * Batch promote all pending session observations.
 * Idempotent: running twice does not create duplicates.
 *
 * Pure logic: queries for pending sessions, extracts alumno IDs,
 * calls Phase C API for each session, marks completed sessions.
 *
 * @param {SupabaseClient} supabase - Supabase client with auth context
 * @param {Function} promoteObservationsFn - Phase C API function (injected for testability)
 * @param {Object} options - Configuration
 * @param {number} options.batchSize - Sessions to process per run (default: 100, no limit)
 * @param {boolean} options.dryRun - If true, log but don't mark promoted (default: false)
 * @returns {Promise<Object>} { processed: number, promoted: number, errors: Array<{sessionId, message}> }
 */
export async function batchPromoteSessionObservations(
  supabase,
  promoteObservationsFn = null,
  options = {}
) {
  const { batchSize = 100, dryRun = false } = options

  // If promoteObservationsFn not provided, import at runtime
  let promoteObservations = promoteObservationsFn
  if (!promoteObservations) {
    const { promoteObservations: imported } = await import('../api/observacionesApi.js')
    promoteObservations = imported
  }

  const result = {
    processed: 0,
    promoted: 0,
    errors: []
  }

  try {
    // Query for pending sessions: fecha_fin IS NOT NULL AND es_promocionado = false
    const { data: pendingSessions, error: queryError } = await supabase
      .from('sesiones_clase')
      .select('id')
      .neq('fecha_fin', null)
      .eq('es_promocionado', false)

    if (queryError) {
      result.errors.push({
        sessionId: null,
        message: `Database query failed: ${queryError.message}`
      })
      return result
    }

    if (!pendingSessions || pendingSessions.length === 0) {
      // No pending sessions; batch complete
      return result
    }

    // Apply batch size limit (if needed)
    const sessionsToProcess = batchSize > 0 ? pendingSessions.slice(0, batchSize) : pendingSessions

    // Process each session
    for (const sessionRecord of sessionsToProcess) {
      const sessionId = sessionRecord.id
      result.processed++

      try {
        // Extract alumno IDs for this session
        const { data: alumnoRecords, error: alumnoError } = await supabase
          .from('alumnos_clases')
          .select('alumno_id')
          .eq('clase_id', sessionId) // Assuming sesiones_clase has clase_id

        if (alumnoError) {
          result.errors.push({
            sessionId,
            message: `Failed to fetch alumnos: ${alumnoError.message}`
          })
          continue
        }

        const alumnoIds = (alumnoRecords || []).map(r => r.alumno_id)

        // Call Phase C API to promote observations
        const promoteResult = await promoteObservations(sessionId, alumnoIds)

        if (promoteResult.errors && promoteResult.errors.length > 0) {
          // API returned errors; don't mark as promoted
          result.errors.push({
            sessionId,
            message: promoteResult.errors[0]?.message || 'Promotion API failed'
          })
          continue
        }

        // Mark session as promoted (idempotence guard)
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('sesiones_clase')
            .update({ es_promocionado: true })
            .eq('id', sessionId)

          if (updateError) {
            result.errors.push({
              sessionId,
              message: `Failed to mark promoted: ${updateError.message}`
            })
            continue
          }
        }

        // Success: increment promoted count
        result.promoted++
      } catch (error) {
        // Catch unexpected errors; continue batch
        result.errors.push({
          sessionId,
          message: error.message || 'Unexpected error during promotion'
        })
      }
    }
  } catch (error) {
    // Catch unexpected errors at batch level
    result.errors.push({
      sessionId: null,
      message: `Batch processing failed: ${error.message}`
    })
  }

  return result
}

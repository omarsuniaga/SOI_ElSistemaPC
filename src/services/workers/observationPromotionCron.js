import cron from 'node-cron'
import { batchPromoteSessionObservations } from '../../modules/observaciones/services/cronPromoteObservations.js'
import { promoteObservations } from '../../modules/observaciones/api/observacionesApi.js'

/**
 * Register the observation promotion cron job.
 * Runs daily at 02:00 UTC to promote all pending session observations.
 *
 * @param {SupabaseClient} supabase - Supabase client
 * @param {Object} logger - Logger instance (default: console)
 * @returns {void} Registers side effect; does not return a value
 */
export function registerObservationPromotionCron(supabase, logger = console) {
  // Cron pattern: 0 2 * * * (02:00 UTC every day)
  cron.schedule('0 2 * * *', async () => {
    try {
      const result = await batchPromoteSessionObservations(supabase, promoteObservations)

      // Log summary
      logger.info(
        `[ObservationPromotion] Batch complete: processed=${result.processed}, promoted=${result.promoted}, errors=${result.errors.length}`
      )

      // Log per-session errors if any
      if (result.errors.length > 0) {
        logger.warn(`[ObservationPromotion] Errors:`, result.errors)

        // Send to monitoring service (e.g., Sentry) — optional Phase E
        // if (globalThis.Sentry) {
        //   Sentry.captureMessage(`Observation promotion batch had ${result.errors.length} errors`, 'warning')
        // }
      }
    } catch (error) {
      // Catch unexpected errors; do NOT rethrow (prevents cron crash)
      logger.error(`[ObservationPromotion] Cron job failed:`, error)

      // Send to monitoring service — optional Phase E
      // if (globalThis.Sentry) {
      //   Sentry.captureException(error)
      // }
    }
  })

  logger.info('[ObservationPromotion] Cron job registered (0 2 * * * UTC)')
}

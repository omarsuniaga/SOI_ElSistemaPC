import { supabase } from '../../../lib/supabaseClient.js'
import { getPeriodos } from '../../periodos/api/periodosApi.js'

export const DEFAULT_CUTOFF = '2026-08-10'
export const confirmationPhrase = (cutoff) => `RESETEAR PERIODO ${cutoff}`

function unwrap(data, error, fallback) {
  if (error) throw new Error(error.message || fallback)
  return data
}

function requireStatus(data, expected, fallback) {
  if (!data || data.status !== expected) {
    throw new Error(data?.error || fallback)
  }
  return data
}

export async function listResetPeriods() {
  return getPeriodos()
}

export async function previewPeriodReset(cutoff, periodId) {
  const { data, error } = await supabase.rpc('admin_preview_period_reset', {
    p_cutoff: cutoff,
    p_target_period_id: periodId,
  })
  return unwrap(data, error, 'No se pudo preparar la vista previa')
}

export async function preparePeriodResetBackup(runId) {
  const { data, error } = await supabase.rpc('admin_backup_period_reset', { p_run_id: runId })
  return requireStatus(unwrap(data, error, 'No se pudo preparar el respaldo'), 'backed_up', 'El respaldo no quedó listo')
}

export async function executePeriodReset(runId, phrase) {
  const { data, error } = await supabase.rpc('admin_execute_period_reset', {
    p_run_id: runId,
    p_confirmation: phrase,
  })
  return requireStatus(unwrap(data, error, 'No se pudo ejecutar el reinicio'), 'completed', 'El reinicio no se completó')
}

export async function getPeriodResetStatus(runId) {
  const { data, error } = await supabase.rpc('admin_get_period_reset_status', { p_run_id: runId })
  return unwrap(data, error, 'No se pudo consultar el estado de la ejecución')
}

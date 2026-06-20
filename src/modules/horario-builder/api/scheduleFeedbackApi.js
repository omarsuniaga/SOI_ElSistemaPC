import { supabase } from '../../../lib/supabaseClient.js';

/**
 * Fetch all feedback entries for a given schedule run.
 *
 * @param {string} runId - UUID of the schedule run
 * @returns {Promise<Array>} Array of feedback objects
 */
export async function getRunFeedback(runId) {
  const { data, error } = await supabase
    .from('schedule_run_feedback')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Add a feedback entry for a schedule run.
 *
 * @param {Object} params
 * @param {string} params.runId      - UUID of the schedule run
 * @param {string} params.comentario - Feedback text
 * @param {string} params.tipo       - 'observacion' | 'aprobacion' | 'rechazo'
 * @returns {Promise<Object>} Inserted feedback record
 */
export async function addFeedback({ runId, comentario, tipo = 'observacion' }) {
  const { data, error } = await supabase
    .from('schedule_run_feedback')
    .insert([{ run_id: runId, comentario, tipo }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Returns whether the currently authenticated user is an admin.
 * @returns {Promise<boolean>}
 */
export async function getCurrentUserIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from('maestros')
    .select('es_admin')
    .eq('user_id', user.id)
    .single();
  if (error || !data) return false;
  return data.es_admin === true;
}

/**
 * Update the estado of a schedule run.
 *
 * @param {string} runId   - UUID of the schedule run
 * @param {string} estado  - 'borrador' | 'revision' | 'publicado'
 * @returns {Promise<Object>} Updated schedule_run record
 */
export async function updateScheduleRunEstado(runId, estado) {
  const { data, error } = await supabase
    .from('schedule_runs')
    .update({ estado })
    .eq('id', runId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

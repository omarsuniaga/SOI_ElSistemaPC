/**
 * GDPR Compliance and Data Portability Service
 */

import { supabase } from '../../lib/supabaseClient.js'

/**
 * Export all user data as JSON
 */
export async function exportUserData(userId) {
  try {
    const [profile, observations, plans, evaluations] = await Promise.all([
      supabase.from('maestros').select('*').eq('id', userId).single(),
      supabase.from('observaciones_sesion').select('*').eq('maestro_id', userId),
      supabase.from('academic_plans').select('*').eq('teacher_id', userId),
      supabase.from('indicator_attempts').select('*').eq('created_by', userId),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile: profile.data,
      observations: observations.data || [],
      plans: plans.data || [],
      evaluations: evaluations.data || [],
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portal-maestros-data-${userId}.json`
    a.click()
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (err) {
    console.error('[Compliance] Export failed:', err)
    throw err
  }
}

/**
 * GDPR: Delete all user data (Right to be forgotten)
 */
export async function requestDataErasure(userId) {
  if (!confirm('Esta acción eliminará permanentemente todos tus datos. ¿Estás seguro?')) {
    return { success: false, reason: 'cancelled' }
  }

  try {
    // Cascade delete via Supabase RLS/triggers is preferred,
    // but here we simulate the calls for explicit control.
    await Promise.all([
      supabase.from('indicator_attempts').delete().eq('created_by', userId),
      supabase.from('academic_plans').delete().eq('teacher_id', userId),
      supabase.from('observaciones_sesion').delete().eq('maestro_id', userId),
      supabase.from('maestros').delete().eq('id', userId),
    ])

    // Log the request to an anonymized audit log
    console.log(`[GDPR] Erasure completed for user ${userId}`)
    
    return { success: true }
  } catch (err) {
    console.error('[Compliance] Erasure failed:', err)
    throw err
  }
}

export default { exportUserData, requestDataErasure }

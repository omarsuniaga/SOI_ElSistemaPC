import { supabase } from '../../../lib/supabaseClient.js'

export async function getTeacherFillingMetrics() {
  try {
    const { data, error } = await supabase
      .from('teacher_class_fill_metrics')
      .select('*')
      .order('maestro_nombre', { ascending: true })

    if (error) throw error

    return data || []
  } catch (err) {
    console.error('[getTeacherFillingMetrics] Error:', err)
    throw err
  }
}

export async function getFillingMetricsByMaestro(maestroId) {
  try {
    const { data, error } = await supabase
      .from('teacher_class_fill_metrics')
      .select('*')
      .eq('maestro_id', maestroId)
      .order('fecha', { ascending: false })

    if (error) throw error

    return data || []
  } catch (err) {
    console.error('[getFillingMetricsByMaestro] Error:', err)
    throw err
  }
}

export async function getFillingMetricsByDateRange(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('teacher_class_fill_metrics')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .order('fecha', { ascending: false })

    if (error) throw error

    return data || []
  } catch (err) {
    console.error('[getFillingMetricsByDateRange] Error:', err)
    throw err
  }
}

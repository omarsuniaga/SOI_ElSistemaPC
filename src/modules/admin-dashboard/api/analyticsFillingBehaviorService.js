import { supabase } from '../../../lib/supabaseClient.js'

export async function getTeacherFillingMetrics(startDate, endDate) {
  try {
    let query = supabase
      .from('teacher_class_fill_metrics_aggregated')
      .select('*')
      .order('maestro_nombre', { ascending: true })

    if (startDate) {
      query = query.gte('fecha_ultima_clase', startDate)
    }
    if (endDate) {
      query = query.lte('fecha_ultima_clase', endDate)
    }

    const { data, error } = await query

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

export async function getTeacherFillingMetricsPerSession(startDate, endDate) {
  try {
    let query = supabase
      .from('teacher_class_fill_metrics')
      .select('*')
      .order('fecha', { ascending: false })

    if (startDate) {
      query = query.gte('fecha', startDate)
    }
    if (endDate) {
      query = query.lte('fecha', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map(r => ({
      sesion_id: r.sesion_id,
      maestro_id: r.maestro_id,
      fecha: r.fecha,
      orden_llenado: r.orden_llenado,
      orden_asistencia_primero: r.orden_llenado === 'asistencia_primero' ? 1 : 0,
      orden_observaciones_primero: r.orden_llenado === 'observaciones_primero' ? 1 : 0,
      uso_ai_fill_percent: r.uso_ai_fill === 'si' ? 100 : 0,
      duracion_observaciones_segundos: r.duracion_observaciones_segundos || 0,
    }))
  } catch (err) {
    console.error('[getTeacherFillingMetricsPerSession] Error:', err)
    throw err
  }
}

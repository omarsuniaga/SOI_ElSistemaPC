export function aggregateMetricsByDate(metrics) {
  const byDate = {}

  metrics.forEach(m => {
    if (!byDate[m.fecha]) {
      byDate[m.fecha] = {
        total_classes: 0,
        asistencia_first: 0,
        ai_usage_sum: 0,
        observaciones_first: 0
      }
    }

    byDate[m.fecha].total_classes++
    if (m.orden_asistencia_primero === 1) byDate[m.fecha].asistencia_first++
    byDate[m.fecha].ai_usage_sum += m.uso_ai_fill_percent || 0
    if (m.orden_observaciones_primero === 1) byDate[m.fecha].observaciones_first++
  })

  const result = {}
  Object.entries(byDate).forEach(([date, counts]) => {
    result[date] = {
      total_classes: counts.total_classes,
      asistencia_first_percent: (counts.asistencia_first / counts.total_classes * 100).toFixed(1),
      avg_ai_usage_percent: (counts.ai_usage_sum / counts.total_classes).toFixed(1),
      observaciones_first_percent: (counts.observaciones_first / counts.total_classes * 100).toFixed(1)
    }
  })

  return result
}

export function aggregateMetricsByMaestro(metrics) {
  const byMaestro = {}

  metrics.forEach(m => {
    if (!byMaestro[m.maestro_id]) {
      byMaestro[m.maestro_id] = {
        maestro_nombre: m.maestro_nombre,
        total_classes: 0,
        asistencia_first: 0,
        ai_usage_sum: 0,
        avg_duration: 0,
        duration_count: 0
      }
    }

    byMaestro[m.maestro_id].total_classes++
    if (m.orden_asistencia_primero === 1) byMaestro[m.maestro_id].asistencia_first++
    byMaestro[m.maestro_id].ai_usage_sum += m.uso_ai_fill_percent || 0
    if (m.promedio_duracion_observaciones) {
      byMaestro[m.maestro_id].avg_duration += m.promedio_duracion_observaciones
      byMaestro[m.maestro_id].duration_count++
    }
  })

  const result = {}
  Object.entries(byMaestro).forEach(([maestroId, counts]) => {
    result[maestroId] = {
      maestro_nombre: counts.maestro_nombre,
      total_classes: counts.total_classes,
      asistencia_first_percent: (counts.asistencia_first / counts.total_classes * 100).toFixed(1),
      avg_ai_usage_percent: (counts.ai_usage_sum / counts.total_classes).toFixed(1),
      avg_observation_duration: counts.duration_count > 0
        ? (counts.avg_duration / counts.duration_count).toFixed(1)
        : 0
    }
  })

  return result
}

export function detectAnomalies(trend) {
  const anomalies = []
  const avgAiUsage = Object.values(trend).reduce((sum, t) => sum + parseFloat(t.avg_ai_usage_percent), 0) / Object.keys(trend).length

  Object.entries(trend).forEach(([date, metrics]) => {
    const aiUsage = parseFloat(metrics.avg_ai_usage_percent)

    if (aiUsage > avgAiUsage * 1.5) {
      anomalies.push({
        date,
        type: 'HIGH_AI_USAGE',
        value: aiUsage,
        threshold: (avgAiUsage * 1.5).toFixed(1)
      })
    }
  })

  return anomalies
}

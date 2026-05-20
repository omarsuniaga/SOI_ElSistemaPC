/**
 * Admin Reporting API - Historical performance and trend analysis
 * Provides data for director-level reports on teacher compliance
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { getTeacherFillingMetrics, getFillingMetricsByMaestro } from './analyticsFillingBehaviorService.js'
import * as trendService from './trendAnalysisService.js'

/**
 * Get comprehensive performance report for a single maestro
 * Includes: category transitions, trend, compliance metrics
 */
export async function getMaestroPerformanceReport(maestroId) {
  try {
    // Get current desempeño
    const { data: desempeño, error: dError } = await supabase
      .from('maestro_desempeño')
      .select('*')
      .eq('maestro_id', maestroId)
      .single()

    if (dError && dError.code !== 'PGRST116') {
      throw dError
    }

    // Get all registros (both pending and resolved)
    const { data: registros, error: rError } = await supabase
      .from('registros_pendientes')
      .select(
        `
        id,
        estado,
        tipo,
        created_at,
        updated_at,
        notification_state,
        notif_count,
        clases(nombre)
        `
      )
      .eq('maestro_id', maestroId)
      .order('created_at', { ascending: false })

    if (rError) {
      throw rError
    }

    // Get notification history
    const { data: notifications, error: nError } = await supabase
      .from('notificaciones')
      .select(
        `
        id,
        created_at,
        escalation_level,
        tipo,
        registro_pendiente_id
        `
      )
      .eq('maestro_id', maestroId)
      .like('tipo', '%escalation%')
      .order('created_at', { ascending: false })
      .limit(100)

    if (nError) {
      throw nError
    }

    // Calculate metrics
    const metrics = calculatePerformanceMetrics(registros || [])

    return {
      maestroId,
      desempeño: desempeño || null,
      registros: registros || [],
      notifications: notifications || [],
      metrics,
      generatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[getMaestroPerformanceReport] Error:', err)
    throw err
  }
}

/**
 * Calculate performance metrics from registros
 */
function calculatePerformanceMetrics(registros) {
  const total = registros.length
  const verde = registros.filter((r) => r.notification_state === 'VERDE').length
  const amarillo = registros.filter((r) => r.notification_state === 'AMARILLO').length
  const naranja = registros.filter((r) => r.notification_state === 'NARANJA').length
  const rojo = registros.filter((r) => r.notification_state === 'ROJO').length
  const resolved = registros.filter((r) => r.estado === 'resuelto').length

  const complianceRate = total > 0 ? ((verde + resolved) / total) * 100 : 0

  return {
    total,
    verde,
    amarillo,
    naranja,
    rojo,
    resolved,
    pending: total - resolved,
    complianceRate: complianceRate.toFixed(2),
    avgNotificationsPerSession:
      total > 0
        ? (registros.reduce((sum, r) => sum + (r.notif_count || 0), 0) / total).toFixed(1)
        : 0
  }
}

/**
 * Get institution-wide compliance summary (for director)
 */
export async function getInstitutionComplianceSummary() {
  try {
    const { data: allDesempeño, error } = await supabase
      .from('maestro_desempeño')
      .select(
        `
        id,
        maestro_id,
        maestros(nombre_completo),
        categoria,
        tendencia,
        total_sesiones,
        sesiones_verde,
        sesiones_amarillo,
        sesiones_naranja,
        sesiones_rojo,
        updated_at
        `
      )
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    // Group by category
    const byCategory = (allDesempeño || []).reduce(
      (acc, d) => {
        acc[d.categoria] = (acc[d.categoria] || 0) + 1
        return acc
      },
      {}
    )

    // Trend summary
    const byTrend = (allDesempeño || []).reduce(
      (acc, d) => {
        acc[d.tendencia] = (acc[d.tendencia] || 0) + 1
        return acc
      },
      {}
    )

    // Overall compliance rate
    const totalSessions = (allDesempeño || []).reduce((sum, d) => sum + d.total_sesiones, 0)
    const completedSessions = (allDesempeño || []).reduce((sum, d) => sum + d.sesiones_verde, 0)
    const overallComplianceRate =
      totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(2) : 0

    return {
      totalMaestros: allDesempeño?.length || 0,
      byCategory,
      byTrend,
      overallComplianceRate,
      totalSessions,
      completedSessions,
      data: allDesempeño || [],
      generatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[getInstitutionComplianceSummary] Error:', err)
    throw err
  }
}

/**
 * Get critical maestros report (NARANJA + ROJO for director attention)
 */
export async function getCriticalMaestrosReport() {
  try {
    // Get maestros with ongoing NARANJA or ROJO registros
    const { data: criticalRegistros, error: rError } = await supabase
      .from('registros_pendientes')
      .select(
        `
        id,
        maestro_id,
        notification_state,
        created_at,
        notif_count,
        maestros(nombre_completo)
        `
      )
      .in('notification_state', ['NARANJA', 'ROJO'])
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    if (rError) {
      throw rError
    }

    // Group by maestro and state
    const byMaestro = (criticalRegistros || []).reduce(
      (acc, reg) => {
        if (!acc[reg.maestro_id]) {
          acc[reg.maestro_id] = {
            maestroId: reg.maestro_id,
            nombre: reg.maestros?.nombre_completo,
            email: reg.maestros?.email,
            naranja: [],
            rojo: []
          }
        }

        if (reg.notification_state === 'NARANJA') {
          acc[reg.maestro_id].naranja.push(reg)
        } else {
          acc[reg.maestro_id].rojo.push(reg)
        }

        return acc
      },
      {}
    )

    // Build report
    const criticalMaestros = Object.values(byMaestro).map((m) => {
      const allRegistros = [...m.naranja, ...m.rojo]
      const oldestCreated = Math.max(
        ...allRegistros.map((r) => new Date(r.created_at).getTime())
      )
      const diasAtraso = Math.ceil((Date.now() - oldestCreated) / (1000 * 60 * 60 * 24))

      return {
        ...m,
        diasAtraso,
        naranjaCount: m.naranja.length,
        rojoCount: m.rojo.length,
        totalCount: allRegistros.length,
        urgency: m.rojo.length > 0 ? 'CRITICA' : 'ALTA'
      }
    })

    return {
      totalCritical: criticalMaestros.length,
      byUrgency: {
        critica: criticalMaestros.filter((m) => m.urgency === 'CRITICA').length,
        alta: criticalMaestros.filter((m) => m.urgency === 'ALTA').length
      },
      maestros: criticalMaestros.sort((a, b) => b.diasAtraso - a.diasAtraso),
      generatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[getCriticalMaestrosReport] Error:', err)
    throw err
  }
}

/**
 * Get trend analysis for a maestro over time
 */
export async function getMaestroTrendAnalysis(maestroId, daysBack = 30) {
  try {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()

    const { data: registros, error } = await supabase
      .from('registros_pendientes')
      .select(
        `
        id,
        created_at,
        notification_state,
        notif_count
        `
      )
      .eq('maestro_id', maestroId)
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Group by day and state
    const byDay = (registros || []).reduce(
      (acc, reg) => {
        const day = new Date(reg.created_at).toISOString().split('T')[0]
        if (!acc[day]) {
          acc[day] = { verde: 0, amarillo: 0, naranja: 0, rojo: 0, total: 0 }
        }
        acc[day][reg.notification_state.toLowerCase()]++
        acc[day].total++
        return acc
      },
      {}
    )

    // Convert to array
    const trend = Object.entries(byDay).map(([day, counts]) => ({
      day,
      ...counts
    }))

    return {
      maestroId,
      daysBack,
      trend,
      summary: {
        verde: (registros || []).filter((r) => r.notification_state === 'VERDE').length,
        amarillo: (registros || []).filter((r) => r.notification_state === 'AMARILLO').length,
        naranja: (registros || []).filter((r) => r.notification_state === 'NARANJA').length,
        rojo: (registros || []).filter((r) => r.notification_state === 'ROJO').length
      },
      generatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[getMaestroTrendAnalysis] Error:', err)
    throw err
  }
}

/**
 * Export report data (CSV format for director)
 */
export async function exportComplianceReport(format = 'csv') {
  try {
    const summary = await getInstitutionComplianceSummary()

    if (format === 'csv') {
      let csv = 'REPORTE DE CUMPLIMIENTO DE MAESTROS\n'
      csv += `Generado: ${new Date().toLocaleString()}\n\n`

      csv += 'RESUMEN GENERAL\n'
      csv += `Total de Maestros,${summary.totalMaestros}\n`
      csv += `Tasa de Cumplimiento,${summary.overallComplianceRate}%\n`
      csv += `Sesiones Completadas,${summary.completedSessions}/${summary.totalSessions}\n\n`

      csv += 'POR CATEGORÍA\n'
      csv += 'Categoría,Cantidad\n'
      Object.entries(summary.byCategory).forEach(([cat, count]) => {
        csv += `${cat},${count}\n`
      })

      csv += '\nPOR TENDENCIA\n'
      csv += 'Tendencia,Cantidad\n'
      Object.entries(summary.byTrend).forEach(([trend, count]) => {
        csv += `${trend},${count}\n`
      })

      return csv
    }

    return summary
  } catch (err) {
    console.error('[exportComplianceReport] Error:', err)
    throw err
  }
}

/**
 * Get maestro trend report with filling behavior analysis
 */
export async function getMaestroTrendReportWithFilling(maestroId, daysBack = 30) {
  try {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get notification trend (existing function)
    const notificationTrend = await getMaestroTrendAnalysis(maestroId, daysBack)

    // Get filling metrics
    const fillingMetrics = await getFillingMetricsByMaestro(maestroId)
    const recentFilling = fillingMetrics.filter(m => m.fecha >= since)

    // Analyze filling trends
    const fillingTrends = trendService.aggregateMetricsByDate(recentFilling)
    const anomalies = trendService.detectAnomalies(fillingTrends)

    return {
      maestroId,
      daysBack,
      notification_trend: notificationTrend,
      filling_trends: fillingTrends,
      anomalies,
      summary: {
        total_classes_analyzed: recentFilling.length,
        avg_ai_usage: recentFilling.length > 0
          ? (recentFilling.reduce((sum, m) => sum + (m.uso_ai_fill_percent || 0), 0) / recentFilling.length).toFixed(1)
          : 0,
        asistencia_first_percent: recentFilling.length > 0
          ? (recentFilling.filter(m => m.orden_asistencia_primero === 1).length / recentFilling.length * 100).toFixed(1)
          : 0
      },
      generatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[getMaestroTrendReportWithFilling] Error:', err)
    throw err
  }
}

/**
 * Get institution trend report with filling behavior analysis
 */
export async function getInstitutionTrendReportWithFilling(daysBack = 30) {
  try {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get all filling metrics
    const allMetrics = await getTeacherFillingMetrics()
    const recentMetrics = allMetrics.filter(m => m.fecha >= since)

    // Aggregate by date and by maestro
    const dateAggregation = trendService.aggregateMetricsByDate(recentMetrics)
    const maestroAggregation = trendService.aggregateMetricsByMaestro(recentMetrics)

    return {
      daysBack,
      total_classes: recentMetrics.length,
      total_maestros: Object.keys(maestroAggregation).length,
      date_trends: dateAggregation,
      maestro_trends: maestroAggregation,
      institution_summary: {
        avg_ai_usage_institution: recentMetrics.length > 0
          ? (recentMetrics.reduce((sum, m) => sum + (m.uso_ai_fill_percent || 0), 0) / recentMetrics.length).toFixed(1)
          : 0,
        asistencia_first_percent: recentMetrics.length > 0
          ? (recentMetrics.filter(m => m.orden_asistencia_primero === 1).length / recentMetrics.length * 100).toFixed(1)
          : 0,
        observaciones_first_percent: recentMetrics.length > 0
          ? (recentMetrics.filter(m => m.orden_observaciones_primero === 1).length / recentMetrics.length * 100).toFixed(1)
          : 0
      },
      generatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[getInstitutionTrendReportWithFilling] Error:', err)
    throw err
  }
}

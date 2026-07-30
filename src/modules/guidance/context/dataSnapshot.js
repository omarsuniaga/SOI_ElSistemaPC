/**
 * dataSnapshot.js — Lightweight data queries for Guidance Engine.
 *
 * Performs minimal queries to determine context state.
 * Uses DataAdapter when available, falls back to Supabase RPC.
 *
 * @module guidance/context
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Get preinscriptions pending validation for today.
 * @returns {Promise<{count: number, items: Array}>}
 */
export async function getPendingPreinscriptions() {
  try {
    const { data, error } = await supabase
      .from('preinscripciones')
      .select('id, nombre, apellido, grado, seccion, documentos_completos')
      .eq('estado', 'pendiente')
      .limit(50)

    if (error) throw error
    return {
      count: data?.length ?? 0,
      items: data ?? [],
      hasIncompleteFiles: data?.some(p => !p.documentos_completos) ?? false,
    }
  } catch {
    return { count: 0, items: [], hasIncompleteFiles: false }
  }
}

/**
 * Get attendance summary for current user's groups today.
 * @returns {Promise<Object>}
 */
export async function getAttendanceSummary() {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const isAfter9am = now.getHours() >= 9

    const { data, error } = await supabase
      .from('asistencia')
      .select('id, alumno_id, estado, observaciones')
      .eq('fecha', today)
      .limit(100)

    if (error) throw error

    const total = data?.length ?? 0
    const present = data?.filter(a => a.estado === 'presente').length ?? 0
    const absent = data?.filter(a => a.estado === 'ausente').length ?? 0

    return {
      total,
      present,
      absent,
      allMarked: total > 0 && (present + absent) === total,
      hasAbsences: absent > 0,
      isAfter9am,
      noStudentsLoaded: total === 0,
    }
  } catch {
    return {
      total: 0, present: 0, absent: 0,
      allMarked: false, hasAbsences: false, isAfter9am: false,
      noStudentsLoaded: true,
    }
  }
}

/**
 * Get grades summary for current user's groups.
 * @returns {Promise<Object>}
 */
export async function getGradesSummary() {
  try {
    const { data, error } = await supabase
      .from('calificaciones')
      .select('id, alumno_id, nota, evaluacion_id')
      .limit(100)

    if (error) throw error

    return {
      count: data?.length ?? 0,
      hasEmptyGrades: data?.some(g => g.nota === null || g.nota === undefined) ?? false,
      gradeBelowMinimum: data?.some(g => g.nota !== null && g.nota < 0) ?? false,
      hasPendingEvaluations: (data?.length ?? 0) === 0,
    }
  } catch {
    return { count: 0, hasEmptyGrades: false, gradeBelowMinimum: false, hasPendingEvaluations: false }
  }
}

/**
 * Get planning status for current user.
 * @returns {Promise<Object>}
 */
export async function getPlanningStatus() {
  try {
    const { data, error } = await supabase
      .from('planificaciones')
      .select('id, estado, fecha_inicio, fecha_fin')
      .order('fecha_inicio', { ascending: false })
      .limit(20)

    if (error) throw error

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay())
    const weekEnd = new Date(thisWeek)
    weekEnd.setDate(weekEnd.getDate() + 6)

    return {
      count: data?.length ?? 0,
      hasUnapprovedPlans: data?.some(p => p.estado === 'borrador') ?? false,
      noPlansThisWeek: !data?.some(p => {
        const start = new Date(p.fecha_inicio)
        return start >= thisWeek && start <= weekEnd
      }),
    }
  } catch {
    return { count: 0, hasUnapprovedPlans: false, noPlansThisWeek: true }
  }
}

/**
 * Get metrics summary.
 * @returns {Promise<Object>}
 */
export async function getMetricsSummary() {
  try {
    const { data, error } = await supabase
      .from('metricas')
      .select('id, nombre, valor, fecha_actualizacion')
      .limit(20)

    if (error) throw error

    const lastUpdate = data?.[0]?.fecha_actualizacion
    const dataIsStale = lastUpdate
      ? (Date.now() - new Date(lastUpdate).getTime()) > 24 * 60 * 60 * 1000
      : true

    return {
      count: data?.length ?? 0,
      hasLowPerformance: data?.some(m => m.valor < 60) ?? false,
      dataIsStale,
    }
  } catch {
    return { count: 0, hasLowPerformance: false, dataIsStale: true }
  }
}

/**
 * Data fetcher function compatible with createContextProvider.
 * Routes to the correct query based on view.
 * @param {string} view
 * @returns {Promise<Object>}
 */
export async function viewDataFetcher(view) {
  const fetchers = {
    hoy: async () => {
      const [preinscripciones, asistencia] = await Promise.all([
        getPendingPreinscriptions(),
        getAttendanceSummary(),
      ])
      return {
        hasNewStudents: preinscripciones.count > 0,
        isAfter9am: asistencia.isAfter9am,
        hasPendingEvaluations: false,
        ...asistencia,
        preinscripcionCount: preinscripciones.count,
      }
    },
    asistencia: getAttendanceSummary,
    calificaciones: getGradesSummary,
    planificacion: getPlanningStatus,
    metricas: getMetricsSummary,
    preinscritos: getPendingPreinscriptions,
  }

  const fetcher = fetchers[view]
  return fetcher ? fetcher() : {}
}

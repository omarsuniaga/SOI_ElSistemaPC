/**
 * hermesContextAggregator.js — Multidimensional Data Aggregator for Hermes
 *
 * Compiles institutional state across modules (tasks, procedures, departments,
 * metrics) into a unified context object for deterministic and LLM querying.
 */

import * as tareasApi from './tareasApi.js'

export const DEPARTAMENTOS_MAP = {
  DIR: 'Dirección General',
  ACM: 'Coordinación Académica',
  ADM: 'Administración',
  FIN: 'Finanzas y Cobranzas',
  LOG: 'Logística y Operaciones',
  COM: 'Comunicaciones y Difusión',
  TECNICO: 'Soporte Técnico',
  LUT: 'Lutería y Mantenimiento',
}

/**
 * Gathers and structures the full operational context of the institution.
 * @returns {Promise<object>}
 */
export async function getHermesOperationalContext() {
  const [snapshot, rawProcedimientos, allTareas] = await Promise.all([
    tareasApi.getConsultaEstado().catch(() => null),
    tareasApi.getProcedimientos().catch(() => []),
    tareasApi.getTareas().catch(() => []),
  ])

  const defaultTareas = { total: 0, pendiente: 0, en_progreso: 0, bloqueada: 0, observada: 0, completada: 0 }
  const tareasStats = snapshot?.tareas || defaultTareas
  const procedimientos = Array.isArray(rawProcedimientos) ? rawProcedimientos : []
  const tareas = Array.isArray(allTareas) ? allTareas : []

  // Compute department breakdown
  const porDepartamento = Object.entries(DEPARTAMENTOS_MAP).map(([codigo, nombre]) => {
    const deptTareas = tareas.filter((t) => (t.departamento || '').toUpperCase() === codigo)
    const abiertas = deptTareas.filter((t) => ['pendiente', 'en_progreso', 'bloqueada', 'observada'].includes(t.estado)).length
    const pendientes = deptTareas.filter((t) => t.estado === 'pendiente').length
    const bloqueadas = deptTareas.filter((t) => t.estado === 'bloqueada').length
    const completadas = deptTareas.filter((t) => t.estado === 'completada').length
    const total = deptTareas.length
    const pctAvance = total > 0 ? Math.round((completadas / total) * 100) : 100

    return {
      codigo,
      nombre,
      total,
      abiertas,
      pendientes,
      bloqueadas,
      completadas,
      pctAvance,
    }
  })

  // Urgent/Critical blockers
  const atencionInmediata = (snapshot?.atencion_inmediata || []).map((t) => ({
    id: t.id,
    caso_id: t.caso_id || t.evento_id || null,
    titulo: t.titulo || 'Tarea sin título',
    departamento: t.departamento,
    deptoNombre: DEPARTAMENTOS_MAP[t.departamento] || t.departamento,
    estado: t.estado,
    prioridad: t.prioridad || 'alta',
    fecha_limite: t.fecha_limite || null,
  }))

  // Overall Health calculation
  const totalAbiertas = tareasStats.pendiente + tareasStats.en_progreso + tareasStats.bloqueada + tareasStats.observada
  const tasaBloqueo = totalAbiertas > 0 ? Math.round((tareasStats.bloqueada / totalAbiertas) * 100) : 0

  let saludGeneral = 'optima'
  const puntosCriticos = []

  if (tareasStats.bloqueada > 0) {
    saludGeneral = tareasStats.bloqueada >= 3 ? 'critica' : 'alerta'
    puntosCriticos.push(`${tareasStats.bloqueada} tarea(s) en estado bloqueado`)
  }

  const deptosConBloqueo = porDepartamento.filter((d) => d.bloqueadas > 0)
  deptosConBloqueo.forEach((d) => {
    puntosCriticos.push(`${d.nombre}: ${d.bloqueadas} tarea(s) bloqueadas`)
  })

  return {
    timestamp: new Date().toISOString(),
    totalProcedimientos: snapshot?.total_procedimientos || procedimientos.length,
    procedimientos,
    tareas: tareasStats,
    atencionInmediata,
    porDepartamento,
    tasaBloqueo,
    saludGeneral,
    puntosCriticos,
  }
}

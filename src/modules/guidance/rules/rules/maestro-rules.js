/**
 * maestro-rules.js — Concrete business rules for Portal de Maestros.
 *
 * Each rule has a condition function that evaluates context + data.
 * Rules are organized by category: proactive, reactive, alert.
 *
 * @module guidance/rules
 */

/**
 * Proactive rules — shown as inline hints automatically.
 * Max 3 shown at once (top critical/high).
 */
export const PROACTIVE_RULES = [
  {
    id: 'maestro-att-time',
    category: 'proactive',
    priority: 'high',
    process: 'control_asistencia',
    condition: (_ctx, data) => data.isAfter9am && !data.allMarked && data.total > 0,
    message: 'Ya pasaron las 9 AM y la asistencia no está completa.',
    action: 'Cargá la asistencia de tus alumnos ahora para mantener el registro al día.',
    views: ['asistencia', 'hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-preinscritos-new',
    category: 'proactive',
    priority: 'critical',
    process: 'preinscripciones',
    condition: (_ctx, data) => data.hasNewStudents,
    message: 'Tenés alumnos nuevos preinscritos para hoy.',
    action: 'Revisá la lista de preinscritos y validá cada uno.',
    views: ['hoy', 'preinscritos'],
    roles: ['maestro', 'coordinador'],
  },
  {
    id: 'maestro-plan-missing',
    category: 'proactive',
    priority: 'medium',
    process: 'planificacion',
    condition: (_ctx, data) => data.noPlansThisWeek,
    message: 'No tenés planificaciones para esta semana.',
    action: 'Creá las planificaciones de la semana para mantener el seguimiento pedagógógico.',
    views: ['planificacion', 'hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-grades-empty',
    category: 'proactive',
    priority: 'medium',
    process: 'calificaciones',
    condition: (_ctx, data) => data.hasEmptyGrades,
    message: 'Hay campos de calificación vacíos pendientes.',
    action: 'Completá todas las calificaciones o marcá "N/A" si el alumno no fue evaluado.',
    views: ['calificaciones'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-onboarding-hoy',
    category: 'proactive',
    priority: 'high',
    process: 'onboarding',
    condition: (ctx) => ctx.isFirstVisit,
    message: '¡Bienvenido a la Vista del Día!',
    action: 'Revisá los preinscritos del día, cargá asistencia y consultá las métricas.',
    views: ['hoy'],
    roles: ['*'],
  },
  {
    id: 'maestro-onboarding-asistencia',
    category: 'proactive',
    priority: 'high',
    process: 'onboarding',
    condition: (ctx) => ctx.isFirstVisit,
    message: '¡Esta es la vista de Asistencia!',
    action: 'Seleccioná el grupo, marcá presente/ausente y guardá antes de salir.',
    views: ['asistencia'],
    roles: ['*'],
  },
]

/**
 * Reactive rules — shown in panel when user asks "¿Qué puedo hacer acá?"
 */
export const REACTIVE_RULES = [
  {
    id: 'maestro-absence-justification',
    category: 'reactive',
    priority: 'medium',
    process: 'control_asistencia',
    condition: (_ctx, data) => data.hasAbsences,
    message: 'Algunos alumnos están ausentes.',
    action: 'Si tenés justificación, registrala en observaciones.',
    views: ['asistencia'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-pre-docs-incomplete',
    category: 'reactive',
    priority: 'high',
    process: 'preinscripciones',
    condition: (_ctx, data) => data.hasIncompleteFiles,
    message: 'Algunas preinscripciones tienen documentos incompletos.',
    action: 'Solicitá los documentos faltantes al padre o encargado.',
    views: ['preinscritos'],
    roles: ['maestro', 'coordinador'],
  },
  {
    id: 'maestro-grades-negative',
    category: 'reactive',
    priority: 'high',
    process: 'calificaciones',
    condition: (_ctx, data) => data.gradeBelowMinimum,
    message: 'Detecté una calificación con valor negativo.',
    action: 'Verificá que la calificación sea correcta. El rango válido es 0-100.',
    views: ['calificaciones'],
    roles: ['maestro'],
  },
  {
    id: 'maestro-plan-unapproved',
    category: 'reactive',
    priority: 'high',
    process: 'planificacion',
    condition: (_ctx, data) => data.hasUnapprovedPlans,
    message: 'Tenés planificaciones en borrador sin aprobar.',
    action: 'Enviálas al coordinador para que las revise.',
    views: ['planificacion'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-metrics-low',
    category: 'reactive',
    priority: 'medium',
    process: 'metricas',
    condition: (_ctx, data) => data.hasLowPerformance,
    message: 'Algunas métricas están por debajo del umbral.',
    action: 'Revisá los reportes de rendimiento y considerá estrategias de mejora.',
    views: ['metricas'],
    roles: ['maestro', 'coordinador'],
  },
  {
    id: 'maestro-metrics-stale',
    category: 'reactive',
    priority: 'low',
    process: 'metricas',
    condition: (_ctx, data) => data.dataIsStale,
    message: 'Los datos de métricas no se actualizaron hoy.',
    action: 'Refrescá la vista para ver información actual.',
    views: ['metricas'],
    roles: ['maestro', 'coordinador'],
  },
]

/**
 * Alert rules — shown as smart alerts (Fase 5).
 */
export const ALERT_RULES = [
  {
    id: 'maestro-att-critical-late',
    category: 'alert',
    priority: 'critical',
    process: 'control_asistencia',
    condition: (_ctx, data) => data.isAfter9am && data.noStudentsLoaded,
    message: 'No cargaste asistencia hoy y ya son más de las 9 AM.',
    action: 'Cargá la asistencia AHORA para no perder el registro del día.',
    views: ['hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-preinscritos-unvalidated',
    category: 'alert',
    priority: 'high',
    process: 'preinscripciones',
    condition: (_ctx, data) => data.hasNewStudents && data.preinscripcionCount > 3,
    message: `Tenés ${'{count}'} preinscripciones sin validar.`,
    action: 'Validalas cuanto antes para no perder la oportunidad de asignar grupo.',
    views: ['hoy'],
    roles: ['maestro', 'coordinador'],
  },
]

/**
 * Get all maestro rules (proactive + reactive + alerts).
 * @returns {import('./rulesEngine.js').GuidanceRule[]}
 */
export function getAllMaestroRules() {
  return [...PROACTIVE_RULES, ...REACTIVE_RULES, ...ALERT_RULES]
}

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
    action: 'Registre la asistencia de sus alumnos ahora para mantener el registro al día.',
    views: ['asistencia', 'hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-preinscritos-new',
    category: 'proactive',
    priority: 'critical',
    process: 'preinscripciones',
    condition: (_ctx, data) => data.hasNewStudents,
    message: 'Hay alumnos nuevos preinscritos para hoy.',
    action: 'Revise la lista de preinscritos y valide cada uno.',
    views: ['hoy', 'preinscritos'],
    roles: ['maestro', 'coordinador'],
  },
  {
    id: 'maestro-plan-missing',
    category: 'proactive',
    priority: 'medium',
    process: 'planificacion',
    condition: (_ctx, data) => data.noPlansThisWeek,
    message: 'No tiene planificaciones para esta semana.',
    action: 'Cree las planificaciones de la semana para mantener el seguimiento pedagógico.',
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
    action: 'Complete todas las calificaciones o marque "N/A" si el alumno no fue evaluado.',
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
    action: 'Revise los preinscritos del día, registre asistencia y consulte las métricas.',
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
    action: 'Seleccione el grupo, marque presente/ausente y guarde antes de salir.',
    views: ['asistencia'],
    roles: ['*'],
  },
]

/**
 * Reactive rules — shown in panel when user asks "¿Qué puedo hacer aquí?"
 */
export const REACTIVE_RULES = [
  {
    id: 'maestro-absence-justification',
    category: 'reactive',
    priority: 'medium',
    process: 'control_asistencia',
    condition: (_ctx, data) => data.hasAbsences,
    message: 'Algunos alumnos están ausentes.',
    action: 'Si cuenta con justificación, regístrela en observaciones.',
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
    action: 'Solicite los documentos faltantes al representante.',
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
    action: 'Verifique que la calificación sea correcta. El rango válido es 0-100.',
    views: ['calificaciones'],
    roles: ['maestro'],
  },
  {
    id: 'maestro-plan-unapproved',
    category: 'reactive',
    priority: 'high',
    process: 'planificacion',
    condition: (_ctx, data) => data.hasUnapprovedPlans,
    message: 'Tiene planificaciones en borrador sin aprobar.',
    action: 'Envíelas al coordinador para que las revise.',
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
    action: 'Revise los reportes de rendimiento y considere estrategias de mejora.',
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
    action: 'Actualice la vista para ver información actual.',
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
    message: 'No ha registrado asistencia hoy y ya son más de las 9 AM.',
    action: 'Registre la asistencia AHORA para no perder el registro del día.',
    views: ['hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'maestro-preinscritos-unvalidated',
    category: 'alert',
    priority: 'high',
    process: 'preinscripciones',
    condition: (_ctx, data) => data.hasNewStudents && data.preinscripcionCount > 3,
    message: `Tiene ${'{count}'} preinscripciones sin validar.`,
    action: 'Valídelas cuanto antes para no perder la oportunidad de asignar grupo.',
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

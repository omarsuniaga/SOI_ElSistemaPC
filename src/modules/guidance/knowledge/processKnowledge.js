/**
 * processKnowledge.js — Converts 62 SOI institutional processes into
 * structured guidance rules the Rules Engine can evaluate.
 *
 * Source: src/modules/hermes/data/soiProcessIndex.js
 *
 * @module guidance/knowledge
 */

/**
 * @typedef {Object} ProcessRule
 * @property {string}  id          - Unique rule id
 * @property {string}  process     - Parent process name
 * @property {string}  trigger     - When this rule fires (event or condition)
 * @property {string}  message     - User-facing hint
 * @property {string}  action      - What the user should do
 * @property {string}  priority    - 'critical' | 'high' | 'medium' | 'low'
 * @property {string[]} views      - Views where this rule applies ('*' = all)
 * @property {string[]} roles      - Roles this applies to ('*' = all)
 */

/** Process rules derived from the 62 institutional processes */
export const PROCESS_RULES = [
  // ── Attendance Process ──────────────────────────────────────────
  {
    id: 'att-mark-before-close',
    process: 'control_asistencia',
    trigger: 'view:asistencia:after_9am',
    message: 'Deberías haber registrado la asistencia antes de las 9 AM.',
    action: 'Cargá la asistencia de tus alumnos ahora para mantener el registro al día.',
    priority: 'high',
    views: ['asistencia', 'hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'att-absence-justification',
    process: 'control_asistencia',
    trigger: 'data:hasAbsences',
    message: 'Algunos alumnos están marcados como ausentes.',
    action: 'Si tenés justificación de la ausencia, registrala en el campo de observaciones.',
    priority: 'medium',
    views: ['asistencia'],
    roles: ['maestro', 'maestra_suplente'],
  },

  // ── Preinscriptions Process ─────────────────────────────────────
  {
    id: 'pre-validate-new',
    process: 'preinscripciones',
    trigger: 'data:hasNewStudents',
    message: 'Tenés nuevas preinscripciones pendientes de validación.',
    action: 'Revisá los documentos y validá cada preinscripción antes de asignar grupo.',
    priority: 'critical',
    views: ['preinscritos', 'hoy'],
    roles: ['maestro', 'coordinador'],
  },
  {
    id: 'pre-documents-incomplete',
    process: 'preinscripciones',
    trigger: 'data:hasIncompleteFiles',
    message: 'Algunas preinscripciones tienen documentos incompletos.',
    action: 'Solicitá los documentos faltantes al padre o encargado.',
    priority: 'high',
    views: ['preinscritos'],
    roles: ['maestro', 'coordinador', 'admin'],
  },

  // ── Grades Process ──────────────────────────────────────────────
  {
    id: 'grades-complete-entry',
    process: 'calificaciones',
    trigger: 'data:hasEmptyGrades',
    message: 'Hay campos de calificación vacíos pendientes.',
    action: 'Completá todas las calificaciones o marcá "N/A" si el alumno no fue evaluado.',
    priority: 'medium',
    views: ['calificaciones'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'grades-negative-check',
    process: 'calificaciones',
    trigger: 'data:gradeBelowMinimum',
    message: 'Detecté una calificación con valor negativo.',
    action: 'Verificá que la calificación sea correcta. El rango válido es 0-100.',
    priority: 'high',
    views: ['calificaciones'],
    roles: ['maestro', 'maestra_suplente'],
  },

  // ── Planning Process ────────────────────────────────────────────
  {
    id: 'plan-approval-pending',
    process: 'planificacion',
    trigger: 'data:hasUnapprovedPlans',
    message: 'Tenés planificaciones en estado borrador que necesitan aprobación.',
    action: 'Enviálas al coordinador para que las revise y apruebe.',
    priority: 'high',
    views: ['planificacion'],
    roles: ['maestro', 'maestra_suplente'],
  },
  {
    id: 'plan-week-missing',
    process: 'planificacion',
    trigger: 'data:noPlansThisWeek',
    message: 'No tenés planificaciones para esta semana.',
    action: 'Creá las planificaciones de la semana para mantener el seguimiento pedagógico.',
    priority: 'medium',
    views: ['planificacion', 'hoy'],
    roles: ['maestro', 'maestra_suplente'],
  },

  // ── Student Records Process ─────────────────────────────────────
  {
    id: 'student-incomplete-record',
    process: 'estudiantes',
    trigger: 'data:hasMissingInfo',
    message: 'Algunos registros de estudiantes tienen información incompleta.',
    action: 'Actualizá los datos faltantes: contacto, dirección o información médica.',
    priority: 'medium',
    views: ['estudiantes'],
    roles: ['maestro', 'coordinador'],
  },

  // ── Evaluations Process ─────────────────────────────────────────
  {
    id: 'eval-upcoming-prep',
    process: 'evaluaciones',
    trigger: 'data:hasUpcomingEvals',
    message: 'Tenés evaluaciones próximas programadas.',
    action: 'Prepará los materiales y comunicá a los alumnos la fecha y contenido.',
    priority: 'medium',
    views: ['evaluaciones'],
    roles: ['maestro', 'maestra_suplente'],
  },

  // ── Metrics Process ─────────────────────────────────────────────
  {
    id: 'metrics-low-performance',
    process: 'metricas',
    trigger: 'data:hasLowPerformance',
    message: 'Algunas métricas están por debajo del umbral esperado.',
    action: 'Revisá los reportes de rendimiento y considerá estrategias de mejora.',
    priority: 'high',
    views: ['metricas'],
    roles: ['maestro', 'coordinador', 'admin'],
  },
  {
    id: 'metrics-data-stale',
    process: 'metricas',
    trigger: 'data:dataIsStale',
    message: 'Los datos de métricas no se actualizaron recientemente.',
    action: 'Refrescá la vista o contactá al administrador para sincronizar datos.',
    priority: 'low',
    views: ['metricas'],
    roles: ['maestro', 'coordinador', 'admin'],
  },

  // ── Onboarding Hints (first-visit) ──────────────────────────────
  {
    id: 'onboarding-hoy',
    process: 'onboarding',
    trigger: 'context:isFirstVisit',
    message: '¡Bienvenido a la Vista del Día!',
    action: 'Revisá los preinscritos del día, cargá asistencia y consultá las métricas.',
    priority: 'high',
    views: ['hoy'],
    roles: ['*'],
  },
  {
    id: 'onboarding-asistencia',
    process: 'onboarding',
    trigger: 'context:isFirstVisit',
    message: '¡Esta es la vista de Asistencia!',
    action: 'Seleccioná el grupo, marcá presente/ausente y guardá antes de salir.',
    priority: 'high',
    views: ['asistencia'],
    roles: ['*'],
  },
]

/**
 * Get rules applicable to a specific view.
 * @param {string} viewId
 * @param {string} [role]
 * @returns {ProcessRule[]}
 */
export function getRulesForView(viewId, role) {
  return PROCESS_RULES.filter(rule => {
    const viewMatch = rule.views.includes('*') || rule.views.includes(viewId)
    const roleMatch = !role || rule.roles.includes('*') || rule.roles.includes(role)
    return viewMatch && roleMatch
  })
}

/**
 * Get rules by priority level.
 * @param {'critical'|'high'|'medium'|'low'} priority
 * @returns {ProcessRule[]}
 */
export function getRulesByPriority(priority) {
  return PROCESS_RULES.filter(r => r.priority === priority)
}

/**
 * Get all unique process names.
 * @returns {string[]}
 */
export function getProcessNames() {
  return [...new Set(PROCESS_RULES.map(r => r.process))]
}

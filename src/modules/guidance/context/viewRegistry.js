/**
 * viewRegistry.js — Static registry mapping views to applicable guidance rules.
 *
 * Each view definition specifies:
 * - viewId: matches the route key from portalRoutes.js
 * - label: Human-readable view name
 * - primaryAction: The most important action in this view
 * - criticalRules: Array of rule ids that ALWAYS fire in this view
 * - contextualTips: Array of {condition, tip} pairs (reactive hints)
 *
 * @module guidance/context
 */

/** @type {ViewDefinition[]} */
export const VIEWS = [
  {
    viewId: 'hoy',
    label: 'Vista del Día',
    primaryAction: 'daily_check',
    criticalRules: ['always_check_preinscritos', 'attendance_before_9am'],
    contextualTips: [
      {
        condition: 'hasNewStudents',
        tip: 'Hay alumnos nuevos preinscritos para hoy. Revise la lista de preinscritos antes de empezar.',
      },
      {
        condition: 'isAfter9am',
        tip: 'Ya pasaron las 9 AM. Si no ha registrado asistencia, hágalo ahora para no perder el registro.',
      },
      {
        condition: 'hasPendingEvaluations',
        tip: 'Hay evaluaciones pendientes de calificar. Revise la sección de métricas.',
      },
    ],
  },
  {
    viewId: 'asistencia',
    label: 'Control de Asistencia',
    primaryAction: 'take_attendance',
    criticalRules: ['mark_attendance_before_end_of_day', 'absence_needs_justification'],
    contextualTips: [
      {
        condition: 'allMarked',
        tip: 'Se han cargado todos los alumnos. Recuerde guardar antes de salir.',
      },
      {
        condition: 'hasAbsences',
        tip: 'Algunos alumnos están marcados como ausentes. Si cuenta con justificación, regístrela.',
      },
      {
        condition: 'noStudentsLoaded',
        tip: 'No hay alumnos cargados para esta sección. Verifique que haya seleccionado el grado y sección correctos.',
      },
    ],
  },
  {
    viewId: 'calificaciones',
    label: 'Calificaciones',
    primaryAction: 'enter_grades',
    criticalRules: ['grade_entry_requires_evaluation_id', 'grades_cannot_be_negative'],
    contextualTips: [
      {
        condition: 'hasEmptyGrades',
        tip: 'Hay campos de calificación vacíos. Si el alumno no fue evaluado, déjelo en blanco o marque "N/A".',
      },
      {
        condition: 'gradeBelowMinimum',
        tip: 'Una calificación es menor al mínimo permitido (0). Verifique que sea correcta.',
      },
    ],
  },
  {
    viewId: 'planificacion',
    label: 'Planificación',
    primaryAction: 'plan_lessons',
    criticalRules: ['planning_requires_approval', 'planning_must_align_with_program'],
    contextualTips: [
      {
        condition: 'hasUnapprovedPlans',
        tip: 'Tiene planificaciones pendientes de aprobación. Revíselas con el coordinador.',
      },
      {
        condition: 'noPlansThisWeek',
        tip: 'No tiene planificaciones para esta semana. Créelas para mantener el seguimiento.',
      },
    ],
  },
  {
    viewId: 'metricas',
    label: 'Métricas',
    primaryAction: 'view_metrics',
    criticalRules: ['metrics_requires_approval_for_export'],
    contextualTips: [
      {
        condition: 'hasLowPerformance',
        tip: 'Algunas métricas están por debajo del umbral. Revise los alumnos con bajo rendimiento.',
      },
      {
        condition: 'dataIsStale',
        tip: 'Los datos no se actualizaron hoy. Actualice la vista para ver información actual.',
      },
    ],
  },
  {
    viewId: 'preinscritos',
    label: 'Preinscritos',
    primaryAction: 'manage_preinscriptions',
    criticalRules: ['preinscriptions_need_validation', 'preinscriptions_need_documents'],
    contextualTips: [
      {
        condition: 'hasIncompleteFiles',
        tip: 'Algunas preinscripciones tienen archivos incompletos. Complételas antes de procesar.',
      },
    ],
  },
  {
    viewId: 'estudiantes',
    label: 'Estudiantes',
    primaryAction: 'manage_students',
    criticalRules: ['student_records_must_be_complete'],
    contextualTips: [
      {
        condition: 'hasMissingInfo',
        tip: 'Algunos registros de estudiantes tienen información faltante. Complételos para mantener la base de datos.',
      },
    ],
  },
  {
    viewId: 'evaluaciones',
    label: 'Evaluaciones',
    primaryAction: 'manage_evaluations',
    criticalRules: ['evaluations_must_have_date'],
    contextualTips: [
      {
        condition: 'hasUpcomingEvals',
        tip: 'Tiene evaluaciones próximas. Prepare los materiales y comuníquelo a los alumnos.',
      },
    ],
  },
]

/**
 * Get a view definition by its id.
 * @param {string} viewId
 * @returns {ViewDefinition|undefined}
 */
export function getViewDefinition(viewId) {
  return VIEWS.find(v => v.viewId === viewId)
}

/**
 * Get all view ids.
 * @returns {string[]}
 */
export function getAllViewIds() {
  return VIEWS.map(v => v.viewId)
}

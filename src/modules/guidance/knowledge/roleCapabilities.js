/**
 * roleCapabilities.js — Maps (role × view) to available actions.
 *
 * Determines what a user CAN do in a given view based on their role.
 * Used by Guidance Panel to show "Available Actions" section.
 *
 * @module guidance/knowledge
 */

/**
 * @typedef {Object} Capability
 * @property {string} action   - Action key (matches portal action)
 * @property {string} label    - Human-readable label (Spanish)
 * @property {string} icon     - Bootstrap icon class
 * @property {string} priority - 'primary' | 'secondary'
 */

/** @type {Record<string, Record<string, Capability[]>>} */
export const ROLE_VIEW_CAPABILITIES = {
  // ── Maestro ───────────────────────────────────────────────────
  maestro: {
    hoy: [
      { action: 'view_preinscritos', label: 'Ver preinscritos del día', icon: 'bi-person-plus', priority: 'primary' },
      { action: 'take_attendance', label: 'Ir a Asistencia', icon: 'bi-clipboard-check', priority: 'primary' },
      { action: 'view_metrics', label: 'Ver Métricas', icon: 'bi-graph-up', priority: 'secondary' },
    ],
    asistencia: [
      { action: 'mark_present', label: 'Marcar presente', icon: 'bi-check-circle', priority: 'primary' },
      { action: 'mark_absent', label: 'Marcar ausente', icon: 'bi-x-circle', priority: 'primary' },
      { action: 'add_observation', label: 'Agregar observación', icon: 'bi-pencil', priority: 'secondary' },
    ],
    calificaciones: [
      { action: 'enter_grade', label: 'Ingresar calificación', icon: 'bi-input-cursor-text', priority: 'primary' },
      { action: 'view_history', label: 'Ver historial', icon: 'bi-clock-history', priority: 'secondary' },
    ],
    planificacion: [
      { action: 'create_plan', label: 'Crear planificación', icon: 'bi-plus-circle', priority: 'primary' },
      { action: 'submit_for_approval', label: 'Enviar para aprobación', icon: 'bi-send', priority: 'secondary' },
    ],
    metricas: [
      { action: 'view_reports', label: 'Ver reportes', icon: 'bi-file-bar-graph', priority: 'primary' },
      { action: 'export_report', label: 'Exportar reporte', icon: 'bi-download', priority: 'secondary' },
    ],
    preinscritos: [
      { action: 'validate_preinscripcion', label: 'Validar preinscripción', icon: 'bi-check2-square', priority: 'primary' },
      { action: 'request_documents', label: 'Solicitar documentos', icon: 'bi-file-earmark', priority: 'secondary' },
    ],
    estudiantes: [
      { action: 'view_student', label: 'Ver detalle', icon: 'bi-person', priority: 'primary' },
      { action: 'edit_student', label: 'Editar registro', icon: 'bi-pencil-square', priority: 'secondary' },
    ],
    evaluaciones: [
      { action: 'create_evaluation', label: 'Crear evaluación', icon: 'bi-journal-plus', priority: 'primary' },
      { action: 'view_results', label: 'Ver resultados', icon: 'bi-list-check', priority: 'secondary' },
    ],
  },

  // ── Maestra Suplente ──────────────────────────────────────────
  maestra_suplente: {
    hoy: [
      { action: 'view_preinscritos', label: 'Ver preinscritos del día', icon: 'bi-person-plus', priority: 'primary' },
      { action: 'take_attendance', label: 'Ir a Asistencia', icon: 'bi-clipboard-check', priority: 'primary' },
    ],
    asistencia: [
      { action: 'mark_present', label: 'Marcar presente', icon: 'bi-check-circle', priority: 'primary' },
      { action: 'mark_absent', label: 'Marcar ausente', icon: 'bi-x-circle', priority: 'primary' },
    ],
    calificaciones: [
      { action: 'enter_grade', label: 'Ingresar calificación', icon: 'bi-input-cursor-text', priority: 'primary' },
    ],
  },

  // ── Coordinador ───────────────────────────────────────────────
  coordinador: {
    hoy: [
      { action: 'view_all_teachers', label: 'Ver todos los maestros', icon: 'bi-people', priority: 'primary' },
      { action: 'view_metrics', label: 'Ver Métricas', icon: 'bi-graph-up', priority: 'primary' },
      { action: 'approve_plans', label: 'Aprobar planificaciones', icon: 'bi-check2-all', priority: 'secondary' },
    ],
    preinscritos: [
      { action: 'validate_preinscripcion', label: 'Validar preinscripción', icon: 'bi-check2-square', priority: 'primary' },
      { action: 'assign_group', label: 'Asignar grupo', icon: 'bi-diagram-3', priority: 'primary' },
    ],
    metricas: [
      { action: 'view_reports', label: 'Ver reportes', icon: 'bi-file-bar-graph', priority: 'primary' },
      { action: 'export_report', label: 'Exportar reporte', icon: 'bi-download', priority: 'secondary' },
    ],
    estudiantes: [
      { action: 'view_student', label: 'Ver detalle', icon: 'bi-person', priority: 'primary' },
      { action: 'bulk_update', label: 'Actualización masiva', icon: 'bi-lightning', priority: 'secondary' },
    ],
  },

  // ── Admin ──────────────────────────────────────────────────────
  admin: {
    hoy: [
      { action: 'view_all_teachers', label: 'Ver todos los maestros', icon: 'bi-people', priority: 'primary' },
      { action: 'view_metrics', label: 'Ver Métricas', icon: 'bi-graph-up', priority: 'primary' },
    ],
    metricas: [
      { action: 'view_reports', label: 'Ver reportes', icon: 'bi-file-bar-graph', priority: 'primary' },
      { action: 'export_report', label: 'Exportar reporte', icon: 'bi-download', priority: 'primary' },
      { action: 'sync_data', label: 'Sincronizar datos', icon: 'bi-arrow-repeat', priority: 'secondary' },
    ],
    preinscritos: [
      { action: 'validate_preinscripcion', label: 'Validar preinscripción', icon: 'bi-check2-square', priority: 'primary' },
      { action: 'assign_group', label: 'Asignar grupo', icon: 'bi-diagram-3', priority: 'primary' },
    ],
  },
}

/**
 * Get available capabilities for a role in a specific view.
 * @param {string} role
 * @param {string} viewId
 * @returns {Capability[]}
 */
export function getCapabilities(role, viewId) {
  const roleCaps = ROLE_VIEW_CAPABILITIES[role]
  if (!roleCaps) return []
  return roleCaps[viewId] || []
}

/**
 * Get all views where a role has capabilities.
 * @param {string} role
 * @returns {string[]}
 */
export function getViewsForRole(role) {
  const roleCaps = ROLE_VIEW_CAPABILITIES[role]
  if (!roleCaps) return []
  return Object.keys(roleCaps)
}

/**
 * Check if a role can perform a specific action in a view.
 * @param {string} role
 * @param {string} viewId
 * @param {string} action
 * @returns {boolean}
 */
export function canPerformAction(role, viewId, action) {
  return getCapabilities(role, viewId).some(c => c.action === action)
}

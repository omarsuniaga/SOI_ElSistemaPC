export * from './api/planificacionAdapter.js'
export { Planificacion } from './models/planificacion.model.js'

// Motor de sincronización offline-first para evaluaciones por estrellas (fix C-5):
// arranca al cargar el módulo y reintenta automáticamente al recuperar conexión.
// remoteSyncFn escribe en evaluacion_indicador (desplegada en 20260730000001).
import { initOfflineSync } from './api/offlineSyncAdapter.js'
export { initOfflineSync } from './api/offlineSyncAdapter.js'
initOfflineSync()
export { usePlanificacion } from './hooks/usePlanificacion.js'
export { registerRoutesPlanificacion } from './planificacion.router.js'
export { renderPlanificacionView } from './views/planificacionView.js'
export { openAprobacionPlanificacionesModal } from './components/aprobacionPlanificacionesModal.js'

export { parseDsl, highlightDsl, getTokenSummary, validateDsl } from './utils/dslParser.js'
export { createDslEditor } from './components/dslEditor.js'
export { createDslToolbar, createDslEditorWithToolbar } from './components/dslToolbar.js'
export { createAlumnoPickerModal } from './components/alumnoPickerModal.js'

// ── Phase 3: Planificación de Clase ──
export { renderClasePlanificacionView } from './views/clasePlanificacionView.js'
export { renderEvaluacionClaseModal } from './components/evaluacionClaseModal.js'
export { renderProgresoAlumnosPanel } from './components/progresoAlumnosPanel.js'
export { renderCurriculumLinkerPanel } from './components/curriculumLinkerPanel.js'
export { useClasePlanificacion } from './hooks/useClasePlanificacion.js'

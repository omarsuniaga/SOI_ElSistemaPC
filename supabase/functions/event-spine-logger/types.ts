/**
 * SOI Event Enrichment — Shared Type Definitions
 *
 * Common interfaces used across event-spine-logger consumer and handlers
 */

/**
 * Event from soi_eventos table
 *
 * These are immutable, append-only log entries created by Phase 1 triggers.
 * Handlers read these and create reactive tasks in tareas_institucionales.
 */
export interface SoiEvento {
  id: string
  tipo: string
  entidad_tipo: string
  entidad_id: string | null
  actor_id: string | null
  payload: Record<string, unknown>
  correlation_id: string | null
  procesado: boolean
  created_at: string
}

/**
 * Possible event types in the system
 *
 * These are enforced by CHECK constraint on soi_eventos.tipo
 */
export type EventType =
  | 'sesion.creada'
  | 'sesion.completada'
  | 'sesion.cancelada'
  | 'asistencia.registrada'
  | 'asistencia.falta_injustificada'
  | 'asistencia.falta_justificada'
  | 'tarea.creada'
  | 'tarea.completada'
  | 'tarea.escalada'
  | 'tarea.vencida'
  | 'justificacion.solicitada'
  | 'justificacion.aprobada'
  | 'justificacion.rechazada'
  | 'periodo.abierto'
  | 'periodo.cerrado'

/**
 * Handler result: whether event was processed and optional task ID
 */
export interface HandlerResult {
  handled: boolean
  taskId?: string
  error?: string
}

/**
 * Consumer batch processing result
 */
export interface BatchResult {
  processed: number
  errors: number
  skipped: number
  timestamp: string
}

/**
 * Department enum matching tareas_institucionales.departamento
 */
export type Departamento = 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'COM' | 'TECNICO'

/**
 * Priority levels matching tareas_institucionales.prioridad
 */
export type Prioridad = 'baja' | 'media' | 'alta' | 'critica'

/**
 * Task state matching tareas_institucionales.estado
 */
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'escalada' | 'vencida'

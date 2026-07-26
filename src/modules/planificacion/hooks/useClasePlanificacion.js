/**
 * useClasePlanificacion.js — Reactive hook for class planification state management.
 *
 * Manages state for:
 * - Class curriculum plan (route assignment)
 * - Planification objectives (clase_objetivos)
 * - Student evaluations (evaluacion_indicador)
 * - Student progress dashboard
 *
 * Follows the observer pattern (same as PlanificacionHook).
 * All mutations go through Phase 2 services.
 *
 * @module hooks/useClasePlanificacion
 */

import {
  asignarRutaAClase,
  obtenerRutaActivaPorClase,
  cambiarEstadoPlan,
} from '../services/clasePlanificacionService.js'
import {
  agregarObjetivos as svcAgregarObjetivos,
  obtenerObjetivosPorPlanificacion,
  actualizarObjetivo,
  eliminarObjetivos,
} from '../services/claseObjetivosService.js'
import {
  registrarEvaluacion,
  obtenerEvaluacionesPorClase,
  obtenerProgresoAlumnos,
} from '../services/evaluacionClaseService.js'

class ClasePlanificacionHook {
  constructor() {
    /** @type {object|null} Current class curriculum plan (bridge record) */
    this.planificacion = null
    /** @type {object|null} Active route assigned to the class */
    this.rutaAsignada = null
    /** @type {Array<object>} Objectives linked to a planificacion */
    this.objetivos = []
    /** @type {Array<object>} Evaluations for the current class */
    this.evaluaciones = []
    /** @type {Array<object>} Student progress dashboard data */
    this.progresoAlumnos = []
    /** @type {boolean} Loading flag */
    this.cargando = false
    /** @type {string|null} Last error message */
    this.error = null
    /** @type {Array<function>} Observer callbacks */
    this._listeners = []
  }

  // ── Observer pattern ────────────────────────────────────────────────────────

  /**
   * Subscribe to state changes.
   * @param {function} callback - Called with the hook instance on every state change
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    this._listeners.push(callback)
    return () => {
      this._listeners = this._listeners.filter((l) => l !== callback)
    }
  }

  /** Notify all subscribers of state change. */
  _notify() {
    this._listeners.forEach((fn) => fn(this))
  }

  // ── Route / Class Curriculum Plan ───────────────────────────────────────────

  /**
   * Fetch the active route for a class via class_curriculum_plan bridge.
   * @param {string} claseId
   * @returns {Promise<object|null>}
   */
  async fetchRutaDeClase(claseId) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      this.rutaAsignada = await obtenerRutaActivaPorClase(claseId)
      this.cargando = false
      this._notify()
      return this.rutaAsignada
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  /**
   * Assign a curriculum route to a class (archives previous active route).
   * @param {string} claseId
   * @param {string} routeVersionId
   * @returns {Promise<object>} The created bridge record
   */
  async asignarRuta(claseId, routeVersionId) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      const result = await asignarRutaAClase(claseId, routeVersionId)
      this.rutaAsignada = result
      this.cargando = false
      this._notify()
      return result
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  /**
   * Change the state of the class curriculum plan.
   * @param {string} claseId
   * @param {string} nuevoEstado - 'borrador'|'activo'|'archivado'
   * @returns {Promise<object>}
   */
  async cambiarEstado(claseId, nuevoEstado) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      const result = await cambiarEstadoPlan(claseId, nuevoEstado)
      this.cargando = false
      this._notify()
      return result
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  // ── Objectives (clase_objetivos) ───────────────────────────────────────────

  /**
   * Fetch objectives linked to a planificacion.
   * @param {string} planificacionId
   * @returns {Promise<Array<object>>}
   */
  async fetchObjetivos(planificacionId) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      this.objetivos = await obtenerObjetivosPorPlanificacion(planificacionId)
      this.cargando = false
      this._notify()
      return this.objetivos
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  /**
   * Add objectives to a planificacion.
   * @param {string} planificacionId
   * @param {string} classCurriculumPlanId
   * @param {Array<object>} objetivos - Array of { node_id, indicator_id, semana? }
   * @returns {Promise<Array<object>>} Inserted records
   */
  async agregarObjetivos(planificacionId, classCurriculumPlanId, objetivos) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      const rows = objetivos.map((o) => ({
        planificacion_id: planificacionId,
        class_curriculum_plan_id: classCurriculumPlanId,
        node_id: o.node_id,
        indicator_id: o.indicator_id,
        semana: o.semana || null,
      }))
      const result = await svcAgregarObjetivos(rows)
      this.objetivos = await obtenerObjetivosPorPlanificacion(planificacionId)
      this.cargando = false
      this._notify()
      return result
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  /**
   * Update a single objective.
   * @param {string} objetivoId
   * @param {object} updates - { estado?, semana? }
   * @returns {Promise<object>}
   */
  async actualizarObjetivo(objetivoId, updates) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      const result = await actualizarObjetivo(objetivoId, updates)
      this.cargando = false
      this._notify()
      return result
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  /**
   * Delete all objectives for a planificacion.
   * @param {string} planificacionId
   * @returns {Promise<void>}
   */
  async eliminarObjetivos(planificacionId) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      await eliminarObjetivos(planificacionId)
      this.objetivos = []
      this.cargando = false
      this._notify()
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  // ── Evaluation ──────────────────────────────────────────────────────────────

  /**
   * Register or update an evaluation for a student on an indicator.
   * @param {object} data - { alumno_id, indicator_id, clase_id, nota?, estado?, observaciones?, evaluado_por? }
   * @returns {Promise<object>} The upserted evaluation
   */
  async evaluarAlumno(data) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      const result = await registrarEvaluacion(data)
      // Refresh evaluations for the class
      this.evaluaciones = await obtenerEvaluacionesPorClase(data.clase_id)
      this.cargando = false
      this._notify()
      return result
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  /**
   * Fetch all evaluations for a class.
   * @param {string} claseId
   * @returns {Promise<Array<object>>}
   */
  async fetchEvaluaciones(claseId) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      this.evaluaciones = await obtenerEvaluacionesPorClase(claseId)
      this.cargando = false
      this._notify()
      return this.evaluaciones
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  // ── Progress Dashboard ──────────────────────────────────────────────────────

  /**
   * Fetch student progress dashboard for a class.
   * @param {string} claseId
   * @returns {Promise<Array<object>>}
   */
  async fetchProgresoAlumnos(claseId) {
    this.cargando = true
    this.error = null
    this._notify()

    try {
      this.progresoAlumnos = await obtenerProgresoAlumnos(claseId)
      this.cargando = false
      this._notify()
      return this.progresoAlumnos
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this._notify()
      throw err
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  /** Reset all state to initial values. */
  reset() {
    this.planificacion = null
    this.rutaAsignada = null
    this.objetivos = []
    this.evaluaciones = []
    this.progresoAlumnos = []
    this.cargando = false
    this.error = null
    this._notify()
  }
}

let instance = null

/**
 * Singleton hook for class planification state.
 * @returns {ClasePlanificacionHook}
 */
export function useClasePlanificacion() {
  if (!instance) {
    instance = new ClasePlanificacionHook()
  }
  return instance
}

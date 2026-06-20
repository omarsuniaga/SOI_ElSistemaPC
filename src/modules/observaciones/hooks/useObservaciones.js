/**
 * Hook: useObservaciones
 * Lógica compartida para el módulo de observaciones
 */

import {
  obtenerObservaciones,
  obtenerObservacion,
  getEstadisticas,
} from '../api/observacionesApi.js'

export class ObservacionesHook {
  constructor() {
    this.observaciones = []
    this.observacionActual = null
    this.cargando = false
    this.error = null
    this.listeners = []
    this.filtros = {
      alumnoId: null,
      tipo: null,
      estado: null,
      prioridad: null,
    }
  }

  /**
   * Suscribirse a cambios de estado
   * @param {Function} callback
   */
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  /**
   * Notificar a todos los suscriptores
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener({
        observaciones: this.observaciones,
        observacionActual: this.observacionActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  /**
   * Cargar todas las observaciones
   */
  async fetchObservaciones() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.observaciones = await obtenerObservaciones()
      this.cargando = false
      this.notifyListeners()
      return this.observaciones
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Cargar una observación específica
   * @param {string} id
   */
  async fetchObservacion(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.observacionActual = await obtenerObservacion(id)
      this.cargando = false
      this.notifyListeners()
      return this.observacionActual
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Limpiar estado
   */
  reset() {
    this.observaciones = []
    this.observacionActual = null
    this.cargando = false
    this.error = null
    this.filtros = {
      alumnoId: null,
      tipo: null,
      estado: null,
      prioridad: null,
    }
    this.notifyListeners()
  }

  /**
   * Buscar observaciones por término
   * @param {string} searchTerm
   * @returns {Array}
   */
  search(searchTerm) {
    if (!searchTerm) return this.observaciones

    const term = searchTerm.toLowerCase()
    return this.observaciones.filter(o =>
      (o.titulo || '').toLowerCase().includes(term) ||
      (o.descripcion || '').toLowerCase().includes(term) ||
      (o.tipo || '').toLowerCase().includes(term) ||
      (o.nombre_alumno || '').toLowerCase().includes(term)
    )
  }

  /**
   * Filtrar observaciones por alumno
   * @param {string} alumnoId
   * @returns {Array}
   */
  filterByAlumno(alumnoId) {
    if (!alumnoId) return this.observaciones
    return this.observaciones.filter(o => o.alumno_id === alumnoId)
  }

  /**
   * Filtrar observaciones por tipo
   * @param {string} tipo
   * @returns {Array}
   */
  filterByTipo(tipo) {
    if (!tipo) return this.observaciones
    return this.observaciones.filter(o => o.tipo === tipo)
  }

  /**
   * Filtrar observaciones por estado
   * @param {string} estado
   * @returns {Array}
   */
  filterByEstado(estado) {
    if (!estado) return this.observaciones
    return this.observaciones.filter(o => o.estado === estado)
  }

  /**
   * Filtrar observaciones por prioridad
   * @param {string} prioridad
   * @returns {Array}
   */
  filterByPrioridad(prioridad) {
    if (!prioridad) return this.observaciones
    return this.observaciones.filter(o => o.prioridad === prioridad)
  }

  /**
   * Obtener observación por ID
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return this.observaciones.find(o => o.id === id) || null
  }

  /**
   * Obtener observaciones abiertas
   * @returns {Array}
   */
  getAbiertas() {
    return this.observaciones.filter(o => o.estado === 'abierta')
  }

  /**
   * Obtener observaciones por alumno
   * @param {string} alumnoId
   * @returns {Array}
   */
  getPorAlumno(alumnoId) {
    return this.observaciones.filter(o => o.alumno_id === alumnoId)
  }

  /**
   * Contar total de observaciones
   * @returns {number}
   */
  count() {
    return this.observaciones.length
  }

  /**
   * Contar observaciones por tipo
   * @returns {Object}
   */
  countByTipo() {
    return this.observaciones.reduce((acc, o) => {
      const tipo = o.tipo || 'sin-tipo'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Contar observaciones por estado
   * @returns {Object}
   */
  countByEstado() {
    return this.observaciones.reduce((acc, o) => {
      const estado = o.estado || 'sin-estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Obtener estadísticas completas
   * @returns {Object}
   */
  async getEstadisticas() {
    try {
      return await getEstadisticas()
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err.message)
      return {
        total: this.observaciones.length,
        porTipo: this.countByTipo(),
        porEstado: this.countByEstado(),
        porPrioridad: this.countByPrioridad(),
      }
    }
  }

  countByPrioridad() {
    return this.observaciones.reduce((acc, o) => {
      const prioridad = o.prioridad || 'sin-prioridad'
      acc[prioridad] = (acc[prioridad] || 0) + 1
      return acc
    }, {})
  }
}

// Instancia singleton
let observacionesHookInstance = null

export function useObservaciones() {
  if (!observacionesHookInstance) {
    observacionesHookInstance = new ObservacionesHook()
  }
  return observacionesHookInstance
}

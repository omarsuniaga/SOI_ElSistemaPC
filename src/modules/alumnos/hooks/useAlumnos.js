/**
 * Hook: useAlumnos
 * Lógica compartida para el módulo de alumnos
 */

import { obtenerAlumnos, obtenerAlumno } from '../api/alumnosApi.js'

export class AlumnosHook {
  constructor() {
    this.alumnos = []
    this.alumnoActual = null
    this.cargando = false
    this.error = null
    this.listeners = []
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
        alumnos: this.alumnos,
        alumnoActual: this.alumnoActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  /**
   * Cargar todos los alumnos
   */
  async fetchAlumnos() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.alumnos = await obtenerAlumnos()
      this.cargando = false
      this.notifyListeners()
      return this.alumnos
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Cargar un alumno específico
   * @param {string} id
   */
  async fetchAlumno(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.alumnoActual = await obtenerAlumno(id)
      this.cargando = false
      this.notifyListeners()
      return this.alumnoActual
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
    this.alumnos = []
    this.alumnoActual = null
    this.cargando = false
    this.error = null
    this.notifyListeners()
  }

  /**
   * Buscar alumnos por término
   * @param {string} searchTerm
   * @returns {Array}
   */
  search(searchTerm) {
    if (!searchTerm) return this.alumnos

    const term = searchTerm.toLowerCase()
    return this.alumnos.filter(a =>
      (a.name || '').toLowerCase().includes(term) ||
      (a.email || '').toLowerCase().includes(term) ||
      (a.cedula || '').toLowerCase().includes(term) ||
      (a.acudiente || '').toLowerCase().includes(term)
    )
  }

  /**
   * Filtrar alumnos por estado
   * @param {boolean} esActivo
   * @returns {Array}
   */
  filterByEstado(esActivo) {
    return this.alumnos.filter(a => a.es_activo === esActivo)
  }

  /**
   * Obtener alumno por ID
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return this.alumnos.find(a => a.id === id) || null
  }

  /**
   * Obtener alumnos activos
   * @returns {Array}
   */
  getActivos() {
    return this.alumnos.filter(a => a.es_activo)
  }

  /**
   * Obtener alumnos inactivos
   * @returns {Array}
   */
  getInactivos() {
    return this.alumnos.filter(a => !a.es_activo)
  }

  /**
   * Contar total de alumnos
   * @returns {number}
   */
  count() {
    return this.alumnos.length
  }

  /**
   * Contar alumnos por sección
   * @returns {Object}
   */
  countBySection() {
    return this.alumnos.reduce((acc, a) => {
      const section = a.section || 'Sin sección'
      acc[section] = (acc[section] || 0) + 1
      return acc
    }, {})
  }
}

// Instancia singleton
let alumnosHookInstance = null

export function useAlumnos() {
  if (!alumnosHookInstance) {
    alumnosHookInstance = new AlumnosHook()
  }
  return alumnosHookInstance
}

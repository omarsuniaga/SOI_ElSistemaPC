/**
 * Hook: useClases
 * Lógica compartida para el módulo de clases
 */

import { obtenerClases, obtenerClase } from '../api/clasesApi.js'

export class ClasesHook {
  constructor() {
    this.clases = []
    this.claseActual = null
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
        clases: this.clases,
        claseActual: this.claseActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  /**
   * Cargar todas las clases
   */
  async fetchClases() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.clases = await obtenerClases()
      this.cargando = false
      this.notifyListeners()
      return this.clases
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Cargar una clase específica
   * @param {string} id
   */
  async fetchClase(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.claseActual = await obtenerClase(id)
      this.cargando = false
      this.notifyListeners()
      return this.claseActual
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
    this.clases = []
    this.claseActual = null
    this.cargando = false
    this.error = null
    this.notifyListeners()
  }

  /**
   * Buscar clases por término
   * @param {string} searchTerm
   * @returns {Array}
   */
  search(searchTerm) {
    if (!searchTerm) return this.clases

    const term = searchTerm.toLowerCase()
    return this.clases.filter(c =>
      (c.nombre || '').toLowerCase().includes(term) ||
      (c.instrumento || '').toLowerCase().includes(term) ||
      (c.estado || '').toLowerCase().includes(term)
    )
  }

  /**
   * Filtrar clases por estado
   * @param {string} estado
   * @returns {Array}
   */
  filterByEstado(estado) {
    if (!estado || estado === 'todos') return this.clases
    return this.clases.filter(c => c.estado === estado)
  }

  /**
   * Filtrar clases por maestro
   * @param {string} maestroId
   * @returns {Array}
   */
  filterByMaestro(maestroId) {
    return this.clases.filter(c => c.maestro_id === maestroId)
  }

  /**
   * Filtrar clases por instrumento
   * @param {string} instrumento
   * @returns {Array}
   */
  filterByInstrumento(instrumento) {
    return this.clases.filter(c => c.instrumento === instrumento)
  }

  /**
   * Obtener clase por ID
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return this.clases.find(c => c.id === id) || null
  }

  /**
   * Obtener clases activas
   * @returns {Array}
   */
  getActivas() {
    return this.clases.filter(c => c.estado === 'activa')
  }

  /**
   * Contar total de clases
   * @returns {number}
   */
  count() {
    return this.clases.length
  }

  /**
   * Contar clases por instrumento
   * @returns {Object}
   */
  countByInstrumento() {
    return this.clases.reduce((acc, c) => {
      const instrumento = c.instrumento || 'Sin instrumento'
      acc[instrumento] = (acc[instrumento] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Contar clases por maestro
   * @returns {Object}
   */
  countByMaestro() {
    return this.clases.reduce((acc, c) => {
      const maestro = c.maestro_id || 'Sin maestro'
      acc[maestro] = (acc[maestro] || 0) + 1
      return acc
    }, {})
  }
}

// Instancia singleton
let clasesHookInstance = null

export function useClases() {
  if (!clasesHookInstance) {
    clasesHookInstance = new ClasesHook()
  }
  return clasesHookInstance
}

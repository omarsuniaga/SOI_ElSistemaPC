/**
 * Hook: usePermisos
 * Lógica compartida para el módulo de permisos
 */

import { obtenerPermisos, obtenerPermisoPorMaestro, actualizarPermiso } from '../api/permisosApi.js'

export class PermisosHook {
  constructor() {
    this.permisos = []
    this.permisoActual = null
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
        permisos: this.permisos,
        permisoActual: this.permisoActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  /**
   * Cargar todos los permisos
   */
  async fetchPermisos() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.permisos = await obtenerPermisos()
      this.cargando = false
      this.notifyListeners()
      return this.permisos
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Cargar permiso de un maestro específico
   * @param {string} maestroId
   */
  async fetchPermisoPorMaestro(maestroId) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.permisoActual = await obtenerPermisoPorMaestro(maestroId)
      this.cargando = false
      this.notifyListeners()
      return this.permisoActual
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Actualizar permiso de un maestro
   * @param {string} maestroId
   * @param {object} changes
   */
  async updatePermiso(maestroId, changes) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      const actualizado = await actualizarPermiso(maestroId, changes)
      // Refrescar lista local
      const idx = this.permisos.findIndex(p => p.maestro_id === maestroId)
      if (idx !== -1) {
        this.permisos[idx] = actualizado
      } else {
        this.permisos.push(actualizado)
      }
      this.permisoActual = actualizado
      this.cargando = false
      this.notifyListeners()
      return actualizado
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
    this.permisos = []
    this.permisoActual = null
    this.cargando = false
    this.error = null
    this.notifyListeners()
  }
}

// Instancia singleton
let permisosHookInstance = null

export function usePermisos() {
  if (!permisosHookInstance) {
    permisosHookInstance = new PermisosHook()
  }
  return permisosHookInstance
}

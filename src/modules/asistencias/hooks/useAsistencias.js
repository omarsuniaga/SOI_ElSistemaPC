/**
 * Hook: useAsistencias
 * Lógica compartida para el módulo de asistencias
 */

import { obtenerAsistencias, obtenerAsistencia } from '../api/asistenciasApi.js'

const DRAFT_PREFIX = 'asistencia_draft_'
const DRAFT_TIMESTAMP_KEY = 'asistencia_draft_ts_'

export class AsistenciasHook {
  constructor() {
    this.asistencias = []
    this.asistenciaActual = null
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
        asistencias: this.asistencias,
        asistenciaActual: this.asistenciaActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  /**
   * Cargar todas las asistencias
   */
  async fetchAsistencias() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.asistencias = await obtenerAsistencias()
      this.cargando = false
      this.notifyListeners()
      return this.asistencias
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  /**
   * Cargar una asistencia específica
   * @param {string} id
   */
  async fetchAsistencia(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.asistenciaActual = await obtenerAsistencia(id)
      this.cargando = false
      this.notifyListeners()
      return this.asistenciaActual
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
    this.asistencias = []
    this.asistenciaActual = null
    this.cargando = false
    this.error = null
    this.notifyListeners()
  }

  /**
   * Buscar asistencias por término
   * @param {string} searchTerm
   * @returns {Array}
   */
  search(searchTerm) {
    if (!searchTerm) return this.asistencias

    const term = searchTerm.toLowerCase()
    return this.asistencias.filter(a =>
      (a.estado || '').toLowerCase().includes(term) ||
      (a.fecha || '').toLowerCase().includes(term) ||
      (a.students?.name || '').toLowerCase().includes(term) ||
      (a.clases?.nombre || '').toLowerCase().includes(term)
    )
  }

  /**
   * Filtrar asistencias por clase
   * @param {string} claseId
   * @returns {Array}
   */
  filterByClase(claseId) {
    return this.asistencias.filter(a => a.clase_id === claseId)
  }

  /**
   * Filtrar asistencias por fecha
   * @param {string} fecha
   * @returns {Array}
   */
  filterByFecha(fecha) {
    return this.asistencias.filter(a => a.fecha === fecha)
  }

  /**
   * Filtrar asistencias por estado
   * @param {string} estado
   * @returns {Array}
   */
  filterByEstado(estado) {
    return this.asistencias.filter(a => a.estado === estado)
  }

  /**
   * Obtener asistencia por ID
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return this.asistencias.find(a => a.id === id) || null
  }

  /**
   * Obtener asistencias para una clase
   * @param {string} claseId
   * @returns {Array}
   */
  getForClase(claseId) {
    return this.asistencias.filter(a => a.clase_id === claseId)
  }

  /**
   * Obtener asistencias para un alumno
   * @param {string} studentId
   * @returns {Array}
   */
  getForAlumno(studentId) {
    return this.asistencias.filter(a => a.student_id === studentId)
  }

  /**
   * Contar total de asistencias
   * @returns {number}
   */
  count() {
    return this.asistencias.length
  }

  /**
   * Contar asistencias por estado
   * @returns {Object}
   */
  countByEstado() {
    return this.asistencias.reduce((acc, a) => {
      const estado = a.estado || 'Sin estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Reordena alumnos: los marcados (marked=true) se mueven al final
   * @param {Array} alumnos - Array de objetos {id, nombre, marcado}
   * @returns {Array} Alumnos reordenados
   */
  reorderByMarked(alumnos) {
    if (!alumnos || !Array.isArray(alumnos)) return []
    const sinMarcar = []
    const marcados = []
    for (const alum of alumnos) {
      if (alum.marcado) {
        marcados.push(alum)
      } else {
        sinMarcar.push(alum)
      }
    }
    return [...sinMarcar, ...marcados]
  }

  /**
   * Guardar borrador en localStorage
   * @param {string} sesionId - ID de la sesión
   * @param {Object} data - Datos de asistencia {alumnos: [{id, nombre, estado, justificacion}]}
   */
  saveDraft(sesionId, data) {
    if (!sesionId) return
    try {
      localStorage.setItem(DRAFT_PREFIX + sesionId, JSON.stringify(data))
      localStorage.setItem(DRAFT_TIMESTAMP_KEY + sesionId, Date.now().toString())
    } catch (e) {
      console.warn('Error guardando draft:', e)
    }
  }

  /**
   * Cargar borrador desde localStorage
   * @param {string} sesionId - ID de la sesión
   * @returns {Object|null} Datos del borrador o null si no existe
   */
  loadDraft(sesionId) {
    if (!sesionId) return null
    try {
      const draft = localStorage.getItem(DRAFT_PREFIX + sesionId)
      return draft ? JSON.parse(draft) : null
    } catch (e) {
      console.warn('Error cargando draft:', e)
      return null
    }
  }

  /**
   * Eliminar borrador de localStorage
   * @param {string} sesionId - ID de la sesión
   */
  clearDraft(sesionId) {
    if (!sesionId) return
    try {
      localStorage.removeItem(DRAFT_PREFIX + sesionId)
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY + sesionId)
    } catch (e) {
      console.warn('Error eliminando draft:', e)
    }
  }

  /**
   * Verificar conflicto de edición externa
   * @param {string} sesionId - ID de la sesión
   * @param {number} lastModified - Timestamp del último modification desde el servidor
   * @returns {Object} {hasConflict: boolean, serverTimestamp: number, localTimestamp: number}
   */
  checkConflict(sesionId, lastModified) {
    if (!sesionId || !lastModified) {
      return { hasConflict: false, serverTimestamp: lastModified || 0, localTimestamp: 0 }
    }
    const localTs = parseInt(localStorage.getItem(DRAFT_TIMESTAMP_KEY + sesionId) || '0', 10)
    const serverTs = parseInt(lastModified, 10)
    return {
      hasConflict: localTs > 0 && serverTs > localTs,
      serverTimestamp: serverTs,
      localTimestamp: localTs,
    }
  }
}

// Instancia singleton
let asistenciasHookInstance = null

export function useAsistencias() {
  if (!asistenciasHookInstance) {
    asistenciasHookInstance = new AsistenciasHook()
  }
  return asistenciasHookInstance
}

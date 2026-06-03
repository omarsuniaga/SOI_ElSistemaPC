import {
  obtenerPlanificaciones,
  obtenerPlanificacion,
  obtenerPlanificacionesConDetalles,
} from '../api/planificacionAdapter.js'
import {
  obtenerSesiones,
  crearSesion,
  actualizarSesion,
  eliminarSesion,
  registrarAsistencia,
  obtenerSesionesCoDocencia,
  obtenerClasesDelMaestro,
} from '../api/sesionesApi.js'

export class PlanificacionHook {
  constructor() {
    this.planificaciones = []
    this.planificacionActual = null
    this.sesiones = []
    this.clases = []
    this.maestroActualId = null
    this.esCoDocencia = false
    this.cargando = false
    this.error = null
    this.listeners = []
  }

  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  setMaestroActual(maestroId, esCoDocencia = false) {
    this.maestroActualId = maestroId
    this.esCoDocencia = esCoDocencia
    this.notifyListeners()
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      listener({
        planificaciones: this.planificaciones,
        planificacionActual: this.planificacionActual,
        sesiones: this.sesiones,
        clases: this.clases,
        maestroActualId: this.maestroActualId,
        esCoDocencia: this.esCoDocencia,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  async fetchPlanificaciones() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.planificaciones = await obtenerPlanificaciones(this.maestroActualId)
      this.cargando = false
      this.notifyListeners()
      return this.planificaciones
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async fetchPlanificacionesConDetalles() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.planificaciones = await obtenerPlanificacionesConDetalles(this.maestroActualId)
      this.cargando = false
      this.notifyListeners()
      return this.planificaciones
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async fetchPlanificacion(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.planificacionActual = await obtenerPlanificacion(id)
      this.cargando = false
      this.notifyListeners()
      return this.planificacionActual
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  reset() {
    this.planificaciones = []
    this.planificacionActual = null
    this.cargando = false
    this.error = null
    this.notifyListeners()
  }

  search(searchTerm) {
    if (!searchTerm) return this.planificaciones

    const term = searchTerm.toLowerCase()
    return this.planificaciones.filter(
      (p) =>
        (p.tema || '').toLowerCase().includes(term) ||
        (p.contenido || '').toLowerCase().includes(term) ||
        (p.objetivos || '').toLowerCase().includes(term) ||
        (p.observaciones || '').toLowerCase().includes(term),
    )
  }

  filterByClase(claseId) {
    return this.planificaciones.filter((p) => p.clase_id === claseId)
  }

  filterByMaestro(maestroId) {
    return this.planificaciones.filter((p) => p.maestro_id === maestroId)
  }

  filterByEstado(estado) {
    return this.planificaciones.filter((p) => p.estado === estado)
  }

  getById(id) {
    return this.planificaciones.find((p) => p.id === id) || null
  }

  getActivas() {
    return this.planificaciones.filter((p) => p.estado === 'planificado')
  }

  count() {
    return this.planificaciones.length
  }

  countByEstado() {
    return this.planificaciones.reduce((acc, p) => {
      const estado = p.estado || 'Sin estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})
  }

  countByClase() {
    return this.planificaciones.reduce((acc, p) => {
      const claseId = p.clase_id || 'Sin clase'
      acc[claseId] = (acc[claseId] || 0) + 1
      return acc
    }, {})
  }

  async fetchSesiones(filtros = {}) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.sesiones = await obtenerSesiones(filtros)
      this.cargando = false
      this.notifyListeners()
      return this.sesiones
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async fetchClasesDelMaestro(maestroId) {
    this.cargando = true
    this.error = null

    try {
      this.clases = await obtenerClasesDelMaestro(maestroId)
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

  async fetchSesionesCoDocencia(maestroAuxiliarId) {
    this.cargando = true
    this.error = null

    try {
      this.sesiones = await obtenerSesionesCoDocencia(maestroAuxiliarId)
      this.esCoDocencia = true
      this.cargando = false
      this.notifyListeners()
      return this.sesiones
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async crearSesionEmergente(sesionData) {
    this.cargando = true
    this.error = null

    try {
      const nueva = await crearSesion({
        ...sesionData,
        maestro_id: this.maestroActualId,
      })
      this.sesiones.unshift(nueva)
      this.cargando = false
      this.notifyListeners()
      return nueva
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async actualizarSesionPasada(sesionId, datos) {
    this.cargando = true
    this.error = null

    try {
      const actualizada = await actualizarSesion(sesionId, datos)
      const idx = this.sesiones.findIndex((s) => s.id === sesionId)
      if (idx !== -1) {
        this.sesiones[idx] = { ...this.sesiones[idx], ...actualizada }
      }
      this.cargando = false
      this.notifyListeners()
      return actualizada
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async eliminarSesion(sesionId) {
    this.cargando = true
    this.error = null

    try {
      await eliminarSesion(sesionId)
      this.sesiones = this.sesiones.filter((s) => s.id !== sesionId)
      this.cargando = false
      this.notifyListeners()
      return { success: true }
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async registrarAsistencia(sesionId, asistenciaData) {
    this.cargando = true
    this.error = null

    try {
      const actualizada = await registrarAsistencia(sesionId, asistenciaData)
      const idx = this.sesiones.findIndex((s) => s.id === sesionId)
      if (idx !== -1) {
        this.sesiones[idx] = { ...this.sesiones[idx], ...actualizada }
      }
      this.cargando = false
      this.notifyListeners()
      return actualizada
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  getSesionesPorFecha(fecha) {
    return this.sesiones.filter((s) => s.fecha === fecha)
  }

  getSesionesEmergentes() {
    return this.sesiones.filter((s) => s.tipo === 'emergente')
  }

  getSesionesRegulares() {
    return this.sesiones.filter((s) => s.tipo === 'regular')
  }

  puedeEditarSesion(sesion) {
    if (this.esCoDocencia) {
      return sesion.maestro_auxiliar_id === this.maestroActualId
    }
    return sesion.maestro_id === this.maestroActualId
  }

  resetSesiones() {
    this.sesiones = []
    this.clases = []
    this.maestroActualId = null
    this.esCoDocencia = false
    this.notifyListeners()
  }
}

let planificacionHookInstance = null

export function usePlanificacion() {
  if (!planificacionHookInstance) {
    planificacionHookInstance = new PlanificacionHook()
  }
  return planificacionHookInstance
}

import { 
  getSesionesPorRango, 
  getDetalleSesion, 
  ESTADOS, 
  registrarAsistenciaBulk 
} from '../api/asistenciasApi.js'
import { Asistencia } from '../models/asistencia.model.js'

/**
 * AsistenciaDataService - Capa de negocio para procesar datos de asistencia.
 * Centraliza la lógica de timeline, conteos y preparación para UI.
 */

/**
 * Obtiene el timeline de sesiones procesado para la vista principal.
 * Agrega instancias de Asistencia y conteos calculados.
 */
export async function getTimelineProcesado(params = {}) {
  const grupos = await getSesionesPorRango(params)
  
  return grupos.map(grupo => ({
    fecha: grupo.fecha,
    sesiones: grupo.sesiones.map(s => ({
      ...s,
      // Los conteos ya vienen de la API en este caso para eficiencia SQL, 
      // pero el servicio asegura que la estructura sea consistente.
      estadoLabel: s.estado.charAt(0).toUpperCase() + s.estado.slice(1)
    }))
  }))
}

/**
 * Registra asistencia masiva para una sesión.
 * Valida cada registro antes de enviarlo a la API.
 */
export async function guardarAsistenciaMasiva(claseId, sesionId, fecha, registrosAlumnos) {
  // 1. Crear instancias de modelo y validar
  const asistencias = registrosAlumnos.map(r => {
    const a = new Asistencia({
      clase_id: claseId,
      sesion_clase_id: sesionId,
      student_id: r.alumnoId,
      fecha: fecha,
      estado: r.estado,
      justificacion_texto: r.justificacion || '',
      observaciones: r.observacion || ''
    })

    const errores = a.validate()
    if (errores.length > 0) {
      throw new Error(`Error en alumno ${r.nombre}: ${errores[0]}`)
    }
    return a
  })

  // 2. Persistir vía API Bulk
  return await registrarAsistenciaBulk(asistencias.map(a => a.toJSON()))
}

export const ASISTENCIA_SERVICE = {
  getTimelineProcesado,
  guardarAsistenciaMasiva,
  ESTADOS
}

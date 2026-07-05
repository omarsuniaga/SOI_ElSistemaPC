import { 
  obtenerProgresosPorAlumno, 
  obtenerProgresosPorClase, 
  actualizarProgreso, 
  crearProgreso 
} from '../api/progresosApi.js'
import { Progreso } from '../models/progreso.model.js'

/**
 * ProgresoDataService - Capa de negocio para la gestión académica.
 * Centraliza cálculos de rendimiento, promedios y alertas de riesgo.
 */

/**
 * Calcula el promedio y el estado de riesgo de un alumno
 * @param {Progreso[]} progresos - Lista de instancias del modelo
 * @returns {Object} { promedio: number, total: number, enRiesgo: boolean }
 */
export function calcularRendimiento(progresos) {
  if (!progresos || progresos.length === 0) {
    return { promedio: null, total: 0, enRiesgo: false }
  }

  const notas = progresos
    .map(p => p.calificacion)
    .filter(n => n !== null && n !== undefined && !isNaN(n))

  if (notas.length === 0) {
    return { promedio: null, total: progresos.length, enRiesgo: false }
  }

  const suma = notas.reduce((a, b) => a + b, 0)
  const promedio = parseFloat((suma / notas.length).toFixed(2))

  return {
    promedio,
    total: progresos.length,
    enRiesgo: promedio < 3.0
  }
}

/**
 * Prepara los datos enriquecidos para la vista de progresos
 */
export async function getResumenProgresosClase(claseId) {
  const progresos = await obtenerProgresosPorClase(claseId)
  
  // Agrupar por alumno para calcular promedios individuales
  const porAlumno = {}
  progresos.forEach(p => {
    if (!porAlumno[p.alumno_id]) porAlumno[p.alumno_id] = []
    porAlumno[p.alumno_id].push(p)
  })

  return Object.entries(porAlumno).map(([alumnoId, lista]) => ({
    alumnoId,
    progresos: lista,
    rendimiento: calcularRendimiento(lista)
  }))
}

export const PROGRESO_SERVICE = {
  calcularRendimiento,
  getResumenProgresosClase
}

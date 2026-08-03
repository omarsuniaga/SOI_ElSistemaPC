/**
 * DeudaPedagogicaEngine.js — Servicio de Dominio para Prerrequisitos y Deudas de Aprendizaje
 */

export class DeudaPedagogicaEngine {
  /**
   * Analiza si un alumno tiene prerrequisitos o contenidos previos no aprobados/ausentes.
   *
   * @param {Object} params
   * @param {string} params.alumnoId
   * @param {Object} params.nodoActual — Nodo que el maestro intenta calificar/enseñar
   * @param {Array<Object>} params.nodosOrdenados — Lista secuencial de nodos de la ruta pedagógica
   * @param {Array<Object>} params.colaOffline — Registro de evaluaciones/asistencias del alumno
   * @returns {Object} { tieneDeuda: boolean, nodosPendientes: Array, advertencia: string|null }
   */
  static evaluarDeuda({ alumnoId, nodoActual, nodosOrdenados = [], colaOffline = [] }) {
    if (!nodoActual || !Array.isArray(nodosOrdenados) || nodosOrdenados.length === 0) {
      return { tieneDeuda: false, nodosPendientes: [], advertencia: null }
    }

    const indexActual = nodosOrdenados.findIndex((n) => String(n.id) === String(nodoActual.id))
    if (indexActual <= 0) {
      // Es el primer nodo de la ruta, no hay prerrequisitos previos
      return { tieneDeuda: false, nodosPendientes: [], advertencia: null }
    }

    // Nodos anteriores en la secuencia pedagógica que preceden al nodo actual
    const nodosPrevios = nodosOrdenados.slice(0, indexActual)
    const nodosPendientes = []

    for (const nodoPrev of nodosPrevios) {
      // Buscar evaluaciones del alumno en el nodo previo
      const evalPrev = [...colaOffline].reverse().find((item) => {
        return String(item.alumnoId) === String(alumnoId) && String(item.nodoId) === String(nodoPrev.id)
      })

      // Un nodo se considera "En Deuda" si:
      // 1. El alumno estuvo ausente o no asistió y no tiene evaluación registrada
      // 2. La evaluación registrada es < 3 estrellas (Iniciado o En Proceso, no logrado)
      const sinEval = !evalPrev
      const ausenteSinEval = evalPrev && (evalPrev.presente === false || evalPrev.ausente === true)
      const noLogrado = evalPrev && typeof evalPrev.estrellas === 'number' && evalPrev.estrellas < 3

      if (sinEval || ausenteSinEval || noLogrado) {
        nodosPendientes.push({
          id: nodoPrev.id,
          titulo: nodoPrev.titulo || nodoPrev.nombre || `Nodo Prev #${nodoPrev.id}`,
          causa: ausenteSinEval ? 'Inasistencia en Clase Previa' : noLogrado ? `${evalPrev.estrellas}★ Pendiente` : 'Contenido No Evaluado',
        })
      }
    }

    if (nodosPendientes.length > 0) {
      const titulos = nodosPendientes.map((n) => `"${n.titulo}"`).join(', ')
      return {
        tieneDeuda: true,
        nodosPendientes,
        advertencia: `⚠️ Advertencia de Brecha Pedagógica: El alumno asistió hoy, pero tiene pendiente el contenido de ${titulos}. Esto podría interferir en el dominio del nodo actual.`,
      }
    }

    return { tieneDeuda: false, nodosPendientes: [], advertencia: null }
  }
}

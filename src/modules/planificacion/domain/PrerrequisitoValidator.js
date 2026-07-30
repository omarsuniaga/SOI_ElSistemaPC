/**
 * PrerrequisitoValidator.js — Validador de Grafo DAG de Prerrequisitos Pedagógicos
 *
 * Cada nodo curricular (indicador) declara, a lo sumo, un `prerrequisitoId`
 * que apunta al `id` de OTRO nodo de la ruta del cual depende (ver
 * `DisenadorCurricularView.js`, selector de prerrequisito por indicador).
 * Esa referencia es la arista real del grafo — NO la posición del nodo dentro
 * del arreglo `nodosRuta`. Este validador recorre la cadena de prerrequisitos
 * (target → su prerrequisito → el prerrequisito de ese nodo → ...) siguiendo
 * `prerrequisitoId`, verificando que cada ancestro haya sido aprobado
 * (nota >= 3) por el alumno, y se protege contra ciclos malformados en la
 * cadena (p. ej. A depende de B y B depende de A).
 */

const NOTA_APROBATORIA = 3

export class PrerrequisitoValidator {
  /**
   * Valida si un alumno cumple con toda la cadena de prerrequisitos (grafo DAG)
   * necesaria para ser evaluado en un indicador objetivo.
   *
   * @param {Object} params
   * @param {string} params.targetIndicadorId — ID del indicador que se desea evaluar
   * @param {Array<Object>} params.nodosRuta — Nodos de la ruta; cada uno con { id, prerrequisitoId }
   * @param {Array<Object>} params.evaluacionesAlumno — Evaluaciones históricas del alumno
   * @returns {{ puedeAvanzar: boolean, razon?: string, nodoPendiente?: Object }}
   */
  static validarPrerrequisitos({ targetIndicadorId, nodosRuta = [], evaluacionesAlumno = [] }) {
    const nodosPorId = new Map(nodosRuta.map(n => [String(n.id), n]))
    const targetNode = nodosPorId.get(String(targetIndicadorId))

    // Si el nodo objetivo no pertenece a la ruta, no hay grafo que validar
    if (!targetNode) {
      return { puedeAvanzar: true }
    }

    const maxSaltos = nodosRuta.length
    const visitados = new Set([String(targetNode.id)])

    let nodoActual = targetNode
    let saltos = 0

    while (nodoActual && nodoActual.prerrequisitoId != null) {
      saltos += 1
      if (saltos > maxSaltos) {
        return {
          puedeAvanzar: false,
          razon: `Ciclo detectado en la cadena de prerrequisitos del nodo '${targetNode.titulo || targetNode.nombre || targetNode.id}'.`,
        }
      }

      const prerrequisitoIdStr = String(nodoActual.prerrequisitoId)
      if (visitados.has(prerrequisitoIdStr)) {
        return {
          puedeAvanzar: false,
          razon: `Ciclo detectado en la cadena de prerrequisitos del nodo '${targetNode.titulo || targetNode.nombre || targetNode.id}'.`,
        }
      }
      visitados.add(prerrequisitoIdStr)

      const nodoPrerrequisito = nodosPorId.get(prerrequisitoIdStr)
      if (!nodoPrerrequisito) {
        // El prerrequisito referenciado no existe (dato huérfano/inconsistente):
        // no hay forma de validarlo, se permite avanzar.
        break
      }

      const evalPrerrequisito = evaluacionesAlumno.find(
        e => String(e.indicator_id || e.indicadorId) === prerrequisitoIdStr
      )
      const notaPrerrequisito = evalPrerrequisito ? parseInt(evalPrerrequisito.nota || '0', 10) : 0

      if (notaPrerrequisito < NOTA_APROBATORIA) {
        return {
          puedeAvanzar: false,
          razon: `El alumno debe completar primero el prerrequisito '${nodoPrerrequisito.titulo || nodoPrerrequisito.nombre}' (Nota actual: ${notaPrerrequisito}/5).`,
          nodoPendiente: nodoPrerrequisito,
        }
      }

      nodoActual = nodoPrerrequisito
    }

    return { puedeAvanzar: true }
  }
}

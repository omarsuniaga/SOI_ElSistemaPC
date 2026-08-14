/**
 * dagResolutionEngine.js — Resolución del Grafo de Precedencia WBS.
 * Módulo puro: sin imports externos, sin side effects.
 * Todas las funciones son deterministas y testeables en aislamiento.
 */

/**
 * Dado un array de hitos con su campo dependeDeTMinusDias,
 * calcula qué estado inicial debe tener cada uno.
 *
 * Regla: si dependeDeTMinusDias !== null → 'bloqueada_por_dependencia'.
 *        si dependeDeTMinusDias === null → 'pendiente'.
 *
 * @param {Array<{tMinusDias: number, dependeDeTMinusDias: number|null}>} hitos
 * @returns {Array<{...hito, estadoInicial: 'pendiente'|'bloqueada_por_dependencia'}>}
 */
export function resolverEstadosIniciales(hitos) {
  return hitos.map(hito => ({
    ...hito,
    estadoInicial: hito.dependeDeTMinusDias == null ? 'pendiente' : 'bloqueada_por_dependencia',
  }))
}

/**
 * Dado el array de hitos (con dependeDeTMinusDias) y el array de tareas
 * ya insertadas en BD (con sus IDs reales y t_minus_dias),
 * construye la lista de actualizaciones para enlazar el DAG.
 *
 * El matching se hace por tMinusDias (valor único dentro de un protocolo).
 *
 * @param {Array<{tMinusDias: number, dependeDeTMinusDias: number|null}>} hitos
 * @param {Array<{id: string, t_minus_dias: number}>} tareasInsertadas
 * @returns {Array<{tareaId: string, dependeDeTareaId: string}>}
 */
export function construirArcosDag(hitos, tareasInsertadas) {
  const tMinusAId = new Map(tareasInsertadas.map(t => [t.t_minus_dias, t.id]))

  return hitos
    .filter(h => h.dependeDeTMinusDias != null)
    .map(h => ({
      tareaId:          tMinusAId.get(h.tMinusDias) ?? null,
      dependeDeTareaId: tMinusAId.get(h.dependeDeTMinusDias) ?? null,
    }))
    .filter(arco => arco.tareaId !== null && arco.dependeDeTareaId !== null)
}

/**
 * Valida que el grafo de dependencias no tiene ciclos.
 * Lanza Error si encuentra un ciclo, con el tMinusDias donde ocurre.
 *
 * @param {Array<{tMinusDias: number, dependeDeTMinusDias: number|null}>} hitos
 * @throws {Error} si hay dependencia circular o auto-referencia
 */
export function validarSinCiclos(hitos) {
  const mapa = new Map(hitos.map(h => [h.tMinusDias, h.dependeDeTMinusDias ?? null]))

  for (const [inicio] of mapa) {
    const visitados = new Set()
    let cursor = inicio

    while (cursor !== null) {
      if (visitados.has(cursor)) {
        throw new Error(
          `Ciclo detectado en el grafo DAG del protocolo WBS: tMinusDias=${cursor}`
        )
      }
      visitados.add(cursor)
      cursor = mapa.get(cursor) ?? null
    }
  }
}

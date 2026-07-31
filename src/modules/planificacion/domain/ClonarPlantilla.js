/**
 * ClonarPlantilla.js — Espejo puro (sin base de datos) del algoritmo de copia
 * del RPC `clonar_plantilla_a_clase`
 * (supabase/migrations/20260731000005_mapa_plantillas.sql).
 *
 * El RPC real es `SECURITY DEFINER` en Postgres y no es ejecutable desde
 * Vitest sin una base de datos real. Esta función simula la copia: dado el
 * catálogo global (objetivos + indicators) de un nivel, produce el árbol
 * class-owned equivalente con `origen_*` poblado e IDs NUEVOS e
 * INDEPENDIENTES — nunca comparte fila con el catálogo original (REQ-10,
 * design.md Decisión 6: "Clonar debe crear una copia independiente y
 * editable").
 */

let _contador = 0

function _nuevoId(prefix) {
  _contador += 1
  return `${prefix}-clonado-${_contador}`
}

/**
 * Reinicia el contador de IDs simulados — usar en beforeEach de los tests
 * para que las corridas sean deterministas y no dependan del orden global.
 */
export function _resetContadorParaTests() {
  _contador = 0
}

/**
 * @param {Object} params
 * @param {string} params.claseId
 * @param {string} params.levelId
 * @param {Array<{id: string, nodeId: string, nombre: string, descripcion?: string, indicadores: Array<{id: string, descripcion: string}>}>} params.objetivosGlobales -
 *   catálogo global (objetivos + sus indicators) ya filtrado por
 *   route_version_id + level_id de la plantilla
 * @param {Array<string>|null} [params.nodeIdsFiltro] - si se provee, solo
 *   clona los objetivos cuyo nodeId esté en esta lista (p_node_ids del RPC)
 * @returns {Array<{
 *   id: string, clase_id: string, level_id: string,
 *   origen_node_id: string, origen_objetivo_id: string,
 *   nombre: string, descripcion: string|null,
 *   indicadores: Array<{id: string, objetivo_id: string, origen_indicator_id: string, descripcion: string}>
 * }>}
 */
export function clonarPlantillaAClase({ claseId, levelId, objetivosGlobales, nodeIdsFiltro = null }) {
  const objetivosFiltrados = nodeIdsFiltro
    ? objetivosGlobales.filter((o) => nodeIdsFiltro.includes(o.nodeId))
    : objetivosGlobales

  return objetivosFiltrados.map((objetivoGlobal) => {
    const nuevoObjetivoId = _nuevoId('obj')
    return {
      id: nuevoObjetivoId,
      clase_id: claseId,
      level_id: levelId,
      origen_node_id: objetivoGlobal.nodeId,
      origen_objetivo_id: objetivoGlobal.id,
      nombre: objetivoGlobal.nombre,
      descripcion: objetivoGlobal.descripcion ?? null,
      indicadores: (objetivoGlobal.indicadores || []).map((indicadorGlobal) => ({
        id: _nuevoId('ind'),
        objetivo_id: nuevoObjetivoId,
        origen_indicator_id: indicadorGlobal.id,
        descripcion: indicadorGlobal.descripcion,
      })),
    }
  })
}

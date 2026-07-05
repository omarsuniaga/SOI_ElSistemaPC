import MOCK_DATA from './curriculo_tres_planos.json'

/**
 * Store compartido en memoria/localStorage para route_versions en modo demo
 * — curriculo-tres-planos WU #8/#9.
 *
 * Unifica el almacén que leen y escriben propuestasMock.js (ACM,
 * src/modules/planificacion/api) y proponerContenidoMock.js (maestro,
 * src/portal-maestros/services) para que una propuesta recién creada por el
 * maestro sea visible inmediatamente en la bandeja ACM — antes eran dos
 * localStorage keys desconectadas (gap encontrado en el test de integración
 * de WU #9).
 */
const STORAGE_KEY = 'curriculo_tres_planos_route_versions_demo'
const SCHEMA_VERSION = 2 // v2: soporta filas con estructura embebida (propuestas del maestro)

let _routeVersions = null

function _ensureStore() {
  if (_routeVersions !== null) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION && Array.isArray(parsed.rows)) {
        _routeVersions = parsed.rows
        return
      }
    }
  } catch {}
  _routeVersions = JSON.parse(JSON.stringify(MOCK_DATA.route_versions))
  _persist()
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows: _routeVersions, schemaVersion: SCHEMA_VERSION }))
  } catch (e) {
    console.warn('[curriculoTresPlanosStore] Failed to persist:', e.message)
  }
}

export function getAll() {
  _ensureStore()
  return _routeVersions
}

export function findById(routeVersionId) {
  _ensureStore()
  return _routeVersions.find((rv) => rv.id === routeVersionId) || null
}

export function insert(row) {
  _ensureStore()
  _routeVersions.push(row)
  _persist()
  return { ...row }
}

export function update(routeVersionId, patch) {
  _ensureStore()
  const idx = _routeVersions.findIndex((rv) => rv.id === routeVersionId)
  if (idx === -1) throw new Error('Propuesta no encontrada.')
  _routeVersions[idx] = { ..._routeVersions[idx], ...patch, updated_at: new Date().toISOString() }
  _persist()
  return { ..._routeVersions[idx] }
}

/**
 * Construye el árbol levels->nodes->objetivos->indicators para una
 * route_version. Prioriza `row.estructura` (formato del parser — niveles/
 * temas/objetivos/indicadores) si está embebida (propuestas creadas en
 * demo por el maestro); si no, cae al fixture relacional estático
 * (route_versions pre-cargadas del JSON base).
 */
export function buildLevelsTree(row) {
  if (row?.estructura?.niveles) {
    return row.estructura.niveles.map((nivel, lvlIdx) => ({
      id: `${row.id}-level-${lvlIdx}`,
      level_number: nivel.numero_nivel ?? lvlIdx + 1,
      name: nivel.nombre,
      nodes: (nivel.temas || []).map((tema, nodeIdx) => ({
        id: `${row.id}-node-${lvlIdx}-${nodeIdx}`,
        name: tema.nombre,
        objetivos: (tema.objetivos || []).map((obj, objIdx) => ({
          id: `${row.id}-obj-${lvlIdx}-${nodeIdx}-${objIdx}`,
          nombre: obj.nombre,
          indicators: (obj.indicadores || []).map((ind, indIdx) => ({
            id: `${row.id}-ind-${lvlIdx}-${nodeIdx}-${objIdx}-${indIdx}`,
            description: ind.descripcion,
            is_required: ind.es_requerido !== false,
          })),
        })),
      })),
    }))
  }

  return MOCK_DATA.levels
    .filter((lv) => lv.route_version_id === row.id)
    .map((lv) => ({
      ...lv,
      nodes: MOCK_DATA.nodes
        .filter((n) => n.level_id === lv.id)
        .map((n) => ({
          ...n,
          objetivos: MOCK_DATA.objetivos
            .filter((o) => o.node_id === n.id)
            .map((o) => ({
              ...o,
              indicators: MOCK_DATA.indicators.filter((i) => i.objetivo_id === o.id),
            })),
        })),
    }))
}

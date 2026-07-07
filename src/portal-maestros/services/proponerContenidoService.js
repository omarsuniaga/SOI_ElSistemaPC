import { supabase } from '../../lib/supabaseClient.js'

/**
 * Servicio de propuestas de contenido curricular — curriculo-tres-planos WU #7.
 *
 * enviarPropuesta toma la estructura ya parseada y VALIDADA por
 * planningParserService (WU #4) — { niveles: [{ temas: [{ objetivos: [{
 * indicadores }] }] }] } — y la persiste como una nueva route_version con
 * origen='maestro' y status='propuesta' (único valor que la policy RLS
 * maestro_insert_propuesta permite en INSERT, ver
 * supabase/migrations/20260704_000002_route_status_enum.sql).
 *
 * route_versions.route_id es NOT NULL en producción: se reutiliza el
 * route_id de la versión más reciente ya asociada a la clase (una clase
 * siempre cuelga de una ruta existente). Los niveles/temas/objetivos/
 * indicadores se insertan en cascada respetando las FKs reales.
 */
export async function enviarPropuesta(estructura, { maestroId, claseId } = {}) {
  if (!maestroId) {
    throw new Error('enviarPropuesta: se requiere maestroId.')
  }
  if (!claseId) {
    throw new Error('enviarPropuesta: se requiere claseId.')
  }

  const routeId = await _resolveRouteIdForClase(claseId)

  const { data: routeVersion, error: rvError } = await supabase
    .from('route_versions')
    .insert({
      route_id: routeId,
      version: `propuesta-${Date.now()}`,
      origen: 'maestro',
      status: 'propuesta',
      propuesta_por: maestroId,
      clase_id: claseId,
    })
    .select()
    .single()

  if (rvError) throw rvError

  await _insertNiveles(routeVersion.id, estructura.niveles || [])

  return routeVersion
}

async function _resolveRouteIdForClase(claseId) {
  const { data, error } = await supabase
    .from('route_versions')
    .select('route_id')
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row?.route_id) {
    throw new Error('No se encontró una ruta existente asociada a esta clase.')
  }
  return row.route_id
}

async function _insertNiveles(routeVersionId, niveles) {
  for (const [levelIdx, nivel] of niveles.entries()) {
    const { data: level, error: levelError } = await supabase
      .from('levels')
      .insert({
        route_version_id: routeVersionId,
        level_number: nivel.numero_nivel ?? levelIdx + 1,
        name: nivel.nombre,
        main_objective: nivel.objetivo_general || null,
      })
      .select()
      .single()
    if (levelError) throw levelError

    await _insertTemas(routeVersionId, level.id, nivel.temas || [])
  }
}

async function _insertTemas(routeVersionId, levelId, temas) {
  for (const [nodeIdx, tema] of temas.entries()) {
    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .insert({
        level_id: levelId,
        route_version_id: routeVersionId,
        name: tema.nombre,
        type: tema.tipo || 'TECNICA',
        is_critical: Boolean(tema.es_critico),
        order_index: nodeIdx,
      })
      .select()
      .single()
    if (nodeError) throw nodeError

    await _insertObjetivos(node.id, tema.objetivos || [])
  }
}

async function _insertObjetivos(nodeId, objetivos) {
  for (const [objIdx, objetivo] of objetivos.entries()) {
    const { data: obj, error: objError } = await supabase
      .from('objetivos')
      .insert({ node_id: nodeId, nombre: objetivo.nombre, order_index: objIdx })
      .select()
      .single()
    if (objError) throw objError

    const indicadores = (objetivo.indicadores || []).map((ind, indIdx) => ({
      node_id: nodeId,
      objetivo_id: obj.id,
      description: ind.descripcion,
      is_required: ind.es_requerido !== false,
      order_index: indIdx,
    }))
    if (indicadores.length) {
      const { error: indError } = await supabase.from('indicators').insert(indicadores)
      if (indError) throw indError
    }
  }
}

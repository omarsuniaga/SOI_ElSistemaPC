import MOCK_DATA from '../../../assets/data/mocks/curriculo_tres_planos.json'

/**
 * Réplica en memoria de fn_objetivo_actual_alumno (WU #5) para modo demo —
 * curriculo-tres-planos WU #8.
 *
 * Recorre el mismo mock de datos (levels -> nodes -> objetivos ->
 * indicators) que alimenta el resto del módulo de planificación en demo,
 * respetando is_required e indicator_attempts.result='approved' igual que
 * la función SQL real. Mantiene paridad de contrato de salida.
 */
export async function getObjetivoActual(alumnoId, routeVersionId) {
  if (!alumnoId) {
    throw new Error('getObjetivoActual: se requiere alumnoId.')
  }
  if (!routeVersionId) {
    throw new Error('getObjetivoActual: se requiere routeVersionId.')
  }

  const emptyResult = () => ({
    objetivo_actual_id: null,
    nombre: null,
    tema_id: null,
    tema_nombre: null,
    nivel_id: null,
    indicadores_pendientes_requeridos: 0,
  })

  const levels = MOCK_DATA.levels
    .filter((lv) => lv.route_version_id === routeVersionId)
    .sort((a, b) => a.level_number - b.level_number)
  if (!levels.length) return emptyResult()

  const approvedIndicatorIds = new Set(
    MOCK_DATA.indicator_attempts
      .filter((a) => a.student_id === alumnoId && a.result === 'approved')
      .map((a) => a.indicator_id),
  )

  for (const level of levels) {
    const nodes = MOCK_DATA.nodes
      .filter((n) => n.level_id === level.id)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

    for (const node of nodes) {
      const objetivos = MOCK_DATA.objetivos
        .filter((o) => o.node_id === node.id && o.activo !== false)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

      for (const objetivo of objetivos) {
        const indicadoresRequeridos = MOCK_DATA.indicators.filter(
          (i) => i.objetivo_id === objetivo.id && i.is_required !== false,
        )
        const pendientes = indicadoresRequeridos.filter((i) => !approvedIndicatorIds.has(i.id)).length

        if (pendientes > 0) {
          return {
            objetivo_actual_id: objetivo.id,
            nombre: objetivo.nombre,
            tema_id: node.id,
            tema_nombre: node.name,
            nivel_id: level.id,
            indicadores_pendientes_requeridos: pendientes,
          }
        }
      }
    }
  }

  return emptyResult()
}

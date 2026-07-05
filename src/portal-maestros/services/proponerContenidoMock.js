import * as store from '../../assets/data/mocks/curriculoTresPlanosStore.js'

function _delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Réplica en memoria de enviarPropuesta (proponerContenidoService.js, WU #7)
 * — curriculo-tres-planos WU #8/#9. Escribe en el mismo store compartido
 * (curriculoTresPlanosStore.js) que lee propuestasMock.js, para que la
 * propuesta sea visible de inmediato en la bandeja ACM en modo demo.
 *
 * Guarda la estructura completa embebida (`estructura`) en vez de filas
 * relacionales separadas — en demo no hay necesidad de cascada entre
 * tablas; buildLevelsTree() sabe reconstruir el árbol desde ese campo.
 */
export async function enviarPropuesta(estructura, { maestroId, claseId } = {}) {
  if (!maestroId) {
    throw new Error('enviarPropuesta: se requiere maestroId.')
  }
  if (!claseId) {
    throw new Error('enviarPropuesta: se requiere claseId.')
  }

  await _delay()

  const nueva = {
    id: `demo-route-version-propuesta-${Date.now()}`,
    route_id: 'demo-route-1',
    clase_id: claseId,
    origen: 'maestro',
    status: 'propuesta',
    propuesta_por: maestroId,
    feedback: null,
    created_at: new Date().toISOString(),
    estructura,
  }

  return store.insert(nueva)
}

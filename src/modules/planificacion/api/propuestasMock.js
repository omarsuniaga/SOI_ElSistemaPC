import * as store from '../../../assets/data/mocks/curriculoTresPlanosStore.js'

function _delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Réplica en memoria de propuestasApi.js — curriculo-tres-planos WU #8/#9.
 * Lee/escribe el store compartido (curriculoTresPlanosStore.js) para que
 * las propuestas creadas por el maestro (proponerContenidoMock.js) sean
 * visibles inmediatamente en la bandeja ACM en modo demo.
 */
export async function listarPropuestasPendientes() {
  await _delay()
  return store
    .getAll()
    .filter((rv) => rv.origen === 'maestro' && rv.status === 'propuesta')
    .map((rv) => ({ ...rv, levels: store.buildLevelsTree(rv) }))
}

export async function publicarPropuesta(routeVersionId) {
  if (!routeVersionId) {
    throw new Error('publicarPropuesta: se requiere routeVersionId.')
  }
  await _delay()
  if (!store.findById(routeVersionId)) throw new Error('Propuesta no encontrada.')
  return store.update(routeVersionId, { status: 'published' })
}

export async function devolverPropuesta(routeVersionId, feedback) {
  if (!routeVersionId) {
    throw new Error('devolverPropuesta: se requiere routeVersionId.')
  }
  if (!feedback || !feedback.trim()) {
    throw new Error('devolverPropuesta: se requiere feedback para explicar el motivo de la devolución.')
  }
  await _delay()
  if (!store.findById(routeVersionId)) throw new Error('Propuesta no encontrada.')
  return store.update(routeVersionId, { status: 'devuelta', feedback: feedback.trim() })
}

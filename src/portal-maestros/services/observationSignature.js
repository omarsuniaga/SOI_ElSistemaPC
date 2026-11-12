import { resolverPertenenciaClase } from './suplenciaService.js'

export function buildObservationSignature(maestroId, context = {}) {
  const actorId = context.actorMaestroId || maestroId
  const membership = resolverPertenenciaClase(context.clase, actorId)
  return {
    maestro_id: actorId,
    user_id: context.maestroUserId || context.userId || null,
    nombre: context.actorNombre || null,
    rol: membership.esTitular ? 'titular' : membership.esSuplente ? 'suplente' : null,
    fecha: new Date().toISOString(),
  }
}

export function observationSignatureLabel(signature) {
  if (!signature?.maestro_id) return 'Autor no registrado'
  const role = signature.rol === 'suplente' ? 'Maestro suplente'
    : signature.rol === 'titular' ? 'Maestro titular' : 'Maestro'
  return `Escrita por ${signature.nombre || 'maestro sin nombre registrado'} · ${role}`
}

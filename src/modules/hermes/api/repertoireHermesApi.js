import { detectMaterialSignals, explainSignal, observeSignals, proposeTaskFromSignal, recommendFromSignal, authorizeHermesSignal, routeMutationRequest } from '../logic/repertoireHermes.js'
import * as tareasApi from './tareasApi.js'

export async function observeRepertoireSignals({ signalReader, authorizedSignalIds = null } = {}) {
  if (typeof signalReader !== 'function') throw new TypeError('Hermes requiere un lector de señales')
  return observeSignals({ signals: await signalReader(), authorizedSignalIds })
}

export function detectRepertoireSignals(signals, previous = new Map()) {
  return detectMaterialSignals(signals, previous)
}

export function explainRepertoireSignal(signal, canAccess) {
  authorizeHermesSignal({ signal, canAccess })
  return explainSignal(signal)
}

export function recommendRepertoireSignal(signal, canAccess) {
  authorizeHermesSignal({ signal, canAccess })
  return recommendFromSignal(signal)
}

export function proposeRepertoireTask(signal, actorId, canAccess) {
  authorizeHermesSignal({ signal, canAccess })
  return proposeTaskFromSignal(signal, actorId)
}

export async function confirmRepertoireTask(signal, { actorId, canAccess, taskApi = tareasApi } = {}) {
  authorizeHermesSignal({ signal, canAccess })
  const proposal = proposeTaskFromSignal(signal, actorId)
  if (!proposal) throw new Error('No se puede crear una tarea sin actor confirmado')
  const task = await taskApi.crearTareaInstitucional({
    ...proposal,
    // Preserve provenance using the already-approved institutional task substrate.
    entidad_tipo: 'otro',
    entidad_id: proposal.entidad_id,
    entidad_label: `${proposal.entidad_label || 'Repertorio'} · ${proposal.deep_link || 'evidencia'}`,
    descripcion: `${proposal.description}${proposal.deep_link ? `\nEvidencia: ${proposal.deep_link}` : ''}`,
  })
  return { task, sourceSignalId: proposal.source_signal_id, deepLink: proposal.deep_link }
}

export function routeHermesMutation(request, canAccess) {
  if (typeof canAccess === 'function' && !canAccess(request)) throw new Error('Solicitud de preparación no autorizada')
  return routeMutationRequest(request, request?.deepLink)
}

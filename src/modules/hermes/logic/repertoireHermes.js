const MATERIAL_LIFECYCLES = new Set(['OPEN', 'ACKNOWLEDGED'])
const SEVERITY_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }

export function observeSignals({ signals = [], authorizedSignalIds = null } = {}) {
  return signals.filter((item) => !authorizedSignalIds || authorizedSignalIds.includes(item.id || item.sourceEntityId))
}

export function detectMaterialSignals(signals = [], previous = new Map()) {
  return signals.filter((item) => {
    if (!MATERIAL_LIFECYCLES.has(item.lifecycle || 'OPEN')) return false
    const key = item.dedupeKey || item.id || item.sourceEntityId
    const prior = previous instanceof Map ? previous.get(key) : previous?.[key]
    return !prior || (SEVERITY_RANK[item.severity] || 0) > (SEVERITY_RANK[prior.severity] || 0) || JSON.stringify(prior.evidence) !== JSON.stringify(item.evidence)
  })
}

export function explainSignal(signal) {
  if (!signal?.reason) return { text: 'No hay evidencia suficiente para explicar esta señal.', sources: [] }
  const evidence = signal.evidence || {}
  const facts = [
    evidence.passageName || evidence.title,
    evidence.redMeasures != null ? `${evidence.redMeasures} compases en rojo` : null,
    evidence.milestoneOverdue ? 'el hito está vencido' : null,
    evidence.daysToEvent != null ? `faltan ${evidence.daysToEvent} días para el evento` : null,
  ].filter(Boolean)
  return {
    text: facts.length ? `${facts.join('; ')}. ${signal.reason}.` : signal.reason,
    sources: ['SIGNAL', ...(evidence.sources || [])],
    signalId: signal.id || signal.sourceEntityId,
  }
}

export function recommendFromSignal(signal) {
  const link = signal?.deepLink || null
  return link ? [{ label: 'Abrir evidencia', deepLink: link, sourceSignalId: signal.id || signal.sourceEntityId }] : []
}

export function proposeTaskFromSignal(signal, actorId) {
  if (!signal?.reason || !actorId) return null
  return {
    title: `Revisar ${signal.evidence?.passageName || signal.evidence?.title || 'material crítico'}`,
    description: signal.reason,
    departamento: 'ACM',
    prioridad: signal.severity === 'CRITICAL' ? 'critica' : 'alta',
    entidad_tipo: 'repertorio_signal',
    entidad_id: signal.id || signal.sourceEntityId,
    entidad_label: signal.evidence?.passageName || signal.evidence?.title || null,
    correlation_id: signal.correlationId || null,
    source_signal_id: signal.id || signal.sourceEntityId,
    deep_link: signal.deepLink || null,
    proposed_by: actorId,
  }
}

export function authorizeHermesSignal({ signal, canAccess }) {
  if (!signal || typeof canAccess !== 'function' || !canAccess(signal)) throw new Error('Señal de repertorio no autorizada')
  return true
}

export function routeMutationRequest(request, deepLink) {
  return { allowed: false, reason: 'Hermes no modifica preparación; use el flujo autorizado.', deepLink: deepLink || request?.deepLink || null }
}

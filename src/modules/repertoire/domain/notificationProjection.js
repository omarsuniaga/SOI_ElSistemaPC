const ACTIVE_LIFECYCLES = new Set(['OPEN', 'ACKNOWLEDGED'])

export function normalizeRepertoireDelivery(delivery) {
  const signal = delivery?.repertoire_signals || delivery?.signal || delivery
  if (!signal?.id && !signal?.sourceEntityId) return null
  return {
    id: delivery?.id || signal.id || signal.dedupeKey,
    signalId: signal.id || null,
    source: 'REPERTOIRE_SIGNAL',
    title: signal.evidence?.title || signal.evidence?.passageName || signal.reason,
    message: signal.reason,
    severity: signal.severity || 'MEDIUM',
    lifecycle: signal.lifecycle || delivery?.status || 'OPEN',
    acknowledged: delivery?.status === 'READ' || signal.lifecycle === 'ACKNOWLEDGED',
    createdAt: delivery?.created_at || signal.createdAt,
    updatedAt: signal.updatedAt || delivery?.updated_at || signal.createdAt,
    deepLink: signal.deepLink || null,
    evidence: signal.evidence || {},
    dedupeKey: signal.dedupeKey,
  }
}

export function projectNotifications(legacy = [], repertoireDeliveries = []) {
  const legacyItems = legacy.map((item) => ({
    ...item,
    source: 'LEGACY_NOTIFICATION',
    lifecycle: item.estado === 'leida' ? 'ACKNOWLEDGED' : 'OPEN',
    acknowledged: item.estado === 'leida',
    createdAt: item.created_at,
    deepLink: item.deep_link || null,
  }))
  const repertoireItems = repertoireDeliveries.map(normalizeRepertoireDelivery).filter(Boolean)
  return [...legacyItems, ...repertoireItems]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

export function isActiveNotification(item) {
  return item?.source === 'REPERTOIRE_SIGNAL'
    ? ACTIVE_LIFECYCLES.has(item.lifecycle) && !item.acknowledged
    : item?.lifecycle === 'OPEN' && !item.acknowledged
}

export function getActionableCount(items = []) {
  return items.filter(isActiveNotification).length
}

export function notificationLifecycleLabel(item) {
  return item?.lifecycle === 'ACKNOWLEDGED' || item?.acknowledged ? 'ACKNOWLEDGED' : (item?.lifecycle || 'OPEN')
}

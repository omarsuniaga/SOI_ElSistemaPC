const DEFAULT_PILOT_IDS = ''

export function parseRepertoirePilotIds(value = DEFAULT_PILOT_IDS) {
  return String(value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export function isRepertoirePilotUser(maestroId, {
  enabled = import.meta.env.VITE_REPERTOIRE_ENABLED === 'true',
  pilotIds = import.meta.env.VITE_REPERTOIRE_PILOT_MAESTRO_IDS || DEFAULT_PILOT_IDS,
} = {}) {
  if (!enabled || !maestroId) return false
  return parseRepertoirePilotIds(pilotIds).includes(String(maestroId))
}

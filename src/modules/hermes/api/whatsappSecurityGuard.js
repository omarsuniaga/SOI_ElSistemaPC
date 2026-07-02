const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions?/i,
  /system\s+prompt/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /mu[eé]strame\s+tu\s+prompt/i,
  /dime\s+tu\s+prompt/i,
  /dime\s+qu[eé]\s+procesos?\s+sigues?/i,
  /consulta\s+la\s+base/i,
  /extrae\s+datos/i,
  /sql/i,
  /base\s+de\s+datos/i,
  /token[s]?\s+máxim[oa]/i,
]

export const WHATSAPP_SECURITY_DEFAULTS = Object.freeze({
  maxTokensPerTurn: 350,
  maxTokensPerSession: 1200,
  maxMessagesPerMinute: 10,
  maxRetriesPerTopic: 3,
  maxCharsPerMessage: 1200,
})

export function detectPromptInjection(text = '') {
  const value = String(text || '')
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value))
}

export function clampMessageText(text = '', maxChars = WHATSAPP_SECURITY_DEFAULTS.maxCharsPerMessage) {
  const value = String(text || '')
  if (value.length <= maxChars) return value
  return `${value.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`
}

export function estimateTokenBudget(text = '') {
  const value = String(text || '')
  return Math.max(1, Math.ceil(value.length / 4))
}

export function shouldBlockSensitiveMessage(text = '') {
  return detectPromptInjection(text)
}

export function buildSafeRejectionMessage() {
  return 'Disculpe la molestia, solo puedo asistirle con información institucional autorizada. ¿En qué más puedo ayudarle?'
}

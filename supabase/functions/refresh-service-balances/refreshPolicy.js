export const DEFAULT_REFRESH_MIN_INTERVAL_SECONDS = 900

export function getRefreshMinIntervalSeconds(value) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 60 || parsed > 86_400) {
    return DEFAULT_REFRESH_MIN_INTERVAL_SECONDS
  }
  return parsed
}

export function getRefreshIntervalDecision(lastQueryAt, minIntervalSeconds, now = Date.now()) {
  if (!lastQueryAt) return { allowed: true, retryAfterSeconds: 0 }

  const lastQueryAtMs = Date.parse(lastQueryAt)
  if (Number.isNaN(lastQueryAtMs)) return { allowed: true, retryAfterSeconds: 0 }

  const elapsedSeconds = Math.max(0, Math.floor((now - lastQueryAtMs) / 1000))
  const retryAfterSeconds = Math.max(0, minIntervalSeconds - elapsedSeconds)
  return { allowed: retryAfterSeconds === 0, retryAfterSeconds }
}

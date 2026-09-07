export function createGatewaySnapshot({ instanceName, qr, qrExpiresAt, connected }) {
  return {
    type: 'gateway.status',
    instanceName,
    qr: qr && qrExpiresAt > Date.now() ? qr : null,
    qrExpiresAt: qr && qrExpiresAt > Date.now() ? qrExpiresAt : null,
    connected: Boolean(connected),
  }
}

export function parseGatewayAuthMessage(raw) {
  try {
    const message = JSON.parse(raw.toString())
    if (message.type !== 'auth') return null
    const key = typeof message.key === 'string' ? message.key : null
    const token = typeof message.token === 'string' ? message.token : null
    if (!key && !token) return null
    return { key, token }
  } catch {
    return null
  }
}

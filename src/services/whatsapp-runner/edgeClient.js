/**
 * edgeClient — cliente HTTP de la Edge Function `whatsapp-gateway`.
 *
 * SDD whatsapp-gateway-multidepto · F3.
 *
 * La app Electron nunca habla con Supabase directo: todo pasa por esta función,
 * autenticado con el device token. `fetch` es inyectable para testear.
 */

export class EdgeClientError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'EdgeClientError'
    this.code = code
  }
}

export function createEdgeClient({ baseUrl, deviceToken, fetchImpl }) {
  if (!baseUrl) throw new Error('edgeClient: baseUrl requerido')
  if (!deviceToken) throw new Error('edgeClient: deviceToken requerido')
  const base = String(baseUrl).replace(/\/+$/, '')
  const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
  if (!doFetch) throw new Error('edgeClient: no hay implementación de fetch disponible')

  async function call(ruta, body) {
    const res = await doFetch(`${base}/${ruta}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deviceToken}`,
      },
      body: JSON.stringify(body ?? {}),
    })

    if (res.status === 401) {
      throw new EdgeClientError('token_invalido', 401)
    }
    if (!res.ok) {
      let detalle = ''
      try { detalle = await res.text() } catch { /* noop */ }
      throw new EdgeClientError(`HTTP ${res.status}${detalle ? `: ${detalle}` : ''}`, res.status)
    }
    return res.json()
  }

  return {
    /** @returns {Promise<{mensajes: Array<{id,jid,mensaje}>, ventana_ok: boolean, cap_restante: number}>} */
    claim: (limite) => call('claim', Number(limite) > 0 ? { limite: Number(limite) } : {}),
    /** @param {Array<{id, estado: 'enviado'|'fallido', error_msg?, procesado_at?}>} resultados */
    report: (resultados) => call('report', { resultados: resultados || [] }),
    heartbeat: (payload) => call('heartbeat', payload || {}),
  }
}

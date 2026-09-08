import { describe, it, expect, vi } from 'vitest'
import { createEdgeClient, EdgeClientError } from '../../src/services/whatsapp-runner/edgeClient.js'

function res(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }
}

describe('createEdgeClient', () => {
  it('exige baseUrl y deviceToken', () => {
    expect(() => createEdgeClient({ deviceToken: 't', fetchImpl: vi.fn() })).toThrow(/baseUrl/)
    expect(() => createEdgeClient({ baseUrl: 'x', fetchImpl: vi.fn() })).toThrow(/deviceToken/)
  })

  it('claim arma la request con Bearer y normaliza baseUrl', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { mensajes: [], ventana_ok: true, cap_restante: 10 }))
    const c = createEdgeClient({ baseUrl: 'https://x.supabase.co/functions/v1/whatsapp-gateway/', deviceToken: 'tok', fetchImpl })

    const out = await c.claim(5)

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://x.supabase.co/functions/v1/whatsapp-gateway/claim',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer tok', 'Content-Type': 'application/json' }),
        body: JSON.stringify({ limite: 5 }),
      }),
    )
    expect(out).toEqual({ mensajes: [], ventana_ok: true, cap_restante: 10 })
  })

  it('claim sin límite manda body vacío', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, {}))
    const c = createEdgeClient({ baseUrl: 'https://x/wg', deviceToken: 'tok', fetchImpl })
    await c.claim()
    expect(fetchImpl.mock.calls[0][1].body).toBe('{}')
  })

  it('report manda { resultados }', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { aplicados: 1, ignorados: 0 }))
    const c = createEdgeClient({ baseUrl: 'https://x/wg', deviceToken: 'tok', fetchImpl })
    await c.report([{ id: 'q1', estado: 'enviado' }])
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ resultados: [{ id: 'q1', estado: 'enviado' }] })
  })

  it('401 -> EdgeClientError con code 401', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(401, { error: 'token_invalido' }))
    const c = createEdgeClient({ baseUrl: 'https://x/wg', deviceToken: 'tok', fetchImpl })
    await expect(c.claim()).rejects.toMatchObject({ name: 'EdgeClientError', code: 401 })
  })

  it('500 -> EdgeClientError con el detalle', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(500, 'boom interno'))
    const c = createEdgeClient({ baseUrl: 'https://x/wg', deviceToken: 'tok', fetchImpl })
    await expect(c.claim()).rejects.toThrow(/HTTP 500: boom interno/)
  })

  it('heartbeat pasa el payload tal cual', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { ok: true }))
    const c = createEdgeClient({ baseUrl: 'https://x/wg', deviceToken: 'tok', fetchImpl })
    await c.heartbeat({ status: 'connected', nombre_equipo: 'PC-ADM-01' })
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ status: 'connected', nombre_equipo: 'PC-ADM-01' })
  })
})

describe('contentGuard re-export', () => {
  it('expone clampMessageText del guard compartido', async () => {
    const g = await import('../../src/services/whatsapp-runner/contentGuard.js')
    expect(typeof g.clampMessageText).toBe('function')
    expect(g.clampMessageText('abc', 2)).toMatch(/…$/)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { createDispatchLoop, normalizarJid } from '../../src/services/whatsapp-runner/dispatchLoop.js'

const guard = { clampMessageText: (t) => String(t ?? '') }

function baseDeps(overrides = {}) {
  return {
    edgeClient: {
      claim: vi.fn().mockResolvedValue({ mensajes: [], ventana_ok: true, cap_restante: 100 }),
      report: vi.fn().mockResolvedValue({ aplicados: 0, ignorados: 0 }),
    },
    sendMessage: vi.fn().mockResolvedValue({ key: { id: 'srv-1' } }),
    ackWaiter: { waitFor: vi.fn().mockResolvedValue(undefined) },
    guard,
    businessHours: () => true,
    config: { claimLimit: 5, jitterMinMs: 0, jitterMaxMs: 0 },
    logger: { warn: vi.fn(), error: vi.fn() },
    now: () => new Date('2026-09-07T18:00:00Z'),
    sleep: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('normalizarJid', () => {
  it('número a jid', () => {
    expect(normalizarJid('+1 (829) 555-0101')).toBe('18295550101@s.whatsapp.net')
  })
  it('respeta un jid ya formado', () => {
    expect(normalizarJid('18295550101@s.whatsapp.net')).toBe('18295550101@s.whatsapp.net')
  })
})

describe('dispatchLoop.tick', () => {
  it('claim vacío -> noop', async () => {
    const d = baseDeps()
    const loop = createDispatchLoop(d)
    const r = await loop.tick()
    expect(r).toMatchObject({ enviados: 0, fallidos: 0 })
    expect(d.sendMessage).not.toHaveBeenCalled()
    expect(d.edgeClient.report).not.toHaveBeenCalled()
  })

  it('N mensajes -> N envíos + report con todos enviado', async () => {
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn().mockResolvedValue({
          mensajes: [
            { id: 'q1', jid: '18290000001', mensaje: 'a' },
            { id: 'q2', jid: '18290000002', mensaje: 'b' },
          ],
          ventana_ok: true,
          cap_restante: 50,
        }),
        report: vi.fn().mockResolvedValue({}),
      },
    })
    const loop = createDispatchLoop(d)
    const r = await loop.tick()

    expect(d.sendMessage).toHaveBeenCalledTimes(2)
    expect(d.sendMessage).toHaveBeenCalledWith('18290000001@s.whatsapp.net', { text: 'a' })
    expect(d.ackWaiter.waitFor).toHaveBeenCalledTimes(2)
    expect(d.edgeClient.report).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q1', estado: 'enviado' }),
      expect.objectContaining({ id: 'q2', estado: 'enviado' }),
    ])
    expect(r).toMatchObject({ enviados: 2, fallidos: 0 })
  })

  it('timeout de ACK -> ese mensaje queda fallido', async () => {
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn().mockResolvedValue({ mensajes: [{ id: 'q1', jid: '1829', mensaje: 'x' }], ventana_ok: true }),
        report: vi.fn().mockResolvedValue({}),
      },
      ackWaiter: { waitFor: vi.fn().mockRejectedValue(new Error('Timeout esperando confirmación')) },
    })
    const loop = createDispatchLoop(d)
    const r = await loop.tick()
    expect(r).toMatchObject({ enviados: 0, fallidos: 1 })
    expect(d.edgeClient.report).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q1', estado: 'fallido', error_msg: expect.stringMatching(/Timeout/) }),
    ])
  })

  it('ventana_ok=false -> skipped, sin envíos', async () => {
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn().mockResolvedValue({ mensajes: [], ventana_ok: false, cap_restante: 0 }),
        report: vi.fn(),
      },
    })
    const loop = createDispatchLoop(d)
    const r = await loop.tick()
    expect(r).toMatchObject({ skipped: 'ventana_cerrada' })
    expect(d.sendMessage).not.toHaveBeenCalled()
  })

  it('businessHours falso -> no llama a claim', async () => {
    const d = baseDeps({ businessHours: () => false })
    const loop = createDispatchLoop(d)
    const r = await loop.tick()
    expect(r).toMatchObject({ skipped: 'fuera_de_ventana' })
    expect(d.edgeClient.claim).not.toHaveBeenCalled()
  })

  it('claim que tira 401 -> skipped claim_error', async () => {
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn().mockRejectedValue(Object.assign(new Error('token_invalido'), { code: 401 })),
        report: vi.fn(),
      },
    })
    const loop = createDispatchLoop(d)
    const r = await loop.tick()
    expect(r).toMatchObject({ skipped: 'claim_error' })
  })

  it('aplica jitter entre mensajes, no después del último', async () => {
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn().mockResolvedValue({
          mensajes: [
            { id: 'q1', jid: '1', mensaje: 'a' },
            { id: 'q2', jid: '2', mensaje: 'b' },
            { id: 'q3', jid: '3', mensaje: 'c' },
          ],
          ventana_ok: true,
        }),
        report: vi.fn().mockResolvedValue({}),
      },
      config: { claimLimit: 5, jitterMinMs: 100, jitterMaxMs: 100 },
    })
    const loop = createDispatchLoop(d)
    await loop.tick()
    expect(d.sleep).toHaveBeenCalledTimes(2) // 3 mensajes -> 2 esperas
    expect(d.sleep).toHaveBeenCalledWith(100)
  })

  it('report que falla: reintenta con backoff, guarda los resultados y los reenvía en el próximo tick', async () => {
    const report = vi.fn()
      .mockRejectedValueOnce(new Error('net1'))
      .mockRejectedValueOnce(new Error('net2'))
      .mockRejectedValueOnce(new Error('net3'))
      .mockResolvedValueOnce({})
    const onEvento = vi.fn()
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn()
          .mockResolvedValueOnce({ mensajes: [{ id: 'q1', jid: '1', mensaje: 'a' }], ventana_ok: true })
          .mockResolvedValue({ mensajes: [], ventana_ok: true }),
        report,
      },
      onEvento,
      config: { claimLimit: 5, jitterMinMs: 0, jitterMaxMs: 0, reporteMaxIntentos: 3 },
    })
    const loop = createDispatchLoop(d)

    const r1 = await loop.tick()
    expect(report).toHaveBeenCalledTimes(3) // 3 intentos, todos fallan
    expect(r1.reportado).toBe(false)
    expect(d.edgeClient.claim).toHaveBeenCalledTimes(1)
    expect(onEvento).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'report_atascado' }))

    // Próximo tick: primero reintenta el report atrasado (4º call -> ok) y RECIÉN
    // ahí sigue el ciclo normal (claim vacío).
    const r2 = await loop.tick()
    expect(report).toHaveBeenCalledTimes(4)
    expect(r2.skipped).toBeUndefined() // ya no está atascado
    expect(r2).toMatchObject({ enviados: 0, fallidos: 0 })
  })

  it('tras maxTicksAtascado ticks sin confirmar, suelta el buffer al reaper', async () => {
    const report = vi.fn().mockResolvedValue({ procesados: [] }) // nunca confirma
    const onEvento = vi.fn()
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn()
          .mockResolvedValueOnce({ mensajes: [{ id: 'q1', jid: '1', mensaje: 'a' }], ventana_ok: true })
          .mockResolvedValue({ mensajes: [], ventana_ok: true }),
        report,
      },
      onEvento,
      config: { claimLimit: 5, jitterMinMs: 0, jitterMaxMs: 0, maxTicksAtascado: 3 },
    })
    const loop = createDispatchLoop(d)
    await loop.tick()                 // tanda inicial, stash
    await loop.tick()                 // atascado 1
    await loop.tick()                 // atascado 2
    const r = await loop.tick()       // atascado 3 -> abandona
    expect(onEvento).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'report_abandonado' }))
    // ya no está atascado: el siguiente tick reclama normal
    const r2 = await loop.tick()
    expect(r2.skipped).toBeUndefined()
  })

  it('mientras el report está atascado, un tick NO reclama nada nuevo', async () => {
    const report = vi.fn().mockRejectedValue(new Error('net'))
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn()
          .mockResolvedValueOnce({ mensajes: [{ id: 'q1', jid: '1', mensaje: 'a' }], ventana_ok: true })
          .mockResolvedValue({ mensajes: [], ventana_ok: true }),
        report,
      },
      config: { claimLimit: 5, jitterMinMs: 0, jitterMaxMs: 0, reporteMaxIntentos: 2 },
    })
    const loop = createDispatchLoop(d)
    await loop.tick() // stashea
    const r = await loop.tick() // report sigue fallando
    expect(r).toMatchObject({ skipped: 'report_atascado' })
    expect(d.edgeClient.claim).toHaveBeenCalledTimes(1) // nunca reclamó de nuevo
  })

  it('re-entrancia: un 2º tick mientras uno corre devuelve skipped:tick_en_curso', async () => {
    let liberar
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn(() => new Promise((r) => { liberar = () => r({ mensajes: [], ventana_ok: true }) })),
        report: vi.fn(),
      },
    })
    const loop = createDispatchLoop(d)
    const p1 = loop.tick()
    const r2 = await loop.tick()          // el 1º sigue esperando el claim
    expect(r2).toMatchObject({ skipped: 'tick_en_curso' })
    liberar()
    await p1
  })

  it('report parcial: solo se re-encolan los ids que el servidor NO dio de baja', async () => {
    const report = vi.fn()
      .mockResolvedValueOnce({ procesados: ['q1'] })   // q1 sí, q2 no
      .mockResolvedValueOnce({ procesados: ['q2'] })   // en el próximo tick, q2
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn()
          .mockResolvedValueOnce({ mensajes: [{ id: 'q1', jid: '1', mensaje: 'a' }, { id: 'q2', jid: '2', mensaje: 'b' }], ventana_ok: true })
          .mockResolvedValue({ mensajes: [], ventana_ok: true }),
        report,
      },
      config: { claimLimit: 5, jitterMinMs: 0, jitterMaxMs: 0 },
    })
    const loop = createDispatchLoop(d)
    const r1 = await loop.tick()
    expect(r1.reportado).toBe(false) // q2 quedó sin confirmar
    // 2º tick: reenvía SOLO q2
    await loop.tick()
    expect(report).toHaveBeenCalledTimes(2)
    expect(report.mock.calls[1][0].map((r) => r.id)).toEqual(['q2'])
  })

  it('sin ACK -> emite evento sin_ack', async () => {
    const onEvento = vi.fn()
    const d = baseDeps({
      edgeClient: {
        claim: vi.fn().mockResolvedValue({ mensajes: [{ id: 'q1', jid: '1', mensaje: 'a' }], ventana_ok: true }),
        report: vi.fn().mockResolvedValue({}),
      },
      ackWaiter: { waitFor: vi.fn().mockRejectedValue(new Error('Timeout')) },
      onEvento,
    })
    const loop = createDispatchLoop(d)
    await loop.tick()
    expect(onEvento).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'sin_ack', id: 'q1' }))
  })
})

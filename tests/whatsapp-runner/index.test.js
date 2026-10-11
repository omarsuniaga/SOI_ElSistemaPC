import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRunner } from '../../src/services/whatsapp-runner/index.js'

function fakeBaileys() {
  const handlers = {}
  const sock = {
    ev: { on: (evt, fn) => { handlers[evt] = fn } },
    sendMessage: vi.fn().mockResolvedValue({ key: { id: 'x' } }),
    end: vi.fn(),
  }
  return {
    handlers,
    sock,
    makeWASocket: vi.fn(() => sock),
    useMultiFileAuthState: vi.fn().mockResolvedValue({ state: {}, saveCreds: vi.fn() }),
    fetchLatestBaileysVersion: vi.fn().mockResolvedValue({ version: [2, 3, 1] }),
  }
}

const baseCfg = (b) => ({
  edgeFnUrl: 'https://x.supabase.co/functions/v1/whatsapp-gateway',
  deviceToken: 'tok',
  departamento: 'ADM',
  nombreEquipo: 'PC-ADM-01',
  authDir: '/tmp/a',
  baileys: { makeWASocket: b.makeWASocket, useMultiFileAuthState: b.useMultiFileAuthState, fetchLatestBaileysVersion: b.fetchLatestBaileysVersion },
  pollMs: 999999,
  heartbeatMs: 999999,
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
})

afterEach(() => vi.restoreAllMocks())

describe('createRunner', () => {
  it('exige edgeFnUrl, deviceToken y departamento', () => {
    expect(() => createRunner({ deviceToken: 't', departamento: 'ADM' })).toThrow(/edgeFnUrl/)
  })

  it('expone start/stop/on/tick', () => {
    const b = fakeBaileys()
    const r = createRunner(baseCfg(b))
    expect(r.start).toBeTypeOf('function')
    expect(r.stop).toBeTypeOf('function')
    expect(r.on).toBeTypeOf('function')
    expect(r.tick).toBeTypeOf('function')
  })

  it('emite "qr" cuando el socket recibe un QR', async () => {
    const b = fakeBaileys()
    const r = createRunner(baseCfg(b))
    const onQr = vi.fn()
    r.on('qr', onQr)
    await r.start()
    b.handlers['connection.update']({ qr: 'QR-XYZ' })
    expect(onQr).toHaveBeenCalledWith('QR-XYZ')
  })

  it('alimenta el ackWaiter desde messages.update (tick lo aprovecha)', async () => {
    const b = fakeBaileys()
    const fetchImpl = vi.fn()
      // claim
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ mensajes: [{ id: 'q1', jid: '1829', mensaje: 'hola' }], ventana_ok: true }), text: async () => '' })
      // report
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ aplicados: 1 }), text: async () => '' })
    vi.stubGlobal('fetch', fetchImpl)

    const r = createRunner({
      ...baseCfg(b),
      jitterMinMs: 0, jitterMaxMs: 0, ackTimeoutMs: 2000,
      ventana: { inicio: '00:00', fin: '23:59', soloDiasHabiles: false }, // sin depender de la hora real
    })
    await r.start()

    const tickP = r.tick()
    // Dejar que sendMessage resuelva y el ackWaiter registre la espera antes del ACK.
    await new Promise((resolve) => setTimeout(resolve, 0))
    b.handlers['messages.update']([{ key: { id: 'x' }, update: { status: 2 } }])
    const out = await tickP

    expect(out).toMatchObject({ enviados: 1, fallidos: 0 })
    expect(b.sock.sendMessage).toHaveBeenCalledWith('1829@s.whatsapp.net', { text: 'hola' })
  })

  it('stop no revienta aunque no se haya llamado start', () => {
    const b = fakeBaileys()
    const r = createRunner(baseCfg(b))
    expect(() => r.stop()).not.toThrow()
  })

  it('exige nombreEquipo', () => {
    const b = fakeBaileys()
    expect(() => createRunner({ ...baseCfg(b), nombreEquipo: '   ' })).toThrow(/nombreEquipo/)
  })

  it('tick() en standby no despacha', async () => {
    const b = fakeBaileys()
    const fetchImpl = vi.fn()
    vi.stubGlobal('fetch', fetchImpl)
    const r = createRunner(baseCfg(b))
    await r.start()
    // Forzar standby: el heartbeat devuelve standby=true
    fetchImpl.mockResolvedValue({ status: 200, ok: true, json: async () => ({ ok: false, standby: true, owner_equipo: 'PC-OTRA' }), text: async () => '' })
    b.handlers['connection.update']({ connection: 'open' }) // dispara latido()
    await new Promise((res) => setTimeout(res, 5))
    const out = await r.tick()
    expect(out).toMatchObject({ skipped: 'standby' })
  })
})

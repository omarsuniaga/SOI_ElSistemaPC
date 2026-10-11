import { describe, it, expect, vi } from 'vitest'
import { createSocket } from '../../src/services/whatsapp-runner/socket.js'

function fakeBaileys() {
  const handlers = {}
  const sock = {
    ev: { on: (evt, fn) => { handlers[evt] = fn } },
    sendMessage: vi.fn().mockResolvedValue({ key: { id: 'x' } }),
    end: vi.fn(),
  }
  const makeWASocket = vi.fn(() => sock)
  const useMultiFileAuthState = vi.fn().mockResolvedValue({ state: {}, saveCreds: vi.fn() })
  const fetchLatestBaileysVersion = vi.fn().mockResolvedValue({ version: [2, 3000, 1] })
  return { sock, handlers, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion }
}

describe('createSocket', () => {
  it('exige makeWASocket y useMultiFileAuthState', () => {
    expect(() => createSocket({})).toThrow(/makeWASocket/)
    expect(() => createSocket({ makeWASocket: () => {} })).toThrow(/useMultiFileAuthState/)
  })

  it('start crea el socket con las opciones esperadas y engancha eventos', async () => {
    const b = fakeBaileys()
    const s = createSocket({ ...b, authDir: '/tmp/auth' })
    await s.start()

    expect(b.useMultiFileAuthState).toHaveBeenCalledWith('/tmp/auth')
    expect(b.makeWASocket).toHaveBeenCalledWith(expect.objectContaining({
      printQRInTerminal: false,
      syncFullHistory: false,
      version: [2, 3000, 1],
    }))
    expect(b.handlers['creds.update']).toBeTypeOf('function')
    expect(b.handlers['connection.update']).toBeTypeOf('function')
    expect(b.handlers['messages.update']).toBeTypeOf('function')
    // conectado refleja el estado REAL: false hasta connection === 'open'.
    expect(s.conectado).toBe(false)
    b.handlers['connection.update']({ connection: 'open' })
    expect(s.conectado).toBe(true)
    b.handlers['connection.update']({ connection: 'close', lastDisconnect: { error: { output: { statusCode: 401 } } } })
    expect(s.conectado).toBe(false)
  })

  it('reenvía qr, connection y messages.update a los callbacks', async () => {
    const b = fakeBaileys()
    const onQR = vi.fn()
    const onConnection = vi.fn()
    const onMessagesUpdate = vi.fn()
    const s = createSocket({ ...b, onQR, onConnection, onMessagesUpdate })
    await s.start()

    b.handlers['connection.update']({ qr: 'QR123' })
    b.handlers['connection.update']({ connection: 'open' })
    b.handlers['messages.update']([{ key: { id: 'm' }, update: { status: 2 } }])

    expect(onQR).toHaveBeenCalledWith('QR123')
    expect(onConnection).toHaveBeenCalledWith('open', undefined)
    expect(onMessagesUpdate).toHaveBeenCalled()
  })

  it("close con código != 401 -> agenda reconexión", async () => {
    const b = fakeBaileys()
    const setTimeoutImpl = vi.fn(() => 1)
    const s = createSocket({ ...b, setTimeoutImpl })
    await s.start()
    b.handlers['connection.update']({ connection: 'close', lastDisconnect: { error: { output: { statusCode: 428 } } } })
    expect(setTimeoutImpl).toHaveBeenCalledWith(expect.any(Function), 4000)
  })

  it('close con 401 (loggedOut) -> NO reconecta', async () => {
    const b = fakeBaileys()
    const setTimeoutImpl = vi.fn(() => 1)
    const s = createSocket({ ...b, setTimeoutImpl, logger: { warn: vi.fn(), error: vi.fn() } })
    await s.start()
    b.handlers['connection.update']({ connection: 'close', lastDisconnect: { error: { output: { statusCode: 401 } } } })
    expect(setTimeoutImpl).not.toHaveBeenCalled()
  })

  it('stop cancela la reconexión y termina el socket', async () => {
    const b = fakeBaileys()
    const setTimeoutImpl = vi.fn(() => 42)
    const clearTimeoutImpl = vi.fn()
    const s = createSocket({ ...b, setTimeoutImpl, clearTimeoutImpl })
    await s.start()
    b.handlers['connection.update']({ connection: 'close', lastDisconnect: { error: { output: { statusCode: 500 } } } })
    s.stop()
    expect(clearTimeoutImpl).toHaveBeenCalledWith(42)
    expect(b.sock.end).toHaveBeenCalled()
    expect(s.conectado).toBe(false)
  })

  it('sendMessage sin socket tira', () => {
    const b = fakeBaileys()
    const s = createSocket({ ...b })
    expect(() => s.sendMessage('j', { text: 'x' })).toThrow(/no conectado/)
  })

  it('stop() durante los await de arranque NO crea un socket', async () => {
    const b = fakeBaileys()
    let resolverAuth
    b.useMultiFileAuthState = vi.fn(() => new Promise((r) => { resolverAuth = () => r({ state: {}, saveCreds: vi.fn() }) }))
    const s = createSocket({ ...b })

    const p = s.start()
    s.stop()               // el usuario cancela mientras auth está pendiente
    resolverAuth()
    await p

    expect(b.makeWASocket).not.toHaveBeenCalled()
    expect(s.conectado).toBe(false)
  })

  it('reconexión: si start() tira, se reprograma otro intento', async () => {
    const b = fakeBaileys()
    b.useMultiFileAuthState = vi.fn()
      .mockResolvedValueOnce({ state: {}, saveCreds: vi.fn() }) // arranque inicial OK
      .mockRejectedValueOnce(new Error('disco lleno'))          // el reconnect falla
      .mockResolvedValue({ state: {}, saveCreds: vi.fn() })
    const timers = []
    const setTimeoutImpl = vi.fn((fn) => { timers.push(fn); return timers.length })
    const s = createSocket({ ...b, setTimeoutImpl, logger: { warn: vi.fn(), error: vi.fn() } })
    await s.start()

    b.handlers['connection.update']({ connection: 'close', lastDisconnect: { error: { output: { statusCode: 500 } } } })
    expect(timers).toHaveLength(1)
    await timers[0]()          // dispara el reconnect -> start() rechaza -> reprograma
    await new Promise((r) => setTimeout(r, 0))
    expect(timers.length).toBeGreaterThanOrEqual(2)
  })
})

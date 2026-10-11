import { describe, it, expect, vi } from 'vitest'
import { createAckWaiter } from '../../src/services/whatsapp-runner/ackWaiter.js'

describe('createAckWaiter', () => {
  it('resuelve cuando llega messages.update con status >= 2', async () => {
    const w = createAckWaiter()
    const p = w.waitFor('m1', 5000)
    w.onUpdate([{ key: { id: 'm1' }, update: { status: 2 } }])
    await expect(p).resolves.toBeUndefined()
    expect(w.size).toBe(0)
  })

  it('ignora status < 2 (todavía no confirmado por el servidor)', async () => {
    const w = createAckWaiter()
    const p = w.waitFor('m1', 5000)
    w.onUpdate([{ key: { id: 'm1' }, update: { status: 1 } }])
    // sigue pendiente
    expect(w.size).toBe(1)
    w.onUpdate([{ key: { id: 'm1' }, update: { status: 3 } }])
    await expect(p).resolves.toBeUndefined()
  })

  it('rechaza por timeout (timers inyectados)', async () => {
    let fire
    const w = createAckWaiter({
      setTimeoutImpl: (fn) => { fire = fn; return 1 },
      clearTimeoutImpl: vi.fn(),
    })
    const p = w.waitFor('m1', 100)
    fire()
    await expect(p).rejects.toThrow(/Timeout/)
    expect(w.size).toBe(0)
  })

  it('acepta el status en la raíz del update (no solo en update.status)', async () => {
    const w = createAckWaiter()
    const p = w.waitFor('m2', 5000)
    w.onUpdate([{ key: { id: 'm2' }, status: 2 }])
    await expect(p).resolves.toBeUndefined()
  })

  it('no revienta con updates vacíos o sin id', () => {
    const w = createAckWaiter()
    expect(() => w.onUpdate(null)).not.toThrow()
    expect(() => w.onUpdate([{}, { key: {} }, { key: { id: 'x' } }])).not.toThrow()
  })

  it('cancelAll RECHAZA cada espera pendiente (no las deja colgadas)', async () => {
    const clearTimeoutImpl = vi.fn()
    const w = createAckWaiter({ setTimeoutImpl: () => 7, clearTimeoutImpl })
    const a = w.waitFor('a')
    const b = w.waitFor('b')
    expect(w.size).toBe(2)
    w.cancelAll('conexión cerrada')
    expect(w.size).toBe(0)
    expect(clearTimeoutImpl).toHaveBeenCalledTimes(2)
    await expect(a).rejects.toThrow(/conexión cerrada/)
    await expect(b).rejects.toMatchObject({ code: 'ACK_CANCELADO' })
  })

  it('ACK adelantado: si onUpdate llega antes que waitFor, waitFor resuelve al toque', async () => {
    const w = createAckWaiter()
    w.onUpdate([{ key: { id: 'temprano' }, update: { status: 2 } }])
    await expect(w.waitFor('temprano', 5000)).resolves.toBeUndefined()
  })

  it('waitFor sin messageId rechaza', async () => {
    const w = createAckWaiter()
    await expect(w.waitFor('')).rejects.toThrow(/messageId/)
  })
})

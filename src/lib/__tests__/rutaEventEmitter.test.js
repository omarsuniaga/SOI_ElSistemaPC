import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rutaEvents } from '../rutaEventEmitter.js'

describe('rutaEventEmitter', () => {
  beforeEach(() => {
    rutaEvents.clearAllListeners()
  })

  it('emits and listens to node-covered event', async () => {
    const listener = vi.fn()

    rutaEvents.on('node-covered', listener)
    rutaEvents.emit('node-covered', { nodeId: 'n1', claseId: 'c1' })

    await new Promise(resolve => setTimeout(resolve, 10))
    expect(listener).toHaveBeenCalledWith({ nodeId: 'n1', claseId: 'c1' })
  })

  it('removes listener', async () => {
    const listener = vi.fn()
    rutaEvents.on('node-covered', listener)
    rutaEvents.off('node-covered', listener)
    rutaEvents.emit('node-covered', { nodeId: 'n1' })

    await new Promise(resolve => setTimeout(resolve, 10))
    expect(listener).not.toHaveBeenCalled()
  })

  it('multiple listeners for same event', async () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    rutaEvents.on('node-covered', listener1)
    rutaEvents.on('node-covered', listener2)
    rutaEvents.emit('node-covered', { nodeId: 'n1' })

    await new Promise(resolve => setTimeout(resolve, 10))
    expect(listener1).toHaveBeenCalled()
    expect(listener2).toHaveBeenCalled()
  })
})

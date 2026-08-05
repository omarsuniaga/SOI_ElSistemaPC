import { describe, expect, it, vi } from 'vitest'
import { updatePwaApp } from '../pwaUpdate.js'

describe('updatePwaApp', () => {
  it('activates a waiting service worker instead of reloading early', async () => {
    const postMessage = vi.fn()
    const reload = vi.fn()
    const serviceWorker = {
      ready: Promise.resolve({
        waiting: { postMessage },
        update: vi.fn().mockResolvedValue(undefined),
      }),
    }

    const result = await updatePwaApp({ serviceWorker, reload })

    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reload).not.toHaveBeenCalled()
    expect(result.updated).toBe(true)
  })

  it('refreshes when there is no waiting service worker', async () => {
    const reload = vi.fn()
    const serviceWorker = {
      ready: Promise.resolve({
        waiting: null,
        update: vi.fn().mockResolvedValue(undefined),
      }),
    }

    const result = await updatePwaApp({ serviceWorker, reload })

    expect(reload).toHaveBeenCalledOnce()
    expect(result.updated).toBe(false)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAutoDraft } from '../../src/portal-maestros/services/autoDraftService.js'

describe('createAutoDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls saveFn after debounceMs of inactivity', async () => {
    const saveFn = vi.fn().mockResolvedValue({})
    const draft = createAutoDraft({ saveFn, debounceMs: 1000 })

    draft.onInput('hello world')
    expect(saveFn).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)
    expect(saveFn).toHaveBeenCalledOnce()
    expect(saveFn).toHaveBeenCalledWith('hello world')
  })

  it('resets timer on each input (debounce behavior)', async () => {
    const saveFn = vi.fn().mockResolvedValue({})
    const draft = createAutoDraft({ saveFn, debounceMs: 1000 })

    draft.onInput('first')
    await vi.advanceTimersByTimeAsync(500)
    draft.onInput('second')
    await vi.advanceTimersByTimeAsync(500)
    expect(saveFn).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(500)
    expect(saveFn).toHaveBeenCalledOnce()
    expect(saveFn).toHaveBeenCalledWith('second')
  })

  it('does NOT save empty content', async () => {
    const saveFn = vi.fn().mockResolvedValue({})
    const draft = createAutoDraft({ saveFn, debounceMs: 1000 })

    draft.onInput('')
    await vi.advanceTimersByTimeAsync(2000)
    expect(saveFn).not.toHaveBeenCalled()

    draft.onInput('   ')
    await vi.advanceTimersByTimeAsync(2000)
    expect(saveFn).not.toHaveBeenCalled()
  })

  it('destroy() cancels pending timer', async () => {
    const saveFn = vi.fn().mockResolvedValue({})
    const draft = createAutoDraft({ saveFn, debounceMs: 1000 })

    draft.onInput('something')
    draft.destroy()
    await vi.advanceTimersByTimeAsync(2000)
    expect(saveFn).not.toHaveBeenCalled()
  })

  it('onSaved callback is called after save', async () => {
    const saveFn = vi.fn().mockResolvedValue({})
    const savedCb = vi.fn()
    const draft = createAutoDraft({ saveFn, debounceMs: 1000 })

    draft.onSaved(savedCb)
    draft.onInput('content')
    await vi.advanceTimersByTimeAsync(1000)

    expect(savedCb).toHaveBeenCalledOnce()
    expect(savedCb).toHaveBeenCalledWith('content')
  })
})

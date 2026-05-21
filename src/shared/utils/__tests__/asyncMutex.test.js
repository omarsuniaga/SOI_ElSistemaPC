// src/shared/utils/__tests__/asyncMutex.test.js
import { describe, it, expect, vi } from 'vitest'
import { createAsyncMutex } from '../asyncMutex.js'

describe('asyncMutex', () => {
  it('should prevent concurrent execution of guarded functions', async () => {
    const mutex = createAsyncMutex()
    const callOrder = []

    const slowFunc1 = vi.fn(async () => {
      callOrder.push('start-1')
      await new Promise(resolve => setTimeout(resolve, 100))
      callOrder.push('end-1')
    })

    const slowFunc2 = vi.fn(async () => {
      callOrder.push('start-2')
      await new Promise(resolve => setTimeout(resolve, 50))
      callOrder.push('end-2')
    })

    // Call both functions concurrently
    const [result1, result2] = await Promise.all([
      mutex.run(slowFunc1),
      mutex.run(slowFunc2)
    ])

    // func2 should start AFTER func1 ends, not before
    expect(callOrder).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
    expect(slowFunc1).toHaveBeenCalled()
    expect(slowFunc2).toHaveBeenCalled()
  })

  it('should return the result of the guarded function', async () => {
    const mutex = createAsyncMutex()
    const result = await mutex.run(async () => 'hello')
    expect(result).toBe('hello')
  })

  it('should propagate errors from guarded function', async () => {
    const mutex = createAsyncMutex()
    await expect(
      mutex.run(async () => {
        throw new Error('test error')
      })
    ).rejects.toThrow('test error')
  })

  it('should release lock even if function throws', async () => {
    const mutex = createAsyncMutex()
    const callOrder = []

    const failingFunc = vi.fn(async () => {
      callOrder.push('start-fail')
      throw new Error('oops')
    })

    const successFunc = vi.fn(async () => {
      callOrder.push('start-success')
    })

    // First call fails
    try {
      await mutex.run(failingFunc)
    } catch (_e) {
      // Expected
    }

    // Second call should still execute
    await mutex.run(successFunc)

    expect(callOrder).toEqual(['start-fail', 'start-success'])
  })
})

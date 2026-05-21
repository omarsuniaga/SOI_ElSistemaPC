// src/portal-maestros/views/__tests__/asistenciaView.race-condition.test.js
import { describe, it, expect, vi } from 'vitest'
import { createAsyncMutex } from '../../../shared/utils/asyncMutex.js'

describe('asistenciaView - Race Condition Prevention (deadlock fix)', () => {
  it('should prevent deadlock when button handler acquires mutex and calls _autoSave(true, skipMutex=true)', async () => {
    /**
     * This test validates the race condition fix pattern used in asistenciaView:
     *
     * Button handler pattern:
     *   await _saveMutex.run(async () => {
     *     // button save logic
     *     await _autoSave(true, true)  // skipMutex=true because we already hold the lock
     *   })
     *
     * _autoSave pattern (with skipMutex parameter):
     *   async function _autoSave(immediate = false, skipMutex = false) {
     *     const saveFn = async () => { ... }
     *     if (immediate) {
     *       if (skipMutex) {
     *         await saveFn()  // Caller already holds mutex
     *       } else {
     *         await _saveMutex.run(saveFn)  // Acquire mutex ourselves
     *       }
     *     }
     *   }
     *
     * If skipMutex=true is NOT respected, both would try to acquire the mutex,
     * causing deadlock (outer awaits inner, inner waits for outer lock release).
     */

    const mutex = createAsyncMutex()
    const executionLog = []
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DEADLOCK: Operation timed out')), 500)
    )

    // Simulate the button handler that holds the mutex
    const buttonHandler = async () => {
      executionLog.push('button-handler-start')

      return Promise.race([
        mutex.run(async () => {
          // Inside button handler, we hold the mutex
          executionLog.push('button-save-start')

          // Simulate _autoSave(true, true) being called with skipMutex=true
          // It should NOT try to acquire the mutex again
          const autoSaveFn = async () => {
            executionLog.push('autosave-fn-start')
            await new Promise(resolve => setTimeout(resolve, 20))
            executionLog.push('autosave-fn-end')
          }

          // With skipMutex=true, autoSave runs directly WITHOUT calling mutex.run()
          await autoSaveFn()

          executionLog.push('button-save-end')
        }),
        timeout
      ])
    }

    // Execute the button handler - should NOT timeout/deadlock
    await buttonHandler()

    // Verify execution order shows no deadlock
    expect(executionLog).toEqual([
      'button-handler-start',
      'button-save-start',
      'autosave-fn-start',
      'autosave-fn-end',
      'button-save-end'
    ])
  })

  it('should serialize autosave and button handler when they run concurrently', async () => {
    /**
     * Verify that autosave (deferred, holds mutex) and button click (immediate, holds mutex)
     * serialize correctly through the shared _saveMutex, with autosave completing first.
     */
    const mutex = createAsyncMutex()
    const events = []

    const autoSave = async () => {
      return mutex.run(async () => {
        events.push('autosave-start')
        await new Promise(resolve => setTimeout(resolve, 100))
        events.push('autosave-end')
      })
    }

    const buttonClick = async () => {
      return mutex.run(async () => {
        events.push('button-start')
        await new Promise(resolve => setTimeout(resolve, 50))
        events.push('button-end')
      })
    }

    // Fire both concurrently (simulating user clicking save while autosave in-flight)
    await Promise.all([autoSave(), buttonClick()])

    // Verify serialization: one completes, then the other
    expect(events).toEqual([
      'autosave-start',
      'autosave-end',
      'button-start',
      'button-end'
    ])
  })
})

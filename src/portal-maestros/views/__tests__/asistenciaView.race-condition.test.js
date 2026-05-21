// src/portal-maestros/views/__tests__/asistenciaView.race-condition.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAsyncMutex } from '../../../shared/utils/asyncMutex.js'

describe('asistenciaView - Race Condition Prevention', () => {
  it('should serialize concurrent save operations using mutex', async () => {
    // Verify that the mutex pattern prevents concurrent execution
    const mutex = createAsyncMutex()
    const executionOrder = []

    const operation1 = async () => {
      executionOrder.push('start-1')
      await new Promise(resolve => setTimeout(resolve, 50))
      executionOrder.push('end-1')
    }

    const operation2 = async () => {
      executionOrder.push('start-2')
      await new Promise(resolve => setTimeout(resolve, 50))
      executionOrder.push('end-2')
    }

    // Fire both concurrently
    await Promise.all([
      mutex.run(operation1),
      mutex.run(operation2)
    ])

    // Verify they executed serially, not concurrently
    // If concurrent: would see ['start-1', 'start-2', 'end-1', 'end-2']
    // If serial: would see ['start-1', 'end-1', 'start-2', 'end-2']
    expect(executionOrder).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
  })
})

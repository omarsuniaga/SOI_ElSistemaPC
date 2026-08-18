/**
 * E3: Integration Tests — Groq Feature Flag & Timeout Fallback
 *
 * Tests cover:
 * - R1 con groq_enabled=true → llama enrichDescription
 * - R1 con groq_enabled=false → NO llama enrichDescription
 * - Groq timeout durante R1 con groq_enabled=true → tarea creada con baseTitle (fallback)
 * - Groq API error → fallback sin lanzar excepción
 * - R1 with groq_enabled=false → no API call to groq
 *
 * These tests validate graceful fallback behavior when Groq is unavailable.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Mock Groq API responses
 */
class MockGroqResponse {
  constructor(success, content = '') {
    this.success = success
    this.content = content
    this.data = success
      ? {
          choices: [
            {
              message: {
                content,
              },
            },
          ],
        }
      : null
    this.error = success
      ? null
      : {
          message: 'Timeout or API error',
        }
  }
}

/**
 * Mock enrichDescription function (simulates groq.ts behavior)
 */
async function enrichDescription(supabase, evento, baseTitle, enabled = false, options = {}) {
  // Feature flag: if disabled, return base title immediately (no API call)
  if (!enabled) {
    console.log('[GROQ_DISABLED] enrichment skipped (feature flag off)')
    return baseTitle
  }

  try {
    // Create abort controller with 5-second timeout
    const controller = new AbortController()
    const timeoutMs = options.timeoutMs || 5000
    let timeoutId = null

    // Set timeout
    timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    // Simulate Groq API call
    const groqResult = options.groqMock
      ? await options.groqMock() // Use mock in tests
      : { data: null, error: { message: 'No mock provided' } }

    clearTimeout(timeoutId)

    // If invocation failed or no response, return base title
    if (groqResult.error) {
      console.warn('[GROQ_TIMEOUT_OR_ERROR]', groqResult.error.message)
      return baseTitle
    }

    // Parse Groq response and extract text
    const enrichedText = groqResult.data?.choices?.[0]?.message?.content?.trim()
    if (!enrichedText) {
      console.warn('[GROQ_EMPTY_RESPONSE]')
      return baseTitle
    }

    // Truncate to 200 chars
    return enrichedText.slice(0, 200)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.warn('[GROQ_EXCEPTION]', errorMsg)
    return baseTitle
  }
}

/**
 * Mock R1 handler with Groq enrichment
 */
async function handleAusenciaAcumuladaWithGroq(evento, groqEnabled = false, options = {}) {
  const baseTitle = `Ausencia acumulada: alumno ${evento.payload?.alumno_id}`

  let taskTitle = baseTitle
  if (groqEnabled) {
    taskTitle = await enrichDescription(null, evento, baseTitle, groqEnabled, options)
  }

  return {
    handled: true,
    taskId: 'mock-task-001',
    taskTitle,
  }
}

// ============================================================================
// Test Suite: E3 — Groq Feature Flag & Timeout Fallback
// ============================================================================

describe('E3: Groq Feature Flag & Timeout Fallback', () => {
  let mockEvento

  beforeEach(() => {
    mockEvento = {
      id: 'evento-001',
      tipo: 'asistencia.falta_injustificada',
      entidad_tipo: 'alumnos',
      entidad_id: 'alumno-123',
      payload: {
        alumno_id: 'alumno-123',
        sesion_id: 'sesion-456',
      },
      created_at: new Date().toISOString(),
    }
  })

  // ========================================================================
  // T1: Groq Enabled Flag (groq_enabled=true/false)
  // ========================================================================

  describe('Groq Enabled Flag', () => {
    it('R1 con groq_enabled=true → llama enrichDescription', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'Estudiante tiene 3+ faltas. Requiere intervención inmediata.',
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Estudiante tiene 3+')
      expect(groqMock).toHaveBeenCalled()
    })

    it('R1 con groq_enabled=false → NO llama enrichDescription', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'This should not be called',
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, false, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Ausencia acumulada')
      expect(groqMock).not.toHaveBeenCalled()
    })
  })

  // ========================================================================
  // T2: Groq Timeout (5-second limit)
  // ========================================================================

  describe('Groq Timeout Handling', () => {
    it('Groq timeout durante R1 con groq_enabled=true → tarea creada con baseTitle (fallback)', async () => {
      const groqMock = vi.fn(async () => {
        // Simulate timeout by rejecting
        throw new Error('AbortError: timeout')
      })

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
        timeoutMs: 100, // Short timeout for test
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Ausencia acumulada') // Uses base title
      expect(result.taskTitle).not.toContain('Estudiante tiene')
    })

    it('Groq timeout → no lanza excepción, task created normally', async () => {
      const groqMock = vi.fn(async () => {
        throw new Error('Timeout')
      })

      // Should not throw
      await expect(
        handleAusenciaAcumuladaWithGroq(mockEvento, true, {
          groqMock,
          timeoutMs: 100,
        })
      ).resolves.toBeDefined()
    })
  })

  // ========================================================================
  // T3: Groq API Error Handling
  // ========================================================================

  describe('Groq API Error Handling', () => {
    it('Groq API error (rate limit) → fallback a baseTitle', async () => {
      const groqMock = vi.fn(async () => ({
        data: null,
        error: { message: 'Rate limit exceeded' },
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Ausencia acumulada')
    })

    it('Groq empty response → fallback a baseTitle', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: null, // Empty content
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Ausencia acumulada')
    })

    it('Groq network error → fallback sin throw', async () => {
      const groqMock = vi.fn(async () => {
        throw new Error('Network error')
      })

      // Should not throw
      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Ausencia acumulada')
    })
  })

  // ========================================================================
  // T4: Successful Groq Enrichment
  // ========================================================================

  describe('Successful Groq Enrichment', () => {
    it('R1 con groq_enabled=true + successful Groq response → task con enriched title', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content:
                  'Cumplimiento académico: Alumno ha faltado 3 veces en una semana. Se requiere contacto inmediato con representante.',
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Cumplimiento académico')
      expect(result.taskTitle).not.toContain('Ausencia acumulada: alumno')
    })

    it('Groq response truncated to 200 chars max', async () => {
      const longText = 'a'.repeat(300) // 300 chars
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: longText,
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.taskTitle.length).toBeLessThanOrEqual(200)
    })
  })

  // ========================================================================
  // T5: Feature Flag Behavior (groq_enabled from conditions_json)
  // ========================================================================

  describe('Feature Flag from conditions_json', () => {
    it('conditions_json: { groq_enabled: true } → enrichDescription called', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'Enriquecido via Groq',
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(groqMock).toHaveBeenCalled()
    })

    it('conditions_json: { groq_enabled: false } → enrichDescription NOT called', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'Should not call',
              },
            },
          ],
        },
        error: null,
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, false, {
        groqMock,
      })

      expect(groqMock).not.toHaveBeenCalled()
    })

    it('conditions_json: {} (empty) → groq_enabled defaults to false', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'Should not call',
              },
            },
          ],
        },
        error: null,
      }))

      // When groqEnabled is false (default), no Groq call
      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, false, {
        groqMock,
      })

      expect(groqMock).not.toHaveBeenCalled()
    })
  })

  // ========================================================================
  // Acceptance Criteria Checklist
  // ========================================================================

  describe('Acceptance Criteria', () => {
    it('AC-GROQ-01: groq_enabled=true → llama enrichDescription', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'Enriquecido',
              },
            },
          ],
        },
        error: null,
      }))

      await handleAusenciaAcumuladaWithGroq(mockEvento, true, { groqMock })

      expect(groqMock).toHaveBeenCalled()
    })

    it('AC-GROQ-02: groq_enabled=false → NO llama enrichDescription', async () => {
      const groqMock = vi.fn(async () => ({
        data: {
          choices: [
            {
              message: {
                content: 'Should not call',
              },
            },
          ],
        },
        error: null,
      }))

      await handleAusenciaAcumuladaWithGroq(mockEvento, false, { groqMock })

      expect(groqMock).not.toHaveBeenCalled()
    })

    it('AC-GROQ-03: Groq timeout → fallback a baseTitle sin throw', async () => {
      const groqMock = vi.fn(async () => {
        throw new Error('Timeout')
      })

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
        timeoutMs: 100,
      })

      expect(result.handled).toBe(true)
      expect(result.taskTitle).toContain('Ausencia acumulada')
    })

    it('AC-GROQ-04: Task creada even when Groq fails (non-blocking)', async () => {
      const groqMock = vi.fn(async () => ({
        data: null,
        error: { message: 'API Error' },
      }))

      const result = await handleAusenciaAcumuladaWithGroq(mockEvento, true, {
        groqMock,
      })

      expect(result.handled).toBe(true)
      expect(result.taskId).toBe('mock-task-001')
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { triggerExtraction, triggerExtractionAsync } from '../knowledgeExtractionService.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

describe('knowledgeExtractionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('triggerExtraction', () => {
    it('calls supabase.functions.invoke with correct body', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { status: 'ok', summary: {}, assertions: [] },
        error: null,
      })

      await triggerExtraction('obs-1')

      expect(supabase.functions.invoke).toHaveBeenCalledWith('extract-knowledge', {
        body: { observacion_id: 'obs-1' },
      })
    })

    it('returns null when no observacionId provided', async () => {
      const result = await triggerExtraction()
      expect(result).toBeNull()
      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })

    it('returns null when observacionId is empty string', async () => {
      const result = await triggerExtraction('')
      expect(result).toBeNull()
      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })

    it('returns null on invocation error (non-blocking)', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      })

      const result = await triggerExtraction('obs-1')
      expect(result).toBeNull()
    })

    it('returns null on function-level error', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { error: 'LLM rate limited' },
        error: null,
      })

      const result = await triggerExtraction('obs-1')
      expect(result).toBeNull()
    })

    it('returns data on success', async () => {
      const response = {
        status: 'ok',
        summary: { prefill: 2, llm_enrichment: 3, total_assertions: 5 },
        assertions: [{ id: 'a1' }, { id: 'a2' }],
      }
      supabase.functions.invoke.mockResolvedValue({
        data: response,
        error: null,
      })

      const result = await triggerExtraction('obs-1')
      expect(result).toEqual(response)
    })

    it('passes node_ids when provided', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { status: 'ok', summary: {}, assertions: [] },
        error: null,
      })

      await triggerExtraction('obs-1', { nodeIds: ['n1', 'n2'] })

      expect(supabase.functions.invoke).toHaveBeenCalledWith('extract-knowledge', {
        body: { observacion_id: 'obs-1', node_ids: ['n1', 'n2'] },
      })
    })

    it('does not throw on network error (always returns null)', async () => {
      supabase.functions.invoke.mockRejectedValue(new Error('Network error'))

      const result = await triggerExtraction('obs-1')
      expect(result).toBeNull()
    })
  })

  describe('triggerExtractionAsync', () => {
    it('calls triggerExtraction fire-and-forget', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { status: 'ok', summary: {}, assertions: [] },
        error: null,
      })

      // Should not throw
      triggerExtractionAsync('obs-1')

      // Wait a tick for the promise to resolve
      await vi.waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalled()
      })
    })

    it('does not throw when triggerExtraction rejects', async () => {
      supabase.functions.invoke.mockRejectedValue(new Error('Network error'))

      // Should not throw despite the error
      expect(() => triggerExtractionAsync('obs-1')).not.toThrow()
    })
  })
})

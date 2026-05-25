import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRunFeedback, addFeedback, updateScheduleRunEstado } from '../api/scheduleFeedbackApi.js';

// ─── Supabase mock ────────────────────────────────────────────────
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    }))
  }
}));

import { supabase } from '../../../lib/supabaseClient.js';

// Helper — builds a fresh chainable query stub for each test
function buildChain({ data = null, error = null } = {}) {
  const terminal = { data, error };
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(terminal),
    single: vi.fn().mockResolvedValue(terminal),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────

describe('getRunFeedback', () => {
  it('queries schedule_run_feedback with correct run_id filter', async () => {
    const feedbackRows = [
      { id: 'f-1', run_id: 'run-123', comentario: 'ok', tipo: 'observacion' }
    ];
    const chain = buildChain({ data: feedbackRows, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getRunFeedback('run-123');

    expect(supabase.from).toHaveBeenCalledWith('schedule_run_feedback');
    expect(chain.eq).toHaveBeenCalledWith('run_id', 'run-123');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(result).toEqual(feedbackRows);
  });

  it('throws when supabase returns an error', async () => {
    const supabaseError = new Error('DB connection failed');
    const chain = buildChain({ data: null, error: supabaseError });
    supabase.from.mockReturnValue(chain);

    await expect(getRunFeedback('run-bad')).rejects.toThrow('DB connection failed');
  });
});

describe('addFeedback', () => {
  it('inserts with correct fields: run_id, comentario, tipo', async () => {
    const inserted = { id: 'f-2', run_id: 'run-456', comentario: 'Looks good', tipo: 'aprobacion' };
    const chain = buildChain({ data: inserted, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await addFeedback({ runId: 'run-456', comentario: 'Looks good', tipo: 'aprobacion' });

    expect(supabase.from).toHaveBeenCalledWith('schedule_run_feedback');
    expect(chain.insert).toHaveBeenCalledWith([{
      run_id: 'run-456',
      comentario: 'Looks good',
      tipo: 'aprobacion'
    }]);
    expect(result).toEqual(inserted);
  });

  it('defaults tipo to "observacion" when not provided', async () => {
    const inserted = { id: 'f-3', run_id: 'run-789', comentario: 'Note', tipo: 'observacion' };
    const chain = buildChain({ data: inserted, error: null });
    supabase.from.mockReturnValue(chain);

    await addFeedback({ runId: 'run-789', comentario: 'Note' });

    expect(chain.insert).toHaveBeenCalledWith([{
      run_id: 'run-789',
      comentario: 'Note',
      tipo: 'observacion'
    }]);
  });
});

describe('updateScheduleRunEstado', () => {
  it('updates estado on the correct run_id and returns updated record', async () => {
    const updated = { id: 'run-123', estado: 'publicado' };
    const chain = buildChain({ data: updated, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await updateScheduleRunEstado('run-123', 'publicado');

    expect(supabase.from).toHaveBeenCalledWith('schedule_runs');
    expect(chain.update).toHaveBeenCalledWith({ estado: 'publicado' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'run-123');
    expect(result).toEqual(updated);
  });
});

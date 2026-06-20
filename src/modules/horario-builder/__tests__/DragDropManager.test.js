// src/modules/horario-builder/__tests__/DragDropManager.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initDragDrop, showConflictMoveModal } from '../engine/DragDropManager.js';

// jsdom does not implement DragEvent — provide a minimal polyfill
if (typeof globalThis.DragEvent === 'undefined') {
  class DragEvent extends Event {
    constructor(type, init = {}) {
      super(type, init);
      this.dataTransfer = init.dataTransfer ?? null;
    }
  }
  globalThis.DragEvent = DragEvent;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function makeGrid() {
  const container = document.createElement('div');
  container.id = 'hb-grid-wrapper';

  const block = document.createElement('div');
  block.setAttribute('draggable', 'true');
  block.dataset.claseId = 'c1';
  container.appendChild(block);

  const cell = document.createElement('div');
  cell.dataset.day  = 'lunes';
  cell.dataset.hour = '09:00';
  container.appendChild(cell);

  document.body.appendChild(container);
  return { container, block, cell };
}

function makeAssignments() {
  return [
    {
      clase_id:       'c1',
      clase_nombre:   'Matemáticas',
      maestro_id:     'm1',
      maestro_nombre: 'Prof. García',
      salon_id:       's1',
      salon_nombre:   'Aula 1',
      dia:            'martes',
      hora_inicio:    '08:00',
      hora_fin:       '09:00',
    },
    {
      clase_id:       'c2',
      clase_nombre:   'Historia',
      maestro_id:     'm2',
      maestro_nombre: 'Prof. López',
      salon_id:       's2',
      salon_nombre:   'Aula 2',
      dia:            'lunes',
      hora_inicio:    '09:00',
      hora_fin:       '10:00',
    },
  ];
}

// Simulate a drag-drop sequence on the grid
function simulateDrop(container, block, cell, claseId) {
  // shared dataTransfer stub
  const dt = { data: {}, effectAllowed: '', dropEffect: '' };
  dt.getData = (k) => dt.data[k] ?? '';
  dt.setData = (k, v) => { dt.data[k] = v; };

  // dragstart on block — we dispatch with the cell as target via bubbling trick:
  // since jsdom dispatchEvent sets target to the dispatched element, we dispatch
  // on block but the listener uses e.target.closest(...) which finds block itself.
  const dragstart = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt });
  block.dispatchEvent(dragstart);

  // drop on cell
  const drop = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
  cell.dispatchEvent(drop);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('initDragDrop', () => {
  let grid;

  beforeEach(() => { grid = makeGrid(); });
  afterEach(() => { document.body.innerHTML = ''; });

  it('returns an object with a destroy function', () => {
    const result = initDragDrop(grid.container, {
      assignments: makeAssignments(),
      onMove:     vi.fn(),
      onConflict: vi.fn(),
    });
    expect(result).toBeDefined();
    expect(typeof result.destroy).toBe('function');
  });

  it('calls onMove with correct parameters when drop has no conflicts', () => {
    const onMove     = vi.fn();
    const onConflict = vi.fn();
    const assignments = makeAssignments();

    initDragDrop(grid.container, { assignments, onMove, onConflict });

    // c1 is on martes 08:00-09:00; drop target is lunes 09:00 — no conflict with c2 (same slot different teacher/room)
    simulateDrop(grid.container, grid.block, grid.cell, 'c1');

    expect(onMove).toHaveBeenCalledOnce();
    expect(onMove).toHaveBeenCalledWith({
      claseId:  'c1',
      fromDay:  'martes',
      fromHour: '08:00',
      toDay:    'lunes',
      toHour:   '09:00',
    });
    expect(onConflict).not.toHaveBeenCalled();
  });

  it('calls onConflict (not onMove) when drop would cause a conflict', () => {
    const onMove     = vi.fn();
    const onConflict = vi.fn();

    // Assignments where c1 and c2 share the same teacher so moving c1 onto c2's slot triggers a conflict
    const assignments = [
      {
        clase_id: 'c1', clase_nombre: 'Matemáticas',
        maestro_id: 'm1', maestro_nombre: 'Prof. García',
        salon_id: 's1', salon_nombre: 'Aula 1',
        dia: 'martes', hora_inicio: '08:00', hora_fin: '09:00',
      },
      {
        clase_id: 'c2', clase_nombre: 'Historia',
        maestro_id: 'm1', maestro_nombre: 'Prof. García', // same teacher → conflict
        salon_id: 's2', salon_nombre: 'Aula 2',
        dia: 'lunes', hora_inicio: '09:00', hora_fin: '10:00',
      },
    ];

    initDragDrop(grid.container, { assignments, onMove, onConflict });

    // Drop c1 onto lunes 09:00 — same slot as c2, same teacher → conflict
    simulateDrop(grid.container, grid.block, grid.cell, 'c1');

    expect(onConflict).toHaveBeenCalledOnce();
    expect(onMove).not.toHaveBeenCalled();
  });
});

describe('showConflictMoveModal', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('returns a Promise', () => {
    const result = showConflictMoveModal({ conflictDescription: 'test conflict' });
    expect(result).toBeInstanceOf(Promise);
    // click cancel to clean up
    const cancelBtn = document.body.querySelector('[data-action="cancel"]');
    if (cancelBtn) cancelBtn.click();
    return result;
  });

  it('resolves true when confirm button is clicked', async () => {
    const promise = showConflictMoveModal({ conflictDescription: 'Conflicto de ejemplo' });
    const confirmBtn = document.body.querySelector('[data-action="confirm"]');
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    const result = await promise;
    expect(result).toBe(true);
  });

  it('resolves false when cancel button is clicked', async () => {
    const promise = showConflictMoveModal({ conflictDescription: 'Conflicto de ejemplo' });
    const cancelBtn = document.body.querySelector('[data-action="cancel"]');
    expect(cancelBtn).toBeTruthy();
    cancelBtn.click();
    const result = await promise;
    expect(result).toBe(false);
  });
});

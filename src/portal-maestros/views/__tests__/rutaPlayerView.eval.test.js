import { describe, it, expect, vi, beforeEach } from 'vitest';

// Polyfill scrollIntoView for jsdom
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

const mockInvalidate = vi.hoisted(() => vi.fn());
const mockSaveAttempt = vi.hoisted(() => vi.fn());

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'teacher-1', nombre_completo: 'Test Teacher' })),
}));

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(async () => [{ id: 'clase-1', nombre: 'Test Class' }]),
  invalidateClasesCache: vi.fn(),
}));

vi.mock('../../services/rutaService.js', () => ({
  loadRouteTree: vi.fn(async () => mockBlocks()),
  resolveRutaIdForClase: vi.fn(async () => 'ruta-1'),
  loadNodesForLevel: vi.fn(async () => []),
  loadIndicatorsForNode: vi.fn(async () => []),
  invalidateSemaphoresForClase: mockInvalidate,
}));

function mockBlocks() {
  return [{
    id: 'block-1',
    nombre: 'Bloque 1',
    levels: [{
      id: 'level-1',
      nombre: 'Nivel 1',
      semaphore: 'gray',
      locked: false,
      nodes: [{
        id: 'node-1',
        nombre: 'Nodo 1',
        semaphore: 'gray',
        indicators: [{
          id: 'ind-1',
          nombre: 'Indicador 1',
          semaphore: 'gray',
        }],
      }],
    }],
  }];
}

vi.mock('../../services/rutaTopicStore.js', () => ({
  setRutaTema: vi.fn(),
  peekRutaTema: vi.fn(() => null),
}));

vi.mock('../../components/NodeEvaluationCard.js', () => ({
  createNodeEvaluationCard: vi.fn(),
}));

vi.mock('../../../modules/academic-routes/services/academicService.js', () => ({
  academicService: {
    saveIndicatorAttempt: mockSaveAttempt,
  },
}));

import { renderRutaPlayerView } from '../rutaPlayerView.js';

describe('RutaPlayerView Evaluation Flow', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveAttempt.mockResolvedValue({});
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('RUTA-02 AC-05: full eval flow — select indicator, save, invalidate semaphore', async () => {
    await renderRutaPlayerView(container);

    // 1. Click an indicator in the tree
    const indEl = container.querySelector('[data-action="select-indicator"]');
    expect(indEl).toBeTruthy();
    indEl.click();
    await new Promise(r => setTimeout(r, 0));

    // 2. Action panel should now be visible with eval buttons
    const actionPanel = container.querySelector('#ruta-action-panel');
    expect(actionPanel).toBeTruthy();
    expect(actionPanel.innerHTML).toContain('Evaluación de clase');
    expect(actionPanel.innerHTML).toContain('Logrado');

    // 3. Click the "Logrado" eval button
    const logradoBtn = actionPanel.querySelector('[data-action="eval-indicator"][data-status="approved"]');
    expect(logradoBtn, 'Logrado button should exist').toBeTruthy();
    logradoBtn.click();
    await new Promise(r => setTimeout(r, 10));

    // 4. Verify saveIndicatorAttempt was called with correct args
    expect(mockSaveAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        indicator_id: 'ind-1',
        status: 'approved',
      })
    );

    // 5. Verify semaphore cache was invalidated
    expect(mockInvalidate).toHaveBeenCalledWith('clase-1');

    // 6. Verify status message shown
    const statusEl = container.querySelector('#ruta-eval-status');
    expect(statusEl.textContent).toContain('Guardado');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Polyfill scrollIntoView for jsdom
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Mock dependencies
vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'teacher-1', nombre_completo: 'Test Teacher' })),
}));

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(async (force) => [{ id: 'clase-1', nombre: 'Test Class' }]),
  invalidateClasesCache: vi.fn(),
}));

vi.mock('../../services/rutaService.js', () => ({
  loadRouteTree: vi.fn(async () => []),
  resolveRutaIdForClase: vi.fn(async () => 'ruta-1'),
  loadNodesForLevel: vi.fn(async () => []),
  loadIndicatorsForNode: vi.fn(async () => []),
  invalidateSemaphoresForClase: vi.fn(),
}));

vi.mock('../../services/rutaTopicStore.js', () => ({
  setRutaTema: vi.fn(),
  peekRutaTema: vi.fn(() => null),
}));

vi.mock('../../components/NodeEvaluationCard.js', () => ({
  createNodeEvaluationCard: vi.fn(),
}));

vi.mock('../../../modules/academic-routes/services/academicService.js', () => ({
  academicService: {
    saveIndicatorAttempt: vi.fn(async () => {}),
  },
}));

import { renderRutaPlayerView } from '../rutaPlayerView.js';

describe('RutaPlayerView Route Resolution', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Mock window.__SOI_MODE__
    Object.defineProperty(window, '__SOI_MODE__', { value: 'maestros', writable: true });
  });

  it('RUTA-01 AC-01: should render ruta player view content when called via router', async () => {
    await renderRutaPlayerView(container);

    // Verify the view renders ruta-specific content
    expect(container.innerHTML).toContain('Ruta de Contenidos');
    expect(container.innerHTML).toContain('ruta-clase-select');
    expect(container.innerHTML).toContain('ruta-tree-area');
    expect(container.innerHTML).toContain('ruta-action-panel');

    // Verify it does NOT render planificacion content
    expect(container.innerHTML).not.toContain('Planificación');
  });

  it('should render empty state when no clases assigned', async () => {
    const { getMisClases } = await import('../../services/maestroDataService.js');
    getMisClases.mockResolvedValue([]);

    await renderRutaPlayerView(container);

    expect(container.innerHTML).toContain('No tenés clases asignadas');
  });

  it('should render error state with error message', async () => {
    const { getMisClases } = await import('../../services/maestroDataService.js');
    getMisClases.mockRejectedValue(new Error('Network error'));

    await renderRutaPlayerView(container);

    expect(container.innerHTML).toContain('Error');
    expect(container.innerHTML).toContain('Network error');
  });
});

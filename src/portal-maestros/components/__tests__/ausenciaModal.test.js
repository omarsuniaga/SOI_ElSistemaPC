import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), eq: vi.fn(), gte: vi.fn(), lte: vi.fn(), or: vi.fn() })),
  },
}));

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn(),
    getSaveButton: vi.fn(() => null),
  },
}));

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1', nombre: 'Test Maestro' })),
}));

vi.mock('../../utils/focusTrap.js', () => ({
  enableTrap: vi.fn(() => ({ dispose: vi.fn() })),
}));

vi.mock('../../services/ausenciaService.js', () => ({
  ausenciaService: {
    findAffectedClasses: vi.fn(),
    buscarSalonesDisponibles: vi.fn(),
    createAbsenceRequest: vi.fn(),
  },
}));

vi.mock('../../utils/portalUtils.js', () => ({
  escHTML: vi.fn((s) => String(s)),
}));

// ── Imports (after mocks) ────────────────────────────────────────────────────

import { AusenciaModal } from '../ausenciaModal.js';
import { AppModal } from '../../../shared/components/AppModal.js';
import { AppToast } from '../../../shared/components/AppToast.js';
import { getMaestroLocal } from '../../auth/maestroAuth.js';
import { ausenciaService } from '../../services/ausenciaService.js';
import { filterBusinessDays } from '../../services/ausenciaUtils.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function dayAfterTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── T10: Class structure + initialization ────────────────────────────────────

describe('T10: AusenciaModal class structure', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    vi.clearAllMocks();
  });

  it('initializes this.maestro as null', () => {
    expect(modal.maestro).toBeNull();
  });

  it('initializes this.currentStep as 1', () => {
    expect(modal.currentStep).toBe(1);
  });

  it('defaultState() returns complete state shape', () => {
    const state = modal.defaultState();
    expect(state).toMatchObject({
      duracionTipo: expect.any(String),
      fechaAusencia: expect.any(String),
      fechaInicio: expect.any(String),
      fechaFin: expect.any(String),
      clasesAfectadas: expect.any(Array),
      tipoAusencia: expect.any(String),
      urgencia: expect.any(String),
      motivo: expect.any(String),
      archivo: expect.objectContaining({ file: null, uploadedUrl: null }),
      notificarDirector: expect.any(Boolean),
      validationErrors: expect.any(Object),
      loadingStates: expect.objectContaining({
        classes: false,
        salones: false,
        maestros: false,
        upload: false,
      }),
    });
  });

  it('open() calls getMaestroLocal and sets this.maestro', () => {
    modal.open();
    expect(getMaestroLocal).toHaveBeenCalled();
    expect(modal.maestro).toEqual({ id: 'maestro-1', nombre: 'Test Maestro' });
  });

  it('open() shows toast error and returns when no maestro', () => {
    getMaestroLocal.mockReturnValueOnce(null);
    modal.open();
    expect(AppToast.error).toHaveBeenCalled();
    expect(AppModal.open).not.toHaveBeenCalled();
  });

  it('open() calls AppModal.open with title and body', () => {
    modal.open();
    expect(AppModal.open).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        body: expect.any(String),
      })
    );
  });

  it('close() calls AppModal.close', () => {
    modal.close();
    expect(AppModal.close).toHaveBeenCalled();
  });

  it('getTitle() returns string containing step number', () => {
    modal.currentStep = 1;
    expect(modal.getTitle()).toContain('1');
    modal.currentStep = 3;
    expect(modal.getTitle()).toContain('3');
  });

  it('getSaveButtonText() returns different text per step', () => {
    modal.currentStep = 1;
    const textStep1 = modal.getSaveButtonText();
    modal.currentStep = 5;
    const textStep5 = modal.getSaveButtonText();
    expect(textStep1).not.toBe(textStep5);
  });
});

// ── T11: Step 1 render + validation ─────────────────────────────────────────

describe('T11: Step 1 — duration and date selection', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    vi.clearAllMocks();
  });

  it('renderStep1() returns HTML string', () => {
    const html = modal.renderStep1();
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('renderStep1() contains heading "Duración de la Ausencia"', () => {
    const html = modal.renderStep1();
    expect(html).toContain('Duración de la Ausencia');
  });

  it('renderStep1() contains radio options un_dia and varios_dias', () => {
    const html = modal.renderStep1();
    expect(html).toContain('value="un_dia"');
    expect(html).toContain('value="varios_dias"');
    expect(html).toContain('Un solo día');
    expect(html).toContain('Varios días');
  });

  it('renderStep1() contains single date input for un_dia mode', () => {
    modal.state.duracionTipo = 'un_dia';
    const html = modal.renderStep1();
    expect(html).toContain('id="fecha-unica"');
  });

  it('renderStep1() contains range inputs for varios_dias mode', () => {
    modal.state.duracionTipo = 'varios_dias';
    const html = modal.renderStep1();
    expect(html).toContain('id="fecha-inicio"');
    expect(html).toContain('id="fecha-fin"');
  });

  it('renderStep1() contains Cancelar and Siguiente buttons', () => {
    const html = modal.renderStep1();
    expect(html).toContain('Cancelar');
    expect(html).toContain('Siguiente');
  });

  it('renderStep1() uses pm-form-section CSS class', () => {
    const html = modal.renderStep1();
    expect(html).toContain('pm-form-section');
  });

  it('validateStep1() returns invalid when duracionTipo is empty', () => {
    modal.state.duracionTipo = '';
    const result = modal.validateStep1();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validateStep1() returns invalid when un_dia and no date provided', () => {
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = '';
    const result = modal.validateStep1();
    expect(result.valid).toBe(false);
  });

  it('validateStep1() returns invalid for past date', () => {
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = yesterday();
    const result = modal.validateStep1();
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('pasado'))).toBe(true);
  });

  it('validateStep1() returns valid for future date', () => {
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = tomorrow();
    const result = modal.validateStep1();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validateStep1() returns invalid for varios_dias with fin before inicio', () => {
    modal.state.duracionTipo = 'varios_dias';
    modal.state.fechaInicio = dayAfterTomorrow();
    modal.state.fechaFin = tomorrow();
    const result = modal.validateStep1();
    expect(result.valid).toBe(false);
  });

  it('validateStep1() returns valid for varios_dias with correct range', () => {
    modal.state.duracionTipo = 'varios_dias';
    modal.state.fechaInicio = tomorrow();
    modal.state.fechaFin = dayAfterTomorrow();
    const result = modal.validateStep1();
    expect(result.valid).toBe(true);
  });
});

// ── T12: Step 2 render + loading ─────────────────────────────────────────────

describe('T12: Step 2 — affected classes loading', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.maestro = { id: 'maestro-1' };
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = tomorrow();
    vi.clearAllMocks();
  });

  it('renderStep2() returns HTML string', () => {
    const html = modal.renderStep2();
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('renderStep2() shows loading state when classes are loading', () => {
    modal.state.loadingStates.classes = true;
    const html = modal.renderStep2();
    expect(html).toMatch(/Buscando|Cargando|spinner|loading/i);
  });

  it('renderStep2() shows class cards when clasesAfectadas has items', () => {
    modal.state.loadingStates.classes = false;
    modal.state.clasesAfectadas = [
      { claseId: 'c1', className: 'Guitarra A', sessionDate: tomorrow(), sessionTime: '10:00' },
    ];
    const html = modal.renderStep2();
    expect(html).toContain('Guitarra A');
    expect(html).toContain('pm-step-card');
  });

  it('renderStep2() shows empty state when no classes found', () => {
    modal.state.loadingStates.classes = false;
    modal.state.clasesAfectadas = [];
    modal.state._classesLoaded = true;
    const html = modal.renderStep2();
    expect(html).toMatch(/No hay clases|sin clases/i);
  });

  it('renderStep2() shows error state when load failed', () => {
    modal.state.loadingStates.classes = false;
    modal.state._classesError = true;
    const html = modal.renderStep2();
    expect(html).toMatch(/Error al cargar/i);
    expect(html).toMatch(/[Rr]eintentar|[Rr]etry/);
  });

  it('renderStep2() contains Atrás and Siguiente buttons', () => {
    const html = modal.renderStep2();
    expect(html).toContain('Atrás');
    expect(html).toContain('Siguiente');
  });

  it('renderStep2() shows heading "Clases afectadas"', () => {
    const html = modal.renderStep2();
    expect(html).toMatch(/Clases afectadas/i);
  });

  it('onLoadAffectedClasses() calls ausenciaService.findAffectedClasses', async () => {
    ausenciaService.findAffectedClasses.mockResolvedValueOnce([]);
    await modal.onLoadAffectedClasses();
    expect(ausenciaService.findAffectedClasses).toHaveBeenCalledWith(
      'maestro-1',
      expect.objectContaining({ fechaInicio: expect.any(String) })
    );
  });

  it('onLoadAffectedClasses() filters weekends via filterBusinessDays', async () => {
    const classes = [
      { claseId: 'c1', className: 'Guitarra', sessionDate: '2026-05-18', sessionTime: '10:00' }, // Monday
      { claseId: 'c2', className: 'Piano', sessionDate: '2026-05-17', sessionTime: '10:00' },   // Sunday
    ];
    ausenciaService.findAffectedClasses.mockResolvedValueOnce(classes);
    await modal.onLoadAffectedClasses();
    // Should filter out Sunday
    expect(modal.state.clasesAfectadas).toHaveLength(1);
    expect(modal.state.clasesAfectadas[0].claseId).toBe('c1');
  });

  it('onLoadAffectedClasses() sets _classesError on service failure', async () => {
    ausenciaService.findAffectedClasses.mockRejectedValueOnce(new Error('Network'));
    await modal.onLoadAffectedClasses();
    expect(modal.state._classesError).toBe(true);
  });
});

// ── T13: Step 3 render ───────────────────────────────────────────────────────

describe('T13: Step 3 — recovery planning per class', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.state.clasesAfectadas = [
      { claseId: 'c1', className: 'Guitarra A', sessionDate: tomorrow(), sessionTime: '10:00' },
      { claseId: 'c2', className: 'Piano B', sessionDate: dayAfterTomorrow(), sessionTime: '14:00' },
    ];
    vi.clearAllMocks();
  });

  it('renderStep3() returns HTML string', () => {
    const html = modal.renderStep3();
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('renderStep3() shows heading "Plan de recuperación"', () => {
    const html = modal.renderStep3();
    expect(html).toMatch(/Plan de recuperación/i);
  });

  it('renderStep3() renders a panel for each class', () => {
    const html = modal.renderStep3();
    expect(html).toContain('Guitarra A');
    expect(html).toContain('Piano B');
    expect(html).toContain('pm-panel-tareas');
  });

  it('renderStep3() includes tareas radio option per class', () => {
    const html = modal.renderStep3();
    expect(html).toContain('value="tareas"');
    expect(html).toContain('Asignar tareas');
  });

  it('renderStep3() includes reprogramar radio option per class', () => {
    const html = modal.renderStep3();
    expect(html).toContain('value="reprogramar"');
    expect(html).toContain('Reprogramar clase');
  });

  it('renderStep3() includes textarea per class with correct id', () => {
    const html = modal.renderStep3();
    expect(html).toContain('id="tareas-c1"');
    expect(html).toContain('id="tareas-c2"');
  });

  it('renderStep3() includes reprogramar date/time inputs per class', () => {
    const html = modal.renderStep3();
    expect(html).toContain('id="fecha-reprograma-c1"');
    expect(html).toContain('id="hora-reprograma-c1"');
  });

  it('renderStep3() contains Atrás and Siguiente buttons', () => {
    const html = modal.renderStep3();
    expect(html).toContain('Atrás');
    expect(html).toContain('Siguiente');
  });

  it('renderStep3() scopes radio names per class id', () => {
    const html = modal.renderStep3();
    expect(html).toContain('name="opcion-c1"');
    expect(html).toContain('name="opcion-c2"');
  });

  it('validateStep3() returns invalid when no class has a plan', () => {
    // No recoveryPlan on any class
    const result = modal.validateStep3();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validateStep3() returns valid when all classes have tareas plan', () => {
    modal.state.clasesAfectadas = modal.state.clasesAfectadas.map((c) => ({
      ...c,
      recoveryPlan: { tipo: 'tareas', actividadReemplazo: 'Hacer ejercicios página 34' },
    }));
    const result = modal.validateStep3();
    expect(result.valid).toBe(true);
  });

  it('validateStep3() returns valid when all classes have reprogramar plan', () => {
    modal.state.clasesAfectadas = modal.state.clasesAfectadas.map((c) => ({
      ...c,
      recoveryPlan: { tipo: 'reprogramar', fechaReprograma: dayAfterTomorrow(), horaReprograma: '10:00' },
    }));
    const result = modal.validateStep3();
    expect(result.valid).toBe(true);
  });

  it('validateStep3() returns invalid when tareas plan has empty text', () => {
    modal.state.clasesAfectadas = modal.state.clasesAfectadas.map((c) => ({
      ...c,
      recoveryPlan: { tipo: 'tareas', actividadReemplazo: '   ' },
    }));
    const result = modal.validateStep3();
    expect(result.valid).toBe(false);
  });

  it('validateStep3() returns valid when clasesAfectadas is empty', () => {
    modal.state.clasesAfectadas = [];
    const result = modal.validateStep3();
    expect(result.valid).toBe(true);
  });
});

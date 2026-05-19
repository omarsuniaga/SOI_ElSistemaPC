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

vi.mock('../../services/fileUploadService.js', () => ({
  fileUploadService: {
    uploadAbsenceDoc: vi.fn(),
  },
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

// ── T14: Step 4 render ───────────────────────────────────────────────────────

describe('T14: Step 4 — admin metadata input', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    vi.clearAllMocks();
  });

  it('renderStep4() returns HTML string', () => {
    const html = modal.renderStep4();
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('renderStep4() contains heading "Información de la ausencia"', () => {
    const html = modal.renderStep4();
    expect(html).toMatch(/Informaci[oó]n de la ausencia/i);
  });

  it('renderStep4() contains tipo-ausencia select with all options', () => {
    const html = modal.renderStep4();
    expect(html).toContain('id="tipo-ausencia"');
    expect(html).toContain('value="enfermedad"');
    expect(html).toContain('value="personal"');
    expect(html).toContain('value="capacitacion"');
    expect(html).toContain('value="otro"');
  });

  it('renderStep4() contains urgencia select with all options', () => {
    const html = modal.renderStep4();
    expect(html).toContain('id="urgencia"');
    expect(html).toContain('Planificada');
    expect(html).toContain('Hoy');
  });

  it('renderStep4() contains motivo textarea with char counter', () => {
    const html = modal.renderStep4();
    expect(html).toContain('id="motivo"');
    expect(html).toContain('maxlength="500"');
    expect(html).toContain('id="char-count"');
    expect(html).toContain('pm-char-counter');
  });

  it('renderStep4() contains file upload input', () => {
    const html = modal.renderStep4();
    expect(html).toContain('id="archivo-soporte"');
    expect(html).toContain('accept=".pdf,.jpg,.png"');
  });

  it('renderStep4() contains upload progress, success, error containers', () => {
    const html = modal.renderStep4();
    expect(html).toContain('id="upload-progress"');
    expect(html).toContain('id="upload-success"');
    expect(html).toContain('id="upload-error"');
  });

  it('renderStep4() contains notificar-director checkbox (checked by default)', () => {
    const html = modal.renderStep4();
    expect(html).toContain('id="notificar-director"');
    expect(html).toContain('checked');
    expect(html).toMatch(/Notificar al director/i);
  });

  it('renderStep4() contains Atrás and Siguiente buttons', () => {
    const html = modal.renderStep4();
    expect(html).toContain('Atrás');
    expect(html).toContain('Siguiente');
  });

  it('renderStep4() uses pm-form-section CSS class', () => {
    const html = modal.renderStep4();
    expect(html).toContain('pm-form-section');
  });
});

// ── T15: Step 5 render ───────────────────────────────────────────────────────

describe('T15: Step 5 — document preview and WhatsApp', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.maestro = { id: 'maestro-1', nombre: 'María López' };
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = tomorrow();
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'Consulta médica';
    modal.state.clasesAfectadas = [
      {
        claseId: 'c1',
        className: 'Guitarra A',
        sessionDate: tomorrow(),
        sessionTime: '10:00',
        recoveryPlan: { tipo: 'tareas', actividadReemplazo: 'Ejercicios del libro' },
      },
    ];
    vi.clearAllMocks();
  });

  it('renderStep5() returns HTML string', () => {
    const html = modal.renderStep5();
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('renderStep5() contains heading "Vista previa del documento"', () => {
    const html = modal.renderStep5();
    expect(html).toMatch(/Vista previa/i);
  });

  it('renderStep5() includes pm-preview-box', () => {
    const html = modal.renderStep5();
    expect(html).toContain('pm-preview-box');
  });

  it('renderStep5() document preview contains teacher name', () => {
    const html = modal.renderStep5();
    expect(html).toContain('María López');
  });

  it('renderStep5() document preview contains absence date', () => {
    const html = modal.renderStep5();
    expect(html).toContain(tomorrow());
  });

  it('renderStep5() document preview contains affected class', () => {
    const html = modal.renderStep5();
    expect(html).toContain('Guitarra A');
  });

  it('renderStep5() contains copy button', () => {
    const html = modal.renderStep5();
    expect(html).toMatch(/copiar|copy/i);
    expect(html).toContain('id="btn-copy-doc"');
  });

  it('renderStep5() contains WhatsApp button', () => {
    const html = modal.renderStep5();
    expect(html).toContain('btn-whatsapp');
  });

  it('renderStep5() WhatsApp button is disabled when no director phone', () => {
    modal.directorPhone = null;
    const html = modal.renderStep5();
    expect(html).toContain('id="btn-whatsapp"');
    // disabled attribute present
    const btnMatch = html.match(/id="btn-whatsapp"[^>]*/);
    expect(btnMatch?.[0] ?? html).toMatch(/disabled|title="[^"]*[Tt]el[eé]fono[^"]*"/);
  });

  it('renderStep5() contains Atrás and Enviar solicitud buttons', () => {
    const html = modal.renderStep5();
    expect(html).toContain('Atrás');
    expect(html).toMatch(/Enviar solicitud/i);
  });
});

// ── T16: Step progression logic ──────────────────────────────────────────────

describe('T16: step progression and validation', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    vi.clearAllMocks();
  });

  it('validateStep4() returns invalid when tipoAusencia is empty', () => {
    modal.state.tipoAusencia = '';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'Test motivo';
    const result = modal.validateStep4();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validateStep4() returns invalid when urgencia is empty', () => {
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = '';
    modal.state.motivo = 'Test motivo';
    const result = modal.validateStep4();
    expect(result.valid).toBe(false);
  });

  it('validateStep4() returns invalid when motivo is empty', () => {
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = '';
    const result = modal.validateStep4();
    expect(result.valid).toBe(false);
  });

  it('validateStep4() returns invalid when motivo exceeds 500 chars', () => {
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'a'.repeat(501);
    const result = modal.validateStep4();
    expect(result.valid).toBe(false);
  });

  it('validateStep4() returns valid with all required fields', () => {
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'Consulta médica';
    const result = modal.validateStep4();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validateStep5() always returns valid (no validation in step 5)', () => {
    const result = modal.validateStep5();
    expect(result.valid).toBe(true);
  });

  it('renderCurrentStep() dispatches to renderStep4 for step 4', () => {
    modal.currentStep = 4;
    const spy = vi.spyOn(modal, 'renderStep4');
    modal.renderCurrentStep();
    expect(spy).toHaveBeenCalled();
  });

  it('renderCurrentStep() dispatches to renderStep5 for step 5', () => {
    modal.currentStep = 5;
    const spy = vi.spyOn(modal, 'renderStep5');
    modal.renderCurrentStep();
    expect(spy).toHaveBeenCalled();
  });

  it('handleStepSubmit() stays on step 4 when validateStep4 fails', async () => {
    modal.currentStep = 4;
    modal.state.tipoAusencia = '';
    modal.state.urgencia = '';
    modal.state.motivo = '';
    const result = await modal.handleStepSubmit();
    expect(result).toBe(false);
    expect(modal.currentStep).toBe(4);
  });

  it('handleStepSubmit() advances from step 4 when valid', async () => {
    modal.currentStep = 4;
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'Consulta médica';
    // Mock _rerenderModal to prevent DOM ops
    vi.spyOn(modal, '_rerenderModal').mockImplementation(() => {});
    const result = await modal.handleStepSubmit();
    expect(result).toBe(true);
    expect(modal.currentStep).toBe(5);
  });

  it('handleStepSubmit() on step 5 calls submitForm', async () => {
    modal.currentStep = 5;
    modal.maestro = { id: 'maestro-1', nombre: 'Test' };
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'Test';
    const submitSpy = vi.spyOn(modal, 'submitForm').mockResolvedValue(undefined);
    vi.spyOn(modal, '_rerenderModal').mockImplementation(() => {});
    await modal.handleStepSubmit();
    expect(submitSpy).toHaveBeenCalled();
  });

  it('_showValidationErrors() renders errors in step error container', () => {
    document.body.innerHTML = '<div id="step4-errors"></div>';
    modal.currentStep = 4;
    modal._showValidationErrors(['Campo requerido', 'Otro error']);
    const container = document.getElementById('step4-errors');
    expect(container.innerHTML).toContain('Campo requerido');
    expect(container.innerHTML).toContain('Otro error');
    document.body.innerHTML = '';
  });
});

// ── T17: Dark mode support ───────────────────────────────────────────────────

describe('T17: dark mode CSS variables', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    vi.clearAllMocks();
  });

  it('renderStep4() does not contain hardcoded color #fff or #000', () => {
    const html = modal.renderStep4();
    expect(html).not.toMatch(/#fff\b/i);
    expect(html).not.toMatch(/#000\b/i);
    expect(html).not.toMatch(/color:\s*white/i);
    expect(html).not.toMatch(/color:\s*black/i);
  });

  it('renderStep5() does not contain hardcoded color #fff or #000', () => {
    modal.maestro = { id: 'm1', nombre: 'Test' };
    const html = modal.renderStep5();
    expect(html).not.toMatch(/#fff\b/i);
    expect(html).not.toMatch(/#000\b/i);
  });

  it('renderStep1() does not contain hardcoded color values', () => {
    const html = modal.renderStep1();
    expect(html).not.toMatch(/background:\s*white/i);
    expect(html).not.toMatch(/background:\s*#fff/i);
  });

  it('renderStep2() does not contain hardcoded color values', () => {
    const html = modal.renderStep2();
    expect(html).not.toMatch(/background:\s*white/i);
  });

  it('renderStep3() does not contain hardcoded color values', () => {
    modal.state.clasesAfectadas = [
      { claseId: 'c1', className: 'Guitarra', sessionDate: tomorrow(), sessionTime: '10:00' },
    ];
    const html = modal.renderStep3();
    expect(html).not.toMatch(/background:\s*white/i);
  });

  it('renderStep4() upload-progress uses existing pm-spinner class (not inline style color)', () => {
    const html = modal.renderStep4();
    expect(html).toContain('pm-spinner');
    // Spinner uses CSS class, not inline color
    expect(html).not.toMatch(/pm-spinner.*color:/);
  });

  it('renderStep5() preview box uses pm-preview-box class (no inline bg color)', () => {
    modal.maestro = { id: 'm1', nombre: 'Test' };
    const html = modal.renderStep5();
    expect(html).toContain('pm-preview-box');
    expect(html).not.toMatch(/pm-preview-box.*background-color:/);
  });

  it('all step renders use pm-helper-text class for helper text (not inline color)', () => {
    const html = modal.renderStep4();
    // If there are danger messages, they use CSS class not inline
    expect(html).not.toMatch(/style="color: red"/i);
    expect(html).not.toMatch(/style="color:#f/i);
  });
});

// ── T18: Keyboard navigation + accessibility ─────────────────────────────────

describe('T18: keyboard navigation and accessibility', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    vi.clearAllMocks();
  });

  it('renderStep4() all form inputs have associated labels (for= attribute)', () => {
    const html = modal.renderStep4();
    // Check key inputs have labels with for= pointing to their id
    expect(html).toMatch(/for="tipo-ausencia"/);
    expect(html).toMatch(/for="urgencia"/);
    expect(html).toMatch(/for="motivo"/);
  });

  it('renderStep4() has role="alert" error container', () => {
    const html = modal.renderStep4();
    expect(html).toContain('role="alert"');
  });

  it('renderStep4() spinner has role="status" for screen readers', () => {
    const html = modal.renderStep4();
    expect(html).toContain('role="status"');
  });

  it('renderStep5() has role="alert" container for accessibility', () => {
    modal.maestro = { id: 'm1', nombre: 'Test' };
    const html = modal.renderStep5();
    expect(html).toContain('role="alert"');
  });

  it('renderStep4() file input has accessible label', () => {
    const html = modal.renderStep4();
    expect(html).toMatch(/for="archivo-soporte"/);
  });

  it('renderStep4() notificar checkbox uses label wrapping or for= attribute', () => {
    const html = modal.renderStep4();
    // Either <label><input ...></label> or <label for="notificar-director">
    const hasWrapped = html.match(/<label[^>]*>[\s\S]*?id="notificar-director"/);
    const hasFor = html.match(/for="notificar-director"/);
    expect(hasWrapped || hasFor).toBeTruthy();
  });

  it('renderStep5() WhatsApp disabled button has title tooltip', () => {
    modal.maestro = { id: 'm1', nombre: 'Test' };
    modal.directorPhone = null;
    const html = modal.renderStep5();
    const btnMatch = html.match(/id="btn-whatsapp"[^>]*/s) ?? [html];
    const btnArea = btnMatch[0];
    expect(btnArea).toMatch(/disabled|title="/);
  });

  it('attachStepEvents() for step 4 does not throw when DOM has step 4 elements', () => {
    document.body.innerHTML = modal.renderStep4();
    modal.currentStep = 4;
    expect(() => modal.attachStepEvents()).not.toThrow();
    document.body.innerHTML = '';
  });

  it('attachStepEvents() for step 5 does not throw', () => {
    modal.maestro = { id: 'm1', nombre: 'Test' };
    document.body.innerHTML = modal.renderStep5();
    modal.currentStep = 5;
    expect(() => modal.attachStepEvents()).not.toThrow();
    document.body.innerHTML = '';
  });

  it('renderStep4() char counter is 0 initially', () => {
    const html = modal.renderStep4();
    expect(html).toContain('>0<');
  });
});

// ── T19: Service integration ─────────────────────────────────────────────────

describe('T19: service call integration', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.maestro = { id: 'maestro-1', nombre: 'María López' };
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = tomorrow();
    vi.clearAllMocks();
  });

  it('onLoadAffectedClasses() sets loadingStates.classes to true before call', async () => {
    let capturedLoading = false;
    ausenciaService.findAffectedClasses.mockImplementationOnce(async () => {
      capturedLoading = modal.state.loadingStates.classes;
      return [];
    });
    await modal.onLoadAffectedClasses();
    expect(capturedLoading).toBe(true);
  });

  it('onLoadAffectedClasses() sets loadingStates.classes false after success', async () => {
    ausenciaService.findAffectedClasses.mockResolvedValueOnce([]);
    await modal.onLoadAffectedClasses();
    expect(modal.state.loadingStates.classes).toBe(false);
  });

  it('onLoadAffectedClasses() sets loadingStates.classes false after error', async () => {
    ausenciaService.findAffectedClasses.mockRejectedValueOnce(new Error('fail'));
    await modal.onLoadAffectedClasses();
    expect(modal.state.loadingStates.classes).toBe(false);
  });

  it('onLoadAffectedClasses() sets _classesLoaded true on success', async () => {
    ausenciaService.findAffectedClasses.mockResolvedValueOnce([]);
    await modal.onLoadAffectedClasses();
    expect(modal.state._classesLoaded).toBe(true);
  });

  it('generateDocument() builds document string with teacher name', () => {
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.motivo = 'Consulta médica';
    modal.state.archivo = { file: null, uploadedUrl: null };
    modal.state.notificarDirector = true;
    modal.state.clasesAfectadas = [
      {
        claseId: 'c1',
        className: 'Guitarra A',
        sessionDate: tomorrow(),
        sessionTime: '10:00',
        recoveryPlan: { tipo: 'tareas', actividadReemplazo: 'Ejercicios' },
      },
    ];
    modal.generateDocument();
    expect(modal.state.whatsappText).toContain('María López');
    expect(modal.state.whatsappText).toContain('Guitarra A');
  });

  it('generateDocument() sets notificación director as SI when checked', () => {
    modal.state.notificarDirector = true;
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.motivo = 'Test';
    modal.state.clasesAfectadas = [];
    modal.state.archivo = { file: null, uploadedUrl: null };
    modal.generateDocument();
    expect(modal.state.whatsappText).toContain('SI');
  });

  it('generateDocument() sets notificación director as NO when unchecked', () => {
    modal.state.notificarDirector = false;
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.motivo = 'Test';
    modal.state.clasesAfectadas = [];
    modal.state.archivo = { file: null, uploadedUrl: null };
    modal.generateDocument();
    expect(modal.state.whatsappText).toContain('NO');
  });

  it('generateDocument() shows "No adjuntado" when no file uploaded', () => {
    modal.state.archivo = { file: null, uploadedUrl: null };
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.motivo = 'Test';
    modal.state.clasesAfectadas = [];
    modal.generateDocument();
    expect(modal.state.whatsappText).toContain('No adjuntado');
  });

  it('generateDocument() shows uploadedUrl when file uploaded', () => {
    modal.state.archivo = { file: null, uploadedUrl: 'https://storage.example.com/doc.pdf' };
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.motivo = 'Test';
    modal.state.clasesAfectadas = [];
    modal.generateDocument();
    expect(modal.state.whatsappText).toContain('https://storage.example.com/doc.pdf');
  });

  it('onLoadAffectedClasses() early-returns when no maestro', async () => {
    modal.maestro = null;
    await modal.onLoadAffectedClasses();
    expect(ausenciaService.findAffectedClasses).not.toHaveBeenCalled();
  });
});

// ── T20: File upload with progress ───────────────────────────────────────────

describe('T20: file upload progress and error recovery', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.maestro = { id: 'maestro-1', nombre: 'Test' };
    vi.clearAllMocks();
  });

  it('validateFileForUpload() returns valid for a small PDF file', () => {
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    const result = modal.validateFileForUpload(file);
    expect(result.valid).toBe(true);
  });

  it('validateFileForUpload() returns invalid for a file > 5MB', () => {
    const bigContent = new Uint8Array(5_100_000);
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' });
    const result = modal.validateFileForUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5MB|tamaño/i);
  });

  it('validateFileForUpload() returns invalid for unsupported mime type', () => {
    const file = new File(['exe content'], 'virus.exe', { type: 'application/octet-stream' });
    const result = modal.validateFileForUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tipo|formato/i);
  });

  it('validateFileForUpload() accepts .jpg file', () => {
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    const result = modal.validateFileForUpload(file);
    expect(result.valid).toBe(true);
  });

  it('validateFileForUpload() accepts .png file', () => {
    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    const result = modal.validateFileForUpload(file);
    expect(result.valid).toBe(true);
  });

  it('onUploadFile() sets loadingStates.upload true before upload', async () => {
    let capturedLoading = false;
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    modal.state.archivo.file = mockFile;

    // Mock the internal _performUpload
    vi.spyOn(modal, '_performUpload').mockImplementationOnce(async () => {
      capturedLoading = modal.state.loadingStates.upload;
      return { url: 'https://example.com/doc.pdf' };
    });
    await modal.onUploadFile(mockFile);
    expect(capturedLoading).toBe(true);
  });

  it('onUploadFile() sets loadingStates.upload false after success', async () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    vi.spyOn(modal, '_performUpload').mockResolvedValueOnce({ url: 'https://example.com/doc.pdf' });
    await modal.onUploadFile(mockFile);
    expect(modal.state.loadingStates.upload).toBe(false);
  });

  it('onUploadFile() updates uploadedUrl on success', async () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    vi.spyOn(modal, '_performUpload').mockResolvedValueOnce({ url: 'https://example.com/doc.pdf' });
    await modal.onUploadFile(mockFile);
    expect(modal.state.archivo.uploadedUrl).toBe('https://example.com/doc.pdf');
  });
});

// ── T21: submitForm and DB persistence ───────────────────────────────────────

describe('T21: submitForm and DB persistence', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.maestro = { id: 'maestro-1', nombre: 'María' };
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.urgencia = 'planificada';
    modal.state.motivo = 'Test motivo';
    modal.state.duracionTipo = 'un_dia';
    modal.state.fechaAusencia = tomorrow();
    modal.state.clasesAfectadas = [];
    modal.state.archivo = { file: null, uploadedUrl: null };
    modal.state.notificarDirector = true;
    vi.clearAllMocks();
  });

  it('submitForm() calls ausenciaService.createAbsenceRequest', async () => {
    ausenciaService.createAbsenceRequest.mockResolvedValueOnce({ absenceId: 'abs-1', createdAt: '2026-01-01' });
    vi.spyOn(modal, 'close').mockImplementation(() => {});
    await modal.submitForm();
    expect(ausenciaService.createAbsenceRequest).toHaveBeenCalledWith(
      'maestro-1',
      expect.any(Object)
    );
  });

  it('submitForm() calls close() on success', async () => {
    ausenciaService.createAbsenceRequest.mockResolvedValueOnce({ absenceId: 'abs-1', createdAt: '2026-01-01' });
    const closeSpy = vi.spyOn(modal, 'close').mockImplementation(() => {});
    await modal.submitForm();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('submitForm() shows success toast on success', async () => {
    const { AppToast } = await import('../../../shared/components/AppToast.js');
    ausenciaService.createAbsenceRequest.mockResolvedValueOnce({ absenceId: 'abs-1', createdAt: '2026-01-01' });
    vi.spyOn(modal, 'close').mockImplementation(() => {});
    await modal.submitForm();
    expect(AppToast.success).toHaveBeenCalled();
  });

  it('submitForm() shows error toast on failure', async () => {
    const { AppToast } = await import('../../../shared/components/AppToast.js');
    ausenciaService.createAbsenceRequest.mockRejectedValueOnce(new Error('DB error'));
    await modal.submitForm();
    expect(AppToast.error).toHaveBeenCalled();
  });

  it('submitForm() does NOT call close() on error', async () => {
    ausenciaService.createAbsenceRequest.mockRejectedValueOnce(new Error('DB error'));
    const closeSpy = vi.spyOn(modal, 'close').mockImplementation(() => {});
    await modal.submitForm();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('submitForm() sets state.submitting true during call', async () => {
    let capturedSubmitting = false;
    ausenciaService.createAbsenceRequest.mockImplementationOnce(async () => {
      capturedSubmitting = modal.state.submitting;
      return { absenceId: 'a', createdAt: 'x' };
    });
    vi.spyOn(modal, 'close').mockImplementation(() => {});
    await modal.submitForm();
    expect(capturedSubmitting).toBe(true);
  });

  it('submitForm() sets state.submitting false after success', async () => {
    ausenciaService.createAbsenceRequest.mockResolvedValueOnce({ absenceId: 'a', createdAt: 'x' });
    vi.spyOn(modal, 'close').mockImplementation(() => {});
    await modal.submitForm();
    expect(modal.state.submitting).toBe(false);
  });

  it('submitForm() sets state.submitting false after error', async () => {
    ausenciaService.createAbsenceRequest.mockRejectedValueOnce(new Error('fail'));
    await modal.submitForm();
    expect(modal.state.submitting).toBe(false);
  });

  it('submitForm() dispatches absence-submitted custom event on success', async () => {
    ausenciaService.createAbsenceRequest.mockResolvedValueOnce({ absenceId: 'abs-42', createdAt: '2026' });
    vi.spyOn(modal, 'close').mockImplementation(() => {});
    let eventFired = false;
    document.addEventListener('absence-submitted', () => { eventFired = true; }, { once: true });
    await modal.submitForm();
    expect(eventFired).toBe(true);
  });

  it('submitForm() emits event with absenceId detail', async () => {
    ausenciaService.createAbsenceRequest.mockResolvedValueOnce({ absenceId: 'abs-77', createdAt: '2026' });
    vi.spyOn(modal, 'close').mockImplementation(() => {});
    let eventDetail = null;
    document.addEventListener('absence-submitted', (e) => { eventDetail = e.detail; }, { once: true });
    await modal.submitForm();
    expect(eventDetail?.absenceId).toBe('abs-77');
  });
});

// ── T22: Director phone retrieval and WhatsApp fallback ──────────────────────

describe('T22: director phone retrieval and WhatsApp', () => {
  let modal;

  beforeEach(() => {
    modal = new AusenciaModal();
    modal.maestro = { id: 'maestro-1', nombre: 'Test' };
    modal.state.whatsappText = 'Test message for WhatsApp';
    vi.clearAllMocks();
  });

  it('getWhatsAppLink() returns valid wa.me URL when directorPhone set', () => {
    modal.directorPhone = '5491112345678';
    const link = modal.getWhatsAppLink();
    expect(link).toMatch(/^https:\/\/wa\.me\/5491112345678\?text=/);
  });

  it('getWhatsAppLink() returns null when directorPhone is null', () => {
    modal.directorPhone = null;
    expect(modal.getWhatsAppLink()).toBeNull();
  });

  it('getWhatsAppLink() returns null when directorPhone is empty string', () => {
    modal.directorPhone = '';
    expect(modal.getWhatsAppLink()).toBeNull();
  });

  it('getWhatsAppLink() returns null when directorPhone contains non-digits', () => {
    modal.directorPhone = '+54-11-1234-5678';
    // Contains non-digit chars — should still accept or reject; per spec: "digits only"
    expect(modal.getWhatsAppLink()).toBeNull();
  });

  it('getWhatsAppLink() URL-encodes the whatsapp text', () => {
    modal.directorPhone = '5491112345678';
    modal.state.whatsappText = 'Hello World & More';
    const link = modal.getWhatsAppLink();
    expect(link).toContain(encodeURIComponent('Hello World'));
  });

  it('renderStep5() WhatsApp button is enabled when directorPhone is set', () => {
    modal.maestro = { id: 'm1', nombre: 'Test' };
    modal.directorPhone = '5491112345678';
    modal.state.tipoAusencia = 'enfermedad';
    modal.state.motivo = 'Test';
    modal.state.clasesAfectadas = [];
    modal.state.archivo = { file: null, uploadedUrl: null };
    const html = modal.renderStep5();
    expect(html).toContain('id="btn-whatsapp"');
    // Should not be disabled when phone exists
    const whatsappSection = html.slice(html.indexOf('id="btn-whatsapp"') - 100);
    expect(whatsappSection.slice(0, 200)).not.toContain('disabled');
  });
});

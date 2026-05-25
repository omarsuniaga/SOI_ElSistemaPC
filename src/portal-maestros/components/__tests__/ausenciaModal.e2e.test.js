/**
 * E2E tests for AusenciaModal 3-step-style flow.
 * These tests simulate real user interactions: filling fields, triggering
 * events, and verifying state transitions end-to-end in jsdom.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocks -------------------------------------------------------------------

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(({ body, onShow }) => {
      document.body.innerHTML = `
        <div class="app-modal-dialog">
          <div class="app-modal-title"></div>
          <div class="app-modal-body">${body}</div>
          <div class="app-modal-footer">
            <button id="modal-save-btn">Enviar solicitud</button>
          </div>
        </div>
      `;
      onShow?.(document.querySelector('.app-modal-body'));
    }),
    close: vi.fn(),
    resetSaveBtn: vi.fn(),
  },
}));

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'teacher-1', nombre_completo: 'María García' })),
}));

vi.mock('../../utils/focusTrap.js', () => ({
  enableTrap: vi.fn(() => ({ dispose: vi.fn() })),
}));

vi.mock('../../services/ausenciaService.js', () => ({
  createAbsenceRequest: vi.fn(),
  findAffectedClasses: vi.fn(),
  findAvailableSalons: vi.fn(),
  findSubstituteTeachers: vi.fn(),
}));

// --- Imports (after mocks) ---------------------------------------------------

import { AppModal } from '../../../shared/components/AppModal.js';
import { AppToast } from '../../../shared/components/AppToast.js';
import {
  createAbsenceRequest,
  findAffectedClasses,
  findAvailableSalons,
} from '../../services/ausenciaService.js';
import { ausenciaModal } from '../ausenciaModal.js';

// --- Helpers -----------------------------------------------------------------

/** Open the modal and return the onSave callback for later use. */
function openModal() {
  ausenciaModal.open();
  const lastCall = AppModal.open.mock.calls.at(-1)[0];
  return lastCall.onSave;
}

/** Fill in dates and motivo, the minimum required fields. */
function fillRequiredFields({ fechaInicio = '2026-06-01', fechaFin = '2026-06-01', motivo = 'Motivo válido de prueba' } = {}) {
  // Click "Varios días" (rango) button to enable range fields and match what E2E tests expect
  const rangoBtn = document.querySelector('.am-dur-btn[data-dur="rango"]');
  if (rangoBtn) rangoBtn.click();

  const startEl = document.getElementById('fecha-inicio');
  const endEl = document.getElementById('fecha-fin');
  const motivoEl = document.getElementById('motivo');

  startEl.value = fechaInicio;
  startEl.dispatchEvent(new Event('change'));
  endEl.value = fechaFin;
  endEl.dispatchEvent(new Event('change'));
  motivoEl.value = motivo;
  motivoEl.dispatchEvent(new Event('input'));
}

// --- Tests -------------------------------------------------------------------

describe('AusenciaModal E2E — full flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    findAffectedClasses.mockResolvedValue([]);
    findAvailableSalons.mockResolvedValue([]);
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(() => Promise.resolve()) },
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  // ── Step 1: Modal renders all required sections ────────────────────────────

  it('renders all required form sections on open', () => {
    openModal();

    expect(document.getElementById('fecha-inicio')).not.toBeNull();
    expect(document.getElementById('fecha-fin')).not.toBeNull();
    expect(document.getElementById('motivo')).not.toBeNull();
    expect(document.getElementById('tipo-ausencia')).not.toBeNull();
    expect(document.getElementById('urgencia')).not.toBeNull();
    expect(document.getElementById('notify-director')).not.toBeNull();
    expect(document.getElementById('archivo-soporte')).not.toBeNull();
    expect(document.getElementById('ausencia-errors')).not.toBeNull();
  });

  it('initialises default state on open', () => {
    openModal();

    expect(ausenciaModal.state.tipoAusencia).toBe('personal');
    expect(ausenciaModal.state.urgencia).toBe('media');
    expect(ausenciaModal.state.notifyDirector).toBe(true);
    expect(ausenciaModal.state.coverageType).toBe('activities');
    expect(ausenciaModal.state.fechaInicio).toBe('');
    expect(ausenciaModal.state.fechaFin).toBe('');
    expect(ausenciaModal.state.motivo).toBe('');
  });

  // ── Step 2: Validation prevents submission with empty required fields ───────

  it('shows error when submitting without any fields filled', async () => {
    const onSave = openModal();

    await onSave();

    const errDiv = document.getElementById('ausencia-errors');
    expect(errDiv.textContent).toMatch(/fecha de inicio/i);
    expect(createAbsenceRequest).not.toHaveBeenCalled();
  });

  it('shows error when fechaFin is missing but fechaInicio is set', async () => {
    const onSave = openModal();

    document.getElementById('fecha-inicio').value = '2026-06-01';
    document.getElementById('fecha-inicio').dispatchEvent(new Event('change'));
    document.getElementById('motivo').value = 'Algún motivo';
    document.getElementById('motivo').dispatchEvent(new Event('input'));

    await onSave();

    const errDiv = document.getElementById('ausencia-errors');
    expect(errDiv.textContent).toMatch(/fecha de fin/i);
    expect(createAbsenceRequest).not.toHaveBeenCalled();
  });

  it('shows error when motivo is empty', async () => {
    const onSave = openModal();

    document.getElementById('fecha-inicio').value = '2026-06-01';
    document.getElementById('fecha-inicio').dispatchEvent(new Event('change'));
    document.getElementById('fecha-fin').value = '2026-06-03';
    document.getElementById('fecha-fin').dispatchEvent(new Event('change'));
    // motivo intentionally left empty

    await onSave();

    const errDiv = document.getElementById('ausencia-errors');
    expect(errDiv.textContent).toMatch(/motivo/i);
    expect(createAbsenceRequest).not.toHaveBeenCalled();
  });

  it('shows error when fechaFin is before fechaInicio', async () => {
    const onSave = openModal();

    document.getElementById('fecha-inicio').value = '2026-06-10';
    document.getElementById('fecha-inicio').dispatchEvent(new Event('change'));
    document.getElementById('fecha-fin').value = '2026-06-05'; // before start
    document.getElementById('fecha-fin').dispatchEvent(new Event('change'));
    document.getElementById('motivo').value = 'Motivo válido';
    document.getElementById('motivo').dispatchEvent(new Event('input'));

    await onSave();

    const errDiv = document.getElementById('ausencia-errors');
    expect(errDiv.textContent).toMatch(/fecha final/i);
    expect(createAbsenceRequest).not.toHaveBeenCalled();
  });

  // ── Step 3: Form data tracking across interactions ─────────────────────────

  it('tracks motivo character count in DOM', () => {
    openModal();

    const motivoEl = document.getElementById('motivo');
    motivoEl.value = 'Hola mundo';
    motivoEl.dispatchEvent(new Event('input'));

    expect(ausenciaModal.state.motivo).toBe('Hola mundo');
    expect(document.getElementById('motivo-count').textContent).toBe('10');
  });

  it('tracks tipo-ausencia selection in state', () => {
    openModal();

    const btn = document.querySelector('.am-tipo-btn[data-tipo="enfermedad"]');
    if (btn) btn.click();

    expect(ausenciaModal.state.tipoAusencia).toBe('enfermedad');
  });

  it('tracks urgencia selection in state', () => {
    openModal();

    const btn = document.querySelector('.am-urg-btn[data-urg="alta"]');
    if (btn) btn.click();

    expect(ausenciaModal.state.urgencia).toBe('alta');
  });

  it('tracks notify-director toggle in state', () => {
    openModal();

    const checkbox = document.getElementById('notify-director');
    expect(ausenciaModal.state.notifyDirector).toBe(true);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));

    expect(ausenciaModal.state.notifyDirector).toBe(false);
  });

  it('shows reschedule panel when coverage-reschedule radio is selected', () => {
    openModal();

    const panel = document.getElementById('reschedule-panel');
    expect(panel.style.display).toBe('none');

    document.querySelector('input[name="coverage-type"][value="reschedule"]').click();

    expect(ausenciaModal.state.coverageType).toBe('reschedule');
    expect(panel.style.display).not.toBe('none');
  });

  it('hides reschedule panel when switching back to activities coverage', () => {
    openModal();

    // First switch to reschedule
    const rescheduleRadio = document.querySelector('input[name="coverage-type"][value="reschedule"]');
    rescheduleRadio.checked = true;
    rescheduleRadio.dispatchEvent(new Event('change'));

    // Then switch back to activities
    const activitiesRadio = document.querySelector('input[name="coverage-type"][value="activities"]');
    activitiesRadio.checked = true;
    activitiesRadio.dispatchEvent(new Event('change'));

    expect(ausenciaModal.state.coverageType).toBe('activities');
    expect(document.getElementById('reschedule-panel').style.display).toBe('none');
  });

  // ── Step 4: Affected classes load and data is tracked ─────────────────────

  it('loads affected classes on date change and tracks replacement activity', async () => {
    findAffectedClasses.mockResolvedValue([
      {
        claseId: 'cls-1',
        className: 'Piano Nivel II',
        sessionDate: '2026-06-01',
        sessionTime: '08:00 - 09:00',
        actividadReemplazo: '',
      },
    ]);

    openModal();
    fillRequiredFields({ fechaInicio: '2026-06-01', fechaFin: '2026-06-01' });

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Piano Nivel II');
    });

    expect(findAffectedClasses).toHaveBeenCalledWith('teacher-1', '2026-06-01', '2026-06-01');

    const textarea = document.querySelector('[data-activity-class-id="cls-1"]');
    textarea.value = 'Escala de Do mayor';
    textarea.dispatchEvent(new Event('input'));

    expect(ausenciaModal.state.clasesAfectadas[0].actividadReemplazo).toBe('Escala de Do mayor');
  });

  it('shows empty state message when no classes are affected', async () => {
    findAffectedClasses.mockResolvedValue([]);

    openModal();
    fillRequiredFields();

    await vi.waitFor(() => {
      expect(document.getElementById('clases-afectadas-container').textContent)
        .toContain('No hay clases');
    });
  });

  // ── Step 5: Submit functionality ───────────────────────────────────────────

  it('completes full submission flow and shows success view', async () => {
    createAbsenceRequest.mockResolvedValue({
      ausencia: { id: 'abs-1' },
      whatsappText: 'Ausencia solicitada por María García',
      notification: { id: 'notif-1' },
    });

    const onSave = openModal();
    fillRequiredFields();

    await onSave();

    expect(createAbsenceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        maestro: { id: 'teacher-1', nombre_completo: 'María García' },
        fechaInicio: '2026-06-01',
        fechaFin: '2026-06-01',
        motivo: 'Motivo válido de prueba',
        notifyDirector: true,
      }),
    );

    expect(document.body.textContent).toContain('Solicitud enviada');
    expect(AppModal.resetSaveBtn).toHaveBeenCalledWith('Cerrar');
    expect(ausenciaModal.state.submitted).toBe(true);
  });

  it('passes coverageType and claseEmergente to service on submit', async () => {
    createAbsenceRequest.mockResolvedValue({ whatsappText: '' });
    findAvailableSalons.mockResolvedValue([{ id: 's99', nombre: 'Salón Z', capacidad: 20 }]);

    const onSave = openModal();
    fillRequiredFields();

    // Switch to reschedule and pick a salon
    document.querySelector('input[name="coverage-type"][value="reschedule"]').click();
    document.getElementById('emergente-fecha').value = '2026-06-05';
    document.getElementById('emergente-fecha').dispatchEvent(new Event('change'));
    document.getElementById('emergente-hora').value = '14:00';
    document.getElementById('emergente-hora').dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Salón Z');
    });

    document.querySelector('[name="salon-emergente"][value="s99"]').click();
    await onSave();

    expect(createAbsenceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        coverageType: 'reschedule',
        claseEmergente: expect.objectContaining({
          fecha: '2026-06-05',
          hora: '14:00',
          salonIdNuevo: 's99',
        }),
      }),
    );
  });

  it('shows error toast when service throws on submit', async () => {
    createAbsenceRequest.mockRejectedValue(new Error('Network error'));

    const onSave = openModal();
    fillRequiredFields();

    await onSave();

    expect(AppToast.error).toHaveBeenCalledWith('Error al enviar la solicitud');
    expect(document.body.textContent).not.toContain('Solicitud enviada');
  });

  it('whatsapp copy button writes text to clipboard after success', async () => {
    const expectedText = 'María García solicita ausencia';
    createAbsenceRequest.mockResolvedValue({ whatsappText: expectedText });

    const onSave = openModal();
    fillRequiredFields();
    await onSave();

    document.getElementById('copy-whatsapp').click();

    await vi.waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText),
    );
    expect(AppToast.success).toHaveBeenCalledWith('Mensaje copiado');
  });

  it('whatsapp open button navigates to wa.me with encoded text after success', async () => {
    const expectedText = 'Texto del mensaje WhatsApp';
    createAbsenceRequest.mockResolvedValue({ whatsappText: expectedText });

    const onSave = openModal();
    fillRequiredFields();
    await onSave();

    document.getElementById('open-whatsapp-btn').click();

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      'noopener,noreferrer',
    );
  });

  // ── Medical absence (enfermedad) ───────────────────────────────────────────

  it('allows submission with tipo=enfermedad without requiring document', async () => {
    // The current implementation does NOT enforce document upload for medical
    // absences at the JS validation level — that is a backend concern.
    // This test documents current (expected) behaviour.
    createAbsenceRequest.mockResolvedValue({ whatsappText: '' });

    const onSave = openModal();
    fillRequiredFields();

    const btn = document.querySelector('.am-tipo-btn[data-tipo="enfermedad"]');
    if (btn) btn.click();
    // No file attached

    await onSave();

    // Service was called and no error was thrown (success view replaces the form)
    expect(createAbsenceRequest).toHaveBeenCalledWith(
      expect.objectContaining({ tipoAusencia: 'enfermedad' }),
    );
    expect(document.body.textContent).toContain('Solicitud enviada');
  });

  // ── Session reset on re-open ───────────────────────────────────────────────

  it('resets state when modal is opened a second time', () => {
    openModal();

    document.getElementById('motivo').value = 'Primer motivo';
    document.getElementById('motivo').dispatchEvent(new Event('input'));
    expect(ausenciaModal.state.motivo).toBe('Primer motivo');

    // Open again — state should be reset
    openModal();
    expect(ausenciaModal.state.motivo).toBe('');
    expect(ausenciaModal.state.fechaInicio).toBe('');
    expect(ausenciaModal.state.submitted).toBe(false);
  });
});

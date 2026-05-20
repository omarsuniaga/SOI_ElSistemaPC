import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(({ body, onShow }) => {
      document.body.innerHTML = `
        <div class="app-modal-dialog">
          <div class="app-modal-title"></div>
          <div class="app-modal-body">${body}</div>
          <div class="app-modal-footer"></div>
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
  getMaestroLocal: vi.fn(() => ({ id: 'm1', nombre_completo: 'Ada Lovelace' })),
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

import { AppModal } from '../../../shared/components/AppModal.js';
import { AppToast } from '../../../shared/components/AppToast.js';
import {
  createAbsenceRequest,
  findAffectedClasses,
  findAvailableSalons,
  findSubstituteTeachers,
} from '../../services/ausenciaService.js';
import { ausenciaModal } from '../ausenciaModal.js';

describe('ausenciaModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(() => Promise.resolve()) },
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('renders the complete absence request sections', () => {
    ausenciaModal.open();

    expect(AppModal.open).toHaveBeenCalledWith(expect.objectContaining({ title: 'Nueva Solicitud de Ausencia' }));
    expect(document.body.textContent).toContain('Clases afectadas');
    expect(document.body.textContent).toContain('Opciones de cobertura');
    expect(document.body.textContent).toContain('Documento soporte');
    expect(document.body.textContent).toContain('Mensaje WhatsApp');
    expect(document.body.textContent).toContain('Notificación al director');
  });

  it('loads affected classes when the date range changes and captures replacement activity', async () => {
    findAffectedClasses.mockResolvedValue([
      {
        claseId: 'c1',
        className: 'Violín I',
        instrumento: 'Violín',
        sessionDate: '2026-05-20',
        sessionTime: '09:00 - 10:00',
        actividadReemplazo: '',
        selected: true,
      },
    ]);

    ausenciaModal.open();
    document.getElementById('fecha-inicio').value = '2026-05-20';
    document.getElementById('fecha-inicio').dispatchEvent(new Event('change'));
    document.getElementById('fecha-fin').value = '2026-05-20';
    document.getElementById('fecha-fin').dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Violín I');
    });

    const activity = document.querySelector('[data-activity-class-id="c1"]');
    activity.value = 'Practicar escala mayor';
    activity.dispatchEvent(new Event('input'));

    expect(findAffectedClasses).toHaveBeenCalledWith('m1', '2026-05-20', '2026-05-20');
    expect(ausenciaModal.state.clasesAfectadas[0].actividadReemplazo).toBe('Practicar escala mayor');
  });

  it('loads available salons for reschedule coverage', async () => {
    findAvailableSalons.mockResolvedValue([{ id: 's1', nombre: 'Salón A', capacidad: 12 }]);

    ausenciaModal.open();
    document.getElementById('coverage-reschedule').click();
    document.getElementById('emergente-fecha').value = '2026-05-22';
    document.getElementById('emergente-fecha').dispatchEvent(new Event('change'));
    document.getElementById('emergente-hora').value = '10:00';
    document.getElementById('emergente-hora').dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Salón A');
    });

    document.querySelector('[name="salon-emergente"][value="s1"]').click();

    expect(findAvailableSalons).toHaveBeenCalledWith('2026-05-22', '10:00');
    expect(ausenciaModal.state.claseEmergente.salonIdNuevo).toBe('s1');
  });

  it('submits the request through ausenciaService and shows WhatsApp actions', async () => {
    createAbsenceRequest.mockResolvedValue({
      ausencia: { id: 'a1' },
      whatsappText: 'Solicitud de ausencia\nMaestro: Ada Lovelace',
      notification: { id: 'n1' },
    });

    ausenciaModal.open();
    document.getElementById('fecha-inicio').value = '2026-05-20';
    document.getElementById('fecha-fin').value = '2026-05-20';
    document.getElementById('motivo').value = 'Motivo institucional válido';
    document.getElementById('motivo').dispatchEvent(new Event('input'));

    await AppModal.open.mock.calls.at(-1)[0].onSave();

    expect(createAbsenceRequest).toHaveBeenCalledWith(expect.objectContaining({
      maestro: { id: 'm1', nombre_completo: 'Ada Lovelace' },
      notifyDirector: true,
    }));
    expect(document.body.textContent).toContain('Solicitud enviada');

    document.getElementById('copy-whatsapp').click();
    await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Ada Lovelace')));
    expect(AppToast.success).toHaveBeenCalledWith('Mensaje copiado');
  });
});

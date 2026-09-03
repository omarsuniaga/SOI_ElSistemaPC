/**
 * Integration test: AusenciaModal wired to the REAL ausenciaService + validator.
 *
 * Only the API layer (ausenciasApi) and Supabase are mocked. This exercises the
 * exact seam that broke in production: the modal must hand the service a
 * `formState` object, otherwise `validateAbsenceRequest(undefined)` fails every
 * required-field check and throws
 * "La solicitud de ausencia tiene errores de validación."
 */

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

vi.mock('../../api/ausenciasApi.js', () => ({
  obtenerClasesMaestro: vi.fn(() => Promise.resolve([])),
  obtenerSesionesRango: vi.fn(() => Promise.resolve([])),
  obtenerHorariosClases: vi.fn(() => Promise.resolve([])),
  obtenerSalonesActivos: vi.fn(() => Promise.resolve([])),
  obtenerSesionesOcupadas: vi.fn(() => Promise.resolve([])),
  obtenerMaestrosSuplentes: vi.fn(() => Promise.resolve([])),
  registrarAusencia: vi.fn(),
  crearNotificacionAusencia: vi.fn(() => Promise.resolve({ id: 'n1' })),
}));

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.test/x.pdf' } })),
      })),
    },
  },
}));

import { AppModal } from '../../../shared/components/AppModal.js';
import { AppToast } from '../../../shared/components/AppToast.js';
import * as ausenciasApi from '../../api/ausenciasApi.js';
import { ausenciaModal } from '../ausenciaModal.js';

function fillRequiredFields({ fechaInicio = '2026-06-01', fechaFin = '2026-06-01', motivo = 'Motivo institucional válido' } = {}) {
  const rangoBtn = document.querySelector('.am-dur-btn[data-dur="rango"]');
  if (rangoBtn) rangoBtn.click();
  const start = document.getElementById('fecha-inicio');
  const end = document.getElementById('fecha-fin');
  const motivoEl = document.getElementById('motivo');
  start.value = fechaInicio;
  start.dispatchEvent(new Event('change'));
  end.value = fechaFin;
  end.dispatchEvent(new Event('change'));
  motivoEl.value = motivo;
  motivoEl.dispatchEvent(new Event('input'));
}

describe('AusenciaModal ↔ ausenciaService (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    ausenciasApi.registrarAusencia.mockResolvedValue({
      id: 'a1',
      tipo_ausencia: 'personal',
      urgencia: 'media',
      fecha_inicio: '2026-06-01',
      fecha_fin: '2026-06-01',
    });
  });

  it('a valid form reaches registrarAusencia without a validation error', async () => {
    ausenciaModal.open();
    fillRequiredFields();

    await AppModal.open.mock.calls.at(-1)[0].onSave();

    expect(ausenciasApi.registrarAusencia).toHaveBeenCalledTimes(1);
    expect(AppToast.error).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Solicitud enviada');
  });

  it('reschedule coverage maps to claseEmergente.activo for the service', async () => {
    ausenciaModal.open();
    fillRequiredFields();

    document.querySelector('input[name="coverage-type"][value="reschedule"]').click();
    document.getElementById('emergente-fecha').value = '2026-06-05';
    document.getElementById('emergente-fecha').dispatchEvent(new Event('change'));
    document.getElementById('emergente-hora').value = '14:00';
    document.getElementById('emergente-hora').dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('No hay salones disponibles.');
    });

    // No salon available/selected → the service validation must flag the salon,
    // surfaced in the modal error box (not a generic toast).
    await AppModal.open.mock.calls.at(-1)[0].onSave();

    expect(ausenciasApi.registrarAusencia).not.toHaveBeenCalled();
    expect(document.getElementById('ausencia-errors').textContent).toMatch(/salón/i);
  });
});

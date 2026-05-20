import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/ausenciaAprobacionApi.js', () => ({
  obtenerPendientesDirector: vi.fn(),
  revisarAusencia: vi.fn(),
}));

import {
  obtenerPendientesDirector,
  revisarAusencia,
} from '../../api/ausenciaAprobacionApi.js';
import { renderAusenciasDirectorView } from '../ausenciasDirectorView.js';

describe('ausenciasDirectorView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    vi.spyOn(window, 'dispatchEvent');
  });

  it('renders the director review panel with pending absences', async () => {
    obtenerPendientesDirector.mockResolvedValue([
      {
        id: 'a1',
        tipo_ausencia: 'personal',
        urgencia: 'alta',
        fecha_inicio: '2026-05-20',
        fecha_fin: '2026-05-20',
        motivo: 'Motivo familiar',
        maestros: { nombre_completo: 'Ada Lovelace' },
        clases_afectadas: ['c1'],
      },
    ]);

    await renderAusenciasDirectorView(container);

    expect(container.textContent).toContain('Revisión Director');
    expect(container.textContent).toContain('Ada Lovelace');
    expect(container.querySelectorAll('[data-ausencia-row]').length).toBe(1);
  });

  it('lists pending absences in a table', async () => {
    obtenerPendientesDirector.mockResolvedValue([
      {
        id: 'a1',
        tipo_ausencia: 'personal',
        urgencia: 'alta',
        fecha_inicio: '2026-05-20',
        fecha_fin: '2026-05-20',
        motivo: 'Motivo A',
        maestros: { nombre_completo: 'Ada Lovelace' },
        clases_afectadas: [],
      },
      {
        id: 'a2',
        tipo_ausencia: 'medica',
        urgencia: 'baja',
        fecha_inicio: '2026-05-21',
        fecha_fin: '2026-05-21',
        motivo: 'Motivo B',
        maestros: { nombre_completo: 'Alan Turing' },
        clases_afectadas: [],
      },
    ]);

    await renderAusenciasDirectorView(container);

    expect(container.querySelectorAll('[data-ausencia-row]').length).toBe(2);
    expect(container.textContent).toContain('Ada Lovelace');
    expect(container.textContent).toContain('Alan Turing');
  });

  it('renders review action buttons for each absence', async () => {
    obtenerPendientesDirector.mockResolvedValue([
      {
        id: 'a1',
        tipo_ausencia: 'personal',
        urgencia: 'media',
        fecha_inicio: '2026-05-20',
        fecha_fin: '2026-05-20',
        motivo: 'Motivo',
        maestros: { nombre_completo: 'Ada Lovelace' },
        clases_afectadas: [],
      },
    ]);

    await renderAusenciasDirectorView(container);

    expect(container.querySelector('[data-action="solicitar-info"]')).not.toBeNull();
    expect(container.querySelector('[data-action="enviar-aprobacion"]')).not.toBeNull();
  });

  it('opens detail modal and triggers solicitar-info action', async () => {
    obtenerPendientesDirector.mockResolvedValue([
      {
        id: 'a1',
        tipo_ausencia: 'personal',
        urgencia: 'alta',
        fecha_inicio: '2026-05-20',
        fecha_fin: '2026-05-20',
        motivo: 'Motivo familiar',
        maestros: { nombre_completo: 'Ada Lovelace' },
        clases_afectadas: ['c1'],
      },
    ]);
    revisarAusencia.mockResolvedValue({ id: 'a1', estado: 'info_solicitada' });
    obtenerPendientesDirector.mockResolvedValueOnce([
      {
        id: 'a1',
        tipo_ausencia: 'personal',
        urgencia: 'alta',
        fecha_inicio: '2026-05-20',
        fecha_fin: '2026-05-20',
        motivo: 'Motivo familiar',
        maestros: { nombre_completo: 'Ada Lovelace' },
        clases_afectadas: ['c1'],
      },
    ]);

    await renderAusenciasDirectorView(container);

    container.querySelector('[data-review-notes]').value = 'Necesito más datos.';
    container.querySelector('[data-action="solicitar-info"]').click();

    await vi.waitFor(() => {
      expect(revisarAusencia).toHaveBeenCalledWith('a1', 'info_solicitada', 'Necesito más datos.');
    });
  });

  it('sends absence to approval via enviar-aprobacion action', async () => {
    obtenerPendientesDirector
      .mockResolvedValueOnce([
        {
          id: 'a1',
          tipo_ausencia: 'personal',
          urgencia: 'media',
          fecha_inicio: '2026-05-20',
          fecha_fin: '2026-05-20',
          motivo: 'Motivo',
          maestros: { nombre_completo: 'Ada Lovelace' },
          clases_afectadas: [],
        },
      ])
      .mockResolvedValueOnce([]);
    revisarAusencia.mockResolvedValue({ id: 'a1', estado: 'pendiente_aprobacion' });

    await renderAusenciasDirectorView(container);

    container.querySelector('[data-review-notes]').value = 'Todo en orden.';
    container.querySelector('[data-action="enviar-aprobacion"]').click();

    await vi.waitFor(() => {
      expect(revisarAusencia).toHaveBeenCalledWith('a1', 'pendiente_aprobacion', 'Todo en orden.');
    });
    await vi.waitFor(() => {
      expect(container.textContent).toContain('No hay ausencias pendientes de revisión');
    });
  });
});

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/ausenciaAprobacionApi.js', () => ({
  aprobarAusencia: vi.fn(() => Promise.resolve({})),
  obtenerAusenciasPendientes: vi.fn(() => Promise.resolve([])),
  obtenerHistorialAusencias: vi.fn(() => Promise.resolve([])),
  rechazarAusencia: vi.fn(() => Promise.resolve({})),
}));

import {
  aprobarAusencia,
  obtenerAusenciasPendientes,
  rechazarAusencia,
} from '../../api/ausenciaAprobacionApi.js';
import { renderAusenciasAdminView } from '../ausenciasAdminView.js';

describe('ausenciasAdminView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    container.remove();
  });

  it('renders pending absences for director approval', async () => {
    obtenerAusenciasPendientes.mockResolvedValue([
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

    await renderAusenciasAdminView(container);

    expect(container.textContent).toContain('Solicitudes de Ausencia');
    expect(container.textContent).toContain('Ada Lovelace');
    expect(container.querySelectorAll('[data-ausencia-card]').length).toBe(1);
  });

  it('shows an empty state when there are no pending absences', async () => {
    obtenerAusenciasPendientes.mockResolvedValue([]);

    await renderAusenciasAdminView(container);

    expect(container.textContent).toContain('No hay solicitudes de ausencia pendientes');
  });

  it('uses a four-column grid for absence cards on desktop', async () => {
    await renderAusenciasAdminView(container);

    const styles = document.getElementById('ausencias-admin-view-styles');

    expect(styles.textContent).toContain('max-width: 1400px;');
    expect(styles.textContent).toContain('display: grid;');
    expect(styles.textContent).toContain('@media (min-width: 1200px)');
    expect(styles.textContent).toContain('grid-template-columns: repeat(4, minmax(0, 1fr));');
  });

  it('approves an absence and refreshes the list', async () => {
    obtenerAusenciasPendientes
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
    aprobarAusencia.mockResolvedValue({ id: 'a1', estado: 'aprobada' });

    await renderAusenciasAdminView(container);
    container.querySelector('[data-decision-notes]').value = 'Aprobada.';
    container.querySelector('[data-action="approve"]').click();

    await vi.waitFor(() => {
      expect(aprobarAusencia).toHaveBeenCalledWith('a1', 'Aprobada.');
    });
    await vi.waitFor(() => {
      expect(container.textContent).toContain('No hay solicitudes de ausencia pendientes');
    });
  });

  it('rejects an absence with notes and refreshes the list', async () => {
    obtenerAusenciasPendientes
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
    rechazarAusencia.mockResolvedValue({ id: 'a1', estado: 'rechazada' });

    await renderAusenciasAdminView(container);
    container.querySelector('[data-decision-notes]').value = 'No procede.';
    container.querySelector('[data-action="reject"]').click();

    await vi.waitFor(() => {
      expect(rechazarAusencia).toHaveBeenCalledWith('a1', 'No procede.');
    });
  });
});

import { describe, expect, it, vi } from 'vitest';

import { createAusenciaAprobacionCard } from '../ausenciaAprobacionCard.js';

describe('ausenciaAprobacionCard', () => {
  const ausencia = {
    id: 'a1',
    tipo_ausencia: 'personal',
    urgencia: 'alta',
    fecha_inicio: '2026-05-20',
    fecha_fin: '2026-05-21',
    motivo: 'Motivo familiar',
    maestros: { nombre_completo: 'Ada Lovelace' },
    clases_afectadas: ['c1', 'c2'],
    actividades_por_clase: { c1: 'Lectura guiada' },
    clase_emergente: { fecha: '2026-05-22', hora: '10:00', salon_id: 's1' },
  };

  it('renders absence details and affected class count', () => {
    const card = createAusenciaAprobacionCard(ausencia);

    expect(card.textContent).toContain('Ada Lovelace');
    expect(card.textContent).toContain('Personal');
    expect(card.textContent).toContain('Alta');
    expect(card.textContent).toContain('2 clases afectadas');
    expect(card.textContent).toContain('Motivo familiar');
  });

  it('calls onApprove with decision notes', () => {
    const onApprove = vi.fn();
    const card = createAusenciaAprobacionCard(ausencia, { onApprove });
    card.querySelector('[data-decision-notes]').value = 'Aprobado con suplente.';

    card.querySelector('[data-action="approve"]').click();

    expect(onApprove).toHaveBeenCalledWith('a1', 'Aprobado con suplente.');
  });

  it('calls onReject with decision notes', () => {
    const onReject = vi.fn();
    const card = createAusenciaAprobacionCard(ausencia, { onReject });
    card.querySelector('[data-decision-notes]').value = 'Falta documento.';

    card.querySelector('[data-action="reject"]').click();

    expect(onReject).toHaveBeenCalledWith('a1', 'Falta documento.');
  });
});

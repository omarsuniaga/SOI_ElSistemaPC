// src/modules/horario-builder/__tests__/ScheduleGrid.test.js
import { describe, it, expect } from 'vitest';
import { createScheduleGrid, attachScheduleGridListeners } from '../components/ScheduleGrid.js';

function parse(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

const BASE_ASSIGNMENT = {
  clase_id: 'c1',
  clase_nombre: 'Piano Básico',
  instrumento: 'Piano',
  maestro_id: 'm1',
  maestro_nombre: 'María García',
  salon_nombre: 'Sala A',
  dia: 'lunes',
  hora_inicio: '10:00',
  hora_fin: '11:00',
  locked: false,
  hasConflict: false,
};

describe('createScheduleGrid', () => {
  it('returns empty-state HTML when assignments is empty', () => {
    const html = createScheduleGrid({ assignments: [], activeView: 'grid', draggable: false });
    expect(html).toContain('No hay asignaciones para mostrar.');
  });

  it('grid view renders correct number of day columns (6)', () => {
    const html = createScheduleGrid({
      assignments: [BASE_ASSIGNMENT],
      activeView: 'grid',
      draggable: false,
    });
    const container = parse(html);
    const headers = container.querySelectorAll('th.sg-col-header');
    expect(headers.length).toBe(6);
  });

  it('grid view places an assignment block in the correct day column', () => {
    const html = createScheduleGrid({
      assignments: [BASE_ASSIGNMENT],
      activeView: 'grid',
      draggable: false,
    });
    const container = parse(html);
    const cell = container.querySelector('td.sg-cell[data-day="lunes"][data-hour="10:00"]');
    expect(cell).not.toBeNull();
    expect(cell.innerHTML).toContain('schedule-block');
  });

  it('teacher view groups assignments by maestro_nombre', () => {
    const assignments = [
      { ...BASE_ASSIGNMENT, maestro_nombre: 'María García', clase_id: 'c1' },
      { ...BASE_ASSIGNMENT, maestro_nombre: 'Juan Pérez',   clase_id: 'c2' },
      { ...BASE_ASSIGNMENT, maestro_nombre: 'María García', clase_id: 'c3', dia: 'martes' },
    ];
    const html = createScheduleGrid({ assignments, activeView: 'teacher', draggable: false });
    const container = parse(html);
    const headings = container.querySelectorAll('h4.sg-group-title');
    const titles = [...headings].map(h => h.textContent.trim());
    expect(titles).toContain('María García');
    expect(titles).toContain('Juan Pérez');
    expect(titles.length).toBe(2);
    // María García group has 2 blocks
    const mariaGroup = [...headings].find(h => h.textContent.includes('María García'));
    const mariaBlocks = mariaGroup.nextElementSibling.querySelectorAll('.schedule-block');
    expect(mariaBlocks.length).toBe(2);
  });

  it('room view groups assignments by salon_nombre', () => {
    const assignments = [
      { ...BASE_ASSIGNMENT, salon_nombre: 'Sala A', clase_id: 'c1' },
      { ...BASE_ASSIGNMENT, salon_nombre: 'Sala B', clase_id: 'c2' },
    ];
    const html = createScheduleGrid({ assignments, activeView: 'room', draggable: false });
    const container = parse(html);
    const headings = container.querySelectorAll('h4.sg-group-title');
    const titles = [...headings].map(h => h.textContent.trim());
    expect(titles).toContain('Sala A');
    expect(titles).toContain('Sala B');
  });
});

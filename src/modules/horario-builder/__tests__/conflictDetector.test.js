import { describe, it, expect } from 'vitest';
import { detectConflicts } from '../engine/conflictDetector.js';

const base = {
  clase_id: 'c-1', clase_nombre: 'Piano I',
  maestro_id: 't-1', maestro_nombre: 'Omar',
  salon_id: 's-1', salon_nombre: 'Sala A',
  dia: 'lunes', hora_inicio: '10:00', hora_fin: '11:00'
};

describe('detectConflicts', () => {
  it('returns empty array when no assignments', () => {
    expect(detectConflicts([])).toEqual([]);
  });

  it('returns empty array when no overlaps', () => {
    const a = { ...base, clase_id: 'c-1', hora_inicio: '10:00', hora_fin: '11:00' };
    const b = { ...base, clase_id: 'c-2', maestro_id: 't-2', salon_id: 's-2', hora_inicio: '12:00', hora_fin: '13:00' };
    expect(detectConflicts([a, b])).toEqual([]);
  });

  it('detects teacher conflict on same day and overlapping slot', () => {
    const a = { ...base, clase_id: 'c-1', hora_inicio: '10:00', hora_fin: '11:00' };
    const b = { ...base, clase_id: 'c-2', salon_id: 's-2', hora_inicio: '10:30', hora_fin: '11:30' };
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe('teacher');
    expect(conflicts[0].ids).toContain('c-1');
    expect(conflicts[0].ids).toContain('c-2');
  });

  it('detects room conflict on same day and overlapping slot', () => {
    const a = { ...base, clase_id: 'c-1', maestro_id: 't-1', hora_inicio: '10:00', hora_fin: '11:00' };
    const b = { ...base, clase_id: 'c-2', maestro_id: 't-2', hora_inicio: '10:00', hora_fin: '11:00' };
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe('room');
  });

  it('does not flag conflicts on different days', () => {
    const a = { ...base, clase_id: 'c-1', dia: 'lunes' };
    const b = { ...base, clase_id: 'c-2', salon_id: 's-2', dia: 'martes' };
    expect(detectConflicts([a, b])).toEqual([]);
  });

  it('marks conflicting assignment IDs in the returned assignments', () => {
    const a = { ...base, clase_id: 'c-1' };
    const b = { ...base, clase_id: 'c-2', salon_id: 's-2' };
    const { assignments } = detectConflicts([a, b], { returnAnnotated: true });
    expect(assignments.find(x => x.clase_id === 'c-1').hasConflict).toBe(true);
    expect(assignments.find(x => x.clase_id === 'c-2').hasConflict).toBe(true);
  });
});

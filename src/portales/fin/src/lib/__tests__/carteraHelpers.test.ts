import { describe, test, expect } from 'vitest';
import type { AlumnoCarteraRow } from '../../hooks/useAlumnosCartera';
import {
  diasAtraso,
  filtrarCartera,
  contarPorPestana,
  semaforo,
} from '../carteraHelpers';

function row(over: Partial<AlumnoCarteraRow>): AlumnoCarteraRow {
  return {
    alumno_id: 'a1',
    alumno_nombre: 'Escarlet Martínez',
    instrumento_principal: 'Violín',
    alumno_activo: true,
    exento_mensualidad: false,
    familia_id: 'f1',
    nombre_familia: 'Familia Martínez',
    contacto_nombre: 'Pedro Martínez',
    contacto_cedula: '',
    contacto_telefono: '',
    contacto_email: '',
    cuotas_pendientes_count: 0,
    cuotas_vencidas_count: 0,
    saldo_pendiente_centavos: 0,
    fecha_mas_antigua_vencida: null,
    estado_pago: 'al_dia',
    ...over,
  };
}

describe('diasAtraso', () => {
  const hoy = new Date('2026-09-06T12:00:00');
  test('null / futuro → 0', () => {
    expect(diasAtraso(null, hoy)).toBe(0);
    expect(diasAtraso('2026-10-05', hoy)).toBe(0);
  });
  test('vencida cuenta días enteros', () => {
    expect(diasAtraso('2026-08-05', hoy)).toBe(32);
  });
});

describe('filtrarCartera', () => {
  const rows = [
    row({ alumno_id: 'a', estado_pago: 'mora', saldo_pendiente_centavos: 60000 }),
    row({ alumno_id: 'b', estado_pago: 'debe', saldo_pendiente_centavos: 60000 }),
    row({ alumno_id: 'c', estado_pago: 'al_dia' }),
    row({ alumno_id: 'd', estado_pago: 'exento' }),
    row({ alumno_id: 'e', estado_pago: 'inactivo', saldo_pendiente_centavos: 120000, alumno_activo: false }),
    row({ alumno_id: 'f', estado_pago: 'inactivo', saldo_pendiente_centavos: 0, alumno_activo: false }),
  ];

  test('pendientes = debe + mora', () => {
    expect(filtrarCartera(rows, 'pendientes', '').map((r) => r.alumno_id).sort()).toEqual(['a', 'b']);
  });
  test('al_dia = al_dia + exento', () => {
    expect(filtrarCartera(rows, 'al_dia', '').map((r) => r.alumno_id).sort()).toEqual(['c', 'd']);
  });
  test('retirados = inactivo con saldo > 0', () => {
    expect(filtrarCartera(rows, 'retirados', '').map((r) => r.alumno_id)).toEqual(['e']);
  });
  test('todos = todo', () => {
    expect(filtrarCartera(rows, 'todos', '')).toHaveLength(6);
  });
  test('búsqueda por representante / familia', () => {
    const r = [row({ alumno_id: 'x', alumno_nombre: 'Ana', contacto_nombre: 'Carlos López' })];
    expect(filtrarCartera(r, 'todos', 'lópez')).toHaveLength(1);
    expect(filtrarCartera(r, 'todos', 'zzz')).toHaveLength(0);
  });
});

describe('contarPorPestana', () => {
  test('cuenta cada pestaña', () => {
    const rows = [
      row({ estado_pago: 'mora' }),
      row({ estado_pago: 'debe' }),
      row({ estado_pago: 'al_dia' }),
      row({ estado_pago: 'inactivo', saldo_pendiente_centavos: 100, alumno_activo: false }),
    ];
    const c = contarPorPestana(rows);
    expect(c).toEqual({ pendientes: 2, al_dia: 1, retirados: 1, todos: 4 });
  });
});

describe('semaforo', () => {
  test('cada estado tiene color y label', () => {
    expect(semaforo('mora').label).toBe('En mora');
    expect(semaforo('al_dia').dot).toContain('emerald');
    expect(semaforo('inactivo').label).toBe('Retirado');
    expect(semaforo(null).label).toBe('—');
  });
});

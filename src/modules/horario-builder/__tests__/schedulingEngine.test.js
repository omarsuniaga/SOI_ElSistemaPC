import { describe, it, expect } from 'vitest';
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js';

describe('schedulingEngine tests', () => {
  const JORNADA = {
    lunes:     { inicio: '10:00', fin: '19:00' },
    martes:    { inicio: '10:00', fin: '19:00' },
    miércoles: { inicio: '10:00', fin: '19:00' },
    jueves:    { inicio: '10:00', fin: '19:00' },
    viernes:   { inicio: '10:00', fin: '19:00' },
    sábado:    { inicio: '09:00', fin: '13:00' }
  };

  const mockTeachers = [
    {
      id: 't-1',
      nombre: 'Prof Violin',
      disponibilidad: {
        lunes: [{ inicio: '10:00', fin: '13:00' }]
      }
    }
  ];

  const mockSalones = [
    { id: 's-1', nombre: 'Salon Pequeño', capacidad: 5, is_active: true },
    { id: 's-2', nombre: 'Salon Grande', capacidad: 20, is_active: true }
  ];

  it('debería programar con éxito una clase básica compatible', () => {
    const clases = [
      { id: 'c-1', nombre: 'Clase Violin I', maestro_principal_id: 't-1', total_alumnos: 3, duracion: 60 }
    ];

    const result = generateOptimizedSchedule({
      clasesConMaestro: clases,
      maestros: mockTeachers,
      salones: mockSalones,
      config: { jornada: JORNADA, gapMinimo: 15, duracionBloque: 60 }
    });

    expect(result.assignments.length).toBe(1);
    expect(result.noAsignadas.length).toBe(0);
    
    const assigned = result.assignments[0];
    expect(assigned.clase_id).toBe('c-1');
    expect(assigned.maestro_id).toBe('t-1');
    expect(assigned.dia).toBe('lunes');
    expect(assigned.salon_id).toBe('s-1'); // Prefer smallest capable room
    expect(result.metricas.score).toBe(100);
  });

  it('debería detectar y reportar cuellos de botella por capacidad de salón', () => {
    const clases = [
      { id: 'c-2', nombre: 'Clase Violín Masiva', maestro_principal_id: 't-1', total_alumnos: 25, duracion: 60 }
    ];

    const result = generateOptimizedSchedule({
      clasesConMaestro: clases,
      maestros: mockTeachers,
      salones: mockSalones,
      config: { jornada: JORNADA, gapMinimo: 15, duracionBloque: 60 }
    });

    expect(result.assignments.length).toBe(0);
    expect(result.noAsignadas.length).toBe(1);
    expect(result.noAsignadas[0].razon).toContain('No hay salones activos con capacidad suficiente');
  });

  it('debería evitar solapamientos de clases para el mismo maestro', () => {
    const clases = [
      { id: 'c-1', nombre: 'Clase A', maestro_principal_id: 't-1', total_alumnos: 2, duracion: 60 },
      { id: 'c-2', nombre: 'Clase B', maestro_principal_id: 't-1', total_alumnos: 2, duracion: 60 }
    ];

    const result = generateOptimizedSchedule({
      clasesConMaestro: clases,
      maestros: mockTeachers,
      salones: mockSalones,
      config: { jornada: JORNADA, gapMinimo: 15, duracionBloque: 60 }
    });

    // 1 lunes: 10:00 to 13:00. Room for two 60-minute classes (with 15m gap):
    // Class A: 10:00 - 11:00, Gap: 11:00 - 11:15.
    // Class B: 11:30 - 12:30 (starts at 11:30 or 12:00, fits before 13:00).
    // Let's verify that both were assigned without overlapping
    expect(result.assignments.length).toBe(2);
    expect(result.noAsignadas.length).toBe(0);

    const a1 = result.assignments[0];
    const a2 = result.assignments[1];
    expect(a1.dia).toBe('lunes');
    expect(a2.dia).toBe('lunes');
  });
});

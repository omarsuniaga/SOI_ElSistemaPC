import { describe, test, expect } from 'vitest';
import { computePctAsistencia, computeResumenSolvencia, ResumenAcademico } from '../alumno360';
import { Cuota } from '../../types';

function baseResumen(overrides: Partial<ResumenAcademico> = {}): ResumenAcademico {
  return {
    totalSesiones: 0,
    presentes: 0,
    ausentes: 0,
    justificados: 0,
    primeraAsistencia: null,
    ultimaAsistencia: null,
    totalEvaluaciones: 0,
    ultimaFechaEvaluacion: null,
    ultimaCalificacion: null,
    ultimoEstadoCualitativo: null,
    ultimoObjetivo: null,
    ...overrides,
  };
}

describe('computePctAsistencia', () => {
  test('sin ninguna sesión registrada -> null (no 0%)', () => {
    expect(computePctAsistencia(baseResumen())).toBeNull();
  });

  test('solo justificados, sin presente/ausente -> null (no hay base para calcular)', () => {
    expect(computePctAsistencia(baseResumen({ justificados: 3, totalSesiones: 3 }))).toBeNull();
  });

  test('9 presentes de 22 (13 ausentes) -> 41%, caso real verificado en producción', () => {
    expect(computePctAsistencia(baseResumen({ presentes: 9, ausentes: 13, totalSesiones: 22 }))).toBe(41);
  });

  test('justificados no cuentan a favor ni en contra del %', () => {
    const conJustificados = computePctAsistencia(baseResumen({ presentes: 5, ausentes: 5, justificados: 10 }));
    expect(conJustificados).toBe(50);
  });

  test('100% de asistencia', () => {
    expect(computePctAsistencia(baseResumen({ presentes: 10, ausentes: 0 }))).toBe(100);
  });
});

function makeCuota(overrides: Partial<Cuota>): Cuota {
  return {
    id: 'cuo-1',
    alumno_id: 'alu-1',
    alumno_nombre: 'Alumno Test',
    representante_id: 'rep-1',
    familia_id: 'fam-1',
    arancel_concepto: 'Mensualidad',
    periodo: '2026-08',
    ciclo_academico: '2026-2027',
    monto_bruto_centavos: 60000,
    descuento_beca_centavos: 0,
    monto_neto_centavos: 60000,
    monto_pagado_centavos: 0,
    saldo_centavos: 60000,
    fecha_emision: '2026-08-01',
    fecha_vencimiento: '2026-08-10',
    estado: 'pendiente',
    es_prorrateada: false,
    version: 1,
    ...overrides,
  };
}

describe('computeResumenSolvencia', () => {
  test('sin cuotas registradas -> totalCuotas 0, distinto de "0 pendientes"', () => {
    const res = computeResumenSolvencia([]);
    expect(res.totalCuotas).toBe(0);
    expect(res.tieneCuotasVencidas).toBe(false);
  });

  test('cuota vencida sin pagar', () => {
    const cuotas = [makeCuota({ estado: 'pendiente', fecha_vencimiento: '2020-01-01', saldo_centavos: 60000 })];
    const res = computeResumenSolvencia(cuotas);
    expect(res.totalCuotas).toBe(1);
    expect(res.cuotasPendientes).toBe(1);
    expect(res.saldoPendienteCentavos).toBe(60000);
    expect(res.tieneCuotasVencidas).toBe(true);
  });

  test('todas las cuotas pagadas -> sin saldo pendiente ni vencidas', () => {
    const cuotas = [
      makeCuota({ id: 'c1', estado: 'pagada', saldo_centavos: 0, fecha_vencimiento: '2020-01-01' }),
      makeCuota({ id: 'c2', estado: 'pagada', saldo_centavos: 0, fecha_vencimiento: '2020-02-01' }),
    ];
    const res = computeResumenSolvencia(cuotas);
    expect(res.cuotasPagadas).toBe(2);
    expect(res.cuotasPendientes).toBe(0);
    expect(res.saldoPendienteCentavos).toBe(0);
    expect(res.tieneCuotasVencidas).toBe(false);
  });

  test('cuota parcial cuenta como pendiente para el saldo', () => {
    const cuotas = [makeCuota({ estado: 'parcial', monto_pagado_centavos: 20000, saldo_centavos: 40000, fecha_vencimiento: '2099-01-01' })];
    const res = computeResumenSolvencia(cuotas);
    expect(res.cuotasPendientes).toBe(1);
    expect(res.saldoPendienteCentavos).toBe(40000);
    expect(res.tieneCuotasVencidas).toBe(false);
  });
});

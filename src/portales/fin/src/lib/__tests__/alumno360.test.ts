import { describe, test, expect } from 'vitest';
import {
  computePctAsistencia,
  computeResumenSolvencia,
  ResumenAcademico,
  mapInstrumentoComodato,
  computeResumenInstrumentos,
  separarInstrumentosComodato,
  fetchInstrumentosComodato,
  InstrumentoComodatoRow,
  InstrumentoComodato,
} from '../alumno360';
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

function makeInstrumentoRow(overrides: Partial<InstrumentoComodatoRow> = {}): InstrumentoComodatoRow {
  return {
    comodato_id: 'com-1',
    tipo_comodato: 'escolar',
    fecha_entrega: '2026-03-01',
    fecha_vencimiento: '2026-12-15',
    comodato_estado: 'activo',
    contrato_firmado_url: null,
    activo_id: 'act-1',
    codigo_inventario: 'VIO-042',
    tipo_instrumento: 'Violín',
    marca: 'Yamaha',
    modelo: 'V5 4/4',
    numero_serie: 'YVN-8849201',
    estado_conservacion: 'excelente',
    estado_uso: 'prestado',
    ubicacion: 'Sede Central',
    en_reparacion: false,
    reparacion_estado: null,
    reparacion_descripcion: null,
    reparacion_fecha_ingreso: null,
    ...overrides,
  };
}

describe('mapInstrumentoComodato', () => {
  test('renombra snake_case del RPC a camelCase', () => {
    const m = mapInstrumentoComodato(makeInstrumentoRow());
    expect(m.comodatoId).toBe('com-1');
    expect(m.codigoInventario).toBe('VIO-042');
    expect(m.tipoInstrumento).toBe('Violín');
    expect(m.numeroSerie).toBe('YVN-8849201');
    expect(m.fechaVencimiento).toBe('2026-12-15');
    expect(m.enReparacion).toBe(false);
  });

  test('en_reparacion nulo/ausente -> false (nunca undefined)', () => {
    const m = mapInstrumentoComodato(makeInstrumentoRow({ en_reparacion: null as unknown as boolean }));
    expect(m.enReparacion).toBe(false);
  });

  test('instrumento en taller: propaga estado y descripción de la reparación', () => {
    const m = mapInstrumentoComodato(
      makeInstrumentoRow({
        en_reparacion: true,
        estado_uso: 'en_reparacion',
        reparacion_estado: 'en_reparacion',
        reparacion_descripcion: 'Ajuste de puente y cuerdas nuevas',
        reparacion_fecha_ingreso: '2026-08-20',
      }),
    );
    expect(m.enReparacion).toBe(true);
    expect(m.reparacionEstado).toBe('en_reparacion');
    expect(m.reparacionDescripcion).toBe('Ajuste de puente y cuerdas nuevas');
    expect(m.reparacionFechaIngreso).toBe('2026-08-20');
  });

  test('campos opcionales nulos quedan como null, no como string vacío', () => {
    const m = mapInstrumentoComodato(makeInstrumentoRow({ marca: null, modelo: null, numero_serie: null }));
    expect(m.marca).toBeNull();
    expect(m.modelo).toBeNull();
    expect(m.numeroSerie).toBeNull();
  });
});

function makeInstrumento(overrides: Partial<InstrumentoComodato> = {}): InstrumentoComodato {
  return { ...mapInstrumentoComodato(makeInstrumentoRow()), ...overrides };
}

describe('computeResumenInstrumentos', () => {
  test('sin instrumentos -> total 0, nada en taller, sin vencimiento', () => {
    const r = computeResumenInstrumentos([]);
    expect(r.total).toBe(0);
    expect(r.algunoEnReparacion).toBe(false);
    expect(r.proximoVencimiento).toBeNull();
  });

  test('cuenta todos los comodatos activos', () => {
    const r = computeResumenInstrumentos([
      makeInstrumento({ comodatoId: 'c1', fechaVencimiento: '2026-12-15' }),
      makeInstrumento({ comodatoId: 'c2', fechaVencimiento: '2026-10-01' }),
    ]);
    expect(r.total).toBe(2);
  });

  test('algunoEnReparacion true si al menos un instrumento está en taller', () => {
    const r = computeResumenInstrumentos([
      makeInstrumento({ comodatoId: 'c1', enReparacion: false }),
      makeInstrumento({ comodatoId: 'c2', enReparacion: true }),
    ]);
    expect(r.algunoEnReparacion).toBe(true);
  });

  test('proximoVencimiento = la fecha más temprana entre los comodatos', () => {
    const r = computeResumenInstrumentos([
      makeInstrumento({ comodatoId: 'c1', fechaVencimiento: '2026-12-15' }),
      makeInstrumento({ comodatoId: 'c2', fechaVencimiento: '2026-10-01' }),
      makeInstrumento({ comodatoId: 'c3', fechaVencimiento: null }),
    ]);
    expect(r.proximoVencimiento).toBe('2026-10-01');
  });

  test('todos sin fecha de vencimiento -> proximoVencimiento null', () => {
    const r = computeResumenInstrumentos([
      makeInstrumento({ comodatoId: 'c1', fechaVencimiento: null }),
      makeInstrumento({ comodatoId: 'c2', fechaVencimiento: null }),
    ]);
    expect(r.proximoVencimiento).toBeNull();
  });
});

describe('separarInstrumentosComodato', () => {
  test('separa comodatos activos de concluidos/devueltos', () => {
    const items = [
      makeInstrumento({ comodatoId: 'c1', comodatoEstado: 'activo', codigoInventario: 'ESPCVLA24JA' }),
      makeInstrumento({ comodatoId: 'c2', comodatoEstado: 'vigente', codigoInventario: 'INST-01' }),
      makeInstrumento({ comodatoId: 'c3', comodatoEstado: 'devuelto', codigoInventario: 'ESPCVLN29SG' }),
      makeInstrumento({ comodatoId: 'c4', comodatoEstado: 'finalizado', codigoInventario: 'INST-02' }),
    ];

    const { activos, historial } = separarInstrumentosComodato(items);
    expect(activos).toHaveLength(2);
    expect(activos.map(a => a.codigoInventario)).toEqual(['ESPCVLA24JA', 'INST-01']);
    expect(historial).toHaveLength(2);
    expect(historial.map(h => h.codigoInventario)).toEqual(['ESPCVLN29SG', 'INST-02']);
  });

  test('lista vacía devuelve arrays vacíos', () => {
    const { activos, historial } = separarInstrumentosComodato([]);
    expect(activos).toEqual([]);
    expect(historial).toEqual([]);
  });
});

describe('fetchInstrumentosComodato - Alexandra Vielma', () => {
  test('recupera instrumento activo (Viola ESPCVLA24JA) e historial (Violín ESPCVLN29SG) desde fallback local', async () => {
    const alexandraId = 'e50bb137-f582-4ee2-901a-97f089c0658f';
    const instrumentos = await fetchInstrumentosComodato(alexandraId);

    expect(instrumentos.length).toBeGreaterThanOrEqual(2);

    const { activos, historial } = separarInstrumentosComodato(instrumentos);

    // Instrumento activo
    expect(activos).toHaveLength(1);
    expect(activos[0].codigoInventario).toBe('ESPCVLA24JA');
    expect(activos[0].tipoInstrumento).toContain('Viola');
    expect(activos[0].numeroSerie).toBe('2202001116');
    expect(activos[0].comodatoEstado).toBe('activo');

    // Instrumento histórico
    expect(historial).toHaveLength(1);
    expect(historial[0].codigoInventario).toBe('ESPCVLN29SG');
    expect(historial[0].tipoInstrumento).toContain('Violín');
    expect(historial[0].comodatoEstado).toBe('devuelto');
  });
});


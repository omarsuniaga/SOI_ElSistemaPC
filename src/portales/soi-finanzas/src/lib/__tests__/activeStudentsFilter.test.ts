import { describe, test, expect } from 'vitest';
import { filtrarFamiliasCobro, resolverCuotasCobro } from '../activeStudentsFilter';
import { Alumno, Cuota, Familia } from '../../types';

function makeFamilia(id: string, apellidos: string): Familia {
  return {
    id,
    codigo_familia: `FAM-${id}`,
    apellidos,
    telefono_principal: '8095551234',
    email_principal: 'fam@test.com',
    saldo_pendiente_centavos: 60000,
    credito_favor_centavos: 0,
    alumnos_ids: [],
    created_at: '2026-01-01',
    consentimiento_whatsapp: true,
    opt_out_mensajeria: false,
    estado_cartera: 'al_dia',
    isp: {
      valor: 90,
      categoria: 'A',
      cobertura_datos: 1,
      confiabilidad: 'alta',
      desglose: [],
      requiere_aprobacion_humana: false,
      penalizaciones: 0,
      ventana_pago_sugerida: { inicio_dia: 1, fin_dia: 5, patron: 'fin_de_mes', confianza: 1 }
    }
  };
}

function makeAlumno(id: string, familia_id: string, nombre: string, activo: boolean): Alumno {
  return {
    id,
    familia_id,
    nombre_completo: nombre,
    instrumento_principal: 'Violín',
    nivel: 'Iniciación',
    fecha_ingreso: '2026-01-15',
    exento_mensualidad: false,
    activo
  };
}

function makeCuota(id: string, alumno_id: string, familia_id: string, saldo_centavos: number): Cuota {
  return {
    id,
    alumno_id,
    alumno_nombre: `Alumno ${alumno_id}`,
    representante_id: 'rep-1',
    familia_id,
    arancel_concepto: 'Mensualidad',
    periodo: '2026-09',
    ciclo_academico: '2026',
    monto_bruto_centavos: saldo_centavos,
    descuento_beca_centavos: 0,
    monto_neto_centavos: saldo_centavos,
    monto_pagado_centavos: 0,
    saldo_centavos,
    fecha_emision: '2026-09-01',
    fecha_vencimiento: '2026-09-05',
    estado: 'pendiente',
    es_prorrateada: false,
    version: 1
  };
}

describe('activeStudentsFilter', () => {
  const fam1 = makeFamilia('fam-1', 'Gómez'); // tiene alumno activo
  const fam2 = makeFamilia('fam-2', 'Pérez'); // tiene alumno inactivo
  const fam3 = makeFamilia('fam-3', 'Rodríguez'); // tiene 1 activo y 1 inactivo

  const alu1 = makeAlumno('alu-1', 'fam-1', 'Juan Gómez', true);
  const alu2 = makeAlumno('alu-2', 'fam-2', 'Pedro Pérez', false);
  const alu3Activo = makeAlumno('alu-3', 'fam-3', 'Ana Rodríguez', true);
  const alu3Inactivo = makeAlumno('alu-4', 'fam-3', 'Luis Rodríguez', false);

  const familias = [fam1, fam2, fam3];
  const alumnos = [alu1, alu2, alu3Activo, alu3Inactivo];

  test('filtrarFamiliasCobro con soloAlumnosActivos=true excluye familias sin alumnos activos', () => {
    const res = filtrarFamiliasCobro({
      familias,
      alumnos,
      searchTerm: '',
      soloAlumnosActivos: true
    });

    expect(res.map(f => f.id)).toEqual(['fam-1', 'fam-3']);
    expect(res.some(f => f.id === 'fam-2')).toBe(false);
  });

  test('filtrarFamiliasCobro con soloAlumnosActivos=false incluye familias con solo inactivos', () => {
    const res = filtrarFamiliasCobro({
      familias,
      alumnos,
      searchTerm: '',
      soloAlumnosActivos: false
    });

    expect(res.map(f => f.id)).toContain('fam-2');
  });

  test('búsqueda de alumno inactivo no devuelve la familia si soloAlumnosActivos=true', () => {
    const res = filtrarFamiliasCobro({
      familias,
      alumnos,
      searchTerm: 'Luis', // alumno inactivo de fam-3
      soloAlumnosActivos: true
    });

    // Luis es inactivo, por lo que la búsqueda no debe matchear por Luis
    expect(res.length).toBe(0);
  });

  test('resolverCuotasCobro separa cuotas activas de inactivas y preselecciona solo las activas', () => {
    const c1 = makeCuota('c-1', 'alu-3', 'fam-3', 60000); // Ana (activa)
    const c2 = makeCuota('c-2', 'alu-4', 'fam-3', 60000); // Luis (inactivo)

    const res = resolverCuotasCobro({
      cuotasFamilia: [c1, c2],
      alumnosFamilia: [alu3Activo, alu3Inactivo],
      soloAlumnosActivos: true
    });

    expect(res.cuotasActivas.map(c => c.id)).toEqual(['c-1']);
    expect(res.cuotasInactivas.map(c => c.id)).toEqual(['c-2']);
    expect(res.cuotasSeleccionadas.map(c => c.id)).toEqual(['c-1']);
    expect(res.totalCentavos).toBe(60000); // Solo la de Ana
  });
});

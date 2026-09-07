// Financial calculations and utilities for SOI Finanzas (FUNEYCA-PC)
import { Dinero, Moneda, ISPScore, ISPComponente } from '../types';

/**
 * Formats integer cents into a currency string (RD$ / USD)
 */
export function formatDOP(centavos: number | bigint | null | undefined): string {
  if (centavos === null || centavos === undefined) return 'RD$ 0.00';
  const val = Number(centavos) / 100;
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val).replace('DOP', 'RD$');
}

export function formatUSD(centavos: number | bigint | null | undefined): string {
  if (centavos === null || centavos === undefined) return '$0.00';
  const val = Number(centavos) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDinero(dinero: Dinero): string {
  return dinero.moneda === 'USD' ? formatUSD(dinero.centavos) : formatDOP(dinero.centavos);
}

/**
 * Parse input string e.g. "1250.50" to integer cents
 */
export function parseToCents(amountStr: string | number): number {
  if (typeof amountStr === 'number') {
    return Math.round(amountStr * 100);
  }
  const clean = amountStr.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * SDD G-03: Half-up rounding to the nearest cent
 */
export function redondearHalfUp(valor: number): number {
  return Math.floor(valor + 0.5);
}

/**
 * SDD §5.2: Motor ISP (Índice de Solvencia y Puntualidad) blindado con normalización por disponibilidad
 */
export function calcularISPBlindado(params: {
  cuotas_historicas: Array<{
    monto_neto_centavos: number;
    monto_pagado_centavos: number;
    dias_atraso: number;
    estado: string;
  }>;
  pagos_confirmados_dias_mes: number[]; // e.g. [5, 6, 5, 4, 15]
  gestiones_cobranza_realizadas: number;
  promesas_cumplidas: number;
  promesas_totales: number;
  meses_sin_mora: number;
  meses_evaluados: number;
  penalizaciones_adicionales?: {
    incumplimiento_convenio?: boolean;
    pago_revertido?: boolean;
    mora_critica_abierta?: boolean;
  };
}): ISPScore {
  const {
    cuotas_historicas,
    pagos_confirmados_dias_mes,
    gestiones_cobranza_realizadas,
    promesas_cumplidas,
    promesas_totales,
    meses_sin_mora,
    meses_evaluados,
    penalizaciones_adicionales = {}
  } = params;

  // G-08: Menos de 3 cuotas = SIN_HISTORIAL
  if (cuotas_historicas.length < 3) {
    return {
      valor: 70, // Media institucional de referencia
      categoria: 'SIN_HISTORIAL',
      cobertura_datos: cuotas_historicas.length / 3,
      confiabilidad: 'sin_historial',
      mensaje: `En observación (${cuotas_historicas.length} de 3 cuotas necesarias para categorización formal)`,
      penalizaciones: 0,
      desglose: [],
      ventana_pago_sugerida: {
        inicio_dia: 1,
        fin_dia: 10,
        patron: 'fin_de_mes',
        confianza: 0.5,
      },
      requiere_aprobacion_humana: true,
    };
  }

  const componentes: ISPComponente[] = [];

  // 1. Puntualidad (peso 40) - Siempre disponible
  let sumaAtrasoPonderado = 0;
  let totalNeto = 0;
  for (const c of cuotas_historicas) {
    const atraso = Math.max(0, c.dias_atraso);
    sumaAtrasoPonderado += atraso * c.monto_neto_centavos;
    totalNeto += c.monto_neto_centavos;
  }
  const atrasoPromedioDias = totalNeto > 0 ? (sumaAtrasoPonderado / totalNeto) : 0;
  const puntosPuntualidad = 40 * (1 - Math.min(atrasoPromedioDias / 30, 1));
  componentes.push({
    nombre: 'Puntualidad Ponderada',
    puntos: redondearHalfUp(puntosPuntualidad),
    peso: 40,
    disponible: true,
    dato_crudo: `${atrasoPromedioDias.toFixed(1)} días de atraso ponderado`,
    descripcion: 'Puntaje basado en el promedio ponderado de días de atraso por monto.',
  });

  // 2. Consistencia (peso 20) - Solo si >= 4 pagos
  if (pagos_confirmados_dias_mes.length >= 4) {
    const sorted = [...pagos_confirmados_dias_mes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const mediana = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const deviations = sorted.map(d => Math.abs(d - mediana)).sort((a, b) => a - b);
    const mad = deviations.length % 2 !== 0 ? deviations[mid] : (deviations[mid - 1] + deviations[mid]) / 2;
    
    let puntosConsistencia = 0;
    if (mad <= 3) puntosConsistencia = 20;
    else if (mad <= 7) puntosConsistencia = 15;
    else if (mad <= 14) puntosConsistencia = 8;
    else puntosConsistencia = 0;

    componentes.push({
      nombre: 'Consistencia de Fechas',
      puntos: puntosConsistencia,
      peso: 20,
      disponible: true,
      dato_crudo: `MAD: ${mad.toFixed(1)} días (mediana: día ${mediana})`,
      descripcion: 'Regularidad del día del mes en que la familia acostumbra pagar.',
    });
  }

  // 3. Esfuerzo de cobranza (peso 20) - Solo si tuvo cuotas vencidas
  const cuotasQueLlegaronAVencer = cuotas_historicas.filter(c => c.dias_atraso > 0).length;
  if (cuotasQueLlegaronAVencer >= 2) {
    const ratioGestiones = gestiones_cobranza_realizadas / cuotasQueLlegaronAVencer;
    const puntosEsfuerzo = Math.max(0, 20 - 4 * ratioGestiones);
    componentes.push({
      nombre: 'Esfuerzo de Cobranza',
      puntos: redondearHalfUp(puntosEsfuerzo),
      peso: 20,
      disponible: true,
      dato_crudo: `${gestiones_cobranza_realizadas} gestiones en ${cuotasQueLlegaronAVencer} cuotas vencidas`,
      descripcion: 'Nivel de recordatorios necesarios para obtener el pago.',
    });
  }

  // 4. Compromisos (peso 10) - Solo si hay promesas
  if (promesas_totales > 0) {
    const ratioCumplidas = promesas_cumplidas / promesas_totales;
    const puntosCompromisos = 10 * ratioCumplidas;
    componentes.push({
      nombre: 'Cumplimiento de Promesas',
      puntos: redondearHalfUp(puntosCompromisos),
      peso: 10,
      disponible: true,
      dato_crudo: `${promesas_cumplidas} de ${promesas_totales} acuerdos honrados`,
      descripcion: 'Efectividad en el cumplimiento de fechas acordadas.',
    });
  }

  // 5. Trayectoria (peso 10) - Solo si >= 6 meses
  if (meses_evaluados >= 6) {
    const ratioMesesLimpios = meses_sin_mora / meses_evaluados;
    const puntosTrayectoria = 10 * ratioMesesLimpios;
    componentes.push({
      nombre: 'Trayectoria Temporal',
      puntos: redondearHalfUp(puntosTrayectoria),
      peso: 10,
      disponible: true,
      dato_crudo: `${meses_sin_mora} de ${meses_evaluados} meses sin mora`,
      descripcion: 'Comportamiento a mediano y largo plazo en la institución.',
    });
  }

  // Normalización SDD G-07
  const pesoDisponible = componentes.reduce((acc, c) => acc + c.peso, 0);
  const puntosObtenidos = componentes.reduce((acc, c) => acc + c.puntos, 0);
  const puntajeBruto = (puntosObtenidos / pesoDisponible) * 100;
  const cobertura = pesoDisponible / 100;

  // Penalizaciones
  let totalPenalizaciones = 0;
  if (penalizaciones_adicionales.incumplimiento_convenio) totalPenalizaciones += 15;
  if (penalizaciones_adicionales.pago_revertido) totalPenalizaciones += 5;
  if (penalizaciones_adicionales.mora_critica_abierta) totalPenalizaciones += 10;

  const valorFinal = Math.max(0, Math.min(100, Math.round(puntajeBruto - totalPenalizaciones)));

  let categoria: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  if (valorFinal >= 90) categoria = 'A';
  else if (valorFinal >= 75) categoria = 'B';
  else if (valorFinal >= 55) categoria = 'C';
  else if (valorFinal >= 35) categoria = 'D';
  else categoria = 'E';

  let confiabilidad: 'alta' | 'media' | 'baja' = 'alta';
  if (cobertura < 0.60) confiabilidad = 'baja';
  else if (cobertura < 0.80) confiabilidad = 'media';

  // Ventana de pago sugerida
  let inicio_dia = 1;
  let fin_dia = 10;
  let patron: 'quincenal' | 'fin_de_mes' | 'irregular' = 'fin_de_mes';
  if (pagos_confirmados_dias_mes.length > 0) {
    const quincena1 = pagos_confirmados_dias_mes.filter(d => d >= 1 && d <= 7).length;
    const quincena2 = pagos_confirmados_dias_mes.filter(d => d >= 15 && d <= 22).length;
    const finMes = pagos_confirmados_dias_mes.filter(d => d >= 25).length;
    if (quincena1 >= 2 && quincena2 >= 2) {
      patron = 'quincenal';
      inicio_dia = 15;
      fin_dia = 20;
    } else if (finMes >= 2) {
      patron = 'fin_de_mes';
      inicio_dia = 25;
      fin_dia = 30;
    } else {
      patron = 'irregular';
      inicio_dia = 1;
      fin_dia = 10;
    }
  }

  return {
    valor: valorFinal,
    categoria,
    cobertura_datos: cobertura,
    confiabilidad,
    penalizaciones: totalPenalizaciones,
    desglose: componentes,
    ventana_pago_sugerida: {
      inicio_dia,
      fin_dia,
      patron,
      confianza: cobertura,
    },
    requiere_aprobacion_humana: categoria === 'D' || categoria === 'E' || confiabilidad === 'baja',
  };
}

import { describe, test, expect } from 'vitest';
import { computeEstadoGastoFijo, computeVentanaBarra } from '../gastosFijos';

const ventana = { diaInicio: 10, diaFin: 15 };

describe('computeEstadoGastoFijo', () => {
  test('pagado siempre gana, sin importar el día', () => {
    const res = computeEstadoGastoFijo(ventana, 1, true, '3 ene');
    expect(res.tone).toBe('ok');
    expect(res.sub).toBe('el 3 ene');
  });

  test('pagado sin fecha usa un mensaje genérico', () => {
    const res = computeEstadoGastoFijo(ventana, 1, true);
    expect(res.sub).toBe('este período');
  });

  test('antes de la ventana -> idle (próximo)', () => {
    const res = computeEstadoGastoFijo(ventana, 5, false);
    expect(res.tone).toBe('idle');
    expect(res.sub).toBe('inicia en 5 días');
  });

  test('el primer día de la ventana ya cuenta como dentro (warn)', () => {
    const res = computeEstadoGastoFijo(ventana, 10, false);
    expect(res.tone).toBe('warn');
  });

  test('dentro de la ventana -> warn con días restantes', () => {
    const res = computeEstadoGastoFijo(ventana, 12, false);
    expect(res.tone).toBe('warn');
    expect(res.label).toBe('Vence en 3 días');
  });

  test('el último día de la ventana -> "Último día"', () => {
    const res = computeEstadoGastoFijo(ventana, 15, false);
    expect(res.tone).toBe('warn');
    expect(res.label).toBe('Último día');
  });

  test('después de la ventana sin pagar -> crit (vencido)', () => {
    const res = computeEstadoGastoFijo(ventana, 17, false);
    expect(res.tone).toBe('crit');
    expect(res.sub).toBe('ventana cerró hace 2 días');
  });

  test('singular correcto: "1 día" no "1 días"', () => {
    expect(computeEstadoGastoFijo(ventana, 16, false).sub).toBe('ventana cerró hace 1 día');
    expect(computeEstadoGastoFijo(ventana, 9, false).sub).toBe('inicia en 1 día');
  });
});

describe('computeVentanaBarra', () => {
  test('calcula left/width sobre base de 31 días', () => {
    const bar = computeVentanaBarra({ diaInicio: 1, diaFin: 5 });
    expect(bar.leftPct).toBeCloseTo(0, 5);
    expect(bar.widthPct).toBeCloseTo((5 / 31) * 100, 5);
  });

  test('una ventana de un solo día tiene el ancho mínimo de 1/31', () => {
    const bar = computeVentanaBarra({ diaInicio: 20, diaFin: 20 });
    expect(bar.widthPct).toBeCloseTo((1 / 31) * 100, 5);
  });
});

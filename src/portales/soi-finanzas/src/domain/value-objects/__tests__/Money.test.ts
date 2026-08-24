import { describe, test, expect } from 'vitest';
import { Money } from '../Money';

describe('Money', () => {
  test('se construye desde centavos enteros', () => {
    expect(Money.fromCents(125000).cents).toBe(125000);
  });

  test('redondea a centavo entero si recibe un valor fraccionario', () => {
    expect(Money.fromCents(1250.4).cents).toBe(1250);
    expect(Money.fromCents(1250.6).cents).toBe(1251);
  });

  test('fromMajorUnits convierte pesos a centavos correctamente', () => {
    expect(Money.fromMajorUnits(1250).cents).toBe(125000);
    expect(Money.fromMajorUnits(12.5).cents).toBe(1250);
  });

  test('zero() es RD$0.00', () => {
    expect(Money.zero().cents).toBe(0);
    expect(Money.zero().isZero()).toBe(true);
  });

  test('add y subtract operan en centavos', () => {
    const a = Money.fromCents(10000);
    const b = Money.fromCents(2500);
    expect(a.add(b).cents).toBe(12500);
    expect(a.subtract(b).cents).toBe(7500);
  });

  test('subtract puede producir centavos negativos (el llamador decide si eso es válido)', () => {
    const a = Money.fromCents(1000);
    const b = Money.fromCents(2500);
    expect(a.subtract(b).cents).toBe(-1500);
  });

  test('multiply redondea al centavo más cercano', () => {
    const a = Money.fromCents(10000);
    expect(a.multiply(0.5).cents).toBe(5000);
    expect(a.multiply(1 / 3).cents).toBe(3333);
  });

  test('no permite operar montos en monedas distintas', () => {
    const dop = Money.fromCents(1000, 'DOP');
    const usd = Money.fromCents(1000, 'USD');
    expect(() => dop.add(usd)).toThrow(/Currency mismatch/);
    expect(() => dop.isGreaterThan(usd)).toThrow(/Currency mismatch/);
  });

  test('isGreaterThan / isLessThan / equals', () => {
    const a = Money.fromCents(5000);
    const b = Money.fromCents(3000);
    expect(a.isGreaterThan(b)).toBe(true);
    expect(b.isLessThan(a)).toBe(true);
    expect(Money.fromCents(5000).equals(a)).toBe(true);
  });

  test('toFormattedString usa formato DOP con dos decimales', () => {
    expect(Money.fromCents(125000).toFormattedString()).toBe('RD$ 1,250.00');
  });
});

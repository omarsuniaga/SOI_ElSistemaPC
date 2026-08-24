import { describe, test, expect } from 'vitest';
import { FifoAllocationEngine } from '../FifoAllocationEngine';
import { Fee, FeeProps } from '../../entities/Fee';
import { Money } from '../../value-objects/Money';

function makeFee(overrides: Partial<FeeProps> & { id: string; fechaVencimiento: string }): Fee {
  return new Fee({
    familiaId: 'fam-1',
    alumnoId: 'alu-1',
    alumnoNombre: 'Alumno Test',
    concepto: 'Mensualidad',
    montoBase: Money.fromCents(125000),
    descuento: Money.zero(),
    montoNeto: Money.fromCents(125000),
    montoPagado: Money.zero(),
    fechaGeneracion: '2026-08-01',
    estado: 'pendiente',
    cicloMes: 8,
    cicloAnio: 2026,
    ...overrides,
  });
}

describe('FifoAllocationEngine.allocate', () => {
  test('aplica el pago a la cuota más antigua primero (FIFO)', () => {
    const feeJune = makeFee({ id: 'cuo-jun', fechaVencimiento: '2026-06-10' });
    const feeJuly = makeFee({ id: 'cuo-jul', fechaVencimiento: '2026-07-10' });

    const result = FifoAllocationEngine.allocate({
      pagoId: 'pag-1',
      familyFees: [feeJuly, feeJune], // orden de entrada invertido a propósito
      paymentAmount: Money.fromCents(125000),
    });

    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0].cuotaId).toBe('cuo-jun');
    expect(result.creditGenerated.isZero()).toBe(true);
  });

  test('un pago parcial dentro del monto de una cuota no genera crédito de wallet', () => {
    const fee = makeFee({ id: 'cuo-1', fechaVencimiento: '2026-08-10' });

    const result = FifoAllocationEngine.allocate({
      pagoId: 'pag-1',
      familyFees: [fee],
      paymentAmount: Money.fromCents(50000),
    });

    expect(result.totalApplied.cents).toBe(50000);
    expect(result.creditGenerated.isZero()).toBe(true);
    expect(fee.estado).toBe('parcial');
    expect(fee.saldo.cents).toBe(75000);
  });

  test('el sobrante tras cubrir todas las cuotas pendientes se acredita como crédito de wallet', () => {
    const fee = makeFee({ id: 'cuo-1', fechaVencimiento: '2026-08-10' });

    const result = FifoAllocationEngine.allocate({
      pagoId: 'pag-1',
      familyFees: [fee],
      paymentAmount: Money.fromCents(150000), // RD$1,500 contra una cuota de RD$1,250
    });

    expect(result.totalApplied.cents).toBe(125000);
    expect(result.creditGenerated.cents).toBe(25000);
    expect(fee.isFullyPaid()).toBe(true);
  });

  test('nunca asigna a cuotas exoneradas o becadas', () => {
    const exonerada = makeFee({ id: 'cuo-exo', fechaVencimiento: '2026-05-10', estado: 'exonerada' });
    const becada = makeFee({ id: 'cuo-bec', fechaVencimiento: '2026-06-10', estado: 'becada' });
    const pendiente = makeFee({ id: 'cuo-pen', fechaVencimiento: '2026-07-10' });

    const result = FifoAllocationEngine.allocate({
      pagoId: 'pag-1',
      familyFees: [exonerada, becada, pendiente],
      paymentAmount: Money.fromCents(125000),
    });

    expect(result.affectedFeeIds).toEqual(['cuo-pen']);
  });

  test('respeta cuotasEspecificasIds cuando se pasan explícitamente', () => {
    const feeJune = makeFee({ id: 'cuo-jun', fechaVencimiento: '2026-06-10' });
    const feeJuly = makeFee({ id: 'cuo-jul', fechaVencimiento: '2026-07-10' });

    const result = FifoAllocationEngine.allocate({
      pagoId: 'pag-1',
      familyFees: [feeJune, feeJuly],
      paymentAmount: Money.fromCents(125000),
      specificFeeIds: ['cuo-jul'], // se pide pagar julio aunque junio sea más antiguo
    });

    expect(result.affectedFeeIds).toEqual(['cuo-jul']);
    expect(feeJune.saldo.cents).toBe(125000); // junio queda intacto
  });

  test('un pago no cubre todas las cuotas: el resto queda pendiente sin generar crédito', () => {
    const feeJune = makeFee({ id: 'cuo-jun', fechaVencimiento: '2026-06-10' });
    const feeJuly = makeFee({ id: 'cuo-jul', fechaVencimiento: '2026-07-10' });

    const result = FifoAllocationEngine.allocate({
      pagoId: 'pag-1',
      familyFees: [feeJune, feeJuly],
      paymentAmount: Money.fromCents(125000), // solo alcanza para una cuota
    });

    expect(result.affectedFeeIds).toEqual(['cuo-jun']);
    expect(feeJuly.estado).toBe('pendiente');
    expect(result.creditGenerated.isZero()).toBe(true);
  });

  test('rechaza montos de pago negativos', () => {
    const fee = makeFee({ id: 'cuo-1', fechaVencimiento: '2026-08-10' });
    expect(() =>
      FifoAllocationEngine.allocate({
        pagoId: 'pag-1',
        familyFees: [fee],
        paymentAmount: Money.fromCents(-100),
      })
    ).toThrow(/no puede ser negativo|cannot be negative/i);
  });
});

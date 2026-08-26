import { describe, test, expect, vi } from 'vitest';
import { RegisterPaymentUseCase } from '../RegisterPaymentUseCase';
import { IPaymentTransactionPort, PaymentTransactionResult } from '../../../ports/IPaymentTransactionPort';
import { IFamilyRepository, IFeeRepository, IPaymentRepository } from '../../../ports/IReceivablesRepositories';
import { Family } from '../../../../domain/entities/Family';
import { Fee } from '../../../../domain/entities/Fee';
import { Money } from '../../../../domain/value-objects/Money';

function makeFamily(): Family {
  return new Family({
    id: 'fam-1',
    apellidos: 'Familia Test',
    representanteId: 'rep-1',
    representanteNombre: 'Representante Test',
    saldoPendiente: Money.fromCents(125000),
    creditoFavor: Money.zero(),
    estadoCartera: 'mora_temprana',
  });
}

function makeFee(): Fee {
  return new Fee({
    id: 'cuo-1',
    familiaId: 'fam-1',
    alumnoId: 'alu-1',
    alumnoNombre: 'Alumno Test',
    concepto: 'Mensualidad',
    montoBase: Money.fromCents(125000),
    descuento: Money.zero(),
    montoNeto: Money.fromCents(125000),
    montoPagado: Money.zero(),
    fechaGeneracion: '2026-08-01',
    fechaVencimiento: '2026-08-10',
    estado: 'pendiente',
    cicloMes: 8,
    cicloAnio: 2026,
  });
}

function makeRepos(family: Family, fees: Fee[]) {
  const familyRepository: IFamilyRepository = {
    findById: vi.fn(async (id: string) => (id === family.id ? family : null)),
    findAll: vi.fn(async () => [family]),
    save: vi.fn(async () => {}),
  };
  const feeRepository: IFeeRepository = {
    findById: vi.fn(async (id: string) => fees.find(f => f.id === id) || null),
    findByFamilyId: vi.fn(async () => fees),
    findAll: vi.fn(async () => fees),
    saveMany: vi.fn(async () => {}),
  };
  const paymentRepository: IPaymentRepository = {
    findById: vi.fn(async () => null),
    findByFamilyId: vi.fn(async () => []),
    findAll: vi.fn(async () => []),
    getNextReceiptNumber: vi.fn(async () => 'REC-000001'),
  };
  return { familyRepository, feeRepository, paymentRepository };
}

const baseCommand = {
  familiaId: 'fam-1',
  montoTotalCentavos: 125000,
  metodoPago: 'efectivo' as const,
  fechaPago: '2026-08-15',
  cajeroId: 'cajero-1',
  cajeroNombre: 'Cajero Test',
  periodoActivo: '2026-08',
};

describe('RegisterPaymentUseCase', () => {
  test('rechaza montos en cero o negativos antes de tocar cualquier repositorio', async () => {
    const family = makeFamily();
    const fees = [makeFee()];
    const repos = makeRepos(family, fees);
    const port: IPaymentTransactionPort = {
      executePaymentTransaction: vi.fn(),
    };
    const useCase = new RegisterPaymentUseCase(port, repos.familyRepository, repos.feeRepository, repos.paymentRepository);

    const result = await useCase.execute({ ...baseCommand, montoTotalCentavos: 0 });

    expect(result.success).toBe(false);
    expect(repos.familyRepository.findById).not.toHaveBeenCalled();
    expect(port.executePaymentTransaction).not.toHaveBeenCalled();
  });

  test('falla si la familia no existe, sin invocar el puerto de transacción', async () => {
    const family = makeFamily();
    const fees = [makeFee()];
    const repos = makeRepos(family, fees);
    const port: IPaymentTransactionPort = {
      executePaymentTransaction: vi.fn(),
    };
    const useCase = new RegisterPaymentUseCase(port, repos.familyRepository, repos.feeRepository, repos.paymentRepository);

    const result = await useCase.execute({ ...baseCommand, familiaId: 'fam-inexistente' });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no encontrada/);
    expect(port.executePaymentTransaction).not.toHaveBeenCalled();
  });

  test('falla cerrada: si el RPC transaccional falla, no reporta éxito ni expone un pago confirmado', async () => {
    const family = makeFamily();
    const fees = [makeFee()];
    const repos = makeRepos(family, fees);
    const port: IPaymentTransactionPort = {
      executePaymentTransaction: vi.fn(
        async (): Promise<PaymentTransactionResult> => ({
          success: false,
          error: 'Supabase RPC fn_registrar_pago_transaccional no respondió',
        })
      ),
    };
    const useCase = new RegisterPaymentUseCase(port, repos.familyRepository, repos.feeRepository, repos.paymentRepository);

    const result = await useCase.execute(baseCommand);

    expect(result.success).toBe(false);
    expect(result.confirmedPaymentId).toBeUndefined();
    expect(result.error).toMatch(/fn_registrar_pago_transaccional/);
  });

  test('camino feliz: paga la cuota completa vía el puerto transaccional y expone los IDs confirmados por el servidor', async () => {
    const family = makeFamily();
    const fees = [makeFee()];
    const repos = makeRepos(family, fees);
    const port: IPaymentTransactionPort = {
      executePaymentTransaction: vi.fn(
        async (): Promise<PaymentTransactionResult> => ({
          success: true,
          paymentId: 'srv-pag-1',
          receiptNumber: 'REC-000001',
        })
      ),
    };
    const useCase = new RegisterPaymentUseCase(port, repos.familyRepository, repos.feeRepository, repos.paymentRepository);

    const result = await useCase.execute(baseCommand);

    expect(result.success).toBe(true);
    expect(result.confirmedPaymentId).toBe('srv-pag-1');
    expect(result.payment?.aplicaciones).toHaveLength(1);
    expect(fees[0].isFullyPaid()).toBe(true);
  });
});

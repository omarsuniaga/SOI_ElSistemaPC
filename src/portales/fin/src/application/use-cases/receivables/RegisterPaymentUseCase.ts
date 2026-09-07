import { Money } from '../../../domain/value-objects/Money';
import { Payment, PaymentMethod } from '../../../domain/entities/Payment';
import { Family } from '../../../domain/entities/Family';
import { Fee } from '../../../domain/entities/Fee';
import { FifoAllocationEngine } from '../../../domain/rules/FifoAllocationEngine';
import { IPaymentTransactionPort } from '../../ports/IPaymentTransactionPort';
import { IFamilyRepository, IFeeRepository, IPaymentRepository } from '../../ports/IReceivablesRepositories';

export interface RegisterPaymentCommand {
  familiaId: string;
  montoTotalCentavos: number;
  metodoPago: PaymentMethod;
  fechaPago: string;
  referenciaBancaria?: string;
  observaciones?: string;
  cuotasEspecificasIds?: string[];
  cajeroId: string;
  cajeroNombre: string;
  periodoActivo: string;
  nextReceiptSeq?: number;
}

export interface RegisterPaymentResponse {
  success: boolean;
  payment?: Payment;
  updatedFees?: Fee[];
  updatedFamily?: Family;
  error?: string;
  isOfflineDegraded?: boolean;
  /** DB-assigned id/receipt from the transactional RPC — the authoritative identifiers, not the client-generated preview ones on `payment`. */
  confirmedPaymentId?: string;
  confirmedReceiptNumber?: string;
}

export class RegisterPaymentUseCase {
  constructor(
    private readonly paymentTransactionPort: IPaymentTransactionPort,
    private readonly familyRepository: IFamilyRepository,
    private readonly feeRepository: IFeeRepository,
    private readonly paymentRepository: IPaymentRepository
  ) {}

  public async execute(command: RegisterPaymentCommand): Promise<RegisterPaymentResponse> {
    const {
      familiaId,
      montoTotalCentavos,
      metodoPago,
      fechaPago,
      referenciaBancaria,
      observaciones,
      cuotasEspecificasIds,
      cajeroId,
      cajeroNombre,
      periodoActivo
    } = command;

    if (montoTotalCentavos <= 0) {
      return { success: false, error: 'El monto del pago debe ser mayor a cero centavos.' };
    }

    const family = await this.familyRepository.findById(familiaId);
    if (!family) {
      return { success: false, error: `Familia con ID "${familiaId}" no encontrada.` };
    }

    const familyFees = await this.feeRepository.findByFamilyId(familiaId);
    const paymentAmount = Money.fromCents(montoTotalCentavos);

    const paymentId = `pag-${Date.now()}`;
    const nextReceipt = await this.paymentRepository.getNextReceiptNumber();

    // Pure domain FIFO allocation
    const allocationResult = FifoAllocationEngine.allocate({
      pagoId: paymentId,
      familyFees,
      paymentAmount,
      specificFeeIds: cuotasEspecificasIds
    });

    const payment = new Payment({
      id: paymentId,
      numeroRecibo: nextReceipt,
      familiaId,
      familiaNombre: family.apellidos,
      representanteId: family.representanteId,
      representanteNombre: family.representanteNombre || 'Representante Legal',
      montoTotal: paymentAmount,
      creditoGenerado: allocationResult.creditGenerated,
      fechaPago,
      fechaRegistro: new Date().toISOString(),
      metodoPago,
      referenciaBancaria,
      estado: 'confirmado',
      registradoPor: cajeroId,
      registradoPorNombre: cajeroNombre,
      aplicaciones: allocationResult.allocations,
      observaciones
    });

    // Calculate new family balance and wallet credit
    const remainingPendingFees = allocationResult.updatedFees.filter(f => !f.isFullyPaid());
    const newFamilyBalance = remainingPendingFees.reduce((acc, f) => acc.add(f.saldo), Money.zero());
    const newWalletCredit = family.creditoFavor.add(allocationResult.creditGenerated);

    family.updateBalance(newFamilyBalance, newWalletCredit);

    // Commit atomically via Transactional Port
    const txResult = await this.paymentTransactionPort.executePaymentTransaction({
      payment,
      updatedFees: allocationResult.updatedFees,
      family,
      newFamilyBalance,
      newFamilyWalletCredit: newWalletCredit,
      accountingJournalEntry: {
        plantillaId: allocationResult.creditGenerated.isPositive() ? 'AS-04' : 'AS-03',
        numero: Math.floor(Date.now() / 1000),
        fecha: fechaPago,
        periodo: periodoActivo,
        descripcion: `Cobro de cuotas familia ${family.apellidos} - Recibo ${nextReceipt}`,
        totalCents: montoTotalCentavos
      }
    });

    if (!txResult.success) {
      return {
        success: false,
        error: txResult.error || 'Error al persistir la transacción atómica de pago.',
        isOfflineDegraded: txResult.isOfflineDegraded
      };
    }

    return {
      success: true,
      payment,
      updatedFees: allocationResult.updatedFees,
      updatedFamily: family,
      confirmedPaymentId: txResult.paymentId,
      confirmedReceiptNumber: txResult.receiptNumber
    };
  }
}

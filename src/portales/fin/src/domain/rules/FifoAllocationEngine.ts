import { Money } from '../value-objects/Money';
import { Fee } from '../entities/Fee';
import { PaymentAllocation } from '../entities/PaymentAllocation';

export interface FifoAllocationResult {
  allocations: PaymentAllocation[];
  updatedFees: Fee[];
  totalApplied: Money;
  creditGenerated: Money; // Wallet overpayment
  affectedFeeIds: string[];
}

export class FifoAllocationEngine {
  /**
   * Allocates payment amount to family fees strictly in FIFO order (oldest due date first),
   * unless specific cuota IDs are explicitly requested.
   */
  public static allocate(params: {
    pagoId: string;
    familyFees: Fee[];
    paymentAmount: Money;
    specificFeeIds?: string[];
  }): FifoAllocationResult {
    const { pagoId, familyFees, paymentAmount, specificFeeIds } = params;

    if (paymentAmount.isLessThan(Money.zero())) {
      throw new Error('Payment amount cannot be negative');
    }

    // Filter fees that have a pending balance
    let candidateFees = familyFees.filter(f => !f.isFullyPaid() && f.estado !== 'exonerada' && f.estado !== 'becada');

    if (specificFeeIds && specificFeeIds.length > 0) {
      const specificSet = new Set(specificFeeIds);
      candidateFees = candidateFees.filter(f => specificSet.has(f.id));
    }

    // Sort by due date ascending (FIFO: oldest first)
    candidateFees.sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

    let remainingMoney = paymentAmount;
    const allocations: PaymentAllocation[] = [];
    const affectedFeeIds: string[] = [];

    for (const fee of candidateFees) {
      if (remainingMoney.isZero()) break;

      const saldoAnterior = fee.saldo;
      const { allocated, remainingFeeBalance } = fee.applyPayment(remainingMoney);

      if (allocated.isPositive()) {
        const allocation = new PaymentAllocation({
          id: `alc-${pagoId}-${fee.id}`,
          pagoId,
          cuotaId: fee.id,
          alumnoId: fee.alumnoId,
          alumnoNombre: fee.alumnoNombre,
          concepto: fee.concepto,
          periodo: fee.periodo,
          montoAplicado: allocated,
          saldoAnteriorCuota: saldoAnterior,
          saldoRestanteCuota: remainingFeeBalance
        });

        allocations.push(allocation);
        affectedFeeIds.push(fee.id);
        remainingMoney = remainingMoney.subtract(allocated);
      }
    }

    const totalApplied = paymentAmount.subtract(remainingMoney);
    const creditGenerated = remainingMoney; // Any leftover goes to family wallet

    return {
      allocations,
      updatedFees: familyFees,
      totalApplied,
      creditGenerated,
      affectedFeeIds
    };
  }
}

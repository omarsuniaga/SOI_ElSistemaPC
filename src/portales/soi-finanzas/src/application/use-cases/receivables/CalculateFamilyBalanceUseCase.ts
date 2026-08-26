import { Money } from '../../../domain/value-objects/Money';
import { Fee } from '../../../domain/entities/Fee';
import { IFeeRepository } from '../../ports/IReceivablesRepositories';

export interface FamilyBalanceSummary {
  familiaId: string;
  saldoTotal: Money;
  cuotasVencidasCount: number;
  saldoVencido: Money;
  cuotasPendientesCount: number;
  diasMaximosAtraso: number;
}

export class CalculateFamilyBalanceUseCase {
  constructor(private readonly feeRepository: IFeeRepository) {}

  public async execute(familiaId: string, referenceDate: string = new Date().toISOString().split('T')[0]): Promise<FamilyBalanceSummary> {
    const fees = await this.feeRepository.findByFamilyId(familiaId);
    const refTime = new Date(referenceDate).getTime();

    let saldoTotal = Money.zero();
    let saldoVencido = Money.zero();
    let cuotasVencidasCount = 0;
    let cuotasPendientesCount = 0;
    let diasMaximosAtraso = 0;

    for (const fee of fees) {
      if (!fee.isFullyPaid() && fee.estado !== 'exonerada' && fee.estado !== 'becada') {
        cuotasPendientesCount++;
        saldoTotal = saldoTotal.add(fee.saldo);

        const dueTime = new Date(fee.fechaVencimiento).getTime();
        if (dueTime < refTime) {
          cuotasVencidasCount++;
          saldoVencido = saldoVencido.add(fee.saldo);
          const diffDays = Math.floor((refTime - dueTime) / (1000 * 60 * 60 * 24));
          if (diffDays > diasMaximosAtraso) {
            diasMaximosAtraso = diffDays;
          }
        }
      }
    }

    return {
      familiaId,
      saldoTotal,
      cuotasVencidasCount,
      saldoVencido,
      cuotasPendientesCount,
      diasMaximosAtraso
    };
  }
}

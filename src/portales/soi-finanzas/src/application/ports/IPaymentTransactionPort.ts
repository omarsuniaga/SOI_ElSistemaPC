import { Payment } from '../../domain/entities/Payment';
import { Fee } from '../../domain/entities/Fee';
import { Family } from '../../domain/entities/Family';
import { Money } from '../../domain/value-objects/Money';

export interface PaymentTransactionPayload {
  payment: Payment;
  updatedFees: Fee[];
  family: Family;
  newFamilyBalance: Money;
  newFamilyWalletCredit: Money;
  accountingJournalEntry?: {
    plantillaId: string;
    numero: number;
    fecha: string;
    periodo: string;
    descripcion: string;
    totalCents: number;
  };
}

export interface PaymentTransactionResult {
  success: boolean;
  paymentId?: string;
  receiptNumber?: string;
  error?: string;
  isOfflineDegraded?: boolean;
}

export interface IPaymentTransactionPort {
  /**
   * Commits payment, fee adjustments, family balance updates, and accounting record atomically.
   * If any step fails, the entire transaction is rolled back or aborted.
   */
  executePaymentTransaction(payload: PaymentTransactionPayload): Promise<PaymentTransactionResult>;
}

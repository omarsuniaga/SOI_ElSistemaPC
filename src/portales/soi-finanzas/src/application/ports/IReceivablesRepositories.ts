import { Family } from '../../domain/entities/Family';
import { Fee } from '../../domain/entities/Fee';
import { Payment } from '../../domain/entities/Payment';

export interface IFamilyRepository {
  findById(id: string): Promise<Family | null>;
  findAll(): Promise<Family[]>;
  save(family: Family): Promise<void>;
}

export interface IFeeRepository {
  findById(id: string): Promise<Fee | null>;
  findByFamilyId(familyId: string): Promise<Fee[]>;
  findAll(): Promise<Fee[]>;
  saveMany(fees: Fee[]): Promise<void>;
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByFamilyId(familyId: string): Promise<Payment[]>;
  findAll(): Promise<Payment[]>;
  getNextReceiptNumber(): Promise<string>;
}

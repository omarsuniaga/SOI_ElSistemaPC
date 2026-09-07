import { IFamilyRepository, IFeeRepository, IPaymentRepository } from '../../application/ports/IReceivablesRepositories';
import { Family } from '../../domain/entities/Family';
import { Fee } from '../../domain/entities/Fee';
import { Payment } from '../../domain/entities/Payment';
import { Money } from '../../domain/value-objects/Money';
import { Cuota, Familia, Pago } from '../../types';

export class StateBridgeFamilyRepository implements IFamilyRepository {
  constructor(private readonly getFamiliasState: () => Familia[]) {}

  public async findById(id: string): Promise<Family | null> {
    const raw = this.getFamiliasState().find(f => f.id === id);
    if (!raw) return null;
    return this.mapFamiliaToDomain(raw);
  }

  public async findAll(): Promise<Family[]> {
    return this.getFamiliasState().map(f => this.mapFamiliaToDomain(f));
  }

  public async save(family: Family): Promise<void> {
    // In-memory update bridge
  }

  public mapFamiliaToDomain(f: Familia): Family {
    return new Family({
      id: f.id,
      apellidos: f.apellidos,
      representanteId: f.representante_id,
      representanteNombre: f.representante_principal?.nombre_completo,
      representanteCedula: f.representante_principal?.cedula,
      representanteTelefono: f.representante_principal?.telefono || f.telefono_principal,
      representanteCorreo: f.representante_principal?.email || f.email_principal,
      saldoPendiente: Money.fromCents(f.saldo_pendiente_centavos),
      creditoFavor: Money.fromCents(f.credito_favor_centavos),
      alumnosIds: f.alumnos_ids,
      estadoCartera: f.estado_cartera,
      ispValor: f.isp?.valor,
      ispCategoria: f.isp?.categoria,
      activa: true,
      createdAt: f.created_at
    });
  }
}

export class StateBridgeFeeRepository implements IFeeRepository {
  constructor(private readonly getCuotasState: () => Cuota[]) {}

  public async findById(id: string): Promise<Fee | null> {
    const raw = this.getCuotasState().find(c => c.id === id);
    if (!raw) return null;
    return this.mapCuotaToDomain(raw);
  }

  public async findByFamilyId(familyId: string): Promise<Fee[]> {
    return this.getCuotasState()
      .filter(c => c.familia_id === familyId)
      .map(c => this.mapCuotaToDomain(c));
  }

  public async findAll(): Promise<Fee[]> {
    return this.getCuotasState().map(c => this.mapCuotaToDomain(c));
  }

  public async saveMany(fees: Fee[]): Promise<void> {
    // Handled via transaction
  }

  public mapCuotaToDomain(c: Cuota): Fee {
    return new Fee({
      id: c.id,
      familiaId: c.familia_id,
      alumnoId: c.alumno_id,
      alumnoNombre: c.alumno_nombre,
      concepto: c.arancel_concepto,
      montoBase: Money.fromCents(c.monto_bruto_centavos),
      descuento: Money.fromCents(c.descuento_beca_centavos),
      montoNeto: Money.fromCents(c.monto_neto_centavos),
      montoPagado: Money.fromCents(c.monto_pagado_centavos),
      fechaGeneracion: c.fecha_emision,
      fechaVencimiento: c.fecha_vencimiento,
      estado: c.estado,
      cicloMes: parseInt(c.periodo?.split('-')[1] || '1', 10),
      cicloAnio: parseInt(c.periodo?.split('-')[0] || '2026', 10),
      becaId: c.beca_id,
      becaNombre: c.beca_nombre,
      periodo: c.periodo
    });
  }
}

export class StateBridgePaymentRepository implements IPaymentRepository {
  constructor(private readonly getPagosState: () => Pago[]) {}

  public async findById(id: string): Promise<Payment | null> {
    const raw = this.getPagosState().find(p => p.id === id);
    if (!raw) return null;
    return this.mapPagoToDomain(raw);
  }

  public async findByFamilyId(familyId: string): Promise<Payment[]> {
    return this.getPagosState()
      .filter(p => p.familia_id === familyId)
      .map(p => this.mapPagoToDomain(p));
  }

  public async findAll(): Promise<Payment[]> {
    return this.getPagosState().map(p => this.mapPagoToDomain(p));
  }

  public async getNextReceiptNumber(): Promise<string> {
    const totalPagos = this.getPagosState().length;
    const seq = totalPagos + 845;
    return `REC-${seq.toString().padStart(8, '0')}`;
  }

  public mapPagoToDomain(p: Pago): Payment {
    return new Payment({
      id: p.id,
      numeroRecibo: p.numero_recibo,
      familiaId: p.familia_id,
      familiaNombre: p.familia_nombre,
      representanteId: p.representante_id,
      representanteNombre: p.representante_nombre,
      montoTotal: Money.fromCents(p.monto_total_centavos),
      creditoGenerado: Money.fromCents(p.credito_generado_centavos),
      fechaPago: p.fecha_pago,
      fechaRegistro: p.fecha_registro,
      metodoPago: p.metodo_pago,
      referenciaBancaria: p.referencia_bancaria,
      estado: p.estado,
      registradoPor: p.registrado_por,
      registradoPorNombre: p.registrado_por_nombre,
      aplicaciones: [],
      observaciones: p.observaciones,
      reciboUrl: p.comprobante_url
    });
  }
}

export class StateBridgeReceivablesRepository implements IFamilyRepository, IFeeRepository, IPaymentRepository {
  private readonly familyRepo: StateBridgeFamilyRepository;
  private readonly feeRepo: StateBridgeFeeRepository;
  private readonly paymentRepo: StateBridgePaymentRepository;

  constructor(
    getFamiliasState: () => Familia[],
    getCuotasState: () => Cuota[],
    getPagosState: () => Pago[]
  ) {
    this.familyRepo = new StateBridgeFamilyRepository(getFamiliasState);
    this.feeRepo = new StateBridgeFeeRepository(getCuotasState);
    this.paymentRepo = new StateBridgePaymentRepository(getPagosState);
  }

  // Family Port Methods
  public findFamilyById(id: string): Promise<Family | null> {
    return this.familyRepo.findById(id);
  }
  public findAllFamilies(): Promise<Family[]> {
    return this.familyRepo.findAll();
  }
  public save(family: Family): Promise<void> {
    return this.familyRepo.save(family);
  }

  // Fee Port Methods
  public findFeeById(id: string): Promise<Fee | null> {
    return this.feeRepo.findById(id);
  }
  public findFeesByFamilyId(familyId: string): Promise<Fee[]> {
    return this.feeRepo.findByFamilyId(familyId);
  }
  public findAllFees(): Promise<Fee[]> {
    return this.feeRepo.findAll();
  }
  public saveMany(fees: Fee[]): Promise<void> {
    return this.feeRepo.saveMany(fees);
  }

  // Payment Port Methods
  public findPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepo.findById(id);
  }
  public findPaymentsByFamilyId(familyId: string): Promise<Payment[]> {
    return this.paymentRepo.findByFamilyId(familyId);
  }
  public findAllPayments(): Promise<Payment[]> {
    return this.paymentRepo.findAll();
  }
  public getNextReceiptNumber(): Promise<string> {
    return this.paymentRepo.getNextReceiptNumber();
  }

  // Common IFamilyRepository / IFeeRepository / IPaymentRepository methods
  public findById(id: string): Promise<any> {
    return this.feeRepo.findById(id);
  }
  public findByFamilyId(familyId: string): Promise<any> {
    return this.feeRepo.findByFamilyId(familyId);
  }
  public findAll(): Promise<any> {
    return this.familyRepo.findAll();
  }
}

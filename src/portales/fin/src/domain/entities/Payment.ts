import { Money } from '../value-objects/Money';
import { PaymentAllocation } from './PaymentAllocation';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'pago_movil' | 'tarjeta' | 'mixto' | 'credito_favor' | 'tercero' | 'link_externo';
export type PaymentStatus = 'confirmado' | 'pendiente_verificacion' | 'reversado' | 'anulado';

export interface PaymentProps {
  id: string;
  numeroRecibo: string;
  familiaId: string;
  familiaNombre?: string;
  representanteId?: string;
  representanteNombre?: string;
  montoTotal: Money;
  creditoGenerado: Money; // Overpayment that goes into the family wallet
  fechaPago: string;
  fechaRegistro: string;
  metodoPago: PaymentMethod;
  referenciaBancaria?: string;
  estado: PaymentStatus;
  registradoPor: string;
  registradoPorNombre?: string;
  aplicaciones: PaymentAllocation[];
  observaciones?: string;
  reciboUrl?: string;
}

export class Payment {
  private readonly _id: string;
  private readonly _numeroRecibo: string;
  private readonly _familiaId: string;
  private readonly _familiaNombre?: string;
  private readonly _representanteId?: string;
  private readonly _representanteNombre?: string;
  private readonly _montoTotal: Money;
  private readonly _creditoGenerado: Money;
  private readonly _fechaPago: string;
  private readonly _fechaRegistro: string;
  private readonly _metodoPago: PaymentMethod;
  private readonly _referenciaBancaria?: string;
  private readonly _estado: PaymentStatus;
  private readonly _registradoPor: string;
  private readonly _registradoPorNombre?: string;
  private readonly _aplicaciones: PaymentAllocation[];
  private readonly _observaciones?: string;
  private readonly _reciboUrl?: string;

  constructor(props: PaymentProps) {
    this._id = props.id;
    this._numeroRecibo = props.numeroRecibo;
    this._familiaId = props.familiaId;
    this._familiaNombre = props.familiaNombre;
    this._representanteId = props.representanteId;
    this._representanteNombre = props.representanteNombre;
    this._montoTotal = props.montoTotal;
    this._creditoGenerado = props.creditoGenerado;
    this._fechaPago = props.fechaPago;
    this._fechaRegistro = props.fechaRegistro;
    this._metodoPago = props.metodoPago;
    this._referenciaBancaria = props.referenciaBancaria;
    this._estado = props.estado;
    this._registradoPor = props.registradoPor;
    this._registradoPorNombre = props.registradoPorNombre;
    this._aplicaciones = props.aplicaciones;
    this._observaciones = props.observaciones;
    this._reciboUrl = props.reciboUrl;
  }

  public get id(): string { return this._id; }
  public get numeroRecibo(): string { return this._numeroRecibo; }
  public get familiaId(): string { return this._familiaId; }
  public get familiaNombre(): string | undefined { return this._familiaNombre; }
  public get representanteId(): string | undefined { return this._representanteId; }
  public get representanteNombre(): string | undefined { return this._representanteNombre; }
  public get montoTotal(): Money { return this._montoTotal; }
  public get creditoGenerado(): Money { return this._creditoGenerado; }
  public get fechaPago(): string { return this._fechaPago; }
  public get fechaRegistro(): string { return this._fechaRegistro; }
  public get metodoPago(): PaymentMethod { return this._metodoPago; }
  public get referenciaBancaria(): string | undefined { return this._referenciaBancaria; }
  public get estado(): PaymentStatus { return this._estado; }
  public get registradoPor(): string { return this._registradoPor; }
  public get registradoPorNombre(): string | undefined { return this._registradoPorNombre; }
  public get aplicaciones(): PaymentAllocation[] { return this._aplicaciones; }
  public get observaciones(): string | undefined { return this._observaciones; }
  public get reciboUrl(): string | undefined { return this._reciboUrl; }
}

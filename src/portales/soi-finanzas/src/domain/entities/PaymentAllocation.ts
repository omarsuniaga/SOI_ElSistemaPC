import { Money } from '../value-objects/Money';

export interface PaymentAllocationProps {
  id: string;
  pagoId: string;
  cuotaId: string;
  alumnoId: string;
  alumnoNombre?: string;
  concepto: string;
  periodo?: string;
  montoAplicado: Money;
  saldoAnteriorCuota: Money;
  saldoRestanteCuota: Money;
}

export class PaymentAllocation {
  private readonly _id: string;
  private readonly _pagoId: string;
  private readonly _cuotaId: string;
  private readonly _alumnoId: string;
  private readonly _alumnoNombre?: string;
  private readonly _concepto: string;
  private readonly _periodo?: string;
  private readonly _montoAplicado: Money;
  private readonly _saldoAnteriorCuota: Money;
  private readonly _saldoRestanteCuota: Money;

  constructor(props: PaymentAllocationProps) {
    this._id = props.id;
    this._pagoId = props.pagoId;
    this._cuotaId = props.cuotaId;
    this._alumnoId = props.alumnoId;
    this._alumnoNombre = props.alumnoNombre;
    this._concepto = props.concepto;
    this._periodo = props.periodo;
    this._montoAplicado = props.montoAplicado;
    this._saldoAnteriorCuota = props.saldoAnteriorCuota;
    this._saldoRestanteCuota = props.saldoRestanteCuota;
  }

  public get id(): string { return this._id; }
  public get pagoId(): string { return this._pagoId; }
  public get cuotaId(): string { return this._cuotaId; }
  public get alumnoId(): string { return this._alumnoId; }
  public get alumnoNombre(): string | undefined { return this._alumnoNombre; }
  public get concepto(): string { return this._concepto; }
  public get periodo(): string | undefined { return this._periodo; }
  public get montoAplicado(): Money { return this._montoAplicado; }
  public get saldoAnteriorCuota(): Money { return this._saldoAnteriorCuota; }
  public get saldoRestanteCuota(): Money { return this._saldoRestanteCuota; }
}

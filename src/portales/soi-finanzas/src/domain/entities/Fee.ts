import { Money } from '../value-objects/Money';

export type FeeStatus = 'pendiente' | 'parcial' | 'pagada' | 'condonada' | 'anulada' | 'vencida' | 'en_mora' | 'exonerada' | 'becada';

export interface FeeProps {
  id: string;
  familiaId: string;
  alumnoId: string;
  alumnoNombre?: string;
  concepto: string;
  montoBase: Money;
  descuento: Money;
  montoNeto: Money;
  montoPagado: Money;
  fechaGeneracion: string;
  fechaVencimiento: string;
  estado: FeeStatus;
  cicloMes: number;
  cicloAnio: number;
  becaId?: string;
  becaNombre?: string;
  periodo?: string;
  metadatos?: Record<string, any>;
}

export class Fee {
  private readonly _id: string;
  private readonly _familiaId: string;
  private readonly _alumnoId: string;
  private readonly _alumnoNombre?: string;
  private readonly _concepto: string;
  private readonly _montoBase: Money;
  private readonly _descuento: Money;
  private readonly _montoNeto: Money;
  private _montoPagado: Money;
  private readonly _fechaGeneracion: string;
  private readonly _fechaVencimiento: string;
  private _estado: FeeStatus;
  private readonly _cicloMes: number;
  private readonly _cicloAnio: number;
  private readonly _becaId?: string;
  private readonly _becaNombre?: string;
  private readonly _periodo?: string;
  private readonly _metadatos?: Record<string, any>;

  constructor(props: FeeProps) {
    this._id = props.id;
    this._familiaId = props.familiaId;
    this._alumnoId = props.alumnoId;
    this._alumnoNombre = props.alumnoNombre;
    this._concepto = props.concepto;
    this._montoBase = props.montoBase;
    this._descuento = props.descuento;
    this._montoNeto = props.montoNeto;
    this._montoPagado = props.montoPagado;
    this._fechaGeneracion = props.fechaGeneracion;
    this._fechaVencimiento = props.fechaVencimiento;
    this._estado = props.estado;
    this._cicloMes = props.cicloMes;
    this._cicloAnio = props.cicloAnio;
    this._becaId = props.becaId;
    this._becaNombre = props.becaNombre;
    this._periodo = props.periodo;
    this._metadatos = props.metadatos;
  }

  public get id(): string { return this._id; }
  public get familiaId(): string { return this._familiaId; }
  public get alumnoId(): string { return this._alumnoId; }
  public get alumnoNombre(): string | undefined { return this._alumnoNombre; }
  public get concepto(): string { return this._concepto; }
  public get montoBase(): Money { return this._montoBase; }
  public get descuento(): Money { return this._descuento; }
  public get montoNeto(): Money { return this._montoNeto; }
  public get montoPagado(): Money { return this._montoPagado; }
  public get fechaGeneracion(): string { return this._fechaGeneracion; }
  public get fechaVencimiento(): string { return this._fechaVencimiento; }
  public get estado(): FeeStatus { return this._estado; }
  public get cicloMes(): number { return this._cicloMes; }
  public get cicloAnio(): number { return this._cicloAnio; }
  public get becaId(): string | undefined { return this._becaId; }
  public get becaNombre(): string | undefined { return this._becaNombre; }
  public get periodo(): string | undefined { return this._periodo; }
  public get metadatos(): Record<string, any> | undefined { return this._metadatos; }

  public get saldo(): Money {
    const s = this._montoNeto.subtract(this._montoPagado);
    return s.cents < 0 ? Money.zero() : s;
  }

  public isFullyPaid(): boolean {
    return this.saldo.isZero();
  }

  public applyPayment(amount: Money): { allocated: Money; remainingFeeBalance: Money } {
    if (amount.isLessThan(Money.zero())) {
      throw new Error('Payment allocation amount cannot be negative');
    }

    const currentSaldo = this.saldo;
    const toApply = amount.isGreaterThan(currentSaldo) ? currentSaldo : amount;
    
    this._montoPagado = this._montoPagado.add(toApply);

    if (this._montoPagado.cents >= this._montoNeto.cents) {
      this._estado = 'pagada';
    } else if (this._montoPagado.isPositive()) {
      this._estado = 'parcial';
    }

    return {
      allocated: toApply,
      remainingFeeBalance: this.saldo
    };
  }
}

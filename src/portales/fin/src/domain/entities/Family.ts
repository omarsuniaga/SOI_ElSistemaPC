import { Money } from '../value-objects/Money';

export type PortfolioStatus = 'al_dia' | 'preventivo' | 'mora_temprana' | 'mora_critica' | 'convenio' | 'becado_total' | 'atraso_leve' | 'mora_grave' | 'incobrable';

export interface FamilyProps {
  id: string;
  apellidos: string;
  representanteId?: string;
  representanteNombre?: string;
  representanteCedula?: string;
  representanteTelefono?: string;
  representanteCorreo?: string;
  saldoPendiente: Money;
  creditoFavor: Money; // Wallet credit
  alumnosCount?: number;
  alumnosNombres?: string[];
  alumnosIds?: string[];
  estadoCartera: PortfolioStatus;
  ispValor?: number;
  ispCategoria?: string;
  activa?: boolean;
  datosExtra?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class Family {
  private readonly _id: string;
  private readonly _apellidos: string;
  private readonly _representanteId?: string;
  private readonly _representanteNombre?: string;
  private readonly _representanteCedula?: string;
  private readonly _representanteTelefono?: string;
  private readonly _representanteCorreo?: string;
  private _saldoPendiente: Money;
  private _creditoFavor: Money;
  private readonly _alumnosCount: number;
  private readonly _alumnosNombres?: string[];
  private readonly _alumnosIds?: string[];
  private _estadoCartera: PortfolioStatus;
  private _ispValor?: number;
  private _ispCategoria?: string;
  private readonly _activa: boolean;
  private readonly _datosExtra?: Record<string, any>;
  private readonly _createdAt?: string;
  private readonly _updatedAt?: string;

  constructor(props: FamilyProps) {
    this._id = props.id;
    this._apellidos = props.apellidos;
    this._representanteId = props.representanteId;
    this._representanteNombre = props.representanteNombre;
    this._representanteCedula = props.representanteCedula;
    this._representanteTelefono = props.representanteTelefono;
    this._representanteCorreo = props.representanteCorreo;
    this._saldoPendiente = props.saldoPendiente;
    this._creditoFavor = props.creditoFavor;
    this._alumnosCount = props.alumnosCount ?? (props.alumnosIds ? props.alumnosIds.length : 0);
    this._alumnosNombres = props.alumnosNombres;
    this._alumnosIds = props.alumnosIds;
    this._estadoCartera = props.estadoCartera;
    this._ispValor = props.ispValor;
    this._ispCategoria = props.ispCategoria;
    this._activa = props.activa ?? true;
    this._datosExtra = props.datosExtra;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public get id(): string { return this._id; }
  public get apellidos(): string { return this._apellidos; }
  public get representanteId(): string | undefined { return this._representanteId; }
  public get representanteNombre(): string | undefined { return this._representanteNombre; }
  public get representanteCedula(): string | undefined { return this._representanteCedula; }
  public get representanteTelefono(): string | undefined { return this._representanteTelefono; }
  public get representanteCorreo(): string | undefined { return this._representanteCorreo; }
  public get saldoPendiente(): Money { return this._saldoPendiente; }
  public get creditoFavor(): Money { return this._creditoFavor; }
  public get alumnosCount(): number { return this._alumnosCount; }
  public get alumnosNombres(): string[] | undefined { return this._alumnosNombres; }
  public get alumnosIds(): string[] | undefined { return this._alumnosIds; }
  public get estadoCartera(): PortfolioStatus { return this._estadoCartera; }
  public get ispValor(): number | undefined { return this._ispValor; }
  public get ispCategoria(): string | undefined { return this._ispCategoria; }
  public get activa(): boolean { return this._activa; }
  public get datosExtra(): Record<string, any> | undefined { return this._datosExtra; }
  public get createdAt(): string | undefined { return this._createdAt; }
  public get updatedAt(): string | undefined { return this._updatedAt; }

  public updateBalance(newSaldoPendiente: Money, newCreditoFavor: Money): void {
    this._saldoPendiente = newSaldoPendiente;
    this._creditoFavor = newCreditoFavor;
    if (newSaldoPendiente.isZero()) {
      this._estadoCartera = 'al_dia';
    }
  }

  public updateISP(score: number, category: string): void {
    this._ispValor = score;
    this._ispCategoria = category;
  }
}

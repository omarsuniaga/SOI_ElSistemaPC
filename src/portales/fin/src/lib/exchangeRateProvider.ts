export interface ExchangeRateRecord {
  id: string;
  source: 'MANUAL_FINANCE_ENTRY' | 'BANCO_CENTRAL_RD' | 'BANCO_POPULAR' | 'OPEN_EXCHANGE_RATES';
  rate: number; // DOP por 1 USD (e.g. 60.50)
  effectiveDate: string; // YYYY-MM-DD
  enteredBy: string;
  enteredByRole: string;
  notes?: string;
  createdAt: string;
}

export interface IExchangeRateProvider {
  getCurrentRate(): ExchangeRateRecord;
  getHistoricalRate(date: string): ExchangeRateRecord;
  updateManualRate(newRate: number, user: { id: string; nombre: string; rol: string }, notes?: string): ExchangeRateRecord;
  getAllHistoricalRates(): ExchangeRateRecord[];
}

const STORAGE_KEY_EXCHANGE = 'SOI_FINANZAS_EXCHANGE_RATES_V1';

const INITIAL_RATE_HISTORY: ExchangeRateRecord[] = [
  {
    id: 'rate-hist-001',
    source: 'MANUAL_FINANCE_ENTRY',
    rate: 59.80,
    effectiveDate: '2026-01-15',
    enteredBy: 'Omar Eduardo (Director Financiero)',
    enteredByRole: 'director',
    notes: 'Tasa oficial aprobada para presupuesto Q1-2026',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'rate-hist-002',
    source: 'MANUAL_FINANCE_ENTRY',
    rate: 60.20,
    effectiveDate: '2026-05-01',
    enteredBy: 'Omar Eduardo (Director Financiero)',
    enteredByRole: 'director',
    notes: 'Ajuste de mitad de año para compras de instrumentos Q2-2026',
    createdAt: '2026-05-01T10:30:00Z'
  },
  {
    id: 'rate-hist-003',
    source: 'MANUAL_FINANCE_ENTRY',
    rate: 60.50,
    effectiveDate: '2026-08-01',
    enteredBy: 'Omar Eduardo (Director Financiero)',
    enteredByRole: 'director',
    notes: 'Tasa institucional de referencia para compras del ciclo escolar 2026-2027',
    createdAt: '2026-08-01T08:00:00Z'
  }
];

class InstitutionalExchangeRateProvider implements IExchangeRateProvider {
  private history: ExchangeRateRecord[];

  constructor() {
    this.history = this.loadHistory();
  }

  private loadHistory(): ExchangeRateRecord[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY_EXCHANGE);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading exchange rates from storage', e);
    }
    return INITIAL_RATE_HISTORY;
  }

  private persistHistory() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_EXCHANGE, JSON.stringify(this.history));
      }
    } catch (e) {
      console.warn('Error saving exchange rates', e);
    }
  }

  public getCurrentRate(): ExchangeRateRecord {
    // Retorna el registro más reciente por effectiveDate
    const sorted = [...this.history].sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    return sorted[0] || INITIAL_RATE_HISTORY[INITIAL_RATE_HISTORY.length - 1];
  }

  public getHistoricalRate(date: string): ExchangeRateRecord {
    const targetTime = new Date(date).getTime();
    const sorted = [...this.history].sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());
    
    // Buscar la última tasa aplicable a esa fecha
    let applicable = sorted[0];
    for (const item of sorted) {
      if (new Date(item.effectiveDate).getTime() <= targetTime) {
        applicable = item;
      } else {
        break;
      }
    }
    return applicable || this.getCurrentRate();
  }

  public updateManualRate(
    newRate: number, 
    user: { id: string; nombre: string; rol: string }, 
    notes?: string
  ): ExchangeRateRecord {
    if (newRate <= 0 || isNaN(newRate)) {
      throw new Error('La tasa de cambio debe ser un número positivo válido.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: ExchangeRateRecord = {
      id: `rate-hist-${Date.now()}`,
      source: 'MANUAL_FINANCE_ENTRY',
      rate: Number(newRate.toFixed(4)),
      effectiveDate: todayStr,
      enteredBy: `${user.nombre} (${user.rol.toUpperCase()})`,
      enteredByRole: user.rol,
      notes: notes || `Actualización manual por usuario autorizado de Finanzas`,
      createdAt: new Date().toISOString()
    };

    this.history.push(newRecord);
    this.persistHistory();
    return newRecord;
  }

  public getAllHistoricalRates(): ExchangeRateRecord[] {
    return [...this.history].sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
  }
}

export const exchangeRateService = new InstitutionalExchangeRateProvider();

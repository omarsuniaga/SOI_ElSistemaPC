/**
 * Pure Domain Value Object: Money
 * Authoritative financial representation in integer cents.
 * Disallows floating point inaccuracy in financial arithmetic.
 */

export class Money {
  private readonly _cents: number;
  private readonly _currency: 'DOP' | 'USD';

  private constructor(cents: number, currency: 'DOP' | 'USD' = 'DOP') {
    if (!Number.isInteger(cents)) {
      throw new Error(`Money must be constructed with integer cents, received: ${cents}`);
    }
    this._cents = cents;
    this._currency = currency;
  }

  public static fromCents(cents: number | bigint, currency: 'DOP' | 'USD' = 'DOP'): Money {
    const numericCents = typeof cents === 'bigint' ? Number(cents) : cents;
    if (!Number.isInteger(numericCents)) {
      // Round to nearest integer cent half-up if fractional
      return new Money(Math.round(numericCents), currency);
    }
    return new Money(numericCents, currency);
  }

  public static fromMajorUnits(amount: number, currency: 'DOP' | 'USD' = 'DOP'): Money {
    return new Money(Math.round(amount * 100), currency);
  }

  public static zero(currency: 'DOP' | 'USD' = 'DOP'): Money {
    return new Money(0, currency);
  }

  public get cents(): number {
    return this._cents;
  }

  public get currency(): 'DOP' | 'USD' {
    return this._currency;
  }

  public get majorUnits(): number {
    return this._cents / 100;
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._cents + other.cents, this._currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._cents - other.cents, this._currency);
  }

  public multiply(factor: number): Money {
    return new Money(Math.round(this._cents * factor), this._currency);
  }

  public isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._cents > other.cents;
  }

  public isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._cents < other.cents;
  }

  public isZero(): boolean {
    return this._cents === 0;
  }

  public isPositive(): boolean {
    return this._cents > 0;
  }

  public equals(other: Money): boolean {
    return this._cents === other.cents && this._currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other.currency) {
      throw new Error(`Currency mismatch: cannot operate ${this._currency} with ${other.currency}`);
    }
  }

  public toFormattedString(): string {
    const formatted = (this._cents / 100).toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return this._currency === 'USD' ? `$${formatted}` : `RD$ ${formatted}`;
  }
}

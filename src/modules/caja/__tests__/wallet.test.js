import { describe, test, expect } from 'vitest'
import {
  calcularSaldoActual,
  buildMovimientoCredito,
  buildMovimientoDebito,
  canDebitarWallet,
  alertaSaldoBajo,
  WALLET_STATUS,
  canOperateWallet,
  freezeWallet,
  buildRefundMovimiento,
  shouldDevolver,
} from '../domain/wallet.js'

describe('calcularSaldoActual', () => {
  test('returns 0 when no movements', () => {
    expect(calcularSaldoActual([])).toBe(0)
  })

  test('returns saldo_resultante of last movement', () => {
    const movs = [
      { tipo: 'credito', saldo_resultante: 100 },
      { tipo: 'credito', saldo_resultante: 200 },
    ]
    expect(calcularSaldoActual(movs)).toBe(200)
  })

  test('returns last movement saldo_resultante regardless of tipo', () => {
    const movs = [
      { tipo: 'credito', saldo_resultante: 200 },
      { tipo: 'debito', saldo_resultante: 50 },
    ]
    expect(calcularSaldoActual(movs)).toBe(50)
  })
})

describe('buildMovimientoCredito', () => {
  const base = { familia_id: 'fam-1', monto: 100, origen: 'pago', referencia_id: 'pago-1', descripcion: 'Crédito', saldoAnterior: 50 }

  test('tipo is credito', () => {
    const m = buildMovimientoCredito(base)
    expect(m.tipo).toBe('credito')
  })

  test('saldo_resultante = saldoAnterior + monto', () => {
    const m = buildMovimientoCredito(base)
    expect(m.saldo_resultante).toBe(150)
  })

  test('includes all required fields', () => {
    const m = buildMovimientoCredito(base)
    expect(m.familia_id).toBe('fam-1')
    expect(m.monto).toBe(100)
    expect(m.origen).toBe('pago')
  })
})

describe('buildMovimientoDebito', () => {
  const base = { familia_id: 'fam-1', monto: 30, origen: 'accesorio', referencia_id: 'acc-1', descripcion: 'Débito', saldoAnterior: 100 }

  test('tipo is debito', () => {
    const m = buildMovimientoDebito(base)
    expect(m.tipo).toBe('debito')
  })

  test('saldo_resultante = saldoAnterior - monto', () => {
    const m = buildMovimientoDebito(base)
    expect(m.saldo_resultante).toBe(70)
  })

  test('throws when monto > saldoAnterior', () => {
    expect(() => buildMovimientoDebito({ ...base, monto: 200 })).toThrow()
  })
})

describe('canDebitarWallet', () => {
  test('solo_accesorios config allows accesorio purpose', () => {
    expect(canDebitarWallet({ modo: 'solo_accesorios' }, 100, 'accesorio')).toBe(true)
  })

  test('solo_accesorios config blocks cuota purpose', () => {
    expect(canDebitarWallet({ modo: 'solo_accesorios' }, 100, 'cuota')).toBe(false)
  })

  test('solo_cuotas config allows cuota purpose', () => {
    expect(canDebitarWallet({ modo: 'solo_cuotas' }, 100, 'cuota')).toBe(true)
  })

  test('solo_cuotas config blocks accesorio purpose', () => {
    expect(canDebitarWallet({ modo: 'solo_cuotas' }, 100, 'accesorio')).toBe(false)
  })

  test('mixto allows both purposes', () => {
    expect(canDebitarWallet({ modo: 'mixto' }, 100, 'cuota')).toBe(true)
    expect(canDebitarWallet({ modo: 'mixto' }, 100, 'accesorio')).toBe(true)
  })
})

describe('alertaSaldoBajo', () => {
  test('returns true when saldoActual < saldo_minimo_alerta', () => {
    expect(alertaSaldoBajo({ saldo_minimo_alerta: 50 }, 30)).toBe(true)
  })

  test('returns false when saldoActual >= saldo_minimo_alerta', () => {
    expect(alertaSaldoBajo({ saldo_minimo_alerta: 50 }, 50)).toBe(false)
    expect(alertaSaldoBajo({ saldo_minimo_alerta: 50 }, 100)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// New: wallet status / freeze tests (S-22 / S-23 fixes)
// ---------------------------------------------------------------------------
describe('WALLET_STATUS', () => {
  test('has all three statuses', () => {
    expect(WALLET_STATUS.OPERATIVA).toBe('operativa')
    expect(WALLET_STATUS.CONGELADA).toBe('congelada')
    expect(WALLET_STATUS.DEVUELTA).toBe('devuelta')
  })
})

describe('canOperateWallet', () => {
  test('returns true when status is operativa', () => {
    expect(canOperateWallet({ status: 'operativa', modo: 'mixto', saldo_minimo_alerta: 0 })).toBe(true)
  })
  test('returns true when status is undefined (legacy)', () => {
    expect(canOperateWallet({ modo: 'mixto', saldo_minimo_alerta: 0 })).toBe(true)
  })
  test('returns false when status is congelada', () => {
    expect(canOperateWallet({ status: 'congelada', modo: 'mixto', saldo_minimo_alerta: 0 })).toBe(false)
  })
  test('returns false when status is devuelta', () => {
    expect(canOperateWallet({ status: 'devuelta', modo: 'mixto', saldo_minimo_alerta: 0 })).toBe(false)
  })
})

describe('freezeWallet', () => {
  test('sets status to congelada and records timestamp', () => {
    const cfg = { status: 'operativa', modo: 'mixto', saldo_minimo_alerta: 0 }
    const ts = '2026-06-22T10:00:00.000Z'
    const result = freezeWallet(cfg, ts)
    expect(result.status).toBe('congelada')
    expect(result.congelada_en).toBe(ts)
  })
  test('does not mutate original config', () => {
    const cfg = { status: 'operativa', modo: 'mixto', saldo_minimo_alerta: 0 }
    freezeWallet(cfg, '2026-06-22T10:00:00.000Z')
    expect(cfg.status).toBe('operativa')
  })
})

describe('buildRefundMovimiento', () => {
  test('returns debito movimiento draining to 0', () => {
    const cfg = { status: 'congelada', familia_id: 'fam-001' }
    const mov = buildRefundMovimiento({ familia_id: 'fam-001', saldo: 200, walletConfig: cfg })
    expect(mov.tipo).toBe('debito')
    expect(mov.monto).toBe(200)
    expect(mov.saldo_resultante).toBe(0)
    expect(mov.origen).toBe('ajuste')
  })
  test('throws when saldo is 0', () => {
    const cfg = { status: 'congelada' }
    expect(() => buildRefundMovimiento({ familia_id: 'f', saldo: 0, walletConfig: cfg })).toThrow()
  })
  test('throws when wallet is not congelada', () => {
    const cfg = { status: 'operativa' }
    expect(() => buildRefundMovimiento({ familia_id: 'f', saldo: 100, walletConfig: cfg })).toThrow()
  })
})

describe('shouldDevolver', () => {
  test('returns false when not congelada', () => {
    expect(shouldDevolver({ status: 'operativa', congelada_en: null })).toBe(false)
  })
  test('returns false before 90 days', () => {
    const cfg = { status: 'congelada', congelada_en: new Date(Date.now() - 89 * 86400000).toISOString() }
    expect(shouldDevolver(cfg)).toBe(false)
  })
  test('returns true at exactly 90 days', () => {
    const cfg = { status: 'congelada', congelada_en: new Date(Date.now() - 90 * 86400000).toISOString() }
    expect(shouldDevolver(cfg)).toBe(true)
  })
})

/**
 * Domain: wallet
 * Wallet / balance management — no Supabase imports.
 */

/**
 * Returns saldo_resultante of the last movement (or 0 if empty).
 */
export function calcularSaldoActual(movimientos) {
  if (!movimientos || movimientos.length === 0) return 0
  return movimientos[movimientos.length - 1].saldo_resultante
}

export function buildMovimientoCredito({ familia_id, monto, origen, referencia_id, descripcion, saldoAnterior }) {
  const saldo_resultante = saldoAnterior + monto
  return {
    familia_id,
    tipo: 'credito',
    monto,
    origen,
    referencia_id,
    descripcion,
    saldo_resultante,
  }
}

export function buildMovimientoDebito({ familia_id, monto, origen, referencia_id, descripcion, saldoAnterior }) {
  if (monto > saldoAnterior) {
    throw new Error(`Saldo insuficiente: saldo ${saldoAnterior}, débito ${monto}`)
  }
  const saldo_resultante = saldoAnterior - monto
  return {
    familia_id,
    tipo: 'debito',
    monto,
    origen,
    referencia_id,
    descripcion,
    saldo_resultante,
  }
}

export function canDebitarWallet(walletConfig, monto, proposito) {
  const { modo } = walletConfig
  if (modo === 'mixto') return true
  if (modo === 'solo_accesorios') return proposito === 'accesorio'
  if (modo === 'solo_cuotas') return proposito === 'cuota'
  return false
}

export function alertaSaldoBajo(walletConfig, saldoActual) {
  return saldoActual < walletConfig.saldo_minimo_alerta
}

// ---------------------------------------------------------------------------
// Wallet status / freeze (S-22 / S-23)
// ---------------------------------------------------------------------------

export const WALLET_STATUS = Object.freeze({
  OPERATIVA: 'operativa',
  CONGELADA: 'congelada',
  DEVUELTA: 'devuelta',
})

export function canOperateWallet(walletConfig) {
  return !walletConfig.status || walletConfig.status === WALLET_STATUS.OPERATIVA
}

export function freezeWallet(walletConfig, timestamp = new Date().toISOString()) {
  return {
    ...walletConfig,
    status: WALLET_STATUS.CONGELADA,
    congelada_en: timestamp,
  }
}

export function buildRefundMovimiento({ familia_id, saldo, walletConfig }) {
  if (saldo <= 0) throw new Error('No hay saldo a devolver')
  if (walletConfig.status !== WALLET_STATUS.CONGELADA) {
    throw new Error('Solo se puede devolver saldo de wallets congeladas')
  }
  return {
    familia_id,
    tipo: 'debito',
    monto: saldo,
    origen: 'ajuste',
    referencia_id: null,
    descripcion: 'Devolución de saldo — retiro de último alumno',
    saldo_resultante: 0,
  }
}

export function shouldDevolver(walletConfig, today = new Date()) {
  if (walletConfig.status !== WALLET_STATUS.CONGELADA || !walletConfig.congelada_en) return false
  const diasCongelada = Math.floor((today - new Date(walletConfig.congelada_en)) / (1000 * 60 * 60 * 24))
  return diasCongelada >= 90
}

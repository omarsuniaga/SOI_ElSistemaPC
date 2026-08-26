/**
 * Domain: wallet
 * Wallet / balance management — no Supabase imports.
 * All monetary fields are integer centavos (RD$1.00 = 100 centavos). ADR-002.
 */

/**
 * Returns saldo_resultante_centavos of the last movement (or 0 if empty).
 */
export function calcularSaldoActual(movimientos) {
  if (!movimientos || movimientos.length === 0) return 0
  return movimientos[movimientos.length - 1].saldo_resultante_centavos
}

export function buildMovimientoCredito({ familia_id, monto_centavos, origen, referencia_id, descripcion, saldoAnterior }) {
  const saldo_resultante_centavos = saldoAnterior + monto_centavos
  return {
    familia_id,
    tipo: 'credito',
    monto_centavos,
    origen,
    referencia_id,
    descripcion,
    saldo_resultante_centavos,
  }
}

export function buildMovimientoDebito({ familia_id, monto_centavos, origen, referencia_id, descripcion, saldoAnterior }) {
  if (monto_centavos > saldoAnterior) {
    throw new Error(`Saldo insuficiente: saldo ${saldoAnterior}, débito ${monto_centavos}`)
  }
  const saldo_resultante_centavos = saldoAnterior - monto_centavos
  return {
    familia_id,
    tipo: 'debito',
    monto_centavos,
    origen,
    referencia_id,
    descripcion,
    saldo_resultante_centavos,
  }
}

export function canDebitarWallet(walletConfig, monto_centavos, proposito) {
  const { modo } = walletConfig
  if (modo === 'mixto') return true
  if (modo === 'solo_accesorios') return proposito === 'accesorio'
  if (modo === 'solo_cuotas') return proposito === 'cuota'
  return false
}

export function alertaSaldoBajo(walletConfig, saldoActualCentavos) {
  return saldoActualCentavos < walletConfig.saldo_minimo_alerta_centavos
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
    monto_centavos: saldo,
    origen: 'ajuste',
    referencia_id: null,
    descripcion: 'Devolución de saldo — retiro de último alumno',
    saldo_resultante_centavos: 0,
  }
}

export function shouldDevolver(walletConfig, today = new Date()) {
  if (walletConfig.status !== WALLET_STATUS.CONGELADA || !walletConfig.congelada_en) return false
  const diasCongelada = Math.floor((today - new Date(walletConfig.congelada_en)) / (1000 * 60 * 60 * 24))
  return diasCongelada >= 90
}

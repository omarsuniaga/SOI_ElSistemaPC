/**
 * Domain: reporte
 * Reporting and aggregation — no Supabase imports.
 */

export function aggregateCierreCaja(pagos, fecha) {
  const porMetodo = {}
  let totalGeneral = 0

  for (const pago of pagos) {
    totalGeneral += pago.monto
    if (!porMetodo[pago.metodo_pago]) {
      porMetodo[pago.metodo_pago] = { count: 0, total: 0 }
    }
    porMetodo[pago.metodo_pago].count++
    porMetodo[pago.metodo_pago].total += pago.monto
  }

  return {
    fecha,
    totalGeneral,
    porMetodo,
    cantidadTransacciones: pagos.length,
  }
}

export function buildEstadoCuentaFamiliar(familia, cuotas, pagos, wallet) {
  const totalCuotas = cuotas.reduce((s, c) => s + (c.monto_base || 0), 0)
  const totalPagado = pagos.reduce((s, p) => s + (p.monto || 0), 0)
  const saldoPendiente = totalCuotas - totalPagado
  const walletBalance = wallet ? (wallet.saldo || 0) : 0

  // Sorted timeline: merge pagos sorted by fecha
  const movimientos = [...pagos].sort((a, b) =>
    new Date(a.fecha_pago || 0) - new Date(b.fecha_pago || 0)
  )

  return {
    familia,
    resumen: { totalCuotas, totalPagado, saldoPendiente, walletBalance },
    movimientos,
  }
}

export function buildMoraReport(cuotasMora, representantes, today) {
  const repByFamilia = {}
  for (const r of representantes) {
    repByFamilia[r.familia_id] = r
  }

  const items = cuotasMora.map(cuota => {
    const venc = new Date(cuota.fecha_vencimiento)
    const diasMora = Math.max(0, Math.floor((today - venc) / (1000 * 60 * 60 * 24)))
    return {
      familia: { id: cuota.familia_id },
      representante: repByFamilia[cuota.familia_id] || null,
      cuota,
      diasMora,
      nivel: diasMora > 60 ? 'critico' : diasMora > 30 ? 'mora' : 'vencido',
    }
  })

  return { items, totalMora: cuotasMora.length }
}

export function buildImpactoSocial(becas, patrocinios, exoneraciones) {
  const valorRecuperado = patrocinios.reduce((s, p) => s + (p.monto_mensual || 0), 0)
  const valorSubsidios = exoneraciones.reduce((s, e) => s + (e.porcentaje || 0), 0)

  return {
    totalBecas: becas.length,
    totalPatrocinios: patrocinios.length,
    valorSubsidios,
    valorRecuperado,
  }
}

export function calcularAbandonoScore(financialScore, asistenciaPct, progresoPct) {
  return (financialScore / 100 * 0.4 + asistenciaPct * 0.3 + progresoPct * 0.3) * 100
}

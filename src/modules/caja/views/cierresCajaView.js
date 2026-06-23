/**
 * cierresCajaView.js - Daily close view
 * Route: #/cierre
 * Shows today's close data, Cerrar Caja button, and PDF download.
 */
import * as cajaApi from '../api/cajaApi.js'
import { generateCierreCaja } from '../pdf/cierreCajaDiario.js'

const VERDE = '#059669'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function metodoRow(metodo, data) {
  return '<div style="display:flex;justify-content:space-between;align-items:center;'
    + 'padding:0.75rem 0;border-bottom:1px solid #f1f5f9">'
    + '<div>'
    + '<span style="font-size:0.875rem;font-weight:600;color:#0f172a">' + metodo + '</span>'
    + '<span style="display:block;font-size:0.75rem;color:#94a3b8">' + (data.count || 0) + ' transacciones</span>'
    + '</div>'
    + '<span style="font-size:1rem;font-weight:700;color:' + VERDE + '">' + fmtMoney(data.total) + '</span>'
    + '</div>'
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando cierre...</p></div>'

  const { data: cierre, error } = await cajaApi.getCierreCajaHoy()

  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar cierre del dia.</p></div>'
    return { teardown() {} }
  }

  const cierreData = cierre || { totalGeneral: 0, porMetodo: {}, cantidadTransacciones: 0 }
  const hoy = new Date().toISOString().slice(0, 10)
  const metodoEntries = Object.entries(cierreData.porMetodo || {})

  let yaFueCerrado = false

  function renderMain(cerrado) {
    container.innerHTML =
      '<div style="padding:1.5rem;max-width:700px">'
      + '<div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between">'
      + '<div>'
      + '<h2 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a">'
      + '<i class="bi bi-cash-stack" style="color:' + VERDE + '"></i> Cierre de Caja</h2>'
      + '<p style="margin:0;font-size:0.8125rem;color:#64748b">' + fmtDate(hoy) + '</p>'
      + '</div>'
      + (cerrado
          ? '<span style="background:#f0fdf4;color:' + VERDE + ';font-size:0.75rem;font-weight:600;'
            + 'padding:0.25rem 0.75rem;border-radius:9999px;border:1px solid #bbf7d0">'
            + '<i class="bi bi-check-circle-fill"></i> Caja cerrada</span>'
          : '')
      + '</div>'

      // Summary card
      + '<div style="background:#fff;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.25rem">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">'
      + '<div>'
      + '<p style="margin:0;font-size:0.75rem;font-weight:600;color:#64748b;text-transform:uppercase">Total cobrado hoy</p>'
      + '<p style="margin:0;font-size:2rem;font-weight:800;color:' + VERDE + '">' + fmtMoney(cierreData.totalGeneral) + '</p>'
      + '<p style="margin:0;font-size:0.75rem;color:#94a3b8">' + (cierreData.cantidadTransacciones || 0) + ' transacciones</p>'
      + '</div>'
      + '<i class="bi bi-safe2-fill" style="font-size:3rem;color:#e2e8f0"></i>'
      + '</div>'

      // Desglose por metodo
      + (metodoEntries.length > 0
          ? '<div>'
            + '<p style="margin:0 0 0.5rem;font-size:0.8125rem;font-weight:600;color:#64748b">DESGLOSE POR METODO</p>'
            + metodoEntries.map(([m, d]) => metodoRow(m, d)).join('')
            + '</div>'
          : '<p style="font-size:0.875rem;color:#94a3b8;text-align:center;padding:1rem 0">Sin transacciones registradas hoy</p>')

      + '</div>'

      // Actions
      + '<div style="display:flex;gap:0.875rem;flex-wrap:wrap">'
      + '<button id="btn-descargar-cierre" class="btn btn-sm" '
      + 'style="background:' + VERDE + ';color:#fff;border:none;font-weight:600;flex:1;min-width:160px">'
      + '<i class="bi bi-download"></i> Descargar PDF</button>'
      + (cerrado
          ? ''
          : '<button id="btn-cerrar-caja" class="btn btn-sm btn-outline-danger" '
            + 'style="flex:1;min-width:160px;font-weight:600">'
            + '<i class="bi bi-lock-fill"></i> Cerrar Caja</button>')
      + '</div>'

      + (cerrado
          ? '<div style="margin-top:1rem;background:#f0fdf4;border:1px solid #bbf7d0;'
            + 'border-radius:8px;padding:0.875rem;display:flex;align-items:center;gap:0.5rem">'
            + '<i class="bi bi-check-circle-fill" style="color:' + VERDE + ';font-size:1.125rem"></i>'
            + '<p style="margin:0;font-size:0.875rem;font-weight:600;color:#166534">Caja cerrada exitosamente</p>'
            + '</div>'
          : '')

      + '</div>'

    // Download PDF
    container.querySelector('#btn-descargar-cierre')?.addEventListener('click', () => {
      const doc = generateCierreCaja(cierreData, hoy)
      doc.save('cierre-caja-' + hoy + '.pdf')
    })

    // Cerrar Caja
    container.querySelector('#btn-cerrar-caja')?.addEventListener('click', async () => {
      const btn = container.querySelector('#btn-cerrar-caja')
      if (!confirm('Confirmar cierre de caja para hoy ' + hoy + '?\nEsta accion registrara el cierre.')) return

      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cerrando...'

      const { error: closeErr } = await cajaApi.registrarCierreCaja({
        fecha: hoy,
        cajero_id: session?.user?.id,
        total: cierreData.totalGeneral,
        porMetodo: cierreData.porMetodo,
        cantidadTransacciones: cierreData.cantidadTransacciones || 0,
      })

      if (closeErr) {
        const msg = closeErr.code === '23505'
          ? 'Ya existe un cierre para hoy. Solo se puede cerrar una vez por día.'
          : 'Error al cerrar caja: ' + String(closeErr.message)
        alert(msg)
        btn.disabled = false
        btn.textContent = 'Cerrar Caja'
        return
      }

      yaFueCerrado = true
      renderMain(true)
    })
  }

  renderMain(yaFueCerrado)

  return {
    teardown() {
      yaFueCerrado = false
    },
  }
}

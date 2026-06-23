/**
 * walletView.js - Family wallet detail and movements
 * Route: #/wallet/:familiaId
 */

import * as cajaApi from '../api/cajaApi.js'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function navigate(hash) {
  window.dispatchEvent(new CustomEvent('caja:navigate', { detail: hash }))
}

export async function render(container, session, params) {
  const familiaId = params?.familiaId
  if (!familiaId) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Familia no especificada</p></div>'
    return { teardown() {} }
  }

  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando wallet...</p></div>'

  const [walletRes, famRes] = await Promise.all([
    cajaApi.getWalletByFamilia(familiaId),
    cajaApi.getFamiliaById(familiaId),
  ])

  const wallet = walletRes.data || { saldo: 0, movimientos: [], config: {} }
  const familia = famRes.data?.familia || {}
  let showForm = false

  function renderMain() {
    const movHtml = (wallet.movimientos || []).length === 0
      ? '<p style="text-align:center;color:#94a3b8;padding:2rem 0">Sin movimientos registrados</p>'
      : (wallet.movimientos || []).map(m =>
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #f1f5f9">'
          + '<div>'
          + '<p style="margin:0;font-size:0.875rem;font-weight:500;color:#0f172a">' + (m.descripcion || m.origen || '-') + '</p>'
          + '<p style="margin:0.125rem 0 0;font-size:0.75rem;color:#94a3b8">' + fmtDate(m.created_at) + '</p>'
          + '</div>'
          + '<div style="text-align:right">'
          + '<p style="margin:0;font-weight:700;color:' + (m.tipo === 'credito' ? '#059669' : '#ef4444') + '">'
          + (m.tipo === 'credito' ? '+' : '-') + fmtMoney(m.monto) + '</p>'
          + '<p style="margin:0.125rem 0 0;font-size:0.75rem;color:#94a3b8">Saldo: ' + fmtMoney(m.saldo_resultante) + '</p>'
          + '</div>'
          + '</div>'
        ).join('')

    const formHtml = !showForm ? '' :
      '<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #e2e8f0">'
      + '<h3 style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:700;color:#374151">Registrar movimiento</h3>'
      + '<select id="mov-tipo" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;margin-bottom:0.625rem;font-size:0.875rem">'
      + '<option value="credito">Credito</option><option value="debito">Debito</option>'
      + '</select>'
      + '<input id="mov-monto" type="number" step="0.01" min="0" placeholder="Monto..." style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;margin-bottom:0.625rem;font-size:0.875rem">'
      + '<input id="mov-desc" type="text" placeholder="Descripcion..." style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;margin-bottom:0.625rem;font-size:0.875rem">'
      + '<div id="mov-error" style="display:none;color:#ef4444;font-size:0.8125rem;margin-bottom:0.5rem"></div>'
      + '<div style="display:flex;gap:0.5rem">'
      + '<button id="btn-mov-cancel" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.5rem;cursor:pointer">Cancelar</button>'
      + '<button id="btn-mov-confirm" style="flex:1;background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem;font-weight:600;cursor:pointer">Registrar</button>'
      + '</div></div>'

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:700px">'
      + '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">'
      + '<button id="btn-back" style="background:none;border:none;cursor:pointer;color:#059669"><i class="bi bi-arrow-left"></i></button>'
      + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">Wallet - ' + (familia.nombre_familia || 'Familia') + '</h2>'
      + '</div>'
      + '<div style="background:linear-gradient(135deg,#059669,#0d9488);color:#fff;border-radius:16px;padding:2rem;text-align:center;margin-bottom:1.5rem">'
      + '<p style="margin:0 0 0.25rem;font-size:0.875rem;opacity:0.85">Saldo disponible</p>'
      + '<p style="margin:0;font-size:2.5rem;font-weight:800">' + fmtMoney(wallet.saldo) + '</p>'
      + '<p style="margin:0.5rem 0 0;font-size:0.75rem;opacity:0.7">Modo: ' + (wallet.config?.modo || '-') + ' &bull; Alerta min: ' + fmtMoney(wallet.config?.saldo_minimo_alerta || 0) + '</p>'
      + '</div>'
      + '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">'
      + '<h3 style="margin:0;font-size:0.9375rem;font-weight:700;color:#0f172a">Movimientos</h3>'
      + '<button id="btn-nuevo-mov" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.375rem 0.875rem;font-size:0.8125rem;cursor:pointer">+ Ajuste</button>'
      + '</div>'
      + movHtml
      + formHtml
      + '</div></div>'

    container.querySelector('#btn-back')?.addEventListener('click', () => navigate('#/familias/' + familiaId))
    container.querySelector('#btn-nuevo-mov')?.addEventListener('click', () => { showForm = true; renderMain() })
    container.querySelector('#btn-mov-cancel')?.addEventListener('click', () => { showForm = false; renderMain() })
    container.querySelector('#btn-mov-confirm')?.addEventListener('click', async () => {
      const tipo = container.querySelector('#mov-tipo').value
      const monto = parseFloat(container.querySelector('#mov-monto').value) || 0
      const descripcion = container.querySelector('#mov-desc').value
      const errEl = container.querySelector('#mov-error')
      if (monto <= 0) { errEl.style.display=''; errEl.textContent='Ingresa un monto valido'; return }
      const { data, error } = await cajaApi.registrarMovimientoWallet({ familia_id: familiaId, tipo, monto, descripcion, cajero_id: session?.user?.id })
      if (error) { errEl.style.display=''; errEl.textContent='Error: '+(error.message||'desconocido'); return }
      showForm = false
      // Refresh wallet data
      const refreshed = await cajaApi.getWalletByFamilia(familiaId)
      if (refreshed.data) Object.assign(wallet, refreshed.data)
      renderMain()
    })
  }

  renderMain()
  return { teardown() {} }
}

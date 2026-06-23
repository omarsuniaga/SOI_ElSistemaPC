/**
 * registroPagoView.js - Payment registration (3-step wizard)
 * Route: #/pagos/nuevo
 */

import * as cajaApi from '../api/cajaApi.js'
import { cuotaEsLiquidable, calcularMoraInfo } from '../domain/cuota.js'
import { distribuirPago, METODOS_PAGO, buildPago } from '../domain/pago.js'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function estadoBadge(estado) {
  const map = { pendiente: ['#fef9c3','#713f12'], vencida: ['#ffedd5','#9a3412'], en_mora: ['#fee2e2','#7f1d1d'] }
  const [bg, text] = map[estado] || ['#f1f5f9','#475569']
  return '<span style="background:' + bg + ';color:' + text + ';font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:6px">' + estado + '</span>'
}

export async function render(container, session) {
  let selectedFamilia = null
  let cuotasDisp = []
  let selectedCuotaIds = new Set()

  const familias_res = await cajaApi.getFamilias()
  const familias = familias_res.data || []

  function renderStep1() {
    const rows = familias.map(f =>
      '<button class="familia-btn" data-id="' + f.id + '"'
      + ' style="text-align:left;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:0.75rem 1rem;cursor:pointer;margin-bottom:0.375rem">'
      + '<div style="font-weight:600;color:#0f172a">' + f.nombre_familia + '</div>'
      + '<div style="font-size:0.75rem;color:#64748b;margin-top:0.125rem">' + (f.rep_nombre || '') + ' &bull; Pendiente: ' + fmtMoney(f.saldo_pendiente) + '</div>'
      + '</button>'
    ).join('')

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:700px">'
      + '<h2 style="margin:0 0 1.5rem;font-size:1.125rem;font-weight:700;color:#0f172a">Registrar Pago</h2>'
      + '<div style="background:#fff;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<p style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:600;color:#374151">Paso 1: Buscar familia</p>'
      + '<input id="familia-search" placeholder="Buscar por nombre..." autocomplete="off"'
      + ' style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.625rem 0.875rem;font-size:0.875rem;margin-bottom:0.75rem">'
      + '<div id="familia-list" style="max-height:400px;overflow-y:auto">' + rows + '</div>'
      + '</div></div>'

    container.querySelector('#familia-search').addEventListener('input', function() {
      const q = this.value.toLowerCase()
      container.querySelectorAll('.familia-btn').forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(q) ? '' : 'none'
      })
    })

    container.querySelectorAll('.familia-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fam = familias.find(f => f.id === btn.dataset.id)
        if (!fam) return
        selectedFamilia = fam
        const res = await cajaApi.getCuotasByFamilia(fam.id)
        cuotasDisp = (res.data || []).filter(cuotaEsLiquidable)
        selectedCuotaIds = new Set()
        renderStep2()
      })
    })
  }

  function renderStep2() {
    const today = new Date()
    const cuotasHtml = cuotasDisp.length === 0
      ? '<p style="color:#94a3b8;padding:1rem 0">No hay cuotas pendientes para esta familia</p>'
      : cuotasDisp.map(c => {
          const mora = calcularMoraInfo(c, today)
          const moraStr = mora.diasMora > 0 ? ' (+' + mora.diasMora + ' dias mora)' : ''
          return '<label style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;margin-bottom:0.375rem">'
            + '<input type="checkbox" class="cuota-check" data-id="' + c.id + '" data-monto="' + c.monto_final + '" style="width:16px;height:16px">'
            + '<div style="flex:1">'
            + '<div style="font-size:0.875rem;font-weight:500;color:#0f172a">' + c.concepto + ' ' + c.ciclo_mes + '/' + c.ciclo_anio + '</div>'
            + '<div style="font-size:0.75rem;color:#64748b">Vence: ' + c.fecha_vencimiento + moraStr + '</div>'
            + '</div>' + estadoBadge(c.estado) + ' '
            + '<span style="font-weight:700;color:#0f172a">' + fmtMoney(c.monto_final) + '</span>'
            + '</label>'
        }).join('')

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:700px">'
      + '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">'
      + '<button id="btn-back1" style="background:none;border:none;cursor:pointer;color:#059669"><i class="bi bi-arrow-left"></i></button>'
      + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">' + selectedFamilia.nombre_familia + '</h2>'
      + '</div>'
      + '<div style="background:#fff;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<p style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:600;color:#374151">Paso 2: Seleccionar cuotas a pagar</p>'
      + cuotasHtml
      + '<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between">'
      + '<span id="total-sel" style="font-size:0.875rem;color:#374151">Total: <b>$0.00</b></span>'
      + '<button id="btn-next2" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem 1.25rem;font-weight:600;cursor:pointer">Continuar</button>'
      + '</div></div></div>'

    container.querySelector('#btn-back1').addEventListener('click', renderStep1)

    function updateTotal() {
      let total = 0
      selectedCuotaIds.clear()
      container.querySelectorAll('.cuota-check:checked').forEach(cb => {
        total += parseFloat(cb.dataset.monto || 0)
        selectedCuotaIds.add(cb.dataset.id)
      })
      container.querySelector('#total-sel').innerHTML = 'Total: <b>' + fmtMoney(total) + '</b>'
    }
    container.querySelectorAll('.cuota-check').forEach(cb => cb.addEventListener('change', updateTotal))

    container.querySelector('#btn-next2').addEventListener('click', () => {
      if (selectedCuotaIds.size === 0) { alert('Selecciona al menos una cuota'); return }
      renderStep3()
    })
  }

  function renderStep3() {
    const cuotasSel = cuotasDisp.filter(c => selectedCuotaIds.has(c.id))
    const totalCuotas = cuotasSel.reduce((s, c) => s + c.monto_final, 0)

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:700px">'
      + '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">'
      + '<button id="btn-back2" style="background:none;border:none;cursor:pointer;color:#059669"><i class="bi bi-arrow-left"></i></button>'
      + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">Detalle del pago</h2>'
      + '</div>'
      + '<div style="background:#fff;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<div style="background:#f8fafc;border-radius:8px;padding:0.875rem;margin-bottom:1rem">'
      + '<p style="margin:0 0 0.25rem;font-size:0.75rem;color:#64748b">' + cuotasSel.length + ' cuota(s) seleccionada(s)</p>'
      + '<p style="margin:0;font-size:1.25rem;font-weight:700;color:#059669">Total: ' + fmtMoney(totalCuotas) + '</p>'
      + '</div>'
      + '<label style="display:block;font-size:0.8125rem;font-weight:500;color:#374151;margin-bottom:0.375rem">Metodo de pago</label>'
      + '<select id="sel-metodo" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.875rem">'
      + METODOS_PAGO.map(m => '<option value="' + m + '">' + m + '</option>').join('')
      + '</select>'
      + '<label style="display:block;font-size:0.8125rem;font-weight:500;color:#374151;margin-bottom:0.375rem">Monto recibido</label>'
      + '<input id="inp-monto" type="number" step="0.01" min="0" value="' + totalCuotas.toFixed(2) + '"'
      + ' style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.875rem">'
      + '<label style="display:block;font-size:0.8125rem;font-weight:500;color:#374151;margin-bottom:0.375rem">Referencia (opcional)</label>'
      + '<input id="inp-ref" type="text" placeholder="N de transferencia..."'
      + ' style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.875rem">'
      + '<label style="display:block;font-size:0.8125rem;font-weight:500;color:#374151;margin-bottom:0.375rem">Notas</label>'
      + '<textarea id="inp-notas" rows="2" placeholder="Observaciones..."'
      + ' style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:1rem"></textarea>'
      + '<div id="sobrante-info" style="display:none;background:#d1fae5;border-radius:8px;padding:0.75rem;margin-bottom:1rem;font-size:0.875rem;color:#065f46"></div>'
      + '<div id="pago-error" style="display:none;background:#fee2e2;border-radius:8px;padding:0.75rem;margin-bottom:1rem;font-size:0.875rem;color:#7f1d1d"></div>'
      + '<button id="btn-confirmar" style="width:100%;background:#059669;color:#fff;border:none;border-radius:8px;padding:0.75rem;font-size:0.9375rem;font-weight:600;cursor:pointer">Confirmar Pago</button>'
      + '</div></div>'

    container.querySelector('#btn-back2').addEventListener('click', renderStep2)

    const montoEl = container.querySelector('#inp-monto')
    montoEl.addEventListener('input', () => {
      const monto = parseFloat(montoEl.value) || 0
      const { montoSobrante } = distribuirPago(cuotasSel, monto)
      const sobranteEl = container.querySelector('#sobrante-info')
      if (montoSobrante > 0) {
        sobranteEl.style.display = ''
        sobranteEl.textContent = 'Sobrante: ' + fmtMoney(montoSobrante) + ' se acreditara al wallet de la familia'
      } else { sobranteEl.style.display = 'none' }
    })

    container.querySelector('#btn-confirmar').addEventListener('click', async () => {
      const monto = parseFloat(montoEl.value) || 0
      const metodo_pago = container.querySelector('#sel-metodo').value
      const referencia = container.querySelector('#inp-ref').value
      const notas = container.querySelector('#inp-notas').value
      const errorEl = container.querySelector('#pago-error')
      if (monto <= 0) { errorEl.style.display=''; errorEl.textContent='Ingresa un monto valido'; return }
      const btn = container.querySelector('#btn-confirmar')
      btn.disabled = true; btn.textContent = 'Procesando...'
      const pagoData = buildPago({
        familia_id: selectedFamilia.id,
        cuota_ids: [...selectedCuotaIds],
        monto, metodo_pago,
        cajero_id: session?.user?.id,
        notas: [notas, referencia].filter(Boolean).join(' | '),
      })
      const { data, error } = await cajaApi.registrarPago(pagoData, [...selectedCuotaIds])
      if (error) {
        errorEl.style.display = ''
        errorEl.textContent = 'Error: ' + (error.message || 'Error desconocido')
        btn.disabled = false; btn.textContent = 'Confirmar Pago'; return
      }
      renderConfirmacion(monto, metodo_pago)
    })
  }

  function renderConfirmacion(monto, metodo) {
    container.innerHTML =
      '<div style="padding:1.5rem;max-width:700px;text-align:center">'
      + '<div style="background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">'
      + '<i class="bi bi-check-lg" style="font-size:1.75rem;color:#059669"></i></div>'
      + '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700;color:#0f172a">Pago registrado</h3>'
      + '<p style="margin:0 0 1.5rem;color:#64748b">' + fmtMoney(monto) + ' via ' + metodo + ' - ' + selectedFamilia.nombre_familia + '</p>'
      + '<button id="btn-nuevo-pago" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem 1.5rem;font-weight:600;cursor:pointer">Registrar otro pago</button>'
      + '</div></div>'
    container.querySelector('#btn-nuevo-pago').addEventListener('click', () => {
      selectedFamilia = null; selectedCuotaIds = new Set(); renderStep1()
    })
  }

  renderStep1()
  return { teardown() {} }
}

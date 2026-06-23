/**
 * familiasView.js - Families list and detail
 * Routes: #/familias (list), #/familias/:id (detail)
 */

import * as cajaApi from '../api/cajaApi.js'
import { clasificarNivel } from '../domain/score.js'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function nivelBadge(nivel) {
  const colors = { A: ['#d1fae5','#065f46'], B: ['#dbeafe','#1e40af'], C: ['#fef9c3','#713f12'], D: ['#ffedd5','#9a3412'], E: ['#fee2e2','#7f1d1d'] }
  const [bg, text] = colors[nivel] || ['#f1f5f9','#475569']
  return '<span style="background:' + bg + ';color:' + text + ';font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px;margin-left:0.375rem">' + nivel + '</span>'
}

function navigate(hash) {
  window.dispatchEvent(new CustomEvent('caja:navigate', { detail: hash }))
}

export async function renderList(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando familias...</p></div>'

  const { data: familias, error } = await cajaApi.getFamilias()
  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar familias</p></div>'
    return { teardown() {} }
  }

  let filtered = familias || []

  function renderRows(list) {
    if (list.length === 0) return '<p style="text-align:center;color:#94a3b8;padding:2rem 0">No se encontraron familias</p>'
    return list.map(f =>
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;border-bottom:1px solid #f1f5f9;gap:0.75rem">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-weight:600;color:#0f172a;font-size:0.9375rem">' + f.nombre_familia + nivelBadge(f.nivel || 'C') + '</div>'
      + '<div style="font-size:0.75rem;color:#64748b;margin-top:0.125rem">' + (f.rep_nombre || '') + ' &bull; Pendiente: ' + fmtMoney(f.saldo_pendiente) + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:0.375rem;flex-shrink:0">'
      + '<button class="btn-ver-familia" data-id="' + f.id + '" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:0.25rem 0.625rem;font-size:0.75rem;cursor:pointer">Ver</button>'
      + '<button class="btn-pago-familia" data-id="' + f.id + '" style="background:#059669;color:#fff;border:none;border-radius:6px;padding:0.25rem 0.625rem;font-size:0.75rem;cursor:pointer">Pago</button>'
      + '</div>'
      + '</div>'
    ).join('')
  }

  container.innerHTML =
    '<div style="padding:1.5rem;max-width:1000px">'
    + '<div style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap">'
    + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">Familias (' + filtered.length + ')</h2>'
    + '<input id="search-fam" placeholder="Buscar..." style="border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.875rem;font-size:0.875rem;width:240px">'
    + '</div>'
    + '<div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
    + '<div id="fam-rows">' + renderRows(filtered) + '</div>'
    + '</div></div>'

  container.querySelector('#search-fam').addEventListener('input', function() {
    const q = this.value.toLowerCase()
    filtered = (familias || []).filter(f =>
      f.nombre_familia.toLowerCase().includes(q) || (f.rep_nombre || '').toLowerCase().includes(q)
    )
    container.querySelector('#fam-rows').innerHTML = renderRows(filtered)
    bindButtons()
  })

  function bindButtons() {
    container.querySelectorAll('.btn-ver-familia').forEach(btn => {
      btn.addEventListener('click', () => navigate('#/familias/' + btn.dataset.id))
    })
    container.querySelectorAll('.btn-pago-familia').forEach(btn => {
      btn.addEventListener('click', () => navigate('#/pagos/nuevo'))
    })
  }
  bindButtons()

  return { teardown() {} }
}

export async function renderDetail(container, session, familiaId) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando familia...</p></div>'

  const { data, error } = await cajaApi.getFamiliaById(familiaId)
  if (error || !data) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar familia</p></div>'
    return { teardown() {} }
  }

  const { familia, representante, cuotas, pagos, wallet } = data
  const nivel = familia.nivel || clasificarNivel(familia.score || 50)

  const cuotasRows = (cuotas || []).slice(0, 10).map(c =>
    '<tr style="border-bottom:1px solid #f1f5f9">'
    + '<td style="padding:0.5rem 0.75rem;font-size:0.8125rem">' + c.concepto + ' ' + c.ciclo_mes + '/' + c.ciclo_anio + '</td>'
    + '<td style="padding:0.5rem 0.75rem;font-size:0.8125rem">' + c.fecha_vencimiento + '</td>'
    + '<td style="padding:0.5rem 0.75rem;text-align:right;font-size:0.8125rem;font-weight:600">' + fmtMoney(c.monto_final) + '</td>'
    + '<td style="padding:0.5rem 0.75rem">'
    + '<span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:6px;background:' + (c.estado === 'pagada' ? '#d1fae5' : c.estado === 'en_mora' ? '#fee2e2' : '#fef9c3') + '">' + c.estado + '</span>'
    + '</td></tr>'
  ).join('')

  container.innerHTML =
    '<div style="padding:1.5rem;max-width:900px">'
    + '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">'
    + '<button id="btn-back-list" style="background:none;border:none;cursor:pointer;color:#059669"><i class="bi bi-arrow-left"></i></button>'
    + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">' + (familia.nombre_familia || '-') + nivelBadge(nivel) + '</h2>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">'
    + '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
    + '<h3 style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:700;color:#64748b;text-transform:uppercase">Representante</h3>'
    + '<p style="margin:0;font-weight:600;color:#0f172a">' + (representante?.nombre || '-') + '</p>'
    + '<p style="margin:0.25rem 0 0;font-size:0.8125rem;color:#64748b">' + (representante?.telefono_whatsapp || '') + '</p>'
    + '<p style="margin:0.125rem 0 0;font-size:0.8125rem;color:#64748b">' + (representante?.email || '') + '</p>'
    + '</div>'
    + '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
    + '<h3 style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:700;color:#64748b;text-transform:uppercase">Wallet</h3>'
    + '<p style="margin:0;font-size:1.5rem;font-weight:800;color:#059669">' + fmtMoney(wallet?.saldo || 0) + '</p>'
    + '<button id="btn-ver-wallet" style="margin-top:0.5rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:0.25rem 0.625rem;font-size:0.75rem;cursor:pointer">Ver movimientos</button>'
    + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1rem">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">'
    + '<h3 style="margin:0;font-size:0.9375rem;font-weight:700;color:#0f172a">Cuotas</h3>'
    + '<button id="btn-reg-pago" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:0.375rem 0.875rem;font-size:0.8125rem;font-weight:600;cursor:pointer">Registrar Pago</button>'
    + '</div>'
    + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.8125rem">'
    + '<thead><tr style="border-bottom:2px solid #e2e8f0">'
    + '<th style="text-align:left;padding:0.5rem 0.75rem;font-weight:600;color:#64748b">Concepto</th>'
    + '<th style="text-align:left;padding:0.5rem 0.75rem;font-weight:600;color:#64748b">Vence</th>'
    + '<th style="text-align:right;padding:0.5rem 0.75rem;font-weight:600;color:#64748b">Monto</th>'
    + '<th style="text-align:left;padding:0.5rem 0.75rem;font-weight:600;color:#64748b">Estado</th>'
    + '</tr></thead><tbody>' + (cuotasRows || '<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:#94a3b8">Sin cuotas</td></tr>') + '</tbody>'
    + '</table></div>'
    + '</div>'
    + '</div>'

  container.querySelector('#btn-back-list')?.addEventListener('click', () => navigate('#/familias'))
  container.querySelector('#btn-ver-wallet')?.addEventListener('click', () => navigate('#/wallet/' + familiaId))
  container.querySelector('#btn-reg-pago')?.addEventListener('click', () => navigate('#/pagos/nuevo'))

  return { teardown() {} }
}

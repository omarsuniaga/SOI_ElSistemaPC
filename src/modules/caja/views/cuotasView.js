/**
 * cuotasView.js - Cuota management with filter tabs
 * Route: #/cuotas
 */

import * as cajaApi from '../api/cajaApi.js'
import { calcularMoraInfo } from '../domain/cuota.js'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

const FILTROS = ['Todas', 'pendiente', 'en_mora', 'vencida', 'pagada']

function estadoBadge(estado) {
  const map = {
    pendiente: ['#fef9c3','#713f12'],
    en_mora:   ['#fee2e2','#7f1d1d'],
    vencida:   ['#ffedd5','#9a3412'],
    pagada:    ['#d1fae5','#065f46'],
    becada:    ['#dbeafe','#1e40af'],
  }
  const [bg, text] = map[estado] || ['#f1f5f9','#475569']
  return '<span style="background:' + bg + ';color:' + text + ';font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:6px">' + estado + '</span>'
}

function navigate(hash) {
  window.dispatchEvent(new CustomEvent('caja:navigate', { detail: hash }))
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando cuotas...</p></div>'

  const { data: familias, error } = await cajaApi.getFamilias()
  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar datos</p></div>'
    return { teardown() {} }
  }

  // Build cuotas aggregate from vw_estado_familiar data
  // The view has saldo_pendiente, cuotas_pendientes per family
  // For individual cuota detail, user navigates to family detail

  let filtroActivo = 'Todas'

  function renderContent() {
    const famFiltradas = filtroActivo === 'Todas'
      ? (familias || [])
      : (familias || []).filter(f => {
          if (filtroActivo === 'en_mora') return f.nivel === 'D' || f.nivel === 'E'
          if (filtroActivo === 'pendiente') return (f.cuotas_pendientes || 0) > 0 && f.nivel !== 'E'
          if (filtroActivo === 'pagada') return (f.cuotas_pendientes || 0) === 0
          if (filtroActivo === 'vencida') return (f.saldo_pendiente || 0) > 0
          return true
        })

    const tabHtml = FILTROS.map(f => {
      const isActive = f === filtroActivo
      return '<button class="cuota-tab" data-filtro="' + f + '"'
        + ' style="border:none;background:none;padding:0.75rem 1rem;font-size:0.875rem;cursor:pointer;border-bottom:2px solid '
        + (isActive ? '#059669' : 'transparent') + ';color:' + (isActive ? '#059669' : '#64748b') + ';font-weight:' + (isActive ? '600' : '400') + '">'
        + (f === 'Todas' ? f : f.replace('_', ' '))
        + '</button>'
    }).join('')

    const rowsHtml = famFiltradas.length === 0
      ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#94a3b8">Sin resultados</td></tr>'
      : famFiltradas.map(f =>
          '<tr style="border-bottom:1px solid #f1f5f9;cursor:pointer" class="fam-row" data-id="' + f.id + '">'
          + '<td style="padding:0.75rem">'
          + '<div style="font-weight:600;color:#0f172a;font-size:0.875rem">' + f.nombre_familia + '</div>'
          + '<div style="font-size:0.75rem;color:#64748b">' + (f.rep_nombre || '') + '</div>'
          + '</td>'
          + '<td style="padding:0.75rem;text-align:center;font-size:0.8125rem">' + (f.cuotas_pendientes || 0) + '</td>'
          + '<td style="padding:0.75rem;text-align:right;font-weight:600;color:#ef4444;font-size:0.875rem">' + fmtMoney(f.saldo_pendiente) + '</td>'
          + '<td style="padding:0.75rem;text-align:right;color:#059669;font-size:0.875rem">' + fmtMoney(f.saldo_wallet || 0) + '</td>'
          + '<td style="padding:0.75rem">'
          + '<span style="background:' + (f.nivel === 'A' || f.nivel === 'B' ? '#d1fae5' : f.nivel === 'E' ? '#fee2e2' : '#fef9c3') + ';color:#374151;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px">' + (f.nivel || '?') + '</span>'
          + '</td>'
          + '</tr>'
        ).join('')

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:1100px">'
      + '<h2 style="margin:0 0 1.5rem;font-size:1.125rem;font-weight:700;color:#0f172a">Cuotas y Mora</h2>'
      + '<div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<div style="border-bottom:1px solid #e2e8f0;padding:0 0.5rem;display:flex;overflow-x:auto">' + tabHtml + '</div>'
      + '<div style="overflow-x:auto">'
      + '<table style="width:100%;border-collapse:collapse;font-size:0.8125rem">'
      + '<thead><tr style="border-bottom:2px solid #e2e8f0">'
      + '<th style="text-align:left;padding:0.75rem;font-weight:600;color:#64748b">Familia</th>'
      + '<th style="text-align:center;padding:0.75rem;font-weight:600;color:#64748b">Cuotas pend.</th>'
      + '<th style="text-align:right;padding:0.75rem;font-weight:600;color:#64748b">Saldo pendiente</th>'
      + '<th style="text-align:right;padding:0.75rem;font-weight:600;color:#64748b">Wallet</th>'
      + '<th style="text-align:left;padding:0.75rem;font-weight:600;color:#64748b">Score</th>'
      + '</tr></thead>'
      + '<tbody>' + rowsHtml + '</tbody>'
      + '</table></div></div></div>'

    container.querySelectorAll('.cuota-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        filtroActivo = btn.dataset.filtro
        renderContent()
      })
    })
    container.querySelectorAll('.fam-row').forEach(row => {
      row.addEventListener('click', () => navigate('#/familias/' + row.dataset.id))
    })
  }

  renderContent()
  return { teardown() {} }
}

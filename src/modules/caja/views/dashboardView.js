/**
 * dashboardView.js - Katherine daily operational hub
 * Route: #/dashboard
 */

import * as cajaApi from '../api/cajaApi.js'
import { isStockBajo } from '../domain/accesorio.js'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando panel...</p></div>'

  const [cierreRes, notifRes, tareasRes, accesoriosRes] = await Promise.all([
    cajaApi.getCierreCajaHoy(),
    cajaApi.getNotificaciones({ prioridad: 'critica' }),
    cajaApi.getTareas(session?.user?.id),
    cajaApi.getAccesorios(),
  ])

  const cierre     = cierreRes.data     || { totalGeneral: 0, cantidadTransacciones: 0 }
  const notifsCrit = notifRes.data      || []
  const tareas     = tareasRes.data     || []
  const accesorios = accesoriosRes.data || []

  const tareasPend    = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length
  const stockBajoList = accesorios.filter(isStockBajo)
  const pagosHoy      = cierre.ultimosPagos || []

  const familiasMora = notifsCrit
    .filter(n => n.tipo && n.tipo.includes('mora') && n.familia_id)
    .map(n => n.familia_id)
    .filter((v, i, a) => a.indexOf(v) === i).length

  const kpiData = [
    { label: 'Total cobrado hoy',       value: fmtMoney(cierre.totalGeneral),   sub: (cierre.cantidadTransacciones || 0) + ' transacciones', color: '#059669' },
    { label: 'Familias en mora activa', value: String(familiasMora),            sub: 'Alertas criticas',  color: '#ef4444' },
    { label: 'Tareas pendientes',       value: String(tareasPend),              sub: 'Para hoy',          color: '#f59e0b' },
    { label: 'Alertas de stock bajo',   value: String(stockBajoList.length),    sub: 'Accesorios',        color: '#8b5cf6' },
  ]

  function kpiCard(k) {
    return '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);border-left:4px solid ' + k.color + '">'
      + '<p style="margin:0 0 0.25rem;font-size:0.75rem;font-weight:600;color:#64748b;text-transform:uppercase">' + k.label + '</p>'
      + '<p style="margin:0;font-size:1.5rem;font-weight:800;color:' + k.color + '">' + k.value + '</p>'
      + '<p style="margin:0.25rem 0 0;font-size:0.75rem;color:#94a3b8">' + k.sub + '</p></div>'
  }
  const kpiHtml = kpiData.map(kpiCard).join('')

  function alertaRow(n) {
    return '<div style="padding:0.75rem 1rem;background:#fff5f5;border:1px solid #fecaca;border-radius:8px;margin-bottom:0.5rem">'
      + '<p style="margin:0 0 0.125rem;font-size:0.875rem;font-weight:600;color:#7f1d1d">' + (n.titulo || '-') + '</p>'
      + '<p style="margin:0;font-size:0.75rem;color:#991b1b">' + (n.cuerpo || '') + '</p></div>'
  }
  const alertasHtml = notifsCrit.length === 0 ? '' :
    '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.5rem">'
    + '<h3 style="margin:0 0 1rem;font-size:0.9375rem;font-weight:700;color:#0f172a"><i class="bi bi-exclamation-triangle-fill" style="color:#ef4444"></i> Alertas urgentes</h3>'
    + notifsCrit.slice(0, 5).map(alertaRow).join('') + '</div>'

  function stockItem(acc) {
    return '<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:0.5rem 0.875rem;margin:0.25rem;display:inline-block">'
      + '<b style="color:#7e22ce">' + acc.nombre + '</b> <span style="color:#a78bfa">' + acc.stock_actual + '/' + acc.stock_minimo + '</span></div>'
  }
  const stockHtml = stockBajoList.length === 0 ? '' :
    '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.5rem">'
    + '<h3 style="margin:0 0 1rem;font-size:0.9375rem;font-weight:700;color:#0f172a"><i class="bi bi-box-seam" style="color:#8b5cf6"></i> Stock bajo</h3>'
    + stockBajoList.map(stockItem).join('') + '</div>'

  function pagoRow(p) {
    const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : '-'
    return '<tr><td style="padding:0.625rem 0.75rem;font-weight:500">' + (p.familia_nombre || p.familia_id || '-') + '</td>'
      + '<td style="padding:0.625rem 0.75rem;color:#475569">' + (p.metodo_pago || '-') + '</td>'
      + '<td style="padding:0.625rem 0.75rem;text-align:right;color:#059669;font-weight:700">' + fmtMoney(p.monto) + '</td>'
      + '<td style="padding:0.625rem 0.75rem;color:#94a3b8">' + hora + '</td></tr>'
  }
  const pagosHtml = pagosHoy.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:2rem 0;margin:0">Sin pagos registrados hoy</p>'
    : '<table style="width:100%;border-collapse:collapse;font-size:0.8125rem"><tbody>' + pagosHoy.slice(0, 5).map(pagoRow).join('') + '</tbody></table>'

  const dateStr = new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  container.innerHTML =
    '<div style="padding:1.5rem;max-width:1200px">'
    + '<div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">'
    + '<div><h2 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a">Panel de Caja</h2>'
    + '<p style="margin:0;font-size:0.8125rem;color:#64748b">' + dateStr + '</p></div>'
    + '<div style="display:flex;gap:0.5rem">'
    + '<button id="btn-dash-pago" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;cursor:pointer"><i class="bi bi-plus-circle"></i> Registrar Pago</button>'
    + '<button id="btn-dash-mora" style="background:#fff;color:#64748b;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 1rem;cursor:pointer">Ver Mora Activa</button>'
    + '</div></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem">' + kpiHtml + '</div>'
    + alertasHtml + stockHtml
    + '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
    + '<h3 style="margin:0 0 1rem;font-size:0.9375rem;font-weight:700;color:#0f172a">Ultimos pagos del dia</h3>' + pagosHtml
    + '</div></div>'

  container.querySelector('#btn-dash-pago')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('caja:navigate', { detail: '#/pagos/nuevo' }))
  })
  container.querySelector('#btn-dash-mora')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('caja:navigate', { detail: '#/cuotas' }))
  })

  return { teardown() {} }
}

/**
 * accesoriosView.js - POS (Point of Sale) + Stock management
 * Route: #/accesorios
 */

import * as cajaApi from '../api/cajaApi.js'
import { isStockBajo } from '../domain/accesorio.js'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function stockBadge(acc) {
  if (isStockBajo(acc)) return '<span style="background:#fee2e2;color:#7f1d1d;font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:6px">Stock bajo (' + acc.stock_actual + '/' + acc.stock_minimo + ')</span>'
  if (acc.stock_actual < acc.stock_minimo * 2) return '<span style="background:#fef9c3;color:#713f12;font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:6px">Stock medio (' + acc.stock_actual + '/' + acc.stock_minimo + ')</span>'
  return '<span style="background:#d1fae5;color:#065f46;font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:6px">OK (' + acc.stock_actual + '/' + acc.stock_minimo + ')</span>'
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando accesorios...</p></div>'

  const { data: accesorios, error } = await cajaApi.getAccesorios()
  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar accesorios</p></div>'
    return { teardown() {} }
  }

  const stockBajoList = (accesorios || []).filter(isStockBajo)
  let modalAccId = null

  function renderMain() {
    const itemsHtml = (accesorios || []).filter(a => a.activo).map(acc =>
      '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem">'
      + '<div>'
      + '<p style="margin:0;font-weight:700;color:#0f172a">' + acc.nombre + '</p>'
      + '<p style="margin:0.25rem 0 0;font-size:0.75rem;color:#64748b">' + (acc.categoria || '') + '</p>'
      + '</div>'
      + stockBadge(acc)
      + '</div>'
      + '<p style="margin:0 0 0.75rem;font-size:0.8125rem;color:#475569">' + (acc.descripcion || '') + '</p>'
      + '<div style="display:flex;align-items:center;justify-content:space-between">'
      + '<span style="font-size:1rem;font-weight:700;color:#059669">' + fmtMoney(acc.precio_unitario) + '</span>'
      + '<button class="btn-asignar" data-id="' + acc.id + '" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:0.375rem 0.875rem;font-size:0.8125rem;font-weight:600;cursor:pointer">Asignar</button>'
      + '</div>'
      + (acc.links_externos && acc.links_externos.length > 0
        ? '<div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid #f1f5f9">'
          + acc.links_externos.map(l => '<a href="' + l.url + '" target="_blank" rel="noopener" style="font-size:0.75rem;color:#059669;text-decoration:none;margin-right:0.75rem"><i class="bi bi-box-arrow-up-right"></i> ' + l.nombre + '</a>').join('')
          + '</div>'
        : '')
      + '</div>'
    ).join('')

    const stockAlertHtml = stockBajoList.length === 0 ? '' :
      '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.5rem;border-left:4px solid #8b5cf6">'
      + '<h3 style="margin:0 0 0.75rem;font-size:0.9375rem;font-weight:700;color:#0f172a"><i class="bi bi-exclamation-triangle-fill" style="color:#8b5cf6"></i> Items con stock bajo</h3>'
      + stockBajoList.map(acc =>
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #f8f5ff">'
          + '<span style="font-size:0.875rem;font-weight:500;color:#0f172a">' + acc.nombre + '</span>'
          + '<div style="display:flex;align-items:center;gap:0.75rem">'
          + '<span style="font-size:0.8125rem;color:#7e22ce">Stock: ' + acc.stock_actual + ' / Min: ' + acc.stock_minimo + '</span>'
          + (acc.links_externos && acc.links_externos.length > 0
            ? '<a href="' + acc.links_externos[0].url + '" target="_blank" style="font-size:0.75rem;color:#059669;text-decoration:none"><i class="bi bi-cart"></i> Reponer</a>'
            : '')
          + '</div>'
          + '</div>'
        ).join('')
      + '</div>'

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:1000px">'
      + '<h2 style="margin:0 0 1.5rem;font-size:1.125rem;font-weight:700;color:#0f172a">Accesorios</h2>'
      + stockAlertHtml
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">'
      + itemsHtml
      + '</div>'
      + '</div>'
      + '<div id="asignar-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">'
      + '<div style="background:#fff;border-radius:12px;padding:1.5rem;width:100%;max-width:420px;margin:1rem">'
      + '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;color:#0f172a">Asignar accesorio</h3>'
      + '<div id="modal-body"></div>'
      + '<div style="display:flex;gap:0.5rem;margin-top:1rem">'
      + '<button id="btn-modal-cancel" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.5rem;cursor:pointer">Cancelar</button>'
      + '<button id="btn-modal-confirm" style="flex:1;background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem;font-weight:600;cursor:pointer">Confirmar</button>'
      + '</div></div></div>'

    container.querySelectorAll('.btn-asignar').forEach(btn => {
      btn.addEventListener('click', () => {
        modalAccId = btn.dataset.id
        const acc = (accesorios || []).find(a => a.id === modalAccId)
        if (!acc) return
        const modal = container.querySelector('#asignar-modal')
        modal.querySelector('#modal-body').innerHTML =
          '<p style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:600;color:#374151">' + acc.nombre + ' - ' + fmtMoney(acc.precio_unitario) + '</p>'
          + '<label style="display:block;font-size:0.8125rem;font-weight:500;color:#374151;margin-bottom:0.375rem">ID Alumno</label>'
          + '<input id="modal-alumno" type="text" placeholder="ID del alumno..." style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.75rem">'
          + '<label style="display:block;font-size:0.8125rem;font-weight:500;color:#374151;margin-bottom:0.375rem">Cantidad</label>'
          + '<input id="modal-cantidad" type="number" min="1" value="1" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.5rem">'
          + '<div id="modal-error" style="display:none;color:#ef4444;font-size:0.8125rem;margin-top:0.375rem"></div>'
        modal.style.display = 'flex'
      })
    })

    container.querySelector('#btn-modal-cancel')?.addEventListener('click', () => {
      container.querySelector('#asignar-modal').style.display = 'none'
    })

    container.querySelector('#btn-modal-confirm')?.addEventListener('click', async () => {
      const alumno_id = container.querySelector('#modal-alumno').value.trim()
      const cantidad = parseInt(container.querySelector('#modal-cantidad').value) || 1
      const errEl = container.querySelector('#modal-error')
      if (!alumno_id) { errEl.style.display=''; errEl.textContent='Ingresa el ID del alumno'; return }
      const btn = container.querySelector('#btn-modal-confirm')
      btn.disabled = true; btn.textContent = 'Procesando...'
      const { data, error } = await cajaApi.asignarAccesorio({ accesorio_id: modalAccId, alumno_id, cantidad, precio_unitario: (accesorios || []).find(a => a.id === modalAccId)?.precio_unitario || 0 })
      if (error) { errEl.style.display=''; errEl.textContent='Error: '+(error.message||'desconocido'); btn.disabled=false; btn.textContent='Confirmar'; return }
      container.querySelector('#asignar-modal').style.display = 'none'
      renderMain()
    })
  }

  renderMain()
  return { teardown() {} }
}

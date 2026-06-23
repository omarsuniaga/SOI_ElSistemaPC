/**
 * notificacionesView.js - Notification inbox with realtime updates
 * Route: #/notificaciones
 */

import * as cajaApi from '../api/cajaApi.js'

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function prioridadBadge(p) {
  const map = { critica: ['#fee2e2','#7f1d1d'], alta: ['#ffedd5','#9a3412'], normal: ['#f0fdf4','#065f46'], baja: ['#f8fafc','#475569'] }
  const [bg, text] = map[p] || ['#f8fafc','#475569']
  return '<span style="background:' + bg + ';color:' + text + ';font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:6px">' + p + '</span>'
}

function tipoBadge(tipo) {
  return '<span style="background:#eff6ff;color:#1e40af;font-size:0.7rem;font-weight:500;padding:0.15rem 0.5rem;border-radius:6px">' + (tipo || '').replace('_', ' ') + '</span>'
}

export async function render(container, session, _params, onUnreadCount) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando notificaciones...</p></div>'

  const { data: notifs, error } = await cajaApi.getNotificaciones()
  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar notificaciones</p></div>'
    return { teardown() {} }
  }

  let allNotifs = notifs || []

  function getUnread() {
    return allNotifs.filter(n => n.estado_portal === 'no_leida').length
  }

  function renderContent() {
    if (onUnreadCount) onUnreadCount(getUnread())

    const grupos = ['critica', 'alta', 'normal']
    const grupoHtml = grupos.map(prioridad => {
      const items = allNotifs.filter(n => n.prioridad === prioridad)
      if (items.length === 0) return ''
      return '<div style="margin-bottom:1.5rem">'
        + '<h3 style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">' + prioridad.charAt(0).toUpperCase() + prioridad.slice(1) + ' (' + items.length + ')</h3>'
        + items.map(n =>
            '<div class="notif-card" data-id="' + n.id + '"'
            + ' style="background:' + (n.estado_portal === 'no_leida' ? '#fffbeb' : '#fff') + ';border-radius:10px;padding:1rem;margin-bottom:0.5rem;box-shadow:0 1px 2px rgba(0,0,0,0.06);border-left:3px solid ' + (n.prioridad === 'critica' ? '#ef4444' : n.prioridad === 'alta' ? '#f59e0b' : '#059669') + '">'
            + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem">'
            + '<div style="flex:1">'
            + '<div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.375rem">'
            + tipoBadge(n.tipo) + ' ' + prioridadBadge(n.prioridad)
            + (n.estado_portal === 'no_leida' ? '<span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;display:inline-block;margin-left:0.25rem"></span>' : '')
            + '</div>'
            + '<p style="margin:0 0 0.25rem;font-size:0.875rem;font-weight:600;color:#0f172a">' + (n.titulo || '-') + '</p>'
            + '<p style="margin:0;font-size:0.8125rem;color:#475569">' + (n.cuerpo || '') + '</p>'
            + '</div>'
            + '<div style="text-align:right;flex-shrink:0">'
            + '<p style="margin:0 0 0.375rem;font-size:0.7rem;color:#94a3b8">' + fmtDate(n.created_at) + '</p>'
            + (n.estado_portal === 'no_leida'
              ? '<button class="btn-marcar-leida" data-id="' + n.id + '" style="font-size:0.7rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:0.15rem 0.5rem;cursor:pointer">Marcar leida</button>'
              : '<span style="font-size:0.7rem;color:#94a3b8">Leida</span>')
            + '</div>'
            + '</div>'
            + (n.respuesta_padre ? '<div style="margin-top:0.625rem;padding:0.5rem 0.75rem;background:#f0fdf4;border-radius:6px;font-size:0.75rem;color:#065f46"><i class="bi bi-reply"></i> ' + n.respuesta_padre + '</div>' : '')
            + '</div>'
          ).join('')
        + '</div>'
    }).join('')

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:800px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">'
      + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">Notificaciones</h2>'
      + '<span style="font-size:0.8125rem;color:#64748b">' + getUnread() + ' sin leer</span>'
      + '</div>'
      + (grupoHtml || '<p style="text-align:center;color:#94a3b8;padding:2rem 0">Sin notificaciones</p>')
      + '</div>'

    container.querySelectorAll('.btn-marcar-leida').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const notifId = btn.dataset.id
        await cajaApi.marcarNotificacionLeida(notifId)
        const notif = allNotifs.find(n => n.id === notifId)
        if (notif) notif.estado_portal = 'leida'
        renderContent()
      })
    })
  }

  renderContent()

  const unsubscribe = cajaApi.subscribeNotificaciones(newNotif => {
    if (newNotif) allNotifs = [newNotif, ...allNotifs.filter(n => n.id !== newNotif.id)]
    renderContent()
  })

  return {
    teardown() {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }
}

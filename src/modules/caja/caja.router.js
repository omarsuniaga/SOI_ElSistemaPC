/**
 * caja.router.js - Router del módulo Caja basado en History API.
 *
 * El portal se monta en `/fin` (ver public/_redirects y vite.config.js), así que
 * las URLs son limpias: /fin/pagos/nuevo, /fin/cierre, /fin/familias/:id … Sin `#`.
 *
 * `navigate()` y el evento `caja:navigate` toleran rutas con `#` inicial por
 * compatibilidad, pero lo nuevo debe pasar la ruta limpia ('/pagos/nuevo').
 */

import { render as dashboardRender }         from './views/dashboardView.js'
import { renderList, renderDetail }           from './views/familiasView.js'
import { render as cuotasRender }             from './views/cuotasView.js'
import { render as registroPagoRender }       from './views/registroPagoView.js'
import { render as accesoriosRender }         from './views/accesoriosView.js'
import { render as walletRender }             from './views/walletView.js'
import { render as notificacionesRender }     from './views/notificacionesView.js'
import { render as tareasRender }             from './views/tareasView.js'
import { render as scoreRender }             from './views/scoreView.js'
import { render as minutasRender }           from './views/minutasView.js'
import { render as mensajesRender }          from './views/mensajesView.js'
import { render as reportesRender }          from './views/reportesView.js'
import { render as cierreRender }            from './views/cierresCajaView.js'
import { render as campanasRender }          from './views/campanasView.js'
import { renderTareasView as hermesRender }  from '../hermes/views/tareasView.js'

export const BASE_PATH = '/fin'
const DEFAULT_ROUTE = '/pagos/nuevo'

let _currentTeardown = null
let _contentEl = null
let _session = null
let _notifBadgeCallback = null

/**
 * Normaliza cualquier entrada de navegación a la ruta canónica interna
 * ('/pagos/nuevo'). Acepta '/pagos/nuevo', 'pagos/nuevo', '#/pagos/nuevo',
 * '/fin/pagos/nuevo'.
 */
function normalizeRoute(input) {
  let r = String(input || '').trim().replace(/^#/, '')
  if (r.startsWith(BASE_PATH)) r = r.slice(BASE_PATH.length)
  if (!r.startsWith('/')) r = '/' + r
  r = r.replace(/\/+$/, '')
  return r === '' || r === '/' ? DEFAULT_ROUTE : r
}

/** Ruta interna actual, leída de la URL del navegador. */
export function currentRoute() {
  return normalizeRoute(window.location.pathname || BASE_PATH)
}

function matchRoute(route) {
  if (route === '/dashboard') return { view: 'dashboard', params: {} }
  if (route === '/familias') return { view: 'familias-list', params: {} }
  if (/^\/familias\/(.+)$/.test(route)) return { view: 'familias-detail', params: { familiaId: route.split('/')[2] } }
  if (route === '/cuotas') return { view: 'cuotas', params: {} }
  if (route === '/pagos/nuevo') return { view: 'pagos-nuevo', params: {} }
  if (route === '/accesorios') return { view: 'accesorios', params: {} }
  if (/^\/wallet\/(.+)$/.test(route)) return { view: 'wallet', params: { familiaId: route.split('/')[2] } }
  if (route === '/notificaciones') return { view: 'notificaciones', params: {} }
  if (route === '/tareas') return { view: 'tareas', params: {} }
  if (route === '/hermes') return { view: 'hermes', params: {} }
  if (route === '/score')    return { view: 'score',    params: {} }
  if (route === '/minutas')  return { view: 'minutas',  params: {} }
  if (route === '/mensajes') return { view: 'mensajes', params: {} }
  if (route === '/reportes') return { view: 'reportes', params: {} }
  if (route === '/cierre')    return { view: 'cierre',    params: {} }
  if (route === '/campanas')  return { view: 'campanas',  params: {} }
  return { view: 'pagos-nuevo', params: {} }
}

async function loadView(matched) {
  if (!_contentEl || !_session) return

  if (_currentTeardown) {
    try { _currentTeardown() } catch (_e) {}
    _currentTeardown = null
  }

  const { view, params } = matched
  let result = null

  if (view === 'dashboard')        result = await dashboardRender(_contentEl, _session)
  else if (view === 'familias-list')   result = await renderList(_contentEl, _session)
  else if (view === 'familias-detail') result = await renderDetail(_contentEl, _session, params.familiaId)
  else if (view === 'cuotas')          result = await cuotasRender(_contentEl, _session)
  else if (view === 'pagos-nuevo')     result = await registroPagoRender(_contentEl, _session)
  else if (view === 'accesorios')      result = await accesoriosRender(_contentEl, _session)
  else if (view === 'wallet')          result = await walletRender(_contentEl, _session, params)
  else if (view === 'notificaciones')  result = await notificacionesRender(_contentEl, _session, params, _notifBadgeCallback)
  else if (view === 'tareas')          result = await tareasRender(_contentEl, _session)
  else if (view === 'hermes')          result = await hermesRender(_contentEl, { departamento: 'FIN', hideCalendarBtn: true })
  else if (view === 'score')           result = await scoreRender(_contentEl, _session)
  else if (view === 'minutas')         result = await minutasRender(_contentEl, _session)
  else if (view === 'mensajes')        result = await mensajesRender(_contentEl, _session)
  else if (view === 'reportes')        result = await reportesRender(_contentEl, _session)
  else if (view === 'cierre')          result = await cierreRender(_contentEl, _session)
  else if (view === 'campanas')        result = await campanasRender(_contentEl, _session)

  _currentTeardown = result?.teardown || null
}

function handleRouteChange() {
  loadView(matchRoute(currentRoute()))
}

export function initRouter(contentEl, session, notifBadgeCallback) {
  _contentEl = contentEl
  _session = session
  _notifBadgeCallback = notifBadgeCallback || null

  window.addEventListener('popstate', handleRouteChange)

  // Navegación interna emitida por las vistas.
  window.addEventListener('caja:navigate', (e) => navigate(e.detail))
}

export function navigate(to) {
  const route = normalizeRoute(to)
  const url = BASE_PATH + route
  if (window.location.pathname === url) {
    handleRouteChange() // recargar la misma ruta
  } else {
    window.history.pushState(null, '', url)
    handleRouteChange()
  }
}

export function teardownRouter() {
  window.removeEventListener('popstate', handleRouteChange)
  if (_currentTeardown) {
    try { _currentTeardown() } catch (_e) {}
    _currentTeardown = null
  }
}

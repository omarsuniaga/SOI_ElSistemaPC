/**
 * NavigationHooks - Hooks para navegación SPA
 * Proporciona funciones para invalidar vistas desde cualquier componente
 */

let _invalidateViewFn = null
let _invalidateAllViewsFn = null

export function setNavigationCallbacks(invalidateView, invalidateAllViews) {
  _invalidateViewFn = invalidateView
  _invalidateAllViewsFn = invalidateAllViews
}

export function invalidateView(name) {
  if (_invalidateViewFn) {
    _invalidateViewFn(name)
  }
}

export function invalidateAllViews() {
  if (_invalidateAllViewsFn) {
    _invalidateAllViewsFn()
  }
}

/**
 * 'fechas', 'calendario' y 'clases' son tres nombres de ruta que cargan el
 * MISMO módulo (calendarioView.js, ver VIEW_LOADERS en portalRoutes.js). El
 * caché de vistas renderizadas es por nombre de ruta, no por módulo:
 * invalidar solo 'calendario' deja 'fechas' (la pestaña real del menú) con
 * el DOM viejo tras registrar una asistencia o descartar un borrador.
 */
export function invalidateCalendarioViews() {
  invalidateView('fechas')
  invalidateView('calendario')
  invalidateView('clases')
}

export default {
  setNavigationCallbacks,
  invalidateView,
  invalidateAllViews,
  invalidateCalendarioViews
}
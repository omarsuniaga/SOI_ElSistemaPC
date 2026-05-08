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

export default {
  setNavigationCallbacks,
  invalidateView,
  invalidateAllViews
}
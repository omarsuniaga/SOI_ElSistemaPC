/**
 * crossPortalNav.js — Navegación con `claseId` que funciona sin importar qué
 * portal la ejecuta.
 *
 * `DisenadorCurricularView.js` y `MapaClaseView.js` están registrados en DOS
 * routers incompatibles entre sí:
 *   - Portal Maestros (`portal-maestros/router/portalRouter.js`): lee el
 *     parámetro desde el query string embebido en el nombre de ruta
 *     (`navigate('planificacion-mapa-clase?clase=' + id)`), vía
 *     `window.location.search`.
 *   - ACM/ADM (`core/router/router.js`): no toca la URL, recibe los params
 *     como objeto (`navigate('planificacion-mapa-clase', { claseId })`).
 * Pasar el id "mal" en cualquiera de los dos no rompe con un error visible:
 * simplemente el destino no recibe la clase y vuelve a defaultear a la
 * primera de la lista — el mismo síntoma que este módulo vino a corregir.
 * Por eso el helper detecta el router activo (el central expone `.routes`
 * como objeto plano; el de Portal Maestros no) en vez de asumir uno.
 */
export function navegarConClase(destino, claseId) {
  const r = window.router
  if (!r || typeof r.navigate !== 'function') return

  const esRouterCentral = r.routes && typeof r.routes === 'object'
  if (esRouterCentral) {
    r.navigate(destino, claseId ? { claseId } : {})
  } else {
    r.navigate(claseId ? `${destino}?clase=${claseId}` : destino)
  }
}
